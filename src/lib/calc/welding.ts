import { material as materialById, catalog } from '$lib/data/db';
import { ceilWithWaste, finalizeCalculation, type CalculationResult, type Line } from './calc';

/**
 * Procesos de soldadura soportados.
 *
 * - `smaw`: soldadura por arco con electrodo revestido (Stick).
 * - `gmaw`: soldadura por arco con hilo continuo y gas (MIG/MAG).
 * - `gtaw`: soldadura por arco con electrodo de tungsteno y gas (TIG).
 * - `fcaw`: soldadura con hilo tubular (sin gas externo o con gas).
 */
export type WeldingProcess = 'smaw' | 'gmaw' | 'gtaw' | 'fcaw';

/**
 * Tipo de metal base. Afecta a la elección de electrodo/hilo, gas de
 * protección y rango de amperaje permitido.
 */
export type BaseMetal =
  | 'acero_carbono'
  | 'acero_inoxidable'
  | 'aluminio'
  | 'cobre'
  | 'hierro_fundido'
  | 'galvanizado';

/**
 * Tipo de unión entre las piezas. Influye en el volumen de material
 * de aporte necesario (factor de junta).
 */
export type JointType = 'tope' | 'esquina' | 'solape' | 'angulo_t' | 'tubo_t';

/**
 * Posición de soldadura según AWS (1G horizontal, 2G vertical ascendente,
 * 3G vertical descendente, 4G techo). En `gtaw` se usan las equivalentes
 * 1F/2F/3F/4F para chapa.
 */
export type WeldingPosition = 'horizontal' | 'vertical' | 'techo' | 'plana';

export type WeldingOptions = {
  process: WeldingProcess;
  metal: BaseMetal;
  thicknessMm: number;
  joint: JointType;
  position: WeldingPosition;
  totalLengthM: number;
  /** Material de aporte específico (id del catálogo). Si se omite se calcula automáticamente. */
  consumibleId?: string;
  /** Gas de protección (id del catálogo). Si se omite se calcula automáticamente. */
  gasId?: string;
  laborOn: boolean;
  /** Diámetro del electrodo/hilo preferido en mm (si se quiere forzar). */
  diametroMm?: number;
  /** Porcentaje de merma adicional sobre el consumo teórico. */
  merma: number;
  /** Tarifa de mano de obra opcional en €/h. */
  laborRate?: number;
};

export const WELDING_DEFAULTS: WeldingOptions = {
  process: 'smaw',
  metal: 'acero_carbono',
  thicknessMm: 6,
  joint: 'angulo_t',
  position: 'horizontal',
  totalLengthM: 1,
  consumibleId: 'electrodo_e7018_2_5mm',
  gasId: 'argón_11',
  laborOn: true,
  merma: 0.1
};

/** Tabla de identificación de procesos (etiqueta + icono breve). */
export const PROCESS_META: Record<WeldingProcess, { id: WeldingProcess; label: string; subtitle: string; icon: string }> = {
  smaw: { id: 'smaw', label: 'Electrodo (SMAW)', subtitle: 'Stick · electrodo revestido', icon: '⚡' },
  gmaw: { id: 'gmaw', label: 'MIG/MAG (GMAW)', subtitle: 'Hilo continuo + gas', icon: '⌇' },
  gtaw: { id: 'gtaw', label: 'TIG (GTAW)', subtitle: 'Tungsteno + gas inerte', icon: '◬' },
  fcaw: { id: 'fcaw', label: 'Hilo tubular (FCAW)', subtitle: 'Sin gas o con gas', icon: '⌒' }
};

export const METAL_META: Record<BaseMetal, { id: BaseMetal; label: string; density: number; resistivity: number; note: string }> = {
  acero_carbono: { id: 'acero_carbono', label: 'Acero al carbono', density: 7.85, resistivity: 0.18, note: 'ER70S / E7018 / E6010' },
  acero_inoxidable: { id: 'acero_inoxidable', label: 'Acero inoxidable', density: 7.93, resistivity: 0.74, note: 'ER308L / E308L-16' },
  aluminio: { id: 'aluminio', label: 'Aluminio', density: 2.70, resistivity: 0.028, note: 'ER4043 / ER5356' },
  cobre: { id: 'cobre', label: 'Cobre', density: 8.96, resistivity: 0.017, note: 'ERCu / ERCuSi-A' },
  hierro_fundido: { id: 'hierro_fundido', label: 'Hierro fundido', density: 7.20, resistivity: 0.65, note: 'Níquel puro (NiFe-CI)' },
  galvanizado: { id: 'galvanizado', label: 'Acero galvanizado', density: 7.85, resistivity: 0.18, note: 'ER70S-G / E7018' }
};

export const JOINT_META: Record<JointType, { id: JointType; label: string; factor: number }> = {
  tope: { id: 'tope', label: 'A tope', factor: 1.0 },
  esquina: { id: 'esquina', label: 'En esquina', factor: 0.7 },
  solape: { id: 'solape', label: 'Solape (lap)', factor: 0.85 },
  angulo_t: { id: 'angulo_t', label: 'En T (ángulo)', factor: 0.9 },
  tubo_t: { id: 'tubo_t', label: 'Tubo ↔ placa', factor: 1.15 }
};

export const POSITION_META: Record<WeldingPosition, { id: WeldingPosition; label: string; factor: number }> = {
  plana: { id: 'plana', label: 'Plana (1G/1F)', factor: 1.0 },
  horizontal: { id: 'horizontal', label: 'Horizontal (2G/2F)', factor: 1.15 },
  vertical: { id: 'vertical', label: 'Vertical (3G/3F)', factor: 1.4 },
  techo: { id: 'techo', label: 'Techo (4G/4F)', factor: 1.7 }
};

/**
 * Resultado del cálculo de soldadura. Se modela como `CalculationResult`
 * estándar para que el front-end pueda reutilizar la tabla de líneas,
 * pero incluye además los parámetros operativos calculados.
 */
export type WeldingResult = CalculationResult & {
  parametros: {
    process: WeldingProcess;
    metal: BaseMetal;
    thicknessMm: number;
    amperaje: number;
    voltaje: number;
    diametroMm: number;
    velocidadCmMin: number;
    /** Heat input en kJ/mm. */
    heatInput: number;
    /** Caudal de gas de protección en l/min. */
    gasFlujoLMin: number;
    /** Potencia aparente mínima del equipo en kVA. */
    potenciaKVA: number;
    /** Tiempo total estimado en horas. */
    horasTotales: number;
    /** Masa de material de aporte necesaria en kg. */
    aporteKg: number;
    /** Factor de posición aplicado. */
    factorPosicion: number;
  };
  recomendaciones: string[];
};

/**
 * Devuelve el rango de diámetro recomendado (mm) para un proceso y metal
 * en función del espesor. Se usa como pista visual en el UI.
 */
export function diametrosDisponibles(process: WeldingProcess, metal: BaseMetal, thicknessMm: number): number[] {
  if (process === 'smaw') {
    if (thicknessMm < 2) return [1.5, 2.0, 2.5];
    if (thicknessMm < 4) return [2.0, 2.5, 3.25];
    if (thicknessMm < 8) return [2.5, 3.25, 4.0];
    if (thicknessMm < 15) return [3.25, 4.0, 5.0];
    return [4.0, 5.0, 6.0];
  }
  if (process === 'gmaw' || process === 'fcaw') {
    if (metal === 'aluminio') {
      if (thicknessMm < 3) return [0.8, 1.0];
      if (thicknessMm < 6) return [1.0, 1.2];
      return [1.2, 1.6];
    }
    if (thicknessMm < 2) return [0.6, 0.8];
    if (thicknessMm < 5) return [0.8, 1.0];
    if (thicknessMm < 10) return [1.0, 1.2];
    return [1.2, 1.6];
  }
  // gtaw
  if (metal === 'aluminio') {
    if (thicknessMm < 3) return [1.0, 1.6];
    if (thicknessMm < 6) return [1.6, 2.4];
    return [2.4, 3.2];
  }
  if (thicknessMm < 2) return [1.0, 1.6];
  if (thicknessMm < 4) return [1.6, 2.0];
  if (thicknessMm < 8) return [2.0, 2.4];
  return [2.4, 3.2];
}

/**
 * Selecciona el diámetro óptimo dentro de la lista disponible. Si el
 * usuario ya fijó uno se respeta si está dentro del rango.
 */
export function diametroOptimo(opts: WeldingOptions): number {
  const disponibles = diametrosDisponibles(opts.process, opts.metal, opts.thicknessMm);
  if (opts.diametroMm && disponibles.includes(opts.diametroMm)) return opts.diametroMm;
  return disponibles[Math.floor(disponibles.length / 2)] ?? disponibles[0] ?? 2.5;
}

/**
 * Cálculo principal. Devuelve los parámetros operativos y la lista de
 * materiales consumibles recomendados (electrodo/hilo, gas, EPI).
 */
export function calculateWelding(options: WeldingOptions): WeldingResult {
  const { process, metal, thicknessMm, joint, position, totalLengthM, laborOn, merma } = options;
  const diametro = diametroOptimo(options);
  const recomendaciones: string[] = [];

  let amperaje = 0;
  let voltaje = 0;
  let velocidadCmMin = 0;
  let gasFlujoLMin = 0;

  // Fórmulas simplificadas basadas en guías AWS D1.1 / Lincoln Procedure
  // Handbook. Cada proceso tiene su propia lógica.
  if (process === 'smaw') {
    // 1A por cada 0.0254 mm (1 thou) de diámetro, redondeado a múltiplos de 5.
    amperaje = Math.round((diametro / 0.0254) / 5) * 5;
    voltaje = metal === 'acero_inoxidable' ? 22 : 23;
    // Velocidad proporcional al espesor y al amperaje. ~12 cm/min a 6 mm.
    velocidadCmMin = Math.max(4, Math.min(35, thicknessMm * 1.4));
    gasFlujoLMin = 0; // SMAW no usa gas externo.
  } else if (process === 'gmaw') {
    // Para acero: 1A por cada 0.0254 mm de chapa. Aluminio es similar.
    const factorMetal = metal === 'aluminio' ? 1.05 : metal === 'acero_inoxidable' ? 0.95 : 1.0;
    amperaje = Math.round((thicknessMm * 25) * factorMetal / 5) * 5;
    voltaje = metal === 'aluminio' ? 22 : metal === 'acero_inoxidable' ? 23 : 24;
    velocidadCmMin = Math.max(15, Math.min(80, thicknessMm * 6));
    gasFlujoLMin = metal === 'aluminio' ? 16 : 12;
  } else if (process === 'gtaw') {
    // TIG usa menor intensidad por mm: ~25-35 A por mm de espesor.
    const factorMetal = metal === 'aluminio' ? 1.1 : metal === 'acero_inoxidable' ? 0.9 : 1.0;
    amperaje = Math.max(30, Math.round(thicknessMm * 30 * factorMetal / 5) * 5);
    voltaje = metal === 'aluminio' ? 14 : 16;
    velocidadCmMin = Math.max(3, Math.min(20, thicknessMm * 0.8));
    gasFlujoLMin = metal === 'aluminio' ? 12 : metal === 'cobre' ? 14 : 10;
  } else {
    // fcaw
    amperaje = Math.round((thicknessMm * 28) / 5) * 5;
    voltaje = metal === 'acero_inoxidable' ? 26 : 25;
    velocidadCmMin = Math.max(15, Math.min(70, thicknessMm * 5));
    gasFlujoLMin = metal === 'acero_inoxidable' ? 14 : 12;
  }

  // Posición penaliza el rendimiento.
  const factorPos = POSITION_META[position].factor;
  velocidadCmMin = +(velocidadCmMin / factorPos).toFixed(1);

  // Heat input (kJ/mm) = (V × A × 60) / (velocidad mm/min × 1000).
  const velocidadMmMin = velocidadCmMin * 10;
  const heatInput = +((voltaje * amperaje * 60) / (velocidadMmMin * 1000)).toFixed(2);

  // Potencia aparente mínima (kVA). Se asume factor de potencia 0.75 y
  // rendimiento 0.7, más un 25% de margen para arranque.
  const potenciaKW = (voltaje * amperaje) / 1000;
  const potenciaKVA = +((potenciaKW / 0.75 / 0.7) * 1.25).toFixed(2);

  // Volumen de metal depositado: sección del cordón aproximada
  // (garganta t = 0.7 × espesor para junta en T, factor de junta aplicado).
  const gargantaCm = thicknessMm * 0.07 * JOINT_META[joint].factor;
  const seccionCordónCm2 = gargantaCm * (thicknessMm * 0.1) * 0.5;
  const volumenCm3 = seccionCordónCm2 * (totalLengthM * 100);
  const densidad = METAL_META[metal].density;
  // Se asume un 70% de eficiencia de depósito.
  const aporteKg = +((volumenCm3 * densidad * 1.1) / 1000 / 0.7).toFixed(3);

  // Tiempo total en horas (soldando sin descontar preparación).
  const minutosPorMetro = 100 / Math.max(1, velocidadCmMin);
  const horasTotales = +((totalLengthM * minutosPorMetro * factorPos) / 60).toFixed(2);

  if (heatInput > 1.5 && metal === 'acero_inoxidable') {
    recomendaciones.push('⚠ Heat input alto (>1.5 kJ/mm): reduce velocidad para evitar sensibilización.');
  }
  if (position === 'techo') {
    recomendaciones.push('En posición techo reduce el amperaje un 10–15% y aumenta la velocidad.');
  }
  if (metal === 'galvanizado') {
    recomendaciones.push('Retira el zinc en la zona de soldadura o aumenta el amperaje un 10–15%.');
  }
  if (metal === 'aluminio' && process === 'smaw') {
    recomendaciones.push('El electrodo revestido no es adecuado para aluminio. Usa TIG o MIG.');
  }
  if (process === 'gtaw' && metal === 'hierro_fundido') {
    recomendaciones.push('Precalienta la pieza a 150–250 °C y deja enfriar lento para evitar grietas.');
  }
  if (thicknessMm > 12 && process === 'gtaw') {
    recomendaciones.push('Para espesores >12 mm considera multipasada o cambiar a MIG/MAG.');
  }

  const lines: Line[] = [];

  // Material de aporte (electrodo / hilo).
  const consumibleId = options.consumibleId ?? defaultConsumibleId(process, metal, diametro);
  try {
    const cons = materialById(consumibleId);
    if (cons.kgPorEnvase && cons.kgPorEnvase > 0) {
      const uds = Math.max(1, Math.ceil((aporteKg * (1 + merma)) / cons.kgPorEnvase));
      lines.push({
        material: cons,
        quantity: uds,
        total: 0,
        detail: `${(aporteKg * (1 + merma)).toFixed(2)} kg · ⌀${diametro} mm · ${process.toUpperCase()}`
      });
    }
  } catch {
    /* id inexistente, se omite */
  }

  // Gas de protección (solo MIG/MAG, FCAW-gas y TIG).
  if ((process === 'gmaw' || process === 'gtaw' || process === 'fcaw') && gasFlujoLMin > 0) {
    const gasId = options.gasId ?? defaultGasId(process, metal);
    try {
      const gas = materialById(gasId);
      const minutos = horasTotales * 60;
      const litros = minutos * gasFlujoLMin;
      const m3 = +(litros / 1000).toFixed(2);
      if (gas.volumenM3) {
        const botellas = Math.max(1, Math.ceil(m3 / gas.volumenM3));
        lines.push({
          material: gas,
          quantity: botellas,
          total: 0,
          detail: `${m3} m³ · caudal ${gasFlujoLMin} l/min durante ${horasTotales} h`
        });
      }
    } catch {
      /* id inexistente, se omite */
    }
  }

  // Consumibles comunes a todos los procesos.
  const minutos = horasTotales * 60;
  const discos = Math.max(1, Math.ceil(minutos / 30));
  try {
    const disco = materialById('disco_lamela_125');
    lines.push({
      material: disco,
      quantity: discos,
      total: 0,
      detail: 'Limpieza / amolado entre pasadas'
    });
  } catch {
    /* noop */
  }
  const cepillos = Math.max(1, Math.ceil(minutos / 90));
  try {
    const cepillo = materialById('cepillo_alambre');
    lines.push({
      material: cepillo,
      quantity: cepillos,
      total: 0,
      detail: 'Cepillado de la pieza y cordón'
    });
  } catch {
    /* noop */
  }

  // EPI básico (una unidad por proyecto salvo guantes por horas).
  const epi: Array<{ id: string; detail: string }> = [
    { id: 'careta_soldar_auto', detail: 'EPI · Careta de soldar auto-oscurecente' },
    { id: 'guantes_soldador', detail: 'EPI · Guantes de soldador (piel)' },
    { id: 'mandil_soldador', detail: 'EPI · Mandil de cuero' }
  ];
  for (const e of epi) {
    try {
      lines.push({ material: materialById(e.id), quantity: 1, total: 0, detail: e.detail });
    } catch {
      /* noop */
    }
  }

  const laborInfo = catalog.manoObra.welding ?? { precioM2: 35, m2PorDia: 6, cuadrilla: 'soldador' };
  // El "área" que entiende finalizeCalculation no aplica aquí: usamos el
  // tiempo total para cobrar mano de obra.
  const areaForLabor = Math.max(1, horasTotales);
  const baseResult = finalizeCalculation(areaForLabor, lines, 'welding', laborOn, options.laborRate);

  return {
    ...baseResult,
    parametros: {
      process,
      metal,
      thicknessMm,
      amperaje,
      voltaje,
      diametroMm: diametro,
      velocidadCmMin,
      heatInput,
      gasFlujoLMin,
      potenciaKVA,
      horasTotales,
      aporteKg,
      factorPosicion: factorPos
    },
    recomendaciones
  };
}

/** Selecciona un electrodo/hilo por defecto según proceso, metal y diámetro. */
function defaultConsumibleId(process: WeldingProcess, metal: BaseMetal, diametro: number): string {
  if (process === 'smaw') {
    if (metal === 'hierro_fundido') return 'electrodo_niquel_ci_3_2mm';
    if (metal === 'acero_inoxidable') return 'electrodo_e308l_2_5mm';
    return diametro <= 2.5 ? 'electrodo_e7018_2_5mm' : 'electrodo_e7018_3_25mm';
  }
  if (process === 'gmaw') {
    if (metal === 'aluminio') return 'hilo_mig_4043_1_2mm';
    if (metal === 'acero_inoxidable') return 'hilo_mig_308l_1_0mm';
    return 'hilo_mig_er70s_1_0mm';
  }
  if (process === 'gtaw') {
    if (metal === 'aluminio') return 'varilla_tig_4043_2_4mm';
    if (metal === 'acero_inoxidable') return 'varilla_tig_308l_2_0mm';
    return 'varilla_tig_er70s_2_0mm';
  }
  // fcaw
  if (metal === 'acero_inoxidable') return 'hilo_tubular_e308lt1_1_2mm';
  return 'hilo_tubular_e71t11_1_2mm';
}

/** Selecciona un gas de protección por defecto. */
function defaultGasId(process: WeldingProcess, metal: BaseMetal): string {
  if (process === 'gtaw') {
    if (metal === 'aluminio') return 'argón_11';
    if (metal === 'cobre') return 'argon_75_co2_25';
    return 'argón_11';
  }
  if (process === 'gmaw') {
    if (metal === 'aluminio') return 'argón_11';
    if (metal === 'acero_inoxidable') return 'argon_98_co2_2';
    return 'co2_industrial';
  }
  // fcaw con gas
  return metal === 'acero_inoxidable' ? 'argon_75_co2_25' : 'co2_industrial';
}

export function ceilWelding(value: number, waste = 0): number {
  return ceilWithWaste(value, waste);
}

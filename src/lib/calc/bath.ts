import { material as materialById, catalog } from '$lib/data/db';
import { ceilWithWaste, finalizeCalculation, type CalculationResult, type Line } from './calc';

export type BathOptions = {
  width: number;
  length: number;
  wallHeight: number;
  withDemolicion: boolean;
  withAlicatado: boolean;
  withFontaneria: boolean;
  withSanitarios: boolean;
  withPintura: boolean;
  puntosAgua: number;
  inodoro: boolean;
  lavabo: boolean;
  platoDucha: boolean;
  mampara: boolean;
  espejo: boolean;
  baldosaId?: string;
  laborOn: boolean;
};

export const BATH_DEFAULTS: BathOptions = {
  width: 2.5,
  length: 3,
  wallHeight: 2.4,
  withDemolicion: true,
  withAlicatado: true,
  withFontaneria: true,
  withSanitarios: true,
  withPintura: true,
  puntosAgua: 4,
  inodoro: true,
  lavabo: true,
  platoDucha: true,
  mampara: true,
  espejo: true,
  baldosaId: 'azulejo_30x60',
  laborOn: true
};

function blockDemolicion(opts: BathOptions): CalculationResult {
  const { width, length, wallHeight, laborOn } = opts;
  const areaSuelo = Math.max(0, width * length);
  const perimetro = 2 * (width + length);
  const areaParedes = Math.max(0, perimetro * wallHeight);
  const totalDemoler = areaSuelo + areaParedes;
  const consumos = catalog.consumos.bano_demolicion;
  const escombroM3PorM2 = Number(consumos.escombroM3PorM2 ?? 0.15);
  const sacosLitrosPorM3 = Number(consumos.sacosLitrosPorM3 ?? 20);
  const volumenM3 = totalDemoler * escombroM3PorM2;
  const sacos = Math.ceil((volumenM3 * 1000) / sacosLitrosPorM3);

  const lines: Line[] = [];
  if (sacos > 0) {
    const saco = materialById('saco_escombros_50l');
    lines.push({
      material: saco,
      quantity: sacos,
      total: 0,
      detail: `${volumenM3.toFixed(2)} m³ de escombro`
    });
  }
  if (volumenM3 >= 2) {
    const contenedor = materialById('contenedor_escombros');
    lines.push({
      material: contenedor,
      quantity: 1,
      total: 0,
      detail: `Contenedor 3 m³ para ${volumenM3.toFixed(2)} m³ de escombro`
    });
  }
  const disco = materialById('disco_diamante');
  lines.push({
    material: disco,
    quantity: Math.max(1, Math.ceil(totalDemoler / 25)),
    total: 0,
    detail: 'Corte y demolición'
  });
  const plastico = materialById('plastico_protector');
  lines.push({
    material: plastico,
    quantity: Math.max(1, Math.ceil(totalDemoler / Number(plastico.superficieM2 ?? 20))),
    total: 0,
    detail: 'Protección de zonas adyacentes'
  });

  return finalizeCalculation(totalDemoler, lines, 'bano_demolicion', laborOn);
}

function blockAlicatado(opts: BathOptions): CalculationResult {
  const { width, length, wallHeight, baldosaId, laborOn } = opts;
  const areaSuelo = Math.max(0, width * length);
  const perimetro = 2 * (width + length);
  const areaParedes = Math.max(0, perimetro * wallHeight);
  const area = areaSuelo + areaParedes;
  if (area <= 0) return finalizeCalculation(0, [], 'bano_alicatado', laborOn);

  const consumos = catalog.consumos.bano_alicatado;
  const desperdicio = Number(consumos.desperdicio ?? 0.1);
  const adhesivoKgPorM2 = Number(consumos.adhesivoKgPorM2 ?? 4.5);
  const lechadaKgPorM2 = Number(consumos.lechadaKgPorM2 ?? 0.5);
  const crucetasPorM2 = Number(consumos.crucetasPorM2 ?? 6);
  const lines: Line[] = [];

  const baldosa = materialById(baldosaId ?? 'azulejo_30x60');
  lines.push({
    material: baldosa,
    quantity: Math.ceil(ceilWithWaste(area, desperdicio) / Number(baldosa.superficieM2 ?? 1)),
    total: 0,
    detail: `Suelo + paredes · ${baldosa.formato}`
  });

  const adhesivo = materialById('adhesivo_c2te');
  lines.push({
    material: adhesivo,
    quantity: Math.ceil((area * adhesivoKgPorM2) / Number(adhesivo.kgPorEnvase ?? 25)),
    total: 0,
    detail: `${adhesivoKgPorM2} kg/m² · C2TE flexible`
  });

  const crucetas = materialById('crucetas_2mm');
  lines.push({
    material: crucetas,
    quantity: Math.ceil((area * crucetasPorM2) / Number(crucetas.udsPorEnvase ?? 250)),
    total: 0,
    detail: `~${crucetasPorM2} uds/m²`
  });

  const lechada = materialById('lechada_cg2');
  lines.push({
    material: lechada,
    quantity: Math.ceil((area * lechadaKgPorM2) / Number(lechada.kgPorEnvase ?? 5)),
    total: 0,
    detail: `${lechadaKgPorM2} kg/m² · ${lechada.formato}`
  });

  return finalizeCalculation(area, lines, 'bano_alicatado', laborOn);
}

function blockFontaneria(opts: BathOptions): CalculationResult {
  const { puntosAgua, laborOn } = opts;
  if (puntosAgua <= 0) return finalizeCalculation(0, [], 'bano_fontaneria', laborOn);
  const consumos = catalog.consumos.bano_fontaneria;
  const metrosPorPunto = Number(consumos.metrosPorPunto ?? 4);
  const metrosTotales = puntosAgua * metrosPorPunto;
  const lines: Line[] = [];

  const tuberia = materialById('tuberia_ppr_20');
  lines.push({
    material: tuberia,
    quantity: Math.ceil(metrosTotales / Number(tuberia.longitudM ?? 4)),
    total: 0,
    detail: `${metrosTotales} m lineales en PPR 20 mm`
  });

  const codos = materialById('codo_ppr_20');
  lines.push({
    material: codos,
    quantity: Math.max(1, Math.ceil(puntosAgua * 2)),
    total: 0,
    detail: 'Codos 90° por punto'
  });

  const tes = materialById('te_ppr_20');
  lines.push({
    material: tes,
    quantity: Math.max(1, Math.ceil(puntosAgua / 2)),
    total: 0,
    detail: 'Tes de distribución'
  });

  return finalizeCalculation(puntosAgua, lines, 'bano_fontaneria', laborOn);
}

function blockSanitarios(opts: BathOptions): CalculationResult {
  const { inodoro, lavabo, platoDucha, mampara, espejo, laborOn } = opts;
  const laborInfo = catalog.manoObra.bano_sanitarios;
  const laborUd = laborInfo.precioUd ?? 90;
  const horasPorUd = laborInfo.horasPorUd ?? 1.5;
  const lines: Line[] = [];
  let unidades = 0;

  if (inodoro) {
    unidades++;
    lines.push({ material: materialById('inodoro_tanque_bajo'), quantity: 1, total: 0, detail: 'Inodoro tanque bajo' });
  }
  if (lavabo) {
    unidades++;
    lines.push({ material: materialById('lavabo_60'), quantity: 1, total: 0, detail: 'Lavabo sobre encimera' });
    lines.push({ material: materialById('mueble_lavabo_60'), quantity: 1, total: 0, detail: 'Mueble lavabo 60 cm' });
    lines.push({ material: materialById('grifo_lavabo_monomando'), quantity: 1, total: 0, detail: 'Grifo monomando lavabo' });
    lines.push({ material: materialById('sifon_lavabo'), quantity: 1, total: 0, detail: 'Sifón lavabo' });
  }
  if (platoDucha) {
    unidades++;
    lines.push({ material: materialById('plato_ducha_80x80'), quantity: 1, total: 0, detail: 'Plato de ducha resina 80×80' });
    lines.push({ material: materialById('grifo_ducha_monomando'), quantity: 1, total: 0, detail: 'Grifo monomando ducha' });
  }
  if (mampara) {
    unidades++;
    lines.push({ material: materialById('mampara_ducha_80'), quantity: 1, total: 0, detail: 'Mampara corredera' });
  }
  if (espejo) {
    unidades++;
    lines.push({ material: materialById('espejo_bano_60'), quantity: 1, total: 0, detail: 'Espejo LED 60 cm' });
  }

  const labor = laborOn ? unidades * laborUd : 0;
  const hours = Math.max(0, unidades * horasPorUd);
  const linesFinal: Line[] = lines.map((l) => ({
    ...l,
    total: l.quantity * l.material.precio
  }));
  const total = linesFinal.reduce((sum, l) => sum + l.total, 0);
  return { area: unidades, lines: linesFinal, total, labor, hours, grandTotal: total + labor };
}

function blockPintura(opts: BathOptions): CalculationResult {
  const { width, length, laborOn } = opts;
  const areaSuelo = Math.max(0, width * length);
  if (areaSuelo <= 0) return finalizeCalculation(0, [], 'bano_pintura', laborOn);
  const consumos = catalog.consumos.bano_pintura;
  const manos = Number(consumos.manos ?? 2);
  const rendimientoM2PorLitro = Number(consumos.rendimientoM2PorLitro ?? 8);
  const totalLitros = (areaSuelo * manos) / rendimientoM2PorLitro;
  const lines: Line[] = [];

  const imprimacion = materialById('imprimacion_pintura_10l');
  lines.push({
    material: imprimacion,
    quantity: Math.max(1, Math.ceil(areaSuelo / Number(imprimacion.superficieM2 ?? 80))),
    total: 0,
    detail: 'Imprimación al agua'
  });

  const pintura = materialById('pintura_plastica_15l');
  lines.push({
    material: pintura,
    quantity: Math.max(1, Math.ceil(totalLitros / 15)),
    total: 0,
    detail: `${manos} manos · ${totalLitros.toFixed(1)} L`
  });

  const cinta = materialById('cinta_pintar_48mm');
  lines.push({
    material: cinta,
    quantity: Math.max(1, Math.ceil(2 * (width + length) / Number(cinta.longitudM ?? 45))),
    total: 0,
    detail: `Perímetro ${(2 * (width + length)).toFixed(2)} m`
  });

  const plastico = materialById('plastico_protector');
  lines.push({
    material: plastico,
    quantity: Math.max(1, Math.ceil(areaSuelo / Number(plastico.superficieM2 ?? 20))),
    total: 0,
    detail: 'Protección'
  });

  return finalizeCalculation(areaSuelo, lines, 'bano_pintura', laborOn);
}

export function calculateBath(options: BathOptions): CalculationResult {
  const blocks: CalculationResult[] = [];
  if (options.withDemolicion) blocks.push(blockDemolicion(options));
  if (options.withAlicatado) blocks.push(blockAlicatado(options));
  if (options.withFontaneria) blocks.push(blockFontaneria(options));
  if (options.withSanitarios) blocks.push(blockSanitarios(options));
  if (options.withPintura) blocks.push(blockPintura(options));

  const lines: Line[] = [];
  let total = 0;
  let labor = 0;
  let hours = 0;
  let area = 0;

  for (const block of blocks) {
    lines.push(...block.lines);
    total += block.total;
    labor += block.labor;
    hours += block.hours;
    area += block.area;
  }

  return { area, lines, total, labor, hours, grandTotal: total + labor };
}

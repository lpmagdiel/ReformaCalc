import { material as materialById, catalog } from '$lib/data/db';
import { ceilWithWaste, finalizeCalculation, type CalculationResult, type Line } from './calc';

export type FloorKind = 'tarima' | 'ceramica' | 'microcemento';
export type FloorSurface = 'tarima_laminada' | 'tarima_madera' | 'gres' | 'azulejo';
export type AdhesiveType = 'C1' | 'C2TE';
export type UnderlaymentType = 'espuma' | 'corcho';

export type FloorOptions = {
  kind: FloorKind;
  width: number;
  length: number;
  laborOn: boolean;

  // tarima
  tarimaSurface?: FloorSurface;
  underlayment?: UnderlaymentType;
  perimetroExtra?: number;

  // cerámica / microcemento
  baldosaId?: string;
  adhesive?: AdhesiveType;
  aplicarNivelacion?: boolean;
};

export const FLOOR_DEFAULTS: FloorOptions = {
  kind: 'tarima',
  width: 4,
  length: 5,
  laborOn: true,
  tarimaSurface: 'tarima_laminada',
  underlayment: 'espuma',
  perimetroExtra: 0,
  baldosaId: 'gres_porcelanico_60x60',
  adhesive: 'C2TE',
  aplicarNivelacion: false
};

export function laborKey(kind: FloorKind): string {
  return kind;
}

const TARIAM_MAP: Record<string, string> = {
  tarima_laminada: 'tarima_laminada_ac4',
  tarima_madera: 'tarima_madera_roble'
};

function calculateTarima(opts: FloorOptions): CalculationResult {
  const { width, length, tarimaSurface, underlayment, perimetroExtra, laborOn } = opts;
  const area = Math.max(0, width * length);
  const consumos = catalog.consumos.tarima;
  const desperdicio = Number(consumos.desperdicio ?? 0);
  const perimetro = 2 * (width + length) + (perimetroExtra ?? 0);
  const lines: Line[] = [];

  const tarimaId = TARIAM_MAP[tarimaSurface ?? 'tarima_laminada'] ?? 'tarima_laminada_ac4';
  const tarima = materialById(tarimaId);
  lines.push({
    material: tarima,
    quantity: Math.ceil(ceilWithWaste(area, desperdicio) / Number(tarima.superficieM2 ?? 1)),
    total: 0,
    detail: `${tarima.formato} · desperdicio ${(desperdicio * 100).toFixed(0)}%`
  });

  const underlaymentId = underlayment === 'corcho' ? 'underlayment_cork' : 'underlayment_espuma';
  const ull = materialById(underlaymentId);
  lines.push({
    material: ull,
    quantity: Math.ceil(ceilWithWaste(area, 0.05) / Number(ull.superficieM2 ?? 1)),
    total: 0,
    detail: 'Lámina anti-impacto'
  });

  const rodapie = materialById('rodapie_laminado');
  const rodapieCount = Math.ceil(perimetro / Number(rodapie.longitudM ?? 2.4));
  lines.push({
    material: rodapie,
    quantity: rodapieCount,
    total: 0,
    detail: `Perímetro ${perimetro.toFixed(2)} m`
  });

  if (area > Number(consumos.juntaDilatacionCadaM2 ?? 25)) {
    const junta = materialById('perfil_junta_dilatacion');
    const juntas = Math.ceil(area / Number(consumos.juntaDilatacionCadaM2 ?? 25));
    lines.push({
      material: junta,
      quantity: juntas,
      total: 0,
      detail: `Juntas cada ${consumos.juntaDilatacionCadaM2} m²`
    });
  }

  return finalizeCalculation(area, lines, laborKey('tarima'), laborOn);
}

function calculateCeramica(opts: FloorOptions): CalculationResult {
  const { width, length, baldosaId, adhesive, aplicarNivelacion, laborOn } = opts;
  const area = Math.max(0, width * length);
  const consumos = catalog.consumos.ceramica;
  const desperdicio = Number(consumos.desperdicio ?? 0);
  const adhesivoKgPorM2 = Number(consumos.adhesivoKgPorM2 ?? 4.5);
  const lechadaKgPorM2 = Number(consumos.lechadaKgPorM2 ?? 0.5);
  const crucetasPorM2 = Number(consumos.crucetasPorM2 ?? 6);
  const lines: Line[] = [];

  const baldosa = materialById(baldosaId ?? 'gres_porcelanico_60x60');
  lines.push({
    material: baldosa,
    quantity: Math.ceil(ceilWithWaste(area, desperdicio) / Number(baldosa.superficieM2 ?? 1)),
    total: 0,
    detail: `${baldosa.formato} · desperdicio ${(desperdicio * 100).toFixed(0)}%`
  });

  const adhesivoId = adhesive === 'C2TE' ? 'adhesivo_c2te' : 'adhesivo_cementoso_c1';
  const adhesivo = materialById(adhesivoId);
  lines.push({
    material: adhesivo,
    quantity: Math.ceil((area * adhesivoKgPorM2) / Number(adhesivo.kgPorEnvase ?? 25)),
    total: 0,
    detail: `${adhesivoKgPorM2} kg/m² · ${adhesivo.formato}`
  });

  if (aplicarNivelacion) {
    const nivel = materialById('mortero_nivelacion');
    lines.push({
      material: nivel,
      quantity: Math.ceil(area / Number(nivel.superficieM2 ?? 1.5)),
      total: 0,
      detail: 'Mortero autonivelante'
    });
  }

  const crucetas = materialById('crucetas_2mm');
  const crucetasBolsas = Math.ceil((area * crucetasPorM2) / Number(crucetas.udsPorEnvase ?? 250));
  lines.push({
    material: crucetas,
    quantity: crucetasBolsas,
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

  return finalizeCalculation(area, lines, laborKey('ceramica'), laborOn);
}

function calculateMicrocemento(opts: FloorOptions): CalculationResult {
  const { width, length, aplicarNivelacion, laborOn } = opts;
  const area = Math.max(0, width * length);
  const consumos = catalog.consumos.microcemento;
  const desperdicio = Number(consumos.desperdicio ?? 0);
  const capasBase = Number(consumos.capasBase ?? 2);
  const capasAcabado = Number(consumos.capasAcabado ?? 2);
  const manosBarniz = Number(consumos.manosBarniz ?? 2);
  const lines: Line[] = [];

  if (aplicarNivelacion) {
    const nivel = materialById('mortero_nivelacion');
    lines.push({
      material: nivel,
      quantity: Math.ceil(area / Number(nivel.superficieM2 ?? 1.5)),
      total: 0,
      detail: 'Mortero autonivelante (base)'
    });
  }

  const imprimacion = materialById('imprimacion_microcemento');
  lines.push({
    material: imprimacion,
    quantity: Math.max(1, Math.ceil(area / Number(imprimacion.superficieM2 ?? 25))),
    total: 0,
    detail: 'Imprimación promotora de adherencia'
  });

  const malla = materialById('malla_fibra_microcemento');
  lines.push({
    material: malla,
    quantity: Math.max(1, Math.ceil(area / Number(malla.superficieM2 ?? 50))),
    total: 0,
    detail: 'Malla de fibra de vidrio'
  });

  const base = materialById('microcemento_base');
  lines.push({
    material: base,
    quantity: Math.max(1, Math.ceil(ceilWithWaste(area * capasBase, desperdicio) / Number(base.superficieM2 ?? 10))),
    total: 0,
    detail: `${capasBase} capas · ${base.formato}`
  });

  const acabado = materialById('microcemento_acabado');
  lines.push({
    material: acabado,
    quantity: Math.max(1, Math.ceil(ceilWithWaste(area * capasAcabado, desperdicio) / Number(acabado.superficieM2 ?? 10))),
    total: 0,
    detail: `${capasAcabado} capas · ${acabado.formato}`
  });

  const barniz = materialById('barniz_poliuretano_micro');
  lines.push({
    material: barniz,
    quantity: Math.max(1, Math.ceil(ceilWithWaste(area * manosBarniz, 0.05) / Number(barniz.superficieM2 ?? 20))),
    total: 0,
    detail: `${manosBarniz} manos · sellado poliuretano`
  });

  return finalizeCalculation(area, lines, laborKey('microcemento'), laborOn);
}

export function calculateFloor(options: FloorOptions): CalculationResult {
  if (options.kind === 'tarima') return calculateTarima(options);
  if (options.kind === 'ceramica') return calculateCeramica(options);
  return calculateMicrocemento(options);
}

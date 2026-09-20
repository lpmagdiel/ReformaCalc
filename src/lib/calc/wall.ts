import { material as materialById, catalog } from '$lib/data/db';
import { ceilWithWaste, finalizeCalculation, type CalculationResult, type Line } from './calc';

export type WallKind = 'drywall' | 'block' | 'ladrillo';
export type WallThickness = 'M48' | 'M70' | 'M90';

export type Hueco = {
  id: string;
  tipo: 'puerta' | 'ventana';
  nombre: string;
  ancho: number;
  alto: number;
  cantidad: number;
};

export type WallOptions = {
  kind: WallKind;
  width: number;
  height: number;
  huecos: Hueco[];
  studSpacing: 40 | 50 | 60 | 80;
  thickness: WallThickness;
  withInsulation: boolean;
  laborOn: boolean;
  merma: number;
  laborRate?: number;
};

export const WALL_DEFAULTS: WallOptions = {
  kind: 'drywall',
  width: 3.2,
  height: 2.6,
  huecos: [],
  studSpacing: 60,
  thickness: 'M48',
  withInsulation: true,
  laborOn: true,
  merma: 0.05
};

/** Suma de m² a descontar por los huecos definidos. */
export function huecosArea(huecos: Hueco[]): number {
  return huecos.reduce((sum, h) => sum + (h.ancho * h.alto * h.cantidad), 0);
}

export function calculateWall(options: WallOptions): CalculationResult {
  const { kind, width, height, huecos, studSpacing, withInsulation, laborOn, merma, laborRate } = options;
  const openings = huecosArea(huecos);
  const areaBruta = Math.max(0, width * height);
  const area = Math.max(0, areaBruta - openings);
  const lines: Line[] = [];

  if (kind === 'drywall') {
    const plates = materialById('placa_yeso_estandar');
    const studs = materialById('montante_m48');
    const tracks = materialById('canal_c48');
    const screws = materialById('tornillos_placa');
    const structureScrews = materialById('tornillos_estructura');
    const jointTape = materialById('cinta_juntas');
    const joint = materialById('pasta_juntas');
    const insulation = materialById('lana_mineral');
    const consumos = catalog.consumos.drywall;
    const wastePlates = Number(consumos.desperdicioPlacas ?? 0) + merma;
    const plateCount = ceilWithWaste((area * 2) / Number(plates.superficieM2 ?? 1), wastePlates);
    const studCount = Math.ceil(width / (studSpacing / 100)) + 1;
    const trackCount = ceilWithWaste((width * 2) / Number(tracks.longitudM ?? 3), 0.08 + merma);

    lines.push({ material: plates, quantity: plateCount, total: 0, detail: `2 caras · 2,5 × 1,2 m · merma ${(wastePlates * 100).toFixed(0)}%` });
    lines.push({ material: studs, quantity: studCount, total: 0, detail: `Montante vertical cada ${studSpacing} cm` });
    lines.push({ material: tracks, quantity: trackCount, total: 0, detail: 'Canal superior e inferior' });

    if (withInsulation) {
      lines.push({
        material: insulation,
        quantity: Math.ceil(area / Number(insulation.superficieM2 ?? 1)),
        total: 0,
        detail: 'Aislamiento interior'
      });
    }

    lines.push({
      material: screws,
      quantity: Math.ceil((area * 2 * Number(consumos.tornillosPorM2Placa ?? 0)) / Number(screws.udsPorEnvase ?? 1)),
      total: 0,
      detail: screws.formato
    });
    lines.push({
      material: structureScrews,
      quantity: Math.ceil((studCount * Number(consumos.tornillosEstructuraPorMontante ?? 0)) / Number(structureScrews.udsPorEnvase ?? 1)),
      total: 0,
      detail: structureScrews.formato
    });
    lines.push({
      material: jointTape,
      quantity: Math.ceil((plateCount * Number(consumos.cintaMetrosPorPlaca ?? 0)) / Number(jointTape.longitudM ?? 1)),
      total: 0,
      detail: jointTape.formato
    });
    lines.push({
      material: joint,
      quantity: Math.ceil((area * 2 * Number(consumos.pastaKgPorM2Placa ?? 0)) / Number(joint.kgPorEnvase ?? 1)),
      total: 0,
      detail: joint.formato
    });
  } else {
    const wallKind: WallKind = kind;
    const unit = materialById(wallKind === 'block' ? 'bloque_hormigon_15' : 'ladrillo_hueco_doble');
    const mortar = materialById('mortero_seco');
    const consumos = catalog.consumos[wallKind] ?? {};
    const udsPorM2 = Number(consumos.udsPorM2 ?? 0);
    const desperdicio = Number(consumos.desperdicio ?? 0) + merma;
    const morteroKgPorM2 = Number(consumos.morteroKgPorM2 ?? 0);

    lines.push({
      material: unit,
      quantity: Math.ceil(area * udsPorM2 * (1 + desperdicio)),
      total: 0,
      detail: `${udsPorM2} uds./m² · merma ${(desperdicio * 100).toFixed(0)}%`
    });
    lines.push({
      material: mortar,
      quantity: Math.ceil((area * morteroKgPorM2) / Number(mortar.kgPorEnvase ?? 25)),
      total: 0,
      detail: `${morteroKgPorM2} kg/m² · ${mortar.formato}`
    });
  }

  return finalizeCalculation(area, lines, kind, laborOn, laborRate);
}

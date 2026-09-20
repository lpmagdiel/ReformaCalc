import type { Material } from '$lib/calc/types';
import { catalog } from '$lib/data/db';

export type Line = {
  material: Material;
  quantity: number;
  total: number;
  detail: string;
};

export type CalculationResult = {
  area: number;
  lines: Line[];
  total: number;
  labor: number;
  hours: number;
  grandTotal: number;
};

export function ceilWithWaste(value: number, waste = 0): number {
  return Math.ceil(value * (1 + waste));
}

/**
 * Calcula el coste de mano de obra y horas a partir de la información del
 * sistema y del área. Devuelve 0 si `laborOn` es false.
 *
 * Si se pasa `laborRateOverride`, se usa en lugar del valor del catálogo.
 */
export function finalizeCalculation(
  area: number,
  lines: Line[],
  laborKey: string,
  laborOn: boolean,
  laborRateOverride?: number
): CalculationResult {
  lines.forEach((line) => (line.total = line.quantity * line.material.precio));
  const laborInfo = catalog.manoObra[laborKey] ?? catalog.manoObra.drywall;
  const laborRate = laborRateOverride ?? laborInfo.precioM2 ?? 0;
  const labor = laborOn ? area * laborRate : 0;
  const horasPorM2 = laborInfo.m2PorDia ? 8 / laborInfo.m2PorDia : 0;
  const hours = Math.max(0, area * horasPorM2);
  const total = lines.reduce((sum, line) => sum + line.total, 0);
  return { area, lines, total, labor, hours, grandTotal: total + labor };
}

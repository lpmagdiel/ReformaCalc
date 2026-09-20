import { describe, expect, it } from 'vitest';
import { calculateWall, huecosArea, WALL_DEFAULTS } from './wall';
import { calculateRoof, ROOF_DEFAULTS } from './roof';
import { calculateFloor, FLOOR_DEFAULTS } from './floor';
import { calculateBath, BATH_DEFAULTS } from './bath';

describe('wall', () => {
  it('drywall 3.2x2.6 sin huecos', () => {
    const r = calculateWall({ ...WALL_DEFAULTS, kind: 'drywall', width: 3.2, height: 2.6, huecos: [] });
    expect(r.area).toBeCloseTo(8.32, 2);
    expect(r.lines.length).toBeGreaterThan(0);
    expect(r.total).toBeGreaterThan(0);
    expect(r.grandTotal).toBeGreaterThan(r.total); // mano de obra
  });

  it('resta huecos correctamente', () => {
    const huecos = [{ id: 'p1', tipo: 'puerta' as const, nombre: 'Puerta', ancho: 0.82, alto: 2.10, cantidad: 1 }];
    expect(huecosArea(huecos)).toBeCloseTo(1.722, 3);
    const r = calculateWall({ ...WALL_DEFAULTS, kind: 'drywall', width: 3.2, height: 2.6, huecos });
    expect(r.area).toBeCloseTo(8.32 - 1.722, 2);
  });

  it('block no incluye aislamiento', () => {
    const r = calculateWall({ ...WALL_DEFAULTS, kind: 'block', width: 3, height: 2.5, huecos: [] });
    expect(r.lines.some((l) => l.material.id === 'lana_mineral')).toBe(false);
    expect(r.lines.some((l) => l.material.id === 'bloque_hormigon_15')).toBe(true);
  });

  it('merma adicional aumenta cantidades', () => {
    const base = calculateWall({ ...WALL_DEFAULTS, kind: 'drywall', width: 3, height: 2.5, huecos: [], merma: 0 });
    const conMerma = calculateWall({ ...WALL_DEFAULTS, kind: 'drywall', width: 3, height: 2.5, huecos: [], merma: 0.10 });
    const placasBase = base.lines.find((l) => l.material.id === 'placa_yeso_estandar')?.quantity ?? 0;
    const placasConMerma = conMerma.lines.find((l) => l.material.id === 'placa_yeso_estandar')?.quantity ?? 0;
    expect(placasConMerma).toBeGreaterThanOrEqual(placasBase);
  });

  it('mano de obra editable', () => {
    const a = calculateWall({ ...WALL_DEFAULTS, kind: 'drywall', width: 3, height: 2.5, huecos: [] });
    const b = calculateWall({ ...WALL_DEFAULTS, kind: 'drywall', width: 3, height: 2.5, huecos: [], laborRate: 50 });
    expect(b.labor).toBeGreaterThan(a.labor);
  });

  it('laborOn=false quita mano de obra', () => {
    const r = calculateWall({ ...WALL_DEFAULTS, kind: 'drywall', width: 3, height: 2.5, huecos: [], laborOn: false });
    expect(r.labor).toBe(0);
    expect(r.grandTotal).toBe(r.total);
  });
});

describe('roof', () => {
  it('techo continuo 4x3', () => {
    const r = calculateRoof({ ...ROOF_DEFAULTS, kind: 'continuo', width: 4, length: 3 });
    expect(r.area).toBe(12);
    expect(r.lines.some((l) => l.material.id === 'placa_yeso_estandar')).toBe(true);
  });

  it('techo desmontable usa perfiles T', () => {
    const r = calculateRoof({ ...ROOF_DEFAULTS, kind: 'desmontable', width: 4, length: 3 });
    expect(r.lines.some((l) => l.material.id === 'perfil_T_primario_24')).toBe(true);
    expect(r.lines.some((l) => l.material.id === 'panel_acustico_60x60')).toBe(true);
  });
});

describe('floor', () => {
  it('tarima 4x5', () => {
    const r = calculateFloor({ ...FLOOR_DEFAULTS, kind: 'tarima', width: 4, length: 5 });
    expect(r.area).toBe(20);
    expect(r.lines.some((l) => l.material.id.startsWith('tarima_'))).toBe(true);
  });

  it('cerámica incluye adhesivo y lechada', () => {
    const r = calculateFloor({ ...FLOOR_DEFAULTS, kind: 'ceramica', width: 4, length: 5 });
    expect(r.lines.some((l) => l.material.id === 'adhesivo_c2te')).toBe(true);
    expect(r.lines.some((l) => l.material.id === 'lechada_cg2')).toBe(true);
  });

  it('microcemento incluye barniz', () => {
    const r = calculateFloor({ ...FLOOR_DEFAULTS, kind: 'microcemento', width: 4, length: 5 });
    expect(r.lines.some((l) => l.material.id === 'barniz_poliuretano_micro')).toBe(true);
    expect(r.lines.some((l) => l.material.id === 'microcemento_base')).toBe(true);
  });
});

describe('bath', () => {
  it('baño completo 2.5x3 con todos los bloques', () => {
    const r = calculateBath({ ...BATH_DEFAULTS, width: 2.5, length: 3 });
    expect(r.lines.some((l) => l.material.id === 'inodoro_tanque_bajo')).toBe(true);
    expect(r.lines.some((l) => l.material.id === 'plato_ducha_80x80')).toBe(true);
    expect(r.lines.some((l) => l.material.id === 'azulejo_30x60')).toBe(true);
    expect(r.lines.some((l) => l.material.id === 'tuberia_ppr_20')).toBe(true);
    expect(r.lines.some((l) => l.material.id === 'pintura_plastica_15l')).toBe(true);
    expect(r.grandTotal).toBeGreaterThan(0);
  });

  it('desactivar bloques quita materiales', () => {
    const completo = calculateBath({ ...BATH_DEFAULTS });
    const sinDemolicion = calculateBath({ ...BATH_DEFAULTS, withDemolicion: false });
    expect(sinDemolicion.lines.length).toBeLessThan(completo.lines.length);
  });

  it('sin sanitarios no genera líneas de sanitarios', () => {
    const r = calculateBath({ ...BATH_DEFAULTS, withSanitarios: false });
    expect(r.lines.some((l) => l.material.id === 'inodoro_tanque_bajo')).toBe(false);
  });
});

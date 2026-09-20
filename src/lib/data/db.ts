import raw from './catalog.json';
import type {
  Categoria,
  ManoObraDB,
  Material,
  MaterialesDB,
  Proveedor,
  Sistema
} from '$lib/calc/types';

/** Catálogo unificado (versión tipada del JSON). */
export const catalog = raw as MaterialesDB;

/** Acceso rápido por id de material. */
const porId = new Map<string, Material>(catalog.materiales.map((m) => [m.id, m]));

/** Acceso rápido por proveedor. */
const porProveedor = new Map<Proveedor, Material[]>();
for (const m of catalog.materiales) {
  if (!m.proveedor) continue;
  const lista = porProveedor.get(m.proveedor) ?? [];
  lista.push(m);
  porProveedor.set(m.proveedor, lista);
}

/** Acceso rápido por sistema. */
const porSistema = new Map<Sistema, Material[]>();
for (const m of catalog.materiales) {
  for (const s of m.sistemas) {
    const lista = porSistema.get(s) ?? [];
    lista.push(m);
    porSistema.set(s, lista);
  }
}

/** Acceso rápido por categoría. */
const porCategoria = new Map<Categoria, Material[]>();
for (const m of catalog.materiales) {
  const lista = porCategoria.get(m.categoria) ?? [];
  lista.push(m);
  porCategoria.set(m.categoria, lista);
}

/** Devuelve un material por id o lanza un error si no existe. */
export function material(id: string): Material {
  const m = porId.get(id);
  if (!m) throw new Error(`Material no encontrado en el catálogo: ${id}`);
  return m;
}

/** Devuelve todos los materiales del catálogo. */
export function materiales(): Material[] {
  return catalog.materiales;
}

/** Devuelve los materiales que pertenecen al sistema indicado. */
export function materialesPorSistema(sistema: Sistema): Material[] {
  return porSistema.get(sistema) ?? [];
}

/** Devuelve los materiales de la categoría indicada. */
export function materialesPorCategoria(categoria: Categoria): Material[] {
  return porCategoria.get(categoria) ?? [];
}

/** Devuelve los materiales del proveedor indicado. */
export function materialesPorProveedor(proveedor: Proveedor): Material[] {
  return porProveedor.get(proveedor) ?? [];
}

/** Lista de proveedores definidos en el catálogo. */
export function proveedores() {
  return catalog.proveedores;
}

/** Devuelve el nombre del proveedor o el id como fallback. */
export function proveedorNombre(id?: Proveedor | string | null): string {
  if (!id) return '';
  const found = catalog.proveedores.find((p) => p.id === id);
  return found?.nombre ?? String(id);
}

/** Devuelve la mano de obra asociada a un sistema (con fallback a drywall). */
export function manoObra(sistema: string): ManoObraDB {
  return catalog.manoObra[sistema] ?? catalog.manoObra.drywall;
}

/** Devuelve los consumos técnicos de un sistema. */
export function consumos(sistema: string): Record<string, number> {
  return catalog.consumos[sistema] ?? {};
}

/** Devuelve los presets de huecos (puertas / ventanas) del catálogo. */
export function huecosPreset() {
  return catalog.huecosPreset;
}

/** Acceso directo al bloque `meta` del catálogo. */
export function meta() {
  return catalog.meta;
}

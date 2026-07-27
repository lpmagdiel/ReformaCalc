import raw from './materiales.json';
import type { Material, MaterialesDB, TipoPared, ManoObraDB } from '$lib/calc/types';

/** Base de datos local de materiales (volcado de obramat.es / fuentes alternativas). */
export const db = raw as MaterialesDB;

const porId = new Map<string, Material>(db.materiales.map((m) => [m.id, m]));

export function material(id: string): Material {
	const m = porId.get(id);
	if (!m) throw new Error(`Material no encontrado en la base de datos: ${id}`);
	return m;
}

export function manoObra(tipo: TipoPared): ManoObraDB {
	return db.manoObra[tipo];
}

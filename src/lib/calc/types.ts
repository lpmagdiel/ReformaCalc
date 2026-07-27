export type TipoPared = 'drywall' | 'block' | 'ladrillo';

export type Material = {
  id: string;
  nombre: string;
  categoria: string;
  formato: string;
  unidad: string;
  precio: number;
  superficieM2?: number;
  longitudM?: number;
  udsPorEnvase?: number;
  kgPorEnvase?: number;
  fuente: string;
};

export type ManoObraDB = {
  precioM2: number;
  m2PorDia: number;
  cuadrilla: string;
  fuente: string;
};

export type MaterialesDB = {
  meta: { fuente: string; moneda: string; ivaIncluido: boolean; fechaActualizacion: string; nota: string };
  materiales: Material[];
  manoObra: Record<TipoPared, ManoObraDB>;
  consumos: Record<string, Record<string, number>>;
};

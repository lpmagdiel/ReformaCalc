/**
 * Tipos compartidos por el catálogo unificado y las funciones de cálculo.
 *
 * - `Sistema` agrupa las familias constructivas que la app entiende (pared,
 *   techo, suelo y baño completo).
 * - `Categoria` agrupa los tipos de material (placa, perfil, sanitario...).
 * - `Material` es el esquema normalizado del catálogo unificado.
 */

export type Sistema =
  | 'drywall'
  | 'block'
  | 'ladrillo'
  | 'techo_continuo'
  | 'techo_desmontable'
  | 'tarima'
  | 'ceramica'
  | 'microcemento'
  | 'bano_demolicion'
  | 'bano_alicatado'
  | 'bano_sanitarios'
  | 'bano_fontaneria'
  | 'bano_pintura'
  | 'welding';

export const SISTEMAS: Sistema[] = [
  'drywall',
  'block',
  'ladrillo',
  'techo_continuo',
  'techo_desmontable',
  'tarima',
  'ceramica',
  'microcemento',
  'bano_demolicion',
  'bano_alicatado',
  'bano_sanitarios',
  'bano_fontaneria',
  'bano_pintura',
  'welding'
];

export type Categoria =
  | 'placa'
  | 'perfil'
  | 'tornilleria'
  | 'consumible'
  | 'aislamiento'
  | 'bloque'
  | 'ladrillo'
  | 'albanileria'
  | 'cuelgue'
  | 'panel'
  | 'suelo'
  | 'acabado'
  | 'azulejo'
  | 'baldosa'
  | 'adhesivo'
  | 'microcemento'
  | 'demolicion'
  | 'herramienta'
  | 'fontaneria'
  | 'sanitario'
  | 'mueble'
  | 'mampara'
  | 'griferia'
  | 'pintura'
  | 'electrodo'
  | 'hilo_soldadura'
  | 'gas_soldadura'
  | 'epi';

export type Proveedor = 'obramat' | 'leroymerlin' | 'ambos';

export type Material = {
  id: string;
  nombre: string;
  sistemas: Sistema[];
  categoria: Categoria;
  unidad: string;
  precio: number;
  formato: string;
  fuente?: string;
  sourceUrl?: string;
  proveedor?: Proveedor;
  superficieM2?: number;
  longitudM?: number;
  udsPorEnvase?: number;
  kgPorEnvase?: number;
  volumenLitros?: number;
  volumenM3?: number;
};

export type ManoObraDB = {
  precioM2?: number;
  precioUd?: number;
  precioPunto?: number;
  m2PorDia?: number;
  horasPorUd?: number;
  horasPorPunto?: number;
  cuadrilla?: string;
  fuente?: string;
};

export type ConsumosPorSistema = {
  [key: string]: number;
};

export type HuecoPreset = {
  id: string;
  nombre: string;
  tipo: 'puerta' | 'ventana';
  ancho: number;
  alto: number;
};

export type MaterialesDB = {
  meta: {
    fuente: string;
    moneda: string;
    ivaIncluido: boolean;
    fechaActualizacion: string;
    nota: string;
  };
  proveedores: { id: Proveedor; nombre: string; url: string }[];
  materiales: Material[];
  manoObra: Record<string, ManoObraDB>;
  consumos: Record<string, ConsumosPorSistema>;
  huecosPreset: HuecoPreset[];
};

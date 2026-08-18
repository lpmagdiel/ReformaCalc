/**
 * projectExchange.js
 *
 * Formato estándar de intercambio de proyectos de ReformaCalc.
 *
 * El formato es un objeto JSON versionado que puede exportarse a un archivo
 * `.rcp.json`, copiarse al portapelapeles o importarse desde otro origen
 * (incluida MetricWork). La generación del JSON está centralizada en
 * `serializeProject()`, que es la única fuente de verdad del formato: tanto la
 * descarga como la copia al portapapeles pasan por ella para garantizar que
 * producen exactamente el mismo resultado.
 *
 * Compatibilidad: el módulo está preparado para versiones futuras. Para 1.1,
 * 2.0... se debe ampliar `PROJECT_VERSION`/`SUPPORTED_VERSIONS` y, si cambia la
 * estructura, añadir una migración en `importProject()` que mantenga la
 * compatibilidad hacia atrás con los archivos ya generados.
 */

// ---------------------------------------------------------------------------
// Constantes del formato (evitar valores hardcodeados en la lógica)
// ---------------------------------------------------------------------------

/** Tipo oficial de documento del formato de intercambio. */
export const PROJECT_TYPE = 'reformacalc-project';

/** Versión actual del formato. */
export const PROJECT_VERSION = '1.0';

/** Versiones del formato que esta implementación puede consumir. */
export const SUPPORTED_VERSIONS = [PROJECT_VERSION];

/** Nombre de la aplicación origen por defecto. */
export const DEFAULT_APP = 'ReformaCalc';

/** Moneda por defecto (ISO 4217). */
export const DEFAULT_CURRENCY = 'EUR';

/** Idioma por defecto (ISO 639-1). */
export const DEFAULT_LANGUAGE = 'es';

/** Extensión oficial de los archivos de proyecto exportados. */
export const FILE_EXTENSION = 'rcp.json';

/** Etiquetas cortas de material por id, usadas por `projectToChecklist()`.
 *  Si un id no está mapeado se usa el nombre completo (fallback genérico). */
const SHORT_NAMES = {
  placa_yeso_estandar: 'Placa BA',
  placa_yeso_hidrofuga: 'Placa PPM',
  montante_m48: 'Perfil M48',
  montante_m70: 'Perfil M70',
  montante_m90: 'Perfil M90',
  canal_c48: 'Perfil C48',
  canal_c70: 'Perfil C70',
  canal_c90: 'Perfil C90',
  tornillos_placa: 'Tornillos 3.5x25',
  tornillos_estructura: 'Tornillos 3.5x9.5',
  cinta_juntas: 'Cinta',
  pasta_juntas: 'Pasta',
  lana_mineral: 'Lana de roca',
  banda_acustica: 'Banda acústica',
  bloque_hormigon_15: 'Bloque de hormigón',
  ladrillo_hueco_doble: 'Ladrillo hueco doble',
  mortero_seco: 'Mortero seco',
  cemento: 'Cemento',
  arena: 'Arena',
  yeso_construccion: 'Yeso',
  perfil_omega_47: 'Perfil omega 47',
  varilla_roscada_m6: 'Varilla M6',
  horquilla_cuelgue: 'Horquilla cuelgue',
  taco_varilla_m6: 'Taco M6',
  tuerca_m6: 'Tuerca M6',
  perfil_T_primario_24: 'Perfil T primario',
  perfil_T_secundario_24: 'Perfil T secundario 1,2',
  perfil_T_secundario_24_largo: 'Perfil T secundario 0,6',
  perfil_angular_T24: 'Angular T24',
  clip_cuelgue_T: 'Clip cuelgue T',
  panel_acustico_60x60: 'Panel acústico',
  tornillo_techo_metal: 'Tornillos techo'
};

// ---------------------------------------------------------------------------
// Tipos del formato
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} ProjectMetadata
 * @property {string} app Nombre de la aplicación origen.
 * @property {string} exportedAt Fecha de exportación (ISO 8601).
 * @property {string} currency Código ISO 4217 de la moneda (p. ej. "EUR").
 * @property {string} language Código ISO 639-1 del idioma (p. ej. "es").
 */

/**
 * @typedef {Object} ProjectInfo
 * @property {string} id Identificador del proyecto.
 * @property {string} name Nombre del proyecto.
 * @property {string} description Descripción opcional.
 * @property {string} createdAt Fecha de creación (ISO 8601).
 * @property {string} updatedAt Fecha de última modificación (ISO 8601).
 */

/**
 * @typedef {Object} ProjectDimensions
 * @property {number} width Ancho en metros.
 * @property {number} height Alto en metros.
 * @property {number} area Superficie neta a cubrir en m².
 */

/**
 * @typedef {Object} ProjectConfiguration
 * @property {number} faces Número de caras (p. ej. 2).
 * @property {number} studSpacing Separación entre montantes en metros (p. ej. 0.6).
 * @property {boolean} insulation Indica si se incluye aislamiento.
 */

/**
 * @typedef {Object} ProjectCalculation
 * @property {string} category Categoría constructiva (p. ej. "wall").
 * @property {string} system Sistema constructivo (p. ej. "pladur").
 * @property {ProjectDimensions} dimensions Medidas del proyecto.
 * @property {ProjectConfiguration} configuration Configuración del sistema.
 */

/**
 * @typedef {Object} ProjectSummary
 * @property {number} materials Coste de materiales.
 * @property {number} labor Coste de mano de obra.
 * @property {number} total Coste total.
 * @property {number} hours Tiempo estimado en horas.
 */

/**
 * @typedef {Object} ProjectMaterial
 * @property {string} id Identificador del material.
 * @property {string} name Nombre del material.
 * @property {string} category Categoría del material.
 * @property {string} unit Unidad de medida (p. ej. "ud", "caja", "rollo").
 * @property {number} quantity Cantidad.
 * @property {number} unitPrice Precio unitario.
 * @property {number} total Coste total de la línea.
 */

/**
 * @typedef {Object} ReformaCalcProject
 * @property {string} version Versión del formato.
 * @property {string} type Tipo de documento (PROJECT_TYPE).
 * @property {ProjectMetadata} metadata Metadatos del archivo.
 * @property {ProjectInfo} project Datos generales del proyecto.
 * @property {ProjectCalculation} calculation Cálculo y configuración.
 * @property {ProjectSummary} summary Resumen económico.
 * @property {ProjectMaterial[]} materials Lista de materiales.
 */

/**
 * Proyecto exportable: la forma de entrada de `serializeProject()` antes de
 * añadir `version`, `type` y los metadatos de exportación.
 *
 * @typedef {Object} ExportableProject
 * @property {ProjectInfo} project Datos generales del proyecto.
 * @property {ProjectCalculation} calculation Cálculo y configuración.
 * @property {ProjectSummary} summary Resumen económico.
 * @property {ProjectMaterial[]} materials Lista de materiales.
 */

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Comprueba que el valor sea un objeto simple (no null ni array).
 * @param {any} value Valor a comprobar.
 * @returns {boolean} `true` si es un objeto simple.
 */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Añade a `errors` los campos que faltan en `obj` con la etiqueta dada.
 * @param {object} obj Objeto a inspeccionar.
 * @param {string[]} fields Campos requeridos.
 * @param {string} label Prefijo usado en los mensajes de error.
 * @param {string[]} errors Lista de errores a la que se añaden los faltantes.
 */
function checkMissingFields(obj, fields, label, errors) {
  for (const field of fields) {
    if (!(field in obj)) {
      errors.push(`Falta el campo "${label}.${field}".`);
    }
  }
}

/**
 * Limpia el nombre para usarlo como nombre de archivo seguro.
 * @param {string} name Nombre del proyecto.
 * @returns {string} Nombre seguro para el sistema de archivos.
 */
function sanitizeFileName(name) {
  return String(name || 'proyecto')
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Redondea a 2 decimales evitando errores de coma flotante.
 * @param {number} value Valor a redondear.
 * @returns {number} Valor redondeado.
 */
function round2(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Formatea la cantidad con su unidad pluralizada ("7 ud", "2 paquetes").
 * @param {number} quantity Cantidad.
 * @param {string} unit Unidad de medida.
 * @returns {string} Cantidad formateada con su unidad.
 */
function formatQuantity(quantity, unit) {
  const value = round2(Number(quantity) || 0);
  if (unit === 'ud') return `${value} ud`;
  return value === 1 ? `${value} ${unit}` : `${value} ${unit}s`;
}

/** Caché de formateadores de moneda por divisa (evita recrearlos). */
const moneyFormatters = new Map();

/**
 * Formatea un importe como moneda en formato es-ES ("209,53 €").
 * @param {number} value Importe a formatear.
 * @param {string} currency Código ISO 4217.
 * @returns {string} Importe formateado.
 */
function formatMoney(value, currency = DEFAULT_CURRENCY) {
  let formatter = moneyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency });
    moneyFormatters.set(currency, formatter);
  }
  return formatter.format(Number(value) || 0);
}

/**
 * Formatea las horas estimadas ("2.7 h").
 * @param {number} hours Horas estimadas.
 * @returns {string} Horas formateadas.
 */
function formatHours(hours) {
  return `${round2(Number(hours) || 0).toFixed(1)} h`;
}

/**
 * Devuelve la etiqueta corta del material o su nombre completo como fallback.
 * @param {ProjectMaterial} material Material del proyecto.
 * @returns {string} Etiqueta corta del material.
 */
function shortMaterialName(material) {
  return SHORT_NAMES[material?.id] ?? material?.name ?? '';
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Única fuente de verdad del formato. Construye el objeto JSON completo del
 * proyecto a partir de un `ExportableProject`, añadiendo automáticamente
 * `version`, `type` y `metadata.exportedAt`.
 *
 * @param {ExportableProject & { metadata?: ProjectMetadata }} project
 *   Datos del proyecto (sin version/type/exportedAt).
 * @returns {ReformaCalcProject} Objeto del proyecto listo para serializar.
 */
export function serializeProject(project) {
  const metadata = project?.metadata ?? {};
  return {
    version: PROJECT_VERSION,
    type: PROJECT_TYPE,
    metadata: {
      app: metadata.app ?? DEFAULT_APP,
      exportedAt: new Date().toISOString(),
      currency: metadata.currency ?? DEFAULT_CURRENCY,
      language: metadata.language ?? DEFAULT_LANGUAGE
    },
    project: { ...(project?.project ?? {}) },
    calculation: { ...(project?.calculation ?? {}) },
    summary: { ...(project?.summary ?? {}) },
    materials: (project?.materials ?? []).map((material) => ({ ...material }))
  };
}

/**
 * Devuelve el JSON formateado (2 espacios) del proyecto exportado.
 *
 * @param {ExportableProject & { metadata?: ProjectMetadata }} project
 *   Datos del proyecto.
 * @returns {string} JSON formateado del proyecto.
 */
export function exportProject(project) {
  return JSON.stringify(serializeProject(project), null, 2);
}

/**
 * Descarga el proyecto como archivo `NombreProyecto.rcp.json` en el navegador.
 *
 * @param {ExportableProject & { metadata?: ProjectMetadata }} project
 *   Datos del proyecto.
 * @returns {void}
 */
export function downloadProject(project) {
  const json = exportProject(project);
  const filename = `${sanitizeFileName(project?.project?.name)}.${FILE_EXTENSION}`;
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Valida y parsea un proyecto importado.
 *
 * Acepta un string JSON (o un objeto ya parseado, por reutilización) y lanza
 * un {@link Error} con el motivo si:
 *  - el JSON no es válido,
 *  - falta el campo `version`,
 *  - falta el campo `type`,
 *  - `type` no es `reformacalc-project`.
 *
 * @param {string | ReformaCalcProject} json Cadena JSON o objeto del proyecto.
 * @returns {ReformaCalcProject} El objeto del proyecto.
 * @throws {Error} Si alguna validación falla.
 */
export function importProject(json) {
  let data;
  try {
    data = typeof json === 'string' ? JSON.parse(json) : json;
  } catch (err) {
    throw new Error(`El archivo no contiene JSON válido: ${err.message}`);
  }
  if (!isObject(data)) {
    throw new Error('El archivo no contiene un objeto de proyecto válido.');
  }
  if (!('version' in data)) {
    throw new Error('Falta el campo "version". El archivo no es un proyecto válido.');
  }
  if (!('type' in data)) {
    throw new Error('Falta el campo "type". El archivo no es un proyecto válido.');
  }
  if (data.type !== PROJECT_TYPE) {
    throw new Error(`Tipo no compatible: "${data.type}". Se esperaba "${PROJECT_TYPE}".`);
  }
  return data;
}

/**
 * Comprueba la integridad estructural de un proyecto validando la presencia de
 * `version`, `type`, `metadata`, `project`, `calculation`, `summary` y
 * `materials` (y de sus campos mínimos).
 *
 * @param {any} project Objeto del proyecto a validar (entrada no confiable).
 * @returns {{ valid: boolean, errors: string[] }} Resultado de la validación.
 */
export function validateProject(project) {
  const errors = [];
  if (!isObject(project)) {
    return { valid: false, errors: ['El proyecto no es un objeto válido.'] };
  }

  if (!('version' in project)) {
    errors.push('Falta el campo "version".');
  }
  if (!('type' in project)) {
    errors.push('Falta el campo "type".');
  } else if (project.type !== PROJECT_TYPE) {
    errors.push(`El campo "type" debe ser "${PROJECT_TYPE}" (recibido: "${project.type}").`);
  }

  if (!isObject(project.metadata)) {
    errors.push('Falta la sección "metadata".');
  } else {
    checkMissingFields(project.metadata, ['app', 'exportedAt', 'currency', 'language'], 'metadata', errors);
  }

  if (!isObject(project.project)) {
    errors.push('Falta la sección "project".');
  } else {
    checkMissingFields(project.project, ['id', 'name'], 'project', errors);
  }

  if (!isObject(project.calculation)) {
    errors.push('Falta la sección "calculation".');
  } else {
    checkMissingFields(project.calculation, ['category', 'system'], 'calculation', errors);
    if (!isObject(project.calculation.dimensions)) {
      errors.push('Falta la sección "calculation.dimensions".');
    }
    if (!isObject(project.calculation.configuration)) {
      errors.push('Falta la sección "calculation.configuration".');
    }
  }

  if (!isObject(project.summary)) {
    errors.push('Falta la sección "summary".');
  } else {
    checkMissingFields(project.summary, ['materials', 'labor', 'total', 'hours'], 'summary', errors);
  }

  if (!Array.isArray(project.materials)) {
    errors.push('Falta la sección "materials" (debe ser un array).');
  } else {
    project.materials.forEach((material, index) => {
      if (!isObject(material)) {
        errors.push(`El material en la posición ${index} no es un objeto válido.`);
      } else {
        checkMissingFields(material, ['id', 'name', 'quantity', 'unitPrice', 'total'], `materials[${index}]`, errors);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Convierte el proyecto en un checklist de texto plano compatible con
 * MetricWork, con secciones "Proyecto", "Materiales" y "Resumen".
 *
 * @param {ReformaCalcProject} project Objeto del proyecto.
 * @returns {string} Texto plano del checklist.
 */
export function projectToChecklist(project) {
  const currency = project?.metadata?.currency ?? DEFAULT_CURRENCY;
  const lines = [];

  lines.push('Proyecto', '');
  lines.push(`☐ ${project?.project?.name ?? ''}`);

  lines.push('', 'Materiales', '');
  for (const material of project?.materials ?? []) {
    lines.push(`☐ ${formatQuantity(material.quantity, material.unit)} - ${shortMaterialName(material)}`);
  }

  lines.push('', 'Resumen', '');
  lines.push(`Materiales: ${formatMoney(project?.summary?.materials ?? 0, currency)}`);
  lines.push(`Mano de obra: ${formatMoney(project?.summary?.labor ?? 0, currency)}`);
  lines.push(`Total: ${formatMoney(project?.summary?.total ?? 0, currency)}`);
  lines.push(`Tiempo estimado: ${formatHours(project?.summary?.hours ?? 0)}`);

  return lines.join('\n');
}

/**
 * Copia el mismo JSON que genera `exportProject()` al portapapeles mediante la
 * Clipboard API.
 *
 * @param {ExportableProject & { metadata?: ProjectMetadata }} project
 *   Datos del proyecto.
 * @returns {Promise<boolean>} `true` si se copió correctamente, `false` si no.
 */
export async function copyProjectToClipboard(project) {
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error('Clipboard API no disponible.');
    }
    await navigator.clipboard.writeText(exportProject(project));
    return true;
  } catch {
    return false;
  }
}

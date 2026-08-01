/**
 * rcxExporter.js
 *
 * Exportador del estándar **RCX** (ReformaCalc eXchange) v1.0.
 *
 * RCX es el formato oficial de intercambio de datos entre las aplicaciones del
 * ecosistema (ReformaCalc, MetricWork y futuras). Este módulo es independiente
 * del modelo de datos de cada app: recibe una estructura de entrada
 * normalizada (`AppData`) y la mapea a la especificación RCX, por lo que puede
 * reutilizarse desde cualquier aplicación.
 *
 * Arquitectura:
 *  - Funciones de transformación **puras** (`buildRCXProject` y helpers) que
 *    mapean `AppData` -> objeto RCX. No producen efectos secundarios.
 *  - Orquestadores de salida con efectos en el navegador: `downloadRCXFile`
 *    (descarga) y `copyRCXToClipboard` (portapapeles), aislados para mantener
 *    las transformaciones testables.
 *  - El módulo implementa además la **interfaz común de exportadores**
 *    (`canExport`, `export`, `download`, `copyToClipboard`) para que
 *    `exportManager.js` pueda tratarlo de forma genérica.
 *
 * Escalabilidad (RCX 2.x): todos los nodos opcionales no presentes se omiten
 * (ver `compact`), de modo que se pueden añadir futuras secciones
 * (`clients`, `budgets`, `attachments`, `geo`, ...) sin romper la v1.0.
 */

// ---------------------------------------------------------------------------
// Constantes del estándar
// ---------------------------------------------------------------------------

/** Identificador del formato gestionado por este exportador. */
export const FORMAT = 'rcx';

/** Tipo de documento RCX. */
export const RCX_TYPE = 'rcx-project';

/** Versión del estándar RCX emitido por este exportador. */
export const RCX_VERSION = '1.0';

/** Nombre de la app por defecto (se sobrescribe con `AppMetadata.app`). */
export const DEFAULT_SOURCE_APP = 'ReformaCalc';

/** Versión de la app por defecto (se sobrescribe con `AppMetadata.appVersion`). */
export const DEFAULT_APP_VERSION = '1.0.0';

/** Moneda por defecto (ISO 4217). */
export const DEFAULT_CURRENCY = 'EUR';

/** Idioma por defecto (ISO 639-1). */
export const DEFAULT_LANGUAGE = 'es';

/** Extensión oficial de los archivos RCX. */
export const RCX_FILE_EXTENSION = 'rcx.json';

/** Modos de salida soportados por `exportRCXProject`. */
export const OUTPUT = Object.freeze({ OBJECT: 'object', JSON: 'json' });

/** Campos mínimos de `AppData` exigidos antes de construir el documento. */
const REQUIRED_APP_DATA_FIELDS = ['title'];

// ---------------------------------------------------------------------------
// Tipos de entrada (AppData / AppMetadata) y contrato RCX
// ---------------------------------------------------------------------------

/**
 * Datos normalizados de entrada que la aplicación pasa al exportador.
 * Independiente del modelo concreto de MetricWork o ReformaCalc.
 *
 * @typedef {Object} AppDimensions
 * @property {number} [width] Ancho en metros.
 * @property {number} [height] Alto en metros.
 * @property {number} [length] Longitud en metros.
 */

/**
 * Material normalizado de entrada.
 *
 * @typedef {Object} AppMaterial
 * @property {string} [id] Identificador del material.
 * @property {string} [name] Nombre del material.
 * @property {number} [quantity] Cantidad.
 * @property {string} [unit] Unidad de medida (p. ej. "ud").
 * @property {number} [unitPrice] Precio unitario.
 * @property {number} [totalPrice] Coste total de la línea.
 */

/**
 * Estructura interna normalizada de un proyecto antes de exportar.
 *
 * @typedef {Object} AppData
 * @property {string} [id] Identificador del proyecto.
 * @property {string} title Título del proyecto (obligatorio).
 * @property {string} [description] Descripción opcional.
 * @property {string} [system] Sistema constructivo (p. ej. "pladur").
 * @property {number} [area] Superficie neta en m².
 * @property {AppDimensions} [dimensions] Dimensiones del proyecto.
 * @property {number} [estimatedHours] Horas estimadas de trabajo.
 * @property {number} [materialsCost] Coste de materiales.
 * @property {number} [laborCost] Coste de mano de obra.
 * @property {number} [totalCost] Coste total.
 * @property {AppMaterial[]} [materials] Lista de materiales.
 */

/**
 * Metadatos de la aplicación que ejecuta la exportación.
 *
 * @typedef {Object} AppMetadata
 * @property {string} [app] Nombre de la aplicación origen.
 * @property {string} [appVersion] Versión de la aplicación origen.
 * @property {string} [currency] Moneda del presupuesto (ISO 4217).
 * @property {string} [language] Idioma (ISO 639-1).
 */

// ---------------------------------------------------------------------------
// Tipos del contrato RCX v1.0
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} RCXSource
 * @property {string} app Aplicación que generó el documento.
 * @property {string} version Versión de la aplicación.
 */

/**
 * @typedef {Object} RCXMetadata
 * @property {string} exportedAt Marca de tiempo ISO 8601 de la exportación.
 * @property {string} currency Moneda (ISO 4217).
 * @property {string} language Idioma (ISO 639-1).
 */

/**
 * @typedef {Object} RCXDimensions
 * @property {number} [width] Ancho en metros.
 * @property {number} [height] Alto en metros.
 * @property {number} [length] Longitud en metros.
 */

/**
 * @typedef {Object} RCXProjectNode
 * @property {string} id Identificador del proyecto.
 * @property {string} title Título del proyecto.
 * @property {string} description Descripción.
 * @property {string} system Sistema constructivo.
 * @property {number} area Superficie en m².
 * @property {RCXDimensions} dimensions Dimensiones.
 */

/**
 * @typedef {Object} RCXCalculation
 * @property {number} estimatedHours Horas estimadas.
 */

/**
 * @typedef {Object} RCXSummary
 * @property {number} materialsCost Coste de materiales.
 * @property {number} laborCost Coste de mano de obra.
 * @property {number} totalCost Coste total.
 */

/**
 * @typedef {Object} RCXMaterial
 * @property {string} id Identificador del material.
 * @property {string} name Nombre del material.
 * @property {number} quantity Cantidad.
 * @property {string} unit Unidad de medida.
 * @property {number} unitPrice Precio unitario.
 * @property {number} totalPrice Coste total de la línea.
 */

/**
 * Documento RCX completo (contrato v1.0).
 *
 * @typedef {Object} RCXDocument
 * @property {string} version Versión del estándar.
 * @property {string} type Tipo de documento (`rcx-project`).
 * @property {RCXSource} source Aplicación origen.
 * @property {RCXMetadata} metadata Metadatos de exportación.
 * @property {RCXProjectNode} project Datos del proyecto.
 * @property {RCXCalculation} calculation Cálculo.
 * @property {RCXSummary} summary Resumen económico.
 * @property {RCXMaterial[]} materials Lista de materiales.
 */

/**
 * Opciones de salida de `exportRCXProject`.
 *
 * @typedef {Object} ExportOptions
 * @property {('object'|'json')} [output] Formato de salida. Por defecto `'object'`.
 * @property {number} [spaces] Número de espacios para indentar el JSON. Por defecto `2`.
 * @property {AppMetadata} [appMetadata] Metadatos de la app origen.
 */

/**
 * Interfaz común de los exportadores registrables en `exportManager`.
 *
 * @typedef {Object} ExporterInterface
 * @property {string} format Identificador del formato.
 * @property {(format: string) => boolean} canExport Comprueba si gestiona un formato.
 * @property {(data: AppData, options?: ExportOptions) => (RCXDocument|string)} export
 *   Genera el contenido exportado.
 * @property {(data: AppData, options?: ExportOptions) => void} download
 *   Genera y descarga el archivo en el navegador.
 * @property {(data: AppData, options?: ExportOptions) => Promise<boolean>} copyToClipboard
 *   Copia el contenido al portapapeles.
 */

// ---------------------------------------------------------------------------
// Helpers de transformación (funciones puras)
// ---------------------------------------------------------------------------

/**
 * Normaliza un valor numérico. Devuelve `0` si no es un número finito.
 * @param {*} value Valor a normalizar.
 * @returns {number} Número finito (o `0`).
 */
function toNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

/**
 * Elimina recursivamente los campos `undefined` o `null` de un valor.
 * Deja la puerta abierta a futuros nodos opcionales de RCX 2.x sin romper la
 * v1.0: cualquier propiedad no definida se omite del documento.
 *
 * @param {*} value Valor a limpiar.
 * @returns {*} Valor sin campos `undefined`/`null`.
 */
function compact(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => compact(item))
      .filter((item) => item !== undefined && item !== null);
  }
  if (value !== null && typeof value === 'object') {
    const result = {};
    for (const [key, item] of Object.entries(value)) {
      if (item !== undefined && item !== null) {
        result[key] = compact(item);
      }
    }
    return result;
  }
  return value;
}

/**
 * Limpia un nombre de archivo eliminando caracteres no seguros.
 * @param {string} name Nombre a sanitizar.
 * @returns {string} Nombre seguro para el sistema de archivos.
 */
function sanitizeFileName(name) {
  return String(name || 'proyecto')
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Valida que `AppData` contenga los datos mínimos para construir el documento.
 * Se invoca antes de cualquier construcción para fallar con un mensaje claro.
 *
 * @param {AppData} appData Datos internos del proyecto.
 * @returns {true} Si la validación es correcta.
 * @throws {Error} Si faltan datos mínimos o `materials` no es un array.
 */
export function validateAppData(appData) {
  if (!appData || typeof appData !== 'object') {
    throw new Error('No se recibieron datos de proyecto válidos para exportar.');
  }
  const missing = REQUIRED_APP_DATA_FIELDS.filter((field) => {
    const value = appData[field];
    return value === undefined || value === null || String(value).trim() === '';
  });
  if (missing.length > 0) {
    throw new Error(`Faltan datos mínimos del proyecto para exportar: ${missing.join(', ')}.`);
  }
  if (appData.materials !== undefined && !Array.isArray(appData.materials)) {
    throw new Error('La lista de materiales debe ser un array.');
  }
  return true;
}

/**
 * Construye el nodo `source` del documento RCX.
 * @param {AppMetadata} [appMetadata] Metadatos de la app origen.
 * @returns {RCXSource} Nodo `source`.
 */
function buildSource(appMetadata) {
  return {
    app: appMetadata?.app ?? DEFAULT_SOURCE_APP,
    version: appMetadata?.appVersion ?? DEFAULT_APP_VERSION
  };
}

/**
 * Construye el nodo `metadata` del documento RCX.
 * @param {AppMetadata} [appMetadata] Metadatos de la app origen.
 * @returns {RCXMetadata} Nodo `metadata`.
 */
function buildMetadata(appMetadata) {
  return {
    exportedAt: new Date().toISOString(),
    currency: appMetadata?.currency ?? DEFAULT_CURRENCY,
    language: appMetadata?.language ?? DEFAULT_LANGUAGE
  };
}

/**
 * Construye el nodo `project` del documento RCX.
 * @param {AppData} appData Datos internos del proyecto.
 * @returns {RCXProjectNode} Nodo `project`.
 */
function buildProjectNode(appData) {
  return {
    id: appData.id ?? '',
    title: appData.title ?? '',
    description: appData.description ?? '',
    system: appData.system ?? '',
    area: toNumber(appData.area),
    dimensions: compact({
      width: toNumber(appData.dimensions?.width),
      height: toNumber(appData.dimensions?.height),
      length: toNumber(appData.dimensions?.length)
    })
  };
}

/**
 * Construye el nodo `calculation` del documento RCX.
 * @param {AppData} appData Datos internos del proyecto.
 * @returns {RCXCalculation} Nodo `calculation`.
 */
function buildCalculationNode(appData) {
  return { estimatedHours: toNumber(appData.estimatedHours) };
}

/**
 * Construye el nodo `summary` del documento RCX.
 * @param {AppData} appData Datos internos del proyecto.
 * @returns {RCXSummary} Nodo `summary`.
 */
function buildSummaryNode(appData) {
  return {
    materialsCost: toNumber(appData.materialsCost),
    laborCost: toNumber(appData.laborCost),
    totalCost: toNumber(appData.totalCost)
  };
}

/**
 * Construye el nodo `materials` del documento RCX.
 * @param {AppData} appData Datos internos del proyecto.
 * @returns {RCXMaterial[]} Nodo `materials`.
 */
function buildMaterialsNode(appData) {
  if (!Array.isArray(appData.materials)) return [];
  return appData.materials
    .map((material) => ({
      id: material?.id ?? '',
      name: material?.name ?? '',
      quantity: toNumber(material?.quantity),
      unit: material?.unit ?? 'ud',
      unitPrice: toNumber(material?.unitPrice),
      totalPrice: toNumber(material?.totalPrice)
    }))
    .filter((material) => material.id !== '' || material.name !== '');
}

/**
 * Construye el nombre del archivo de descarga con la extensión RCX.
 * Si el nombre termina en `.json` se respeta (permite `.rcx.json` o `.json`).
 * @param {AppData} appData Datos internos del proyecto.
 * @param {string} [filename] Nombre base del archivo.
 * @returns {string} Nombre final del archivo (p. ej. "pared-salon.rcx.json").
 */
function buildDownloadFilename(appData, filename) {
  const base = sanitizeFileName(filename ?? appData.title ?? 'proyecto');
  return base.toLowerCase().endsWith('.json') ? base : `${base}.${RCX_FILE_EXTENSION}`;
}

// ---------------------------------------------------------------------------
// API principal del estándar RCX
// ---------------------------------------------------------------------------

/**
 * Única fuente de verdad del estándar RCX: construye el documento RCX v1.0 a
 * partir de los datos normalizados de la aplicación. Transformación pura:
 * no toca el DOM ni el portapapeles, solo mapea y normaliza datos.
 *
 * Valida los datos mínimos y genera automáticamente `exportedAt`.
 *
 * @param {AppData} appData Estructura interna normalizada del proyecto.
 * @param {AppMetadata} [appMetadata] Metadatos de la app que exporta.
 * @returns {RCXDocument} Documento RCX listo para serializar.
 * @throws {Error} Si `appData` no contiene los datos mínimos.
 */
export function buildRCXProject(appData, appMetadata) {
  validateAppData(appData);
  return compact({
    version: RCX_VERSION,
    type: RCX_TYPE,
    source: buildSource(appMetadata),
    metadata: buildMetadata(appMetadata),
    project: buildProjectNode(appData),
    calculation: buildCalculationNode(appData),
    summary: buildSummaryNode(appData),
    materials: buildMaterialsNode(appData)
  });
}

/**
 * Construye y devuelve el proyecto RCX en el formato de salida solicitado.
 *
 * @param {AppData} appData Estructura interna normalizada del proyecto.
 * @param {ExportOptions} [options] Opciones de salida.
 * @returns {RCXDocument | string} Objeto JS o JSON formateado según `options.output`.
 * @throws {Error} Si `appData` no contiene los datos mínimos.
 */
export function exportRCXProject(appData, options = {}) {
  const project = buildRCXProject(appData, options.appMetadata);
  if (options.output === OUTPUT.JSON) {
    return JSON.stringify(project, null, options.spaces ?? 2);
  }
  return project;
}

/**
 * Genera el JSON RCX y fuerza su descarga en el navegador con extensión
 * `.rcx.json` (o `.json` si el nombre lo indica). Limpia los objetos URL
 * creados con `URL.revokeObjectURL`.
 *
 * @param {AppData} appData Estructura interna normalizada del proyecto.
 * @param {string} [filename] Nombre del archivo. Por defecto `[título].rcx.json`.
 * @param {AppMetadata} [appMetadata] Metadatos de la app que exporta.
 * @returns {void}
 * @throws {Error} Si `appData` no contiene los datos mínimos.
 */
export function downloadRCXFile(appData, filename, appMetadata) {
  const json = exportRCXProject(appData, { output: OUTPUT.JSON, appMetadata });
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildDownloadFilename(appData, filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Copia el JSON RCX del proyecto al portapapeles mediante la Clipboard API.
 *
 * @param {AppData} appData Estructura interna normalizada del proyecto.
 * @param {AppMetadata} [appMetadata] Metadatos de la app que exporta.
 * @returns {Promise<boolean>} `true` si la copia fue correcta, `false` si no.
 * @throws {Error} Si `appData` no contiene los datos mínimos.
 */
export async function copyRCXToClipboard(appData, appMetadata) {
  const json = exportRCXProject(appData, { output: OUTPUT.JSON, appMetadata });
  if (!navigator.clipboard?.writeText) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(json);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Interfaz común de exportador (consumida por exportManager.js)
// ---------------------------------------------------------------------------

/**
 * Objeto exportador RCX que implementa la interfaz común. Es el valor que
 * `exportManager.js` registra en su lista de exportadores disponibles.
 *
 * @type {ExporterInterface}
 */
export const rcxExporter = {
  format: FORMAT,
  canExport(format) {
    return format === FORMAT;
  },
  export(data, options) {
    return exportRCXProject(data, options);
  },
  download(data, options) {
    downloadRCXFile(data, options?.filename, options?.appMetadata);
  },
  copyToClipboard(data, options) {
    return copyRCXToClipboard(data, options?.appMetadata);
  }
};

export default rcxExporter;

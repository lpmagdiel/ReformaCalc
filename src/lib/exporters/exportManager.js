/**
 * exportManager.js
 *
 * Gestor de exportación extensible. Proporciona un punto de entrada único a
 * todos los exportadores de la aplicación y es **abierto a extensión**: para
 * añadir un formato nuevo basta con registrar un exportador en la lista
 * `exporters` sin modificar esta lógica (principio Abierto/Cerrado).
 *
 * Cada exportador debe implementar la interfaz común:
 *   `canExport(format)`, `export(data, options)`, `download(data, options)`,
 *   `copyToClipboard(data, options)`.
 */

import rcxExporter from './rcxExporter.js';
// Los siguientes exportadores se registrarán cuando estén implementados:
// import csvExporter from './future/csvExporter.js';
// import excelExporter from './future/excelExporter.js';
// import pdfExporter from './future/pdfExporter.js';

/**
 * Exportadores disponibles. El orden no importa: la resolución se hace por
 * `canExport(format)`.
 *
 * @type {import('./rcxExporter.js').ExporterInterface[]}
 */
const exporters = [
  rcxExporter
  // csvExporter,
  // excelExporter,
  // pdfExporter
];

/**
 * Devuelve el exportador registrado que gestiona el formato solicitado.
 *
 * @param {string} format Identificador del formato (p. ej. "rcx", "csv").
 * @returns {import('./rcxExporter.js').ExporterInterface | null}
 *   Exportador encontrado o `null` si ninguno lo gestiona.
 */
export function getExporter(format) {
  return exporters.find((exporter) => exporter.canExport(format)) ?? null;
}

/**
 * Lista los formatos de exportación disponibles.
 *
 * @returns {string[]} Identificadores de formato soportados.
 */
export function getAvailableFormats() {
  return exporters.map((exporter) => exporter.format);
}

/**
 * Punto de entrada único de exportación. Genera el contenido en el formato
 * solicitado sin producir efectos en el navegador.
 *
 * @param {string} format Identificador del formato (p. ej. "rcx").
 * @param {import('./rcxExporter.js').AppData} data Datos normalizados del proyecto.
 * @param {import('./rcxExporter.js').ExportOptions} [options] Opciones del exportador.
 * @returns {object | string} Contenido exportado (objeto o string según el formato).
 * @throws {Error} Si no existe un exportador para el formato solicitado.
 */
export function exportData(format, data, options) {
  const exporter = getExporter(format);
  if (!exporter) {
    throw new Error(`Formato de exportación no soportado: "${format}".`);
  }
  return exporter.export(data, options);
}

/**
 * Genera el contenido en el formato solicitado y fuerza su descarga.
 *
 * @param {string} format Identificador del formato (p. ej. "rcx").
 * @param {import('./rcxExporter.js').AppData} data Datos normalizados del proyecto.
 * @param {import('./rcxExporter.js').ExportOptions} [options] Opciones del exportador.
 * @returns {void}
 * @throws {Error} Si no existe un exportador o el formato no soporta descarga.
 */
export function downloadData(format, data, options) {
  const exporter = getExporter(format);
  if (!exporter) {
    throw new Error(`Formato de exportación no soportado: "${format}".`);
  }
  if (typeof exporter.download !== 'function') {
    throw new Error(`El exportador "${format}" no soporta descarga de archivos.`);
  }
  exporter.download(data, options);
}

/**
 * Genera el contenido en el formato solicitado y lo copia al portapapeles.
 *
 * @param {string} format Identificador del formato (p. ej. "rcx").
 * @param {import('./rcxExporter.js').AppData} data Datos normalizados del proyecto.
 * @param {import('./rcxExporter.js').ExportOptions} [options] Opciones del exportador.
 * @returns {Promise<boolean>} `true` si la copia fue correcta, `false` si no.
 * @throws {Error} Si no existe un exportador o el formato no soporta copia.
 */
export async function copyToClipboardData(format, data, options) {
  const exporter = getExporter(format);
  if (!exporter) {
    throw new Error(`Formato de exportación no soportado: "${format}".`);
  }
  if (typeof exporter.copyToClipboard !== 'function') {
    throw new Error(`El exportador "${format}" no soporta copia al portapapeles.`);
  }
  return exporter.copyToClipboard(data, options);
}

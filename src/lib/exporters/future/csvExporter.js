/**
 * csvExporter.js
 *
 * Exportador CSV (placeholders). Implementa la interfaz común de exportadores
 * para poder registrarse en `exportManager` sin cambios en el gestor, pero aún
 * no genera contenido: todas las operaciones lanzan un error explícito.
 *
 * Para implementarlo: sustituir los `throw` por la generación real de CSV y
 * registrar `csvExporter` en la lista `exporters` de `exportManager.js`.
 */

/** Identificador del formato gestionado por este exportador. */
export const FORMAT = 'csv';

/**
 * Objeto exportador CSV que implementa la interfaz común.
 * @type {import('../rcxExporter.js').ExporterInterface}
 */
export const csvExporter = {
  format: FORMAT,
  canExport(format) {
    return format === FORMAT;
  },
  export() {
    throw new Error('El exportador CSV aún no está implementado.');
  },
  download() {
    throw new Error('El exportador CSV aún no está implementado.');
  },
  copyToClipboard() {
    return Promise.reject(new Error('El exportador CSV aún no está implementado.'));
  }
};

export default csvExporter;

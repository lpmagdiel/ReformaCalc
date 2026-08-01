/**
 * pdfExporter.js
 *
 * Exportador PDF (placeholder). Implementa la interfaz común de exportadores
 * para poder registrarse en `exportManager` sin cambios en el gestor, pero aún
 * no genera contenido: todas las operaciones lanzan un error explícito.
 *
 * Para implementarlo: sustituir los `throw` por la generación real de PDF
 * (p. ej. con `jspdf`) y registrar `pdfExporter` en la lista `exporters` de
 * `exportManager.js`.
 */

/** Identificador del formato gestionado por este exportador. */
export const FORMAT = 'pdf';

/**
 * Objeto exportador PDF que implementa la interfaz común.
 * @type {import('../rcxExporter.js').ExporterInterface}
 */
export const pdfExporter = {
  format: FORMAT,
  canExport(format) {
    return format === FORMAT;
  },
  export() {
    throw new Error('El exportador PDF aún no está implementado.');
  },
  download() {
    throw new Error('El exportador PDF aún no está implementado.');
  },
  copyToClipboard() {
    return Promise.reject(new Error('El exportador PDF aún no está implementado.'));
  }
};

export default pdfExporter;

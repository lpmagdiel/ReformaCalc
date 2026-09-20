/**
 * csvExporter.js
 *
 * Exportador CSV (valores separados por punto y coma para Excel en es-ES).
 * Estructura:
 *  - Cabecera con metadatos del proyecto (líneas `#`).
 *  - Tabla con columnas: id, nombre, categoría, unidad, cantidad, precio, total.
 *
 * Implementa la interfaz común de exportadores (canExport, export, download,
 * copyToClipboard) y se registra en `exportManager.js`.
 */

/**
 * @typedef {import('../rcxExporter.js').AppData} AppData
 */

/** Identificador del formato. */
export const FORMAT = 'csv';
/** Caracter separador (Excel España usa `;`). */
const SEP = ';';
/** Marca de orden de bytes UTF-8 para que Excel detecte acentos. */
const BOM = '\uFEFF';
/** Extensión del archivo. */
const FILE_EXTENSION = 'csv';

/** Cabecera del CSV (en formato comentario `#`). */
/**
 * @param {AppData} appData
 */
function header(appData) {
  const currency = appData?.currency ?? 'EUR';
  const lines = [
    `# ReformaCalc · Presupuesto`,
    `# Proyecto: ${appData?.title ?? ''}`,
    `# Sistema: ${appData?.system ?? ''}`,
    `# Superficie: ${Number(appData?.area ?? 0).toFixed(2)} m²`,
    `# Horas estimadas: ${Number(appData?.estimatedHours ?? 0).toFixed(1)} h`,
    `# Coste materiales: ${formatNumber(appData?.materialsCost)} ${currency}`,
    `# Coste mano de obra: ${formatNumber(appData?.laborCost)} ${currency}`,
    `# Coste total: ${formatNumber(appData?.totalCost)} ${currency}`
  ];
  return lines.join('\n');
}

/** Tabla CSV de materiales. */
/**
 * @param {AppData} appData
 */
function materialsTable(appData) {
  const headers = ['id', 'nombre', 'categoria', 'unidad', 'cantidad', 'precio_unitario', 'total'];
  const rows = [headers.join(SEP)];
  for (const m of appData?.materials ?? []) {
    rows.push(
      [
        csvField(m.id),
        csvField(m.name),
        csvField(m.unit),
        formatNumber(m.quantity),
        formatNumber(m.unitPrice),
        formatNumber(m.totalPrice)
      ].join(SEP)
    );
  }
  return rows.join('\n');
}

/**
 * @param {*} value
 */
function csvField(value) {
  const s = value == null ? '' : String(value);
  if (/[";\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * @param {*} value
 */
function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return n.toFixed(2).replace('.', ',');
}

/**
 * @param {string} name
 */
function sanitizeFileName(name) {
  return String(name || 'proyecto')
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {AppData} appData
 * @param {string} [filename]
 */
function buildDownloadFilename(appData, filename) {
  const base = sanitizeFileName(filename ?? appData?.title ?? 'proyecto');
  return base.toLowerCase().endsWith(`.${FILE_EXTENSION}`) ? base : `${base}.${FILE_EXTENSION}`;
}

/**
 * @param {AppData} appData
 */
function exportCSV(appData) {
  return `${BOM}${header(appData)}\n${materialsTable(appData)}\n`;
}

/**
 * @param {AppData} appData
 * @param {string} [filename]
 */
function downloadCSV(appData, filename) {
  const csv = exportCSV(appData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
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
 * @param {AppData} appData
 */
async function copyCSVToClipboard(appData) {
  const csv = exportCSV(appData);
  if (!navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(csv);
    return true;
  } catch {
    return false;
  }
}

export const csvExporter = {
  format: FORMAT,
  canExport(format) {
    return format === FORMAT;
  },
  export(appData) {
    return exportCSV(appData);
  },
  download(appData, options) {
    downloadCSV(appData, options?.filename);
  },
  copyToClipboard(appData) {
    return copyCSVToClipboard(appData);
  }
};

export default csvExporter;

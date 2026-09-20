import { material as materialById, catalog } from '$lib/data/db';
import { ceilWithWaste, finalizeCalculation, type CalculationResult, type Line } from './calc';

export type RoofKind = 'continuo' | 'desmontable';

export type RoofOptions = {
  kind: RoofKind;
  width: number;
  length: number;
  withInsulation: boolean;
  roofDropCm: number;
  laborOn: boolean;
};

export const ROOF_DEFAULTS: RoofOptions = {
  kind: 'continuo',
  width: 4,
  length: 3,
  withInsulation: false,
  roofDropCm: 10,
  laborOn: true
};

export function laborKey(kind: RoofKind): string {
  return kind === 'continuo' ? 'techo_continuo' : 'techo_desmontable';
}

export function calculateRoof(options: RoofOptions): CalculationResult {
  const { kind, width, length, withInsulation, laborOn } = options;
  const w = Math.max(0, width);
  const d = Math.max(0, length);
  const area = Math.max(0, w * d);
  const lines: Line[] = [];

  if (kind === 'continuo') {
    const plates = materialById('placa_yeso_estandar');
    const omega = materialById('perfil_omega_47');
    const screws = materialById('tornillos_placa');
    const jointTape = materialById('cinta_juntas');
    const joint = materialById('pasta_juntas');
    const insulation = materialById('lana_mineral');
    const varilla = materialById('varilla_roscada_m6');
    const horquilla = materialById('horquilla_cuelgue');
    const taco = materialById('taco_varilla_m6');
    const tuerca = materialById('tuerca_m6');
    const consumos = catalog.consumos.techo_continuo;
    const separacion = Number(consumos.separacionOmegaCm ?? 60) / 100;
    const desperdicioPlacas = Number(consumos.desperdicioPlacas ?? 0);
    const desperdicioPerfiles = Number(consumos.desperdicioPerfiles ?? 0);

    const plateCount = Math.max(1, Math.ceil(ceilWithWaste(area, desperdicioPlacas) / Number(plates.superficieM2 ?? 1)));
    const omegaRows = Math.max(1, Math.ceil(ceilWithWaste(w, desperdicioPerfiles) / separacion));
    const omegasML = omegaRows * ceilWithWaste(d, desperdicioPerfiles);
    const omegaCount = Math.max(1, Math.ceil(omegasML / Number(omega.longitudM ?? 3)));
    const cuelgues = Math.max(1, Math.ceil(area * Number(consumos.cuelguePorM2 ?? 0)));

    lines.push({ material: plates, quantity: plateCount, total: 0, detail: `1 capa · ${plates.formato}` });
    lines.push({ material: omega, quantity: omegaCount, total: 0, detail: `Perfil omega cada ${consumos.separacionOmegaCm} cm` });
    lines.push({ material: varilla, quantity: cuelgues, total: 0, detail: `Cuelgues cada ≈${(1 / Number(consumos.cuelguePorM2 ?? 1)).toFixed(2)} m²` });
    lines.push({ material: horquilla, quantity: cuelgues, total: 0, detail: 'Horquilla M6 para omega' });
    lines.push({ material: taco, quantity: cuelgues, total: 0, detail: 'Taco metálico M6 al forjado' });
    lines.push({ material: tuerca, quantity: cuelgues * 2, total: 0, detail: '2 tuercas por cuelgue (seguro + regulación)' });

    if (withInsulation) {
      lines.push({
        material: insulation,
        quantity: Math.max(1, Math.ceil(area / Number(insulation.superficieM2 ?? 1))),
        total: 0,
        detail: 'Aislamiento sobre placa'
      });
    }

    lines.push({
      material: screws,
      quantity: Math.max(1, Math.ceil((area * Number(consumos.tornillosPorM2Placa ?? 0)) / Number(screws.udsPorEnvase ?? 1))),
      total: 0,
      detail: screws.formato
    });
    lines.push({
      material: jointTape,
      quantity: Math.max(1, Math.ceil((plateCount * Number(consumos.cintaMetrosPorPlaca ?? 0)) / Number(jointTape.longitudM ?? 1))),
      total: 0,
      detail: jointTape.formato
    });
    lines.push({
      material: joint,
      quantity: Math.max(1, Math.ceil((area * Number(consumos.pastaKgPorM2Placa ?? 0)) / Number(joint.kgPorEnvase ?? 1))),
      total: 0,
      detail: joint.formato
    });
  } else {
    const primario = materialById('perfil_T_primario_24');
    const secundarioLargo = materialById('perfil_T_secundario_24');
    const secundarioCorto = materialById('perfil_T_secundario_24_largo');
    const angular = materialById('perfil_angular_T24');
    const varilla = materialById('varilla_roscada_m6');
    const taco = materialById('taco_varilla_m6');
    const clip = materialById('clip_cuelgue_T');
    const panel = materialById('panel_acustico_60x60');
    const consumos = catalog.consumos.techo_desmontable;
    const sepPrimario = Number(consumos.separacionPrimarioCm ?? 120) / 100;
    const sepSecundario = Number(consumos.separacionSecundarioCm ?? 60) / 100;
    const desperdicioPerfiles = Number(consumos.desperdicioPerfiles ?? 0);
    const desperdicioPaneles = Number(consumos.desperdicioPaneles ?? 0);

    const numPrimarios = Math.max(1, Math.ceil(ceilWithWaste(w, desperdicioPerfiles) / sepPrimario));
    const primaryLineal = numPrimarios * ceilWithWaste(d, desperdicioPerfiles);
    const primarioCount = Math.max(1, Math.ceil(primaryLineal / Number(primario.longitudM ?? 3.6)));
    const numCeldasLargo = Math.max(1, Math.ceil(ceilWithWaste(d, desperdicioPerfiles) / sepSecundario));
    const secundarioLargoCount = Math.max(1, Math.ceil((numPrimarios * Math.ceil(numCeldasLargo / 2)) * (1 + desperdicioPerfiles)));
    const secundarioCortoCount = Math.max(1, Math.ceil((numPrimarios * Math.floor(numCeldasLargo / 2)) * (1 + desperdicioPerfiles)));
    const angularML = 2 * (ceilWithWaste(w, desperdicioPerfiles) + ceilWithWaste(d, desperdicioPerfiles));
    const angularCount = Math.max(1, Math.ceil(angularML / Number(angular.longitudM ?? 3)));
    const cuelgues = Math.max(1, Math.ceil(area * Number(consumos.cuelguePorM2 ?? 0)));
    const panelesCount = Math.max(1, Math.ceil(ceilWithWaste(area, desperdicioPaneles) / Number(panel.superficieM2 ?? 0.36)));

    lines.push({ material: primario, quantity: primarioCount, total: 0, detail: `Perfil T primario cada ${consumos.separacionPrimarioCm} cm` });
    lines.push({ material: secundarioLargo, quantity: secundarioLargoCount, total: 0, detail: 'Secundario largo 1,2 m' });
    lines.push({ material: secundarioCorto, quantity: secundarioCortoCount, total: 0, detail: 'Secundario corto 0,6 m' });
    lines.push({ material: angular, quantity: angularCount, total: 0, detail: 'Perfil angular perimetral' });
    lines.push({ material: varilla, quantity: cuelgues, total: 0, detail: 'Cuelgue con varilla M6' });
    lines.push({ material: taco, quantity: cuelgues, total: 0, detail: 'Taco metálico M6 al forjado' });
    lines.push({ material: clip, quantity: cuelgues, total: 0, detail: 'Clip con muelle para T24' });
    lines.push({ material: panel, quantity: panelesCount, total: 0, detail: 'Panel acústico 600 × 600 mm' });
  }

  return finalizeCalculation(area, lines, laborKey(kind), laborOn);
}

import { b as escape_html, i as head, n as derived, r as ensure_array_like } from "../../chunks/server.js";
import { a as meta, i as materialesPorSistema, n as material, t as catalog } from "../../chunks/db.js";
Object.freeze({
	OBJECT: "object",
	JSON: "json"
});
//#endregion
//#region src/lib/calc/calc.ts
function ceilWithWaste(value, waste = 0) {
	return Math.ceil(value * (1 + waste));
}
/**
* Calcula el coste de mano de obra y horas a partir de la información del
* sistema y del área. Devuelve 0 si `laborOn` es false.
*/
function finalizeCalculation(area, lines, laborKey, laborOn) {
	lines.forEach((line) => line.total = line.quantity * line.material.precio);
	const laborInfo = catalog.manoObra[laborKey] ?? catalog.manoObra.drywall;
	const laborRate = laborInfo.precioM2 ?? 0;
	const labor = laborOn ? area * laborRate : 0;
	const horasPorM2 = laborInfo.m2PorDia ? 8 / laborInfo.m2PorDia : 0;
	const hours = Math.max(0, area * horasPorM2);
	const total = lines.reduce((sum, line) => sum + line.total, 0);
	return {
		area,
		lines,
		total,
		labor,
		hours,
		grandTotal: total + labor
	};
}
//#endregion
//#region src/lib/calc/wall.ts
var WALL_DEFAULTS = {
	kind: "drywall",
	width: 3.2,
	height: 2.6,
	openings: 0,
	studSpacing: 60,
	thickness: "M48",
	withInsulation: true,
	laborOn: true
};
function calculateWall(options) {
	const { kind, width, height, openings, studSpacing, withInsulation, laborOn } = options;
	const area = Math.max(0, width * height - openings);
	const lines = [];
	if (kind === "drywall") {
		const plates = material("placa_yeso_estandar");
		const studs = material("montante_m48");
		const tracks = material("canal_c48");
		const screws = material("tornillos_placa");
		const structureScrews = material("tornillos_estructura");
		const jointTape = material("cinta_juntas");
		const joint = material("pasta_juntas");
		const insulation = material("lana_mineral");
		const consumos = catalog.consumos.drywall;
		const plateCount = ceilWithWaste(area * 2 / Number(plates.superficieM2 ?? 1), Number(consumos.desperdicioPlacas ?? 0));
		const studCount = Math.ceil(width / (studSpacing / 100)) + 1;
		const trackCount = ceilWithWaste(width * 2 / Number(tracks.longitudM ?? 3), .08);
		lines.push({
			material: plates,
			quantity: plateCount,
			total: 0,
			detail: "2 caras · 2,5 × 1,2 m"
		});
		lines.push({
			material: studs,
			quantity: studCount,
			total: 0,
			detail: `Montante vertical cada ${studSpacing} cm`
		});
		lines.push({
			material: tracks,
			quantity: trackCount,
			total: 0,
			detail: "Canal superior e inferior"
		});
		if (withInsulation) lines.push({
			material: insulation,
			quantity: Math.ceil(area / Number(insulation.superficieM2 ?? 1)),
			total: 0,
			detail: "Aislamiento interior"
		});
		lines.push({
			material: screws,
			quantity: Math.ceil(area * 2 * Number(consumos.tornillosPorM2Placa ?? 0) / Number(screws.udsPorEnvase ?? 1)),
			total: 0,
			detail: screws.formato
		});
		lines.push({
			material: structureScrews,
			quantity: Math.ceil(studCount * Number(consumos.tornillosEstructuraPorMontante ?? 0) / Number(structureScrews.udsPorEnvase ?? 1)),
			total: 0,
			detail: structureScrews.formato
		});
		lines.push({
			material: jointTape,
			quantity: Math.ceil(plateCount * Number(consumos.cintaMetrosPorPlaca ?? 0) / Number(jointTape.longitudM ?? 1)),
			total: 0,
			detail: jointTape.formato
		});
		lines.push({
			material: joint,
			quantity: Math.ceil(area * 2 * Number(consumos.pastaKgPorM2Placa ?? 0) / Number(joint.kgPorEnvase ?? 1)),
			total: 0,
			detail: joint.formato
		});
	} else {
		const wallKind = kind;
		const unit = material(wallKind === "block" ? "bloque_hormigon_15" : "ladrillo_hueco_doble");
		const mortar = material("mortero_seco");
		const consumos = catalog.consumos[wallKind] ?? {};
		const udsPorM2 = Number(consumos.udsPorM2 ?? 0);
		const desperdicio = Number(consumos.desperdicio ?? 0);
		const morteroKgPorM2 = Number(consumos.morteroKgPorM2 ?? 0);
		lines.push({
			material: unit,
			quantity: Math.ceil(area * udsPorM2 * (1 + desperdicio)),
			total: 0,
			detail: `${udsPorM2} uds./m² · ${unit.formato}`
		});
		lines.push({
			material: mortar,
			quantity: Math.ceil(area * morteroKgPorM2 / Number(mortar.kgPorEnvase ?? 25)),
			total: 0,
			detail: `${morteroKgPorM2} kg/m² · ${mortar.formato}`
		});
	}
	return finalizeCalculation(area, lines, kind, laborOn);
}
//#endregion
//#region src/lib/calc/roof.ts
var ROOF_DEFAULTS = {
	kind: "continuo",
	width: 4,
	length: 3,
	withInsulation: false,
	roofDropCm: 10,
	laborOn: true
};
//#endregion
//#region src/lib/calc/floor.ts
var FLOOR_DEFAULTS = {
	kind: "tarima",
	width: 4,
	length: 5,
	laborOn: true,
	tarimaSurface: "tarima_laminada",
	underlayment: "espuma",
	perimetroExtra: 0,
	baldosaId: "gres_porcelanico_60x60",
	adhesive: "C2TE",
	aplicarNivelacion: false
};
//#endregion
//#region src/lib/calc/bath.ts
var BATH_DEFAULTS = {
	width: 2.5,
	length: 3,
	wallHeight: 2.4,
	withDemolicion: true,
	withAlicatado: true,
	withFontaneria: true,
	withSanitarios: true,
	withPintura: true,
	puntosAgua: 4,
	inodoro: true,
	lavabo: true,
	platoDucha: true,
	mampara: true,
	espejo: true,
	baldosaId: "azulejo_30x60",
	laborOn: true
};
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const menuItems = [
			{
				id: "wall",
				title: "Pared simple",
				subtitle: "Tabique de drywall, bloque o ladrillo",
				icon: "wall"
			},
			{
				id: "roof",
				title: "Techo",
				subtitle: "Falso techo continuo o desmontable",
				icon: "roof"
			},
			{
				id: "floor",
				title: "Suelo",
				subtitle: "Tarima, cerámica o microcemento",
				icon: "floor"
			},
			{
				id: "bath",
				title: "Baño completo",
				subtitle: "Reforma integral de baño",
				icon: "bath"
			}
		];
		let wallOptions = { ...WALL_DEFAULTS };
		({ ...ROOF_DEFAULTS });
		({ ...FLOOR_DEFAULTS });
		({ ...BATH_DEFAULTS });
		meta().moneda;
		const wallKinds = [
			{
				id: "drywall",
				label: "Pladur",
				subtitle: "Ligero y rápido",
				icon: "▧"
			},
			{
				id: "block",
				label: "Block",
				subtitle: "Resistente",
				icon: "▦"
			},
			{
				id: "ladrillo",
				label: "Ladrillo",
				subtitle: "Tradicional",
				icon: "▤"
			}
		];
		derived(() => {
			return wallKinds;
		});
		derived(() => {
			return calculateWall(wallOptions);
		});
		materialesPorSistema("ceramica").filter((m) => m.categoria === "azulejo" || m.categoria === "baldosa");
		head("1uha8ag", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>ReformaCalc · Calcula tu reforma</title>`);
			});
			$$renderer.push(`<meta name="description" content="Calcula materiales, presupuesto y tiempo para tus reformas." class="svelte-1uha8ag"/> <meta name="theme-color" content="#f8fafb" class="svelte-1uha8ag"/> <link rel="manifest" href="/manifest.webmanifest" class="svelte-1uha8ag"/>`);
		});
		$$renderer.push(`<div class="app-shell svelte-1uha8ag"><main class="svelte-1uha8ag">`);
		{
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<section class="menu-screen svelte-1uha8ag"><p class="eyebrow menu-eyebrow svelte-1uha8ag">¿QUÉ QUIERES CONSTRUIR?</p> <div class="menu-list svelte-1uha8ag"><!--[-->`);
			const each_array = ensure_array_like(menuItems);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				$$renderer.push(`<button class="menu-card enabled svelte-1uha8ag"><span class="menu-icon svelte-1uha8ag" aria-hidden="true">`);
				if (item.icon === "wall") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" class="svelte-1uha8ag"><path d="M6 26h20M6 22h20M6 18h20M6 14h20M6 10h20M6 6h20" class="svelte-1uha8ag"></path></svg>`);
				} else if (item.icon === "roof") {
					$$renderer.push("<!--[1-->");
					$$renderer.push(`<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" class="svelte-1uha8ag"><path d="M5 16h22M9 11h14M13 6h6" class="svelte-1uha8ag"></path></svg>`);
				} else if (item.icon === "floor") {
					$$renderer.push("<!--[2-->");
					$$renderer.push(`<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" class="svelte-1uha8ag"><rect x="6" y="6" width="8" height="8" class="svelte-1uha8ag"></rect><rect x="18" y="6" width="8" height="8" class="svelte-1uha8ag"></rect><rect x="6" y="18" width="8" height="8" class="svelte-1uha8ag"></rect><rect x="18" y="18" width="8" height="8" class="svelte-1uha8ag"></rect></svg>`);
				} else if (item.icon === "bath") {
					$$renderer.push("<!--[3-->");
					$$renderer.push(`<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svelte-1uha8ag"><path d="M5 16h22v3a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5v-3z" class="svelte-1uha8ag"></path><path d="M9 16V8a3 3 0 0 1 6 0M7 11h2" class="svelte-1uha8ag"></path></svg>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></span> <span class="menu-text svelte-1uha8ag"><strong class="svelte-1uha8ag">${escape_html(item.title)}</strong> <small class="svelte-1uha8ag">${escape_html(item.subtitle)}</small></span> <span class="menu-arrow svelte-1uha8ag" aria-hidden="true">→</span></button>`);
			}
			$$renderer.push(`<!--]--></div> <button class="import-btn svelte-1uha8ag">⇤ Importar proyecto</button> <input type="file" accept=".rcp.json,.json,application/json" hidden="" class="svelte-1uha8ag"/></section>`);
		}
		$$renderer.push(`<!--]--></main> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };

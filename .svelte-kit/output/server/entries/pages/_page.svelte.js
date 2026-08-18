import { b as escape_html, i as head, n as derived, r as ensure_array_like, t as attr_class, y as attr } from "../../chunks/server.js";
var materiales_default = {
	meta: {
		"fuente": "Obramat (obramat.es)",
		"moneda": "EUR",
		"ivaIncluido": true,
		"fechaActualizacion": "2026-07",
		"nota": "Precios reales de obramat.es recopilados vía capturas de web.archive.org (2025), IVA incluido salvo indicación. Actualiza este archivo para refrescar los presupuestos."
	},
	materiales: [
		{
			"id": "placa_yeso_estandar",
			"nombre": "Placa de yeso laminado estándar Placo BA",
			"categoria": "drywall",
			"formato": "2500 × 1200 × 13 mm",
			"unidad": "ud",
			"precio": 7.63,
			"superficieM2": 3,
			"fuente": "obramat.es (archive.org, sep-2025)"
		},
		{
			"id": "placa_yeso_hidrofuga",
			"nombre": "Placa de yeso laminado hidrófuga PPM",
			"categoria": "drywall",
			"formato": "2500 × 1200 × 13 mm",
			"unidad": "ud",
			"precio": 15.84,
			"superficieM2": 3,
			"fuente": "obramat.es (archive.org, sep-2025)"
		},
		{
			"id": "montante_m48",
			"nombre": "Perfil montante Placo M48",
			"categoria": "drywall",
			"formato": "3 m",
			"unidad": "ud",
			"precio": 2.53,
			"longitudM": 3,
			"fuente": "obramat.es (archive.org, ago-2025)"
		},
		{
			"id": "canal_c48",
			"nombre": "Perfil canal Placo C48 (guía suelo/techo)",
			"categoria": "drywall",
			"formato": "3 m",
			"unidad": "ud",
			"precio": 2.03,
			"longitudM": 3,
			"fuente": "obramat.es (archive.org, jul-2025)"
		},
		{
			"id": "tornillos_placa",
			"nombre": "Tornillos autorroscantes Placo 3,5 × 25 mm",
			"categoria": "drywall",
			"formato": "caja 1000 ud",
			"unidad": "caja",
			"precio": 5.5,
			"udsPorEnvase": 1e3,
			"fuente": "obramat.es (archive.org, may-2025)"
		},
		{
			"id": "tornillos_estructura",
			"nombre": "Tornillos autotaladrantes Placo 3,5 × 9,5 mm",
			"categoria": "drywall",
			"formato": "caja 500 ud",
			"unidad": "caja",
			"precio": 3.12,
			"udsPorEnvase": 500,
			"fuente": "obramat.es (archive.org, sep-2025)"
		},
		{
			"id": "cinta_juntas",
			"nombre": "Cinta de juntas de papel 50 mm",
			"categoria": "drywall",
			"formato": "rollo 150 m",
			"unidad": "rollo",
			"precio": 3.55,
			"longitudM": 150,
			"fuente": "obramat.es (archive.org, ago-2025)"
		},
		{
			"id": "pasta_juntas",
			"nombre": "Pasta de juntas Placo SN",
			"categoria": "drywall",
			"formato": "saco 25 kg",
			"unidad": "saco",
			"precio": 16.93,
			"kgPorEnvase": 25,
			"fuente": "obramat.es (archive.org, oct-2025)"
		},
		{
			"id": "lana_mineral",
			"nombre": "Panel lana de roca Alpharock Premium 40 mm",
			"categoria": "drywall",
			"formato": "paquete 8,1 m² (135 × 60 cm, 10 paneles)",
			"unidad": "paquete",
			"precio": 51.61,
			"superficieM2": 8.1,
			"fuente": "obramat.es (archive.org, oct-2025)"
		},
		{
			"id": "banda_acustica",
			"nombre": "Banda estanca perimetral Placo",
			"categoria": "drywall",
			"formato": "rollo 30 m",
			"unidad": "rollo",
			"precio": 12.3,
			"longitudM": 30,
			"fuente": "obramat.es (archive.org, nov-2025; precio península estimado, captura con IGIC 10,50 €)"
		},
		{
			"id": "bloque_hormigon_15",
			"nombre": "Bloque de hormigón",
			"categoria": "block",
			"formato": "15 × 20 × 40 cm",
			"unidad": "ud",
			"precio": .73,
			"fuente": "consydecor.com (IVA incl.); referencia Obramat del 20: 0,70 € (archive.org, oct-2025)"
		},
		{
			"id": "ladrillo_hueco_doble",
			"nombre": "Ladrillo hueco doble",
			"categoria": "ladrillo",
			"formato": "7 × 24 × 11,5 cm",
			"unidad": "ud",
			"precio": .45,
			"fuente": "obramat.es (archive.org, sep-2025; rasillón 40×20×7, formato próximo)"
		},
		{
			"id": "mortero_seco",
			"nombre": "Mortero seco de albañilería M-7,5",
			"categoria": "albanileria",
			"formato": "saco 25 kg",
			"unidad": "saco",
			"precio": 2.15,
			"kgPorEnvase": 25,
			"fuente": "obramat.es (archive.org, oct-2025)"
		},
		{
			"id": "cemento",
			"nombre": "Cemento gris 32,5N",
			"categoria": "albanileria",
			"formato": "saco 25 kg",
			"unidad": "saco",
			"precio": 4.1,
			"kgPorEnvase": 25,
			"fuente": "obramat.es (archive.org, ene-2026)"
		},
		{
			"id": "arena",
			"nombre": "Arena de río 0-6 mm",
			"categoria": "albanileria",
			"formato": "saco 15 kg",
			"unidad": "saco",
			"precio": .48,
			"kgPorEnvase": 15,
			"fuente": "obramat.es (archive.org, sep-2025)"
		},
		{
			"id": "yeso_construccion",
			"nombre": "Yeso controlado Longips GA",
			"categoria": "albanileria",
			"formato": "saco 17 kg",
			"unidad": "saco",
			"precio": 1.94,
			"kgPorEnvase": 17,
			"fuente": "obramat.es (archive.org, ene-2026)"
		},
		{
			"id": "perfil_omega_47",
			"nombre": "Perfil omega galvanizado 47 mm (estructura falso techo continuo)",
			"categoria": "techo",
			"formato": "3 m",
			"unidad": "ud",
			"precio": 3.85,
			"longitudM": 3,
			"fuente": "obramat.es (archive.org, nov-2025); precio referencia 3,50-4,20 €/ud"
		},
		{
			"id": "varilla_roscada_m6",
			"nombre": "Varilla roscada M6 zincada 1 m",
			"categoria": "techo",
			"formato": "barra 1 m",
			"unidad": "ud",
			"precio": .95,
			"longitudM": 1,
			"fuente": "obramat.es (archive.org, nov-2025); pack 10 uds ≈ 9,50 €"
		},
		{
			"id": "horquilla_cuelgue",
			"nombre": "Horquilla de cuelgue M6 para perfil omega",
			"categoria": "techo",
			"formato": "ud",
			"unidad": "ud",
			"precio": .32,
			"fuente": "obramat.es (archive.org, nov-2025); pack 100 uds ≈ 28-35 €"
		},
		{
			"id": "taco_varilla_m6",
			"nombre": "Taco de expansión metálico M6×40 con arandela y tuerca",
			"categoria": "techo",
			"formato": "ud",
			"unidad": "ud",
			"precio": .28,
			"fuente": "obramat.es (archive.org, nov-2025); pack 50 uds ≈ 13-15 €"
		},
		{
			"id": "tuerca_m6",
			"nombre": "Tuerca hexagonal M6 zincada",
			"categoria": "techo",
			"formato": "ud",
			"unidad": "ud",
			"precio": .06,
			"fuente": "obramat.es (archive.org, nov-2025); pack 100 uds ≈ 5-7 €"
		},
		{
			"id": "perfil_T_primario_24",
			"nombre": "Perfil T primario 24×38 mm (falso techo desmontable) blanco",
			"categoria": "techo",
			"formato": "3,6 m",
			"unidad": "ud",
			"precio": 4.95,
			"longitudM": 3.6,
			"fuente": "obramat.es (archive.org, oct-2025); primario T24 Click 3,6 m"
		},
		{
			"id": "perfil_T_secundario_24",
			"nombre": "Perfil T secundario 24×32 mm (falso techo desmontable) 1,2 m",
			"categoria": "techo",
			"formato": "1,2 m",
			"unidad": "ud",
			"precio": 2.15,
			"longitudM": 1.2,
			"fuente": "obramat.es (archive.org, oct-2025); secundario corto T24 1,2 m"
		},
		{
			"id": "perfil_T_secundario_24_largo",
			"nombre": "Perfil T secundario 24×32 mm (falso techo desmontable) 0,6 m",
			"categoria": "techo",
			"formato": "0,6 m",
			"unidad": "ud",
			"precio": 1.25,
			"longitudM": .6,
			"fuente": "obramat.es (archive.org, oct-2025); secundario corto T24 0,6 m"
		},
		{
			"id": "perfil_angular_T24",
			"nombre": "Perfil angular perimetral 24×24 mm (falso techo desmontable) blanco",
			"categoria": "techo",
			"formato": "3 m",
			"unidad": "ud",
			"precio": 2.65,
			"longitudM": 3,
			"fuente": "obramat.es (archive.org, oct-2025); angular 24×24 3 m"
		},
		{
			"id": "clip_cuelgue_T",
			"nombre": "Clip de cuelgue con muelle para perfil T24",
			"categoria": "techo",
			"formato": "ud",
			"unidad": "ud",
			"precio": .45,
			"fuente": "obramat.es (archive.org, oct-2025); pack 50 uds ≈ 20-25 €"
		},
		{
			"id": "panel_acustico_60x60",
			"nombre": "Panel acústico lana mineral 600×600×15 mm (falso techo registrable)",
			"categoria": "techo",
			"formato": "panel 0,36 m²",
			"unidad": "ud",
			"precio": 4.35,
			"superficieM2": .36,
			"fuente": "obramat.es (archive.org, oct-2025); AMF Thermatex 600×600"
		},
		{
			"id": "tornillo_techo_metal",
			"nombre": "Tornillo metal-metal 3,5×9,5 mm (caja 500 ud) estructura techo",
			"categoria": "techo",
			"formato": "caja 500 ud",
			"unidad": "caja",
			"precio": 3.12,
			"udsPorEnvase": 500,
			"fuente": "obramat.es (archive.org, sep-2025)"
		}
	],
	manoObra: {
		"drywall": {
			"precioM2": 20,
			"m2PorDia": 25,
			"cuadrilla": "2 montadores",
			"fuente": "preciom2.com / reformasmadrid20.com (2025): 18-35 €/m² montaje, 25-40 m²/día por instalador"
		},
		"block": {
			"precioM2": 18,
			"m2PorDia": 15,
			"cuadrilla": "albañil + peón",
			"fuente": "CYPE FFQ020 (17,05 €/m²) y habitissimo (2025)"
		},
		"ladrillo": {
			"precioM2": 14,
			"m2PorDia": 10,
			"cuadrilla": "albañil + peón",
			"fuente": "CYPE FFQ010 (13,15 €/m²) y preciom2 (8-12 m²/día)"
		},
		"techo_continuo": {
			"precioM2": 24,
			"m2PorDia": 15,
			"cuadrilla": "2 montadores",
			"fuente": "preciom2.com (2025): 22-30 €/m² falso techo continuo; Placo/Knauf: 12-18 m²/día por montador"
		},
		"techo_desmontable": {
			"precioM2": 18,
			"m2PorDia": 22,
			"cuadrilla": "1 montador",
			"fuente": "preciom2.com (2025): 15-22 €/m² registrable; AMF/Knauf: 20-30 m²/día"
		}
	},
	consumos: {
		"drywall": {
			"desperdicioPlacas": .1,
			"tornillosPorM2Placa": 20,
			"tornillosEstructuraPorMontante": 6,
			"pastaKgPorM2Placa": .45,
			"cintaMetrosPorPlaca": 3.7
		},
		"block": {
			"udsPorM2": 12.5,
			"desperdicio": .05,
			"morteroKgPorM2": 21
		},
		"ladrillo": {
			"udsPorM2": 32,
			"desperdicio": .07,
			"morteroKgPorM2": 12
		},
		"techo_continuo": {
			"desperdicioPlacas": .1,
			"separacionOmegaCm": 60,
			"tornillosPorM2Placa": 20,
			"pastaKgPorM2Placa": .45,
			"cintaMetrosPorPlaca": 3.7,
			"cuelguePorM2": 1.1,
			"longitudVarillaM": .5,
			"desperdicioPerfiles": .08
		},
		"techo_desmontable": {
			"separacionPrimarioCm": 120,
			"separacionSecundarioCm": 60,
			"cuelguePorM2": .7,
			"longitudVarillaM": .5,
			"desperdicioPerfiles": .08,
			"desperdicioPaneles": .05
		}
	}
};
Object.freeze({
	OBJECT: "object",
	JSON: "json"
});
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const menuItems = [
			{
				id: "wall",
				title: "Pared simple",
				subtitle: "Tabique de drywall, bloque o ladrillo",
				available: true,
				icon: "wall"
			},
			{
				id: "roof",
				title: "Techo",
				subtitle: "Falso techo continuo o desmontable",
				available: true,
				icon: "roof"
			},
			{
				id: "floor",
				title: "Suelo",
				subtitle: "Tarima, cerámica o microcemento",
				available: false,
				icon: "floor"
			},
			{
				id: "bath",
				title: "Baño completo",
				subtitle: "Reforma integral de baño",
				available: false,
				icon: "bath"
			}
		];
		let kind = "drywall";
		let width = 3.2;
		let height = 2.6;
		let openings = 0;
		let studSpacing = 60;
		function systemLabel(kind) {
			switch (kind) {
				case "drywall": return "pladur";
				case "block": return "bloque";
				case "ladrillo": return "ladrillo";
				case "continuo": return "techo_continuo";
				case "desmontable": return "techo_desmontable";
			}
		}
		materiales_default.meta.moneda;
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
		derived(() => wallKinds);
		function byId(id) {
			const found = materiales_default.materiales.find((item) => item.id === id);
			if (!found) throw new Error(`Material no encontrado: ${id}`);
			return found;
		}
		function ceilWithWaste(value, waste = 0) {
			return Math.ceil(value * (1 + waste));
		}
		function calculateWall() {
			const area = Math.max(0, width * height - openings);
			const lines = [];
			{
				const plates = byId("placa_yeso_estandar");
				const studs = byId("montante_m48");
				const tracks = byId("canal_c48");
				const screws = byId("tornillos_placa");
				const structureScrews = byId("tornillos_estructura");
				const jointTape = byId("cinta_juntas");
				const joint = byId("pasta_juntas");
				const insulation = byId("lana_mineral");
				const consumos = materiales_default.consumos.drywall;
				const plateCount = ceilWithWaste(area * 2 / Number(plates.superficieM2), consumos.desperdicioPlacas);
				const studCount = Math.ceil(width / (studSpacing / 100)) + 1;
				const trackCount = ceilWithWaste(width * 2 / Number(tracks.longitudM), .08);
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
				lines.push({
					material: insulation,
					quantity: Math.ceil(area / Number(insulation.superficieM2)),
					total: 0,
					detail: "Aislamiento interior"
				});
				lines.push({
					material: screws,
					quantity: Math.ceil(area * 2 * consumos.tornillosPorM2Placa / Number(screws.udsPorEnvase)),
					total: 0,
					detail: screws.formato
				});
				lines.push({
					material: structureScrews,
					quantity: Math.ceil(studCount * consumos.tornillosEstructuraPorMontante / Number(structureScrews.udsPorEnvase)),
					total: 0,
					detail: structureScrews.formato
				});
				lines.push({
					material: jointTape,
					quantity: Math.ceil(plateCount * consumos.cintaMetrosPorPlaca / Number(jointTape.longitudM)),
					total: 0,
					detail: jointTape.formato
				});
				lines.push({
					material: joint,
					quantity: Math.ceil(area * 2 * consumos.pastaKgPorM2Placa / Number(joint.kgPorEnvase)),
					total: 0,
					detail: joint.formato
				});
			}
			return finalizeCalculation(area, lines);
		}
		function getLaborInfo() {
			const laborKey = systemLabel(kind);
			return materiales_default.manoObra[laborKey] ?? materiales_default.manoObra.drywall;
		}
		function finalizeCalculation(area, lines) {
			lines.forEach((line) => line.total = line.quantity * line.material.precio);
			const laborInfo = getLaborInfo();
			const labor = area * laborInfo.precioM2;
			const hours = Math.max(1, area / laborInfo.m2PorDia * 8);
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
		function calculate() {
			return calculateWall();
		}
		derived(calculate);
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
				$$renderer.push(`<button${attr_class("menu-card svelte-1uha8ag", void 0, { "enabled": item.available })}${attr("disabled", !item.available, true)}><span class="menu-icon svelte-1uha8ag" aria-hidden="true">`);
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
				$$renderer.push(`<!--]--></span> <span class="menu-text svelte-1uha8ag"><strong class="svelte-1uha8ag">${escape_html(item.title)}</strong> <small class="svelte-1uha8ag">${escape_html(item.subtitle)}</small></span> `);
				if (item.available) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="menu-arrow svelte-1uha8ag" aria-hidden="true">→</span>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span class="menu-soon svelte-1uha8ag">PRÓXIMAMENTE</span>`);
				}
				$$renderer.push(`<!--]--></button>`);
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

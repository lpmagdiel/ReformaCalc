//#endregion
//#region src/lib/data/db.ts
/** Catálogo unificado (versión tipada del JSON). */
var catalog = {
	meta: {
		"fuente": "Obramat (obramat.es) y Leroy Merlin. Precios orientativos IVA incluido para España peninsular.",
		"moneda": "EUR",
		"ivaIncluido": true,
		"fechaActualizacion": "2026-07",
		"nota": "Precios reales recopilados vía web.archive.org. Actualiza este archivo para refrescar los presupuestos."
	},
	proveedores: [{
		"id": "obramat",
		"nombre": "Obramat",
		"url": "https://www.obramat.es/"
	}, {
		"id": "leroymerlin",
		"nombre": "Leroy Merlin",
		"url": "https://www.leroymerlin.es/"
	}],
	materiales: [
		{
			"id": "placa_yeso_estandar",
			"nombre": "Placa de yeso laminado estándar Placo BA",
			"sistemas": ["drywall", "techo_continuo"],
			"categoria": "placa",
			"unidad": "ud",
			"precio": 7.63,
			"formato": "2500 × 1200 × 13 mm",
			"superficieM2": 3,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=placa+yeso+laminado+estandar+13mm",
			"fuente": "obramat.es (archive.org, sep-2025)"
		},
		{
			"id": "placa_yeso_hidrofuga",
			"nombre": "Placa de yeso laminado hidrófuga PPM",
			"sistemas": ["drywall"],
			"categoria": "placa",
			"unidad": "ud",
			"precio": 15.84,
			"formato": "2500 × 1200 × 13 mm",
			"superficieM2": 3,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=placa+yeso+hidrofuga+13mm",
			"fuente": "obramat.es (archive.org, sep-2025)"
		},
		{
			"id": "pladur_fire_15",
			"nombre": "Placa de yeso laminado ignífuga 15 mm",
			"sistemas": ["drywall"],
			"categoria": "placa",
			"unidad": "ud",
			"precio": 22.9,
			"formato": "2500 × 1200 × 15 mm",
			"superficieM2": 3,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=placa+yeso+ignifuga+15mm",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "pladur_acoustic_13",
			"nombre": "Placa de yeso laminado acústica 13 mm",
			"sistemas": ["drywall"],
			"categoria": "placa",
			"unidad": "ud",
			"precio": 24.5,
			"formato": "2500 × 1200 × 13 mm",
			"superficieM2": 3,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=placa+yeso+acustica+13mm",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "montante_m48",
			"nombre": "Perfil montante Placo M48",
			"sistemas": ["drywall"],
			"categoria": "perfil",
			"unidad": "ud",
			"precio": 2.53,
			"formato": "3 m",
			"longitudM": 3,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=perfil+montante+48mm",
			"fuente": "obramat.es (archive.org, ago-2025)"
		},
		{
			"id": "montante_m70",
			"nombre": "Perfil montante Placo M70",
			"sistemas": ["drywall"],
			"categoria": "perfil",
			"unidad": "ud",
			"precio": 5.75,
			"formato": "3 m",
			"longitudM": 3,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=perfil+montante+70mm",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "montante_m90",
			"nombre": "Perfil montante Placo M90",
			"sistemas": ["drywall"],
			"categoria": "perfil",
			"unidad": "ud",
			"precio": 7.95,
			"formato": "3 m",
			"longitudM": 3,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=perfil+montante+90mm",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "canal_c48",
			"nombre": "Perfil canal Placo C48 (guía suelo/techo)",
			"sistemas": ["drywall"],
			"categoria": "perfil",
			"unidad": "ud",
			"precio": 2.03,
			"formato": "3 m",
			"longitudM": 3,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=perfil+canal+48mm",
			"fuente": "obramat.es (archive.org, jul-2025)"
		},
		{
			"id": "canal_c70",
			"nombre": "Perfil canal Placo C70",
			"sistemas": ["drywall"],
			"categoria": "perfil",
			"unidad": "ud",
			"precio": 5.35,
			"formato": "3 m",
			"longitudM": 3,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=perfil+canal+70mm",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "canal_c90",
			"nombre": "Perfil canal Placo C90",
			"sistemas": ["drywall"],
			"categoria": "perfil",
			"unidad": "ud",
			"precio": 7.45,
			"formato": "3 m",
			"longitudM": 3,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=perfil+canal+90mm",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "tornillos_placa",
			"nombre": "Tornillos autorroscantes Placo 3,5 × 25 mm",
			"sistemas": ["drywall", "techo_continuo"],
			"categoria": "tornilleria",
			"unidad": "caja",
			"precio": 5.5,
			"formato": "caja 1000 ud",
			"udsPorEnvase": 1e3,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=tornillo+placa+yeso",
			"fuente": "obramat.es (archive.org, may-2025)"
		},
		{
			"id": "tornillos_estructura",
			"nombre": "Tornillos autotaladrantes Placo 3,5 × 9,5 mm",
			"sistemas": [
				"drywall",
				"techo_continuo",
				"techo_desmontable"
			],
			"categoria": "tornilleria",
			"unidad": "caja",
			"precio": 3.12,
			"formato": "caja 500 ud",
			"udsPorEnvase": 500,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=tornillo+metal+metal",
			"fuente": "obramat.es (archive.org, sep-2025)"
		},
		{
			"id": "cinta_juntas",
			"nombre": "Cinta de juntas de papel 50 mm",
			"sistemas": ["drywall", "techo_continuo"],
			"categoria": "consumible",
			"unidad": "rollo",
			"precio": 3.55,
			"formato": "rollo 150 m",
			"longitudM": 150,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=cinta+juntas+pladur",
			"fuente": "obramat.es (archive.org, ago-2025)"
		},
		{
			"id": "pasta_juntas",
			"nombre": "Pasta de juntas Placo SN",
			"sistemas": ["drywall", "techo_continuo"],
			"categoria": "consumible",
			"unidad": "saco",
			"precio": 16.93,
			"formato": "saco 25 kg",
			"kgPorEnvase": 25,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=pasta+juntas+5kg",
			"fuente": "obramat.es (archive.org, oct-2025)"
		},
		{
			"id": "pasta_juntas_lista",
			"nombre": "Pasta de juntas lista al uso 20 kg",
			"sistemas": ["drywall", "techo_continuo"],
			"categoria": "consumible",
			"unidad": "bote",
			"precio": 28.9,
			"formato": "bote 20 kg",
			"kgPorEnvase": 20,
			"superficieM2": 40,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=pasta+juntas+preparada",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "lana_mineral",
			"nombre": "Panel lana de roca Alpharock Premium 40 mm",
			"sistemas": ["drywall", "techo_continuo"],
			"categoria": "aislamiento",
			"unidad": "paquete",
			"precio": 51.61,
			"formato": "paquete 8,1 m²",
			"superficieM2": 8.1,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=lana+mineral+50mm",
			"fuente": "obramat.es (archive.org, oct-2025)"
		},
		{
			"id": "banda_acustica",
			"nombre": "Banda estanca perimetral Placo",
			"sistemas": ["drywall"],
			"categoria": "consumible",
			"unidad": "rollo",
			"precio": 12.3,
			"formato": "rollo 30 m",
			"longitudM": 30,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=banda+acustica+placo",
			"fuente": "obramat.es (archive.org, nov-2025)"
		},
		{
			"id": "bloque_hormigon_15",
			"nombre": "Bloque de hormigón 20×20×40 cm",
			"sistemas": ["block"],
			"categoria": "bloque",
			"unidad": "ud",
			"precio": .73,
			"formato": "20 × 20 × 40 cm",
			"superficieM2": .08,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=bloque+hormigon+20x20x40",
			"fuente": "consydecor.com; ref. Obramat 0,70 € (archive.org, oct-2025)"
		},
		{
			"id": "bloque_hormigon_leroy",
			"nombre": "Bloque de hormigón gris 25×20×50 cm",
			"sistemas": ["block"],
			"categoria": "bloque",
			"unidad": "ud",
			"precio": 1.95,
			"formato": "25 × 20 × 50 cm",
			"superficieM2": .1,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=bloque+hormigon+25x20x50",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "ladrillo_hueco_doble",
			"nombre": "Ladrillo hueco doble cerámico 33×9×20 cm",
			"sistemas": ["ladrillo"],
			"categoria": "ladrillo",
			"unidad": "ud",
			"precio": .45,
			"formato": "33 × 9 × 20 cm",
			"superficieM2": .066,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=ladrillo+hueco+33x9x20",
			"fuente": "obramat.es (archive.org, sep-2025)"
		},
		{
			"id": "ladrillo_hueco_leroy",
			"nombre": "Ladrillo hueco cerámico 33×11×20 cm",
			"sistemas": ["ladrillo"],
			"categoria": "ladrillo",
			"unidad": "ud",
			"precio": .85,
			"formato": "33 × 11 × 20 cm",
			"superficieM2": .066,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=ladrillo+hueco+33x11x20",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "mortero_seco",
			"nombre": "Mortero seco de albañilería M-7,5",
			"sistemas": ["block", "ladrillo"],
			"categoria": "albanileria",
			"unidad": "saco",
			"precio": 2.15,
			"formato": "saco 25 kg",
			"kgPorEnvase": 25,
			"superficieM2": 2.2,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=mortero+seco+M7.5+25kg",
			"fuente": "obramat.es (archive.org, oct-2025)"
		},
		{
			"id": "cemento",
			"nombre": "Cemento gris 32,5N",
			"sistemas": ["block", "ladrillo"],
			"categoria": "albanileria",
			"unidad": "saco",
			"precio": 4.1,
			"formato": "saco 25 kg",
			"kgPorEnvase": 25,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=cemento+gris+25kg",
			"fuente": "obramat.es (archive.org, ene-2026)"
		},
		{
			"id": "arena",
			"nombre": "Arena de río 0-6 mm",
			"sistemas": ["block", "ladrillo"],
			"categoria": "albanileria",
			"unidad": "saco",
			"precio": .48,
			"formato": "saco 15 kg",
			"kgPorEnvase": 15,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=arena+rio+15kg",
			"fuente": "obramat.es (archive.org, sep-2025)"
		},
		{
			"id": "yeso_construccion",
			"nombre": "Yeso controlado Longips GA",
			"sistemas": ["block", "ladrillo"],
			"categoria": "albanileria",
			"unidad": "saco",
			"precio": 1.94,
			"formato": "saco 17 kg",
			"kgPorEnvase": 17,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=yeso+controlado",
			"fuente": "obramat.es (archive.org, ene-2026)"
		},
		{
			"id": "perfil_omega_47",
			"nombre": "Perfil omega galvanizado 47 mm",
			"sistemas": ["techo_continuo"],
			"categoria": "perfil",
			"unidad": "ud",
			"precio": 3.85,
			"formato": "3 m",
			"longitudM": 3,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=perfil+omega+47mm",
			"fuente": "obramat.es (archive.org, nov-2025)"
		},
		{
			"id": "varilla_roscada_m6",
			"nombre": "Varilla roscada M6 zincada 1 m",
			"sistemas": ["techo_continuo", "techo_desmontable"],
			"categoria": "cuelgue",
			"unidad": "ud",
			"precio": .95,
			"formato": "barra 1 m",
			"longitudM": 1,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=varilla+roscada+m6",
			"fuente": "obramat.es (archive.org, nov-2025)"
		},
		{
			"id": "horquilla_cuelgue",
			"nombre": "Horquilla de cuelgue M6 para perfil omega",
			"sistemas": ["techo_continuo"],
			"categoria": "cuelgue",
			"unidad": "ud",
			"precio": .32,
			"formato": "ud",
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=horquilla+cuelgue+m6",
			"fuente": "obramat.es (archive.org, nov-2025)"
		},
		{
			"id": "taco_varilla_m6",
			"nombre": "Taco de expansión metálico M6×40 con arandela y tuerca",
			"sistemas": ["techo_continuo", "techo_desmontable"],
			"categoria": "cuelgue",
			"unidad": "ud",
			"precio": .28,
			"formato": "ud",
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=taco+metalico+m6",
			"fuente": "obramat.es (archive.org, nov-2025)"
		},
		{
			"id": "tuerca_m6",
			"nombre": "Tuerca hexagonal M6 zincada",
			"sistemas": ["techo_continuo"],
			"categoria": "cuelgue",
			"unidad": "ud",
			"precio": .06,
			"formato": "ud",
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=tuerca+m6",
			"fuente": "obramat.es (archive.org, nov-2025)"
		},
		{
			"id": "perfil_T_primario_24",
			"nombre": "Perfil T primario 24×38 mm blanco",
			"sistemas": ["techo_desmontable"],
			"categoria": "perfil",
			"unidad": "ud",
			"precio": 4.95,
			"formato": "3,6 m",
			"longitudM": 3.6,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=perfil+T+primario+24",
			"fuente": "obramat.es (archive.org, oct-2025)"
		},
		{
			"id": "perfil_T_secundario_24",
			"nombre": "Perfil T secundario 24×32 mm 1,2 m",
			"sistemas": ["techo_desmontable"],
			"categoria": "perfil",
			"unidad": "ud",
			"precio": 2.15,
			"formato": "1,2 m",
			"longitudM": 1.2,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=perfil+T+secundario+24",
			"fuente": "obramat.es (archive.org, oct-2025)"
		},
		{
			"id": "perfil_T_secundario_24_largo",
			"nombre": "Perfil T secundario 24×32 mm 0,6 m",
			"sistemas": ["techo_desmontable"],
			"categoria": "perfil",
			"unidad": "ud",
			"precio": 1.25,
			"formato": "0,6 m",
			"longitudM": .6,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=perfil+T+secundario+24+corto",
			"fuente": "obramat.es (archive.org, oct-2025)"
		},
		{
			"id": "perfil_angular_T24",
			"nombre": "Perfil angular perimetral 24×24 mm blanco",
			"sistemas": ["techo_desmontable"],
			"categoria": "perfil",
			"unidad": "ud",
			"precio": 2.65,
			"formato": "3 m",
			"longitudM": 3,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=perfil+angular+24x24",
			"fuente": "obramat.es (archive.org, oct-2025)"
		},
		{
			"id": "clip_cuelgue_T",
			"nombre": "Clip de cuelgue con muelle para perfil T24",
			"sistemas": ["techo_desmontable"],
			"categoria": "cuelgue",
			"unidad": "ud",
			"precio": .45,
			"formato": "ud",
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=clip+cuelgue+T24",
			"fuente": "obramat.es (archive.org, oct-2025)"
		},
		{
			"id": "panel_acustico_60x60",
			"nombre": "Panel acústico lana mineral 600×600×15 mm",
			"sistemas": ["techo_desmontable"],
			"categoria": "panel",
			"unidad": "ud",
			"precio": 4.35,
			"formato": "panel 0,36 m²",
			"superficieM2": .36,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=panel+acustico+600x600",
			"fuente": "obramat.es (archive.org, oct-2025)"
		},
		{
			"id": "tornillo_techo_metal",
			"nombre": "Tornillo metal-metal 3,5×9,5 mm (caja 500 ud)",
			"sistemas": ["techo_continuo", "techo_desmontable"],
			"categoria": "tornilleria",
			"unidad": "caja",
			"precio": 3.12,
			"formato": "caja 500 ud",
			"udsPorEnvase": 500,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=tornillo+metal+metal",
			"fuente": "obramat.es (archive.org, sep-2025)"
		},
		{
			"id": "tarima_laminada_ac4",
			"nombre": "Tarima laminada AC4 8 mm (caja 2,23 m²)",
			"sistemas": ["tarima"],
			"categoria": "suelo",
			"unidad": "caja",
			"precio": 18.9,
			"formato": "caja 2,23 m²",
			"superficieM2": 2.23,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=tarima+laminada+ac4",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "tarima_laminada_ac5",
			"nombre": "Tarima laminada AC5 8 mm (caja 2,23 m²)",
			"sistemas": ["tarima"],
			"categoria": "suelo",
			"unidad": "caja",
			"precio": 26.5,
			"formato": "caja 2,23 m²",
			"superficieM2": 2.23,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=tarima+laminada+ac5",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "tarima_madera_roble",
			"nombre": "Tarima madera roble 14 mm (m²)",
			"sistemas": ["tarima"],
			"categoria": "suelo",
			"unidad": "m2",
			"precio": 38,
			"formato": "tablón 14 mm",
			"superficieM2": 1,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=tarima+roble+14mm",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "underlayment_espuma",
			"nombre": "Lámina underlayment espuma PE 3 mm (rollo 15 m²)",
			"sistemas": ["tarima"],
			"categoria": "consumible",
			"unidad": "rollo",
			"precio": 14.5,
			"formato": "rollo 15 m²",
			"superficieM2": 15,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=underlayment+espuma",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "underlayment_cork",
			"nombre": "Lámina underlayment corcho 2 mm (rollo 10 m²)",
			"sistemas": ["tarima"],
			"categoria": "consumible",
			"unidad": "rollo",
			"precio": 22.9,
			"formato": "rollo 10 m²",
			"superficieM2": 10,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=underlayment+corcho",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "rodapie_laminado",
			"nombre": "Rodapié laminado 8 cm × 2,4 m",
			"sistemas": ["tarima"],
			"categoria": "acabado",
			"unidad": "ud",
			"precio": 4.9,
			"formato": "2,4 m",
			"longitudM": 2.4,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=rodapie+laminado",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "perfil_junta_dilatacion",
			"nombre": "Perfil junta de dilatación 0,9 m",
			"sistemas": ["tarima"],
			"categoria": "acabado",
			"unidad": "ud",
			"precio": 6.5,
			"formato": "0,9 m",
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=junta+dilatacion+tarima",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "azulejo_30x60",
			"nombre": "Azulejo blanco mate 30×60 cm (caja 1,08 m²)",
			"sistemas": ["ceramica", "bano_alicatado"],
			"categoria": "azulejo",
			"unidad": "caja",
			"precio": 14.9,
			"formato": "30 × 60 cm",
			"superficieM2": 1.08,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=azulejo+blanco+30x60",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "azulejo_grises_25x40",
			"nombre": "Azulejo gris 25×40 cm (caja 1 m²)",
			"sistemas": ["ceramica", "bano_alicatado"],
			"categoria": "azulejo",
			"unidad": "caja",
			"precio": 11.5,
			"formato": "25 × 40 cm",
			"superficieM2": 1,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=azulejo+gris+25x40",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "gres_porcelanico_60x60",
			"nombre": "Gres porcelánico 60×60 cm (caja 1,44 m²)",
			"sistemas": ["ceramica", "bano_alicatado"],
			"categoria": "baldosa",
			"unidad": "caja",
			"precio": 22,
			"formato": "60 × 60 cm",
			"superficieM2": 1.44,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=gres+porcelanico+60x60",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "adhesivo_cementoso_c1",
			"nombre": "Adhesivo cementoso C1 (saco 25 kg)",
			"sistemas": ["ceramica", "bano_alicatado"],
			"categoria": "adhesivo",
			"unidad": "saco",
			"precio": 8.9,
			"formato": "saco 25 kg",
			"kgPorEnvase": 25,
			"superficieM2": 6,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=adhesivo+cementoso+C1",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "adhesivo_c2te",
			"nombre": "Adhesivo cementoso C2TE flexible (saco 25 kg)",
			"sistemas": ["ceramica", "bano_alicatado"],
			"categoria": "adhesivo",
			"unidad": "saco",
			"precio": 18.5,
			"formato": "saco 25 kg",
			"kgPorEnvase": 25,
			"superficieM2": 6,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=adhesivo+C2TE+flexible",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "crucetas_2mm",
			"nombre": "Crucetas 2 mm (bolsa 250 ud)",
			"sistemas": ["ceramica", "bano_alicatado"],
			"categoria": "consumible",
			"unidad": "bolsa",
			"precio": 3.2,
			"formato": "bolsa 250 ud",
			"udsPorEnvase": 250,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=crucetas+2mm",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "lechada_cg2",
			"nombre": "Lechada CG2 (saco 5 kg)",
			"sistemas": ["ceramica", "bano_alicatado"],
			"categoria": "consumible",
			"unidad": "saco",
			"precio": 11.5,
			"formato": "saco 5 kg",
			"kgPorEnvase": 5,
			"superficieM2": 12,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=lechada+CG2",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "mortero_nivelacion",
			"nombre": "Mortero de nivelación autonivelante (saco 25 kg)",
			"sistemas": [
				"ceramica",
				"tarima",
				"bano_alicatado"
			],
			"categoria": "albanileria",
			"unidad": "saco",
			"precio": 13.9,
			"formato": "saco 25 kg",
			"kgPorEnvase": 25,
			"superficieM2": 1.5,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=mortero+nivelacion",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "microcemento_base",
			"nombre": "Microcemento base bicomponente (kit 20 kg)",
			"sistemas": ["microcemento", "bano_alicatado"],
			"categoria": "microcemento",
			"unidad": "kit",
			"precio": 89,
			"formato": "kit 20 kg",
			"superficieM2": 10,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=microcemento+base",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "microcemento_acabado",
			"nombre": "Microcemento acabado bicomponente (kit 10 kg)",
			"sistemas": ["microcemento", "bano_alicatado"],
			"categoria": "microcemento",
			"unidad": "kit",
			"precio": 79,
			"formato": "kit 10 kg",
			"superficieM2": 10,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=microcemento+acabado",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "malla_fibra_microcemento",
			"nombre": "Malla de fibra para microcemento (rollo 50 m²)",
			"sistemas": ["microcemento", "bano_alicatado"],
			"categoria": "consumible",
			"unidad": "rollo",
			"precio": 49,
			"formato": "rollo 50 m²",
			"superficieM2": 50,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=malla+fibra+microcemento",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "imprimacion_microcemento",
			"nombre": "Imprimación para microcemento (5 L)",
			"sistemas": ["microcemento", "bano_alicatado"],
			"categoria": "consumible",
			"unidad": "bote",
			"precio": 32,
			"formato": "5 L",
			"superficieM2": 25,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=imprimacion+microcemento",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "barniz_poliuretano_micro",
			"nombre": "Barniz poliuretano al agua para microcemento (4 L)",
			"sistemas": ["microcemento", "bano_alicatado"],
			"categoria": "consumible",
			"unidad": "bote",
			"precio": 56,
			"formato": "4 L",
			"superficieM2": 20,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=barniz+poliuretano+microcemento",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "saco_escombros_50l",
			"nombre": "Saco escombros rafia 50 L",
			"sistemas": ["bano_demolicion"],
			"categoria": "demolicion",
			"unidad": "ud",
			"precio": .85,
			"formato": "50 L",
			"volumenLitros": 50,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=saco+escombros",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "contenedor_escombros",
			"nombre": "Contenedor de escombros 3 m³ (alquiler + retirada)",
			"sistemas": ["bano_demolicion"],
			"categoria": "demolicion",
			"unidad": "ud",
			"precio": 220,
			"formato": "3 m³",
			"volumenM3": 3,
			"proveedor": "ambos",
			"fuente": "precio medio contenedor obra menor (2026)"
		},
		{
			"id": "disco_diamante",
			"nombre": "Disco diamante 115 mm corte azulejo",
			"sistemas": ["bano_demolicion", "bano_alicatado"],
			"categoria": "herramienta",
			"unidad": "ud",
			"precio": 8.5,
			"formato": "115 mm",
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=disco+diamante+115",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "tuberia_ppr_20",
			"nombre": "Tubería PPR (polipropileno) 20 mm (barra 4 m)",
			"sistemas": ["bano_fontaneria"],
			"categoria": "fontaneria",
			"unidad": "ud",
			"precio": 6.5,
			"formato": "4 m",
			"longitudM": 4,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=tuberia+ppr+20",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "tuberia_ppr_25",
			"nombre": "Tubería PPR 25 mm (barra 4 m)",
			"sistemas": ["bano_fontaneria"],
			"categoria": "fontaneria",
			"unidad": "ud",
			"precio": 9.2,
			"formato": "4 m",
			"longitudM": 4,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=tuberia+ppr+25",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "codo_ppr_20",
			"nombre": "Codo PPR 90° 20 mm",
			"sistemas": ["bano_fontaneria"],
			"categoria": "fontaneria",
			"unidad": "ud",
			"precio": .55,
			"formato": "20 mm",
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=codo+ppr+20",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "te_ppr_20",
			"nombre": "Te PPR 20 mm",
			"sistemas": ["bano_fontaneria"],
			"categoria": "fontaneria",
			"unidad": "ud",
			"precio": .65,
			"formato": "20 mm",
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=te+ppr+20",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "desague_pvc_40",
			"nombre": "Tubería desagüe PVC 40 mm (barra 3 m)",
			"sistemas": ["bano_fontaneria"],
			"categoria": "fontaneria",
			"unidad": "ud",
			"precio": 5.9,
			"formato": "3 m",
			"longitudM": 3,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=desague+pvc+40",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "sifon_lavabo",
			"nombre": "Sifón lavabo PVC",
			"sistemas": ["bano_fontaneria"],
			"categoria": "fontaneria",
			"unidad": "ud",
			"precio": 6.5,
			"formato": "ud",
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=sifon+lavabo",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "inodoro_tanque_bajo",
			"nombre": "Inodoro tanque bajo porcelana blanco",
			"sistemas": ["bano_sanitarios"],
			"categoria": "sanitario",
			"unidad": "ud",
			"precio": 119,
			"formato": "salida dual",
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=inodoro+tanque+bajo",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "lavabo_60",
			"nombre": "Lavabo sobre encimera 60 cm porcelana blanco",
			"sistemas": ["bano_sanitarios"],
			"categoria": "sanitario",
			"unidad": "ud",
			"precio": 79,
			"formato": "60 cm",
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=lavabo+60",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "mueble_lavabo_60",
			"nombre": "Mueble lavabo 60 cm 2 cajones",
			"sistemas": ["bano_sanitarios"],
			"categoria": "mueble",
			"unidad": "ud",
			"precio": 189,
			"formato": "60 cm",
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=mueble+lavabo+60",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "plato_ducha_80x80",
			"nombre": "Plato de ducha resina 80×80 cm",
			"sistemas": ["bano_sanitarios"],
			"categoria": "sanitario",
			"unidad": "ud",
			"precio": 139,
			"formato": "80 × 80 cm",
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=plato+ducha+80x80",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "mampara_ducha_80",
			"nombre": "Mampara ducha corredera 80 cm",
			"sistemas": ["bano_sanitarios"],
			"categoria": "mampara",
			"unidad": "ud",
			"precio": 169,
			"formato": "80 cm",
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=mampara+ducha+80",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "grifo_lavabo_monomando",
			"nombre": "Grifo lavabo monomando cromado",
			"sistemas": ["bano_sanitarios"],
			"categoria": "griferia",
			"unidad": "ud",
			"precio": 39,
			"formato": "monomando",
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=grifo+lavabo+monomando",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "grifo_ducha_monomando",
			"nombre": "Grifo ducha monomando cromado",
			"sistemas": ["bano_sanitarios"],
			"categoria": "griferia",
			"unidad": "ud",
			"precio": 59,
			"formato": "monomando",
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=grifo+ducha+monomando",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "espejo_bano_60",
			"nombre": "Espejo baño 60 cm con luz LED",
			"sistemas": ["bano_sanitarios"],
			"categoria": "mueble",
			"unidad": "ud",
			"precio": 89,
			"formato": "60 cm",
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=espejo+bano+60",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "pintura_plastica_15l",
			"nombre": "Pintura plástica blanca lavable 15 L",
			"sistemas": ["bano_pintura"],
			"categoria": "pintura",
			"unidad": "bote",
			"precio": 49,
			"formato": "15 L",
			"superficieM2": 75,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=pintura+plastica+15l",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "imprimacion_pintura_10l",
			"nombre": "Imprimación pintura al agua 10 L",
			"sistemas": ["bano_pintura"],
			"categoria": "pintura",
			"unidad": "bote",
			"precio": 32,
			"formato": "10 L",
			"superficieM2": 80,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=imprimacion+pintura",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "cinta_pintar_48mm",
			"nombre": "Cinta de pintor 48 mm (rollo 45 m)",
			"sistemas": ["bano_pintura"],
			"categoria": "consumible",
			"unidad": "rollo",
			"precio": 3.9,
			"formato": "rollo 45 m",
			"longitudM": 45,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=cinta+pintor",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "plastico_protector",
			"nombre": "Plástico protector transparente 4×5 m",
			"sistemas": ["bano_pintura", "bano_demolicion"],
			"categoria": "consumible",
			"unidad": "rollo",
			"precio": 6.5,
			"formato": "4 × 5 m",
			"superficieM2": 20,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=plastico+protector",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "electrodo_e7018_2_5mm",
			"nombre": "Electrodo E7018 rutilo 2,5 mm (caja 1 kg)",
			"sistemas": ["welding"],
			"categoria": "electrodo",
			"unidad": "caja",
			"precio": 11.9,
			"formato": "caja 1 kg · ⌀2,5 mm · 60–100 A",
			"kgPorEnvase": 1,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=electrodo+e7018+2%2C5mm",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "electrodo_e7018_3_25mm",
			"nombre": "Electrodo E7018 rutilo 3,25 mm (caja 5 kg)",
			"sistemas": ["welding"],
			"categoria": "electrodo",
			"unidad": "caja",
			"precio": 39.5,
			"formato": "caja 5 kg · ⌀3,25 mm · 110–160 A",
			"kgPorEnvase": 5,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=electrodo+e7018+3%2C25mm",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "electrodo_e308l_2_5mm",
			"nombre": "Electrodo E308L-16 inox 2,5 mm (caja 1 kg)",
			"sistemas": ["welding"],
			"categoria": "electrodo",
			"unidad": "caja",
			"precio": 18.5,
			"formato": "caja 1 kg · ⌀2,5 mm · 70–100 A",
			"kgPorEnvase": 1,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=electrodo+308L+2%2C5mm",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "electrodo_niquel_ci_3_2mm",
			"nombre": "Electrodo níquel CI para fundición 3,2 mm (caja 1 kg)",
			"sistemas": ["welding"],
			"categoria": "electrodo",
			"unidad": "caja",
			"precio": 24.9,
			"formato": "caja 1 kg · ⌀3,2 mm · 90–130 A · NiFe",
			"kgPorEnvase": 1,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=electrodo+niquel+fundicion",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "hilo_mig_er70s_1_0mm",
			"nombre": "Hilo MIG ER70S-6 1,0 mm (bobina 5 kg)",
			"sistemas": ["welding"],
			"categoria": "hilo_soldadura",
			"unidad": "bobina",
			"precio": 24.9,
			"formato": "bobina 5 kg · ⌀1,0 mm · acero",
			"kgPorEnvase": 5,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=hilo+mig+er70s+1mm",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "hilo_mig_308l_1_0mm",
			"nombre": "Hilo MIG ER308LSi 1,0 mm (bobina 5 kg)",
			"sistemas": ["welding"],
			"categoria": "hilo_soldadura",
			"unidad": "bobina",
			"precio": 78,
			"formato": "bobina 5 kg · ⌀1,0 mm · inox",
			"kgPorEnvase": 5,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=hilo+mig+308L+1mm",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "hilo_mig_4043_1_2mm",
			"nombre": "Hilo MIG ER4043 1,2 mm (bobina 2 kg)",
			"sistemas": ["welding"],
			"categoria": "hilo_soldadura",
			"unidad": "bobina",
			"precio": 49.5,
			"formato": "bobina 2 kg · ⌀1,2 mm · aluminio",
			"kgPorEnvase": 2,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=hilo+mig+4043+1%2C2mm",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "varilla_tig_er70s_2_0mm",
			"nombre": "Varilla TIG ER70S-6 2,0 mm (paquete 5 kg)",
			"sistemas": ["welding"],
			"categoria": "hilo_soldadura",
			"unidad": "paquete",
			"precio": 38.5,
			"formato": "5 kg · ⌀2,0 mm · 1 m por varilla",
			"kgPorEnvase": 5,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=varilla+tig+er70s+2mm",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "varilla_tig_308l_2_0mm",
			"nombre": "Varilla TIG ER308L 2,0 mm (paquete 5 kg)",
			"sistemas": ["welding"],
			"categoria": "hilo_soldadura",
			"unidad": "paquete",
			"precio": 86,
			"formato": "5 kg · ⌀2,0 mm · inox",
			"kgPorEnvase": 5,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=varilla+tig+308L+2mm",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "varilla_tig_4043_2_4mm",
			"nombre": "Varilla TIG ER4043 2,4 mm (paquete 5 kg)",
			"sistemas": ["welding"],
			"categoria": "hilo_soldadura",
			"unidad": "paquete",
			"precio": 64,
			"formato": "5 kg · ⌀2,4 mm · aluminio",
			"kgPorEnvase": 5,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=varilla+tig+4043+2%2C4mm",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "hilo_tubular_e71t11_1_2mm",
			"nombre": "Hilo tubular E71T-11 1,2 mm (bobina 4,5 kg)",
			"sistemas": ["welding"],
			"categoria": "hilo_soldadura",
			"unidad": "bobina",
			"precio": 45,
			"formato": "bobina 4,5 kg · ⌀1,2 mm · autoprotegido",
			"kgPorEnvase": 4.5,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=hilo+tubular+e71t11",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "hilo_tubular_e308lt1_1_2mm",
			"nombre": "Hilo tubular E308LT-1 1,2 mm (bobina 5 kg)",
			"sistemas": ["welding"],
			"categoria": "hilo_soldadura",
			"unidad": "bobina",
			"precio": 95,
			"formato": "bobina 5 kg · ⌀1,2 mm · inox",
			"kgPorEnvase": 5,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=hilo+tubular+308LT",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "argón_11",
			"nombre": "Botella argón 11 m³ (200 bar)",
			"sistemas": ["welding"],
			"categoria": "gas_soldadura",
			"unidad": "botella",
			"precio": 145,
			"formato": "11 m³ · 200 bar",
			"volumenM3": 11,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=botella+argon+soldadura",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "co2_industrial",
			"nombre": "Botella CO₂ industrial 10 kg",
			"sistemas": ["welding"],
			"categoria": "gas_soldadura",
			"unidad": "botella",
			"precio": 95,
			"formato": "10 kg · ≈5,3 m³ de gas",
			"volumenM3": 5.3,
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=botella+co2+soldadura",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "argon_98_co2_2",
			"nombre": "Mezcla Argón 98% / CO₂ 2% botella 10 m³",
			"sistemas": ["welding"],
			"categoria": "gas_soldadura",
			"unidad": "botella",
			"precio": 135,
			"formato": "10 m³ · inox MIG",
			"volumenM3": 10,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=argon+98+co2+2",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "argon_75_co2_25",
			"nombre": "Mezcla Argón 75% / CO₂ 25% botella 10 m³",
			"sistemas": ["welding"],
			"categoria": "gas_soldadura",
			"unidad": "botella",
			"precio": 125,
			"formato": "10 m³ · MAG universal",
			"volumenM3": 10,
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=argon+75+co2+25",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "disco_lamela_125",
			"nombre": "Disco lamela Ø125 mm zirconio",
			"sistemas": ["welding"],
			"categoria": "herramienta",
			"unidad": "ud",
			"precio": 2.9,
			"formato": "Ø125 mm · zirconio",
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=disco+lamela+125",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "cepillo_alambre",
			"nombre": "Cepillo de alambre acero para soldadura",
			"sistemas": ["welding"],
			"categoria": "herramienta",
			"unidad": "ud",
			"precio": 3.5,
			"formato": "mango madera · 4 hileras",
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=cepillo+alambre+soldadura",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "careta_soldar_auto",
			"nombre": "Careta de soldar auto-oscurecente DIN 9–13",
			"sistemas": ["welding"],
			"categoria": "epi",
			"unidad": "ud",
			"precio": 49.9,
			"formato": "filtro LCD · DIN 9–13 · True Color",
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=careta+soldar+auto",
			"fuente": "leroymerlin.es (2026-07)"
		},
		{
			"id": "guantes_soldador",
			"nombre": "Guantes de soldador piel flor (par)",
			"sistemas": ["welding"],
			"categoria": "epi",
			"unidad": "par",
			"precio": 12.9,
			"formato": "par · 35 cm · EN 12477 tipo A",
			"proveedor": "obramat",
			"sourceUrl": "https://www.obramat.es/buscar?text=guantes+soldador",
			"fuente": "obramat.es (2026-07)"
		},
		{
			"id": "mandil_soldador",
			"nombre": "Mandil de cuero para soldador",
			"sistemas": ["welding"],
			"categoria": "epi",
			"unidad": "ud",
			"precio": 24.5,
			"formato": "60 × 90 cm · EN ISO 11611",
			"proveedor": "leroymerlin",
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=mandil+soldador",
			"fuente": "leroymerlin.es (2026-07)"
		}
	],
	manoObra: {
		"drywall": {
			"precioM2": 20,
			"m2PorDia": 25,
			"cuadrilla": "2 montadores",
			"fuente": "preciom2.com / reformasmadrid20.com (2025): 18-35 €/m² montaje"
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
			"fuente": "CYPE FFQ010 (13,15 €/m²) y preciom2 (2025)"
		},
		"techo_continuo": {
			"precioM2": 24,
			"m2PorDia": 15,
			"cuadrilla": "2 montadores",
			"fuente": "preciom2.com (2025): 22-30 €/m² falso techo continuo"
		},
		"techo_desmontable": {
			"precioM2": 18,
			"m2PorDia": 22,
			"cuadrilla": "1 montador",
			"fuente": "preciom2.com (2025): 15-22 €/m² registrable"
		},
		"tarima": {
			"precioM2": 12,
			"m2PorDia": 18,
			"cuadrilla": "1 instalador",
			"fuente": "preciom2.com (2025): 10-18 €/m² tarima laminada"
		},
		"ceramica": {
			"precioM2": 22,
			"m2PorDia": 8,
			"cuadrilla": "alicatador + peón",
			"fuente": "preciom2.com (2025): 18-30 €/m² solado+alicatado"
		},
		"microcemento": {
			"precioM2": 45,
			"m2PorDia": 6,
			"cuadrilla": "aplicador especializado",
			"fuente": "preciom2.com (2025): 35-60 €/m² microcemento aplicado"
		},
		"bano_demolicion": {
			"precioM2": 18,
			"m2PorDia": 12,
			"cuadrilla": "albañil + peón",
			"fuente": "CYPE / reformasmadrid (2025): 15-25 €/m² demolición baño"
		},
		"bano_alicatado": {
			"precioM2": 25,
			"m2PorDia": 7,
			"cuadrilla": "alicatador + peón",
			"fuente": "preciom2.com (2025): 22-35 €/m² alicatado baño"
		},
		"bano_sanitarios": {
			"precioUd": 90,
			"horasPorUd": 1.5,
			"cuadrilla": "fontanero",
			"fuente": "habitissimo (2025): 80-120 €/aparato instalado"
		},
		"bano_fontaneria": {
			"precioPunto": 65,
			"horasPorPunto": 1,
			"cuadrilla": "fontanero",
			"fuente": "CYPE / reformasmadrid (2025): 50-90 €/punto de agua"
		},
		"bano_pintura": {
			"precioM2": 8,
			"m2PorDia": 40,
			"cuadrilla": "1 pintor",
			"fuente": "preciom2.com (2025): 6-12 €/m² pintura plástica"
		},
		"welding": {
			"precioM2": 35,
			"m2PorDia": 1.5,
			"cuadrilla": "soldador cualificado",
			"fuente": "reformasmadrid20.com / habitissimo (2025): 30-45 €/h soldador profesional"
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
		},
		"tarima": {
			"desperdicio": .1,
			"rodapiePerimetroM": 1,
			"juntaDilatacionCadaM2": 25,
			"perfilMLporM2": 0
		},
		"ceramica": {
			"desperdicio": .1,
			"adhesivoKgPorM2": 4.5,
			"lechadaKgPorM2": .5,
			"crucetasPorM2": 6
		},
		"microcemento": {
			"desperdicio": .05,
			"capasBase": 2,
			"capasAcabado": 2,
			"manosBarniz": 2
		},
		"bano_demolicion": {
			"escombroM3PorM2": .15,
			"sacosLitrosPorM3": 20
		},
		"bano_alicatado": {
			"desperdicio": .1,
			"adhesivoKgPorM2": 4.5,
			"lechadaKgPorM2": .5,
			"crucetasPorM2": 6
		},
		"bano_sanitarios": {
			"horasPorInodoro": 2,
			"horasPorLavabo": 1.5,
			"horasPorPlato": 3,
			"horasPorMampara": 2
		},
		"bano_fontaneria": { "metrosPorPunto": 4 },
		"bano_pintura": {
			"manos": 2,
			"rendimientoM2PorLitro": 8
		},
		"welding": {
			"eficienciaDeposito": .7,
			"factorPosicionPlana": 1,
			"factorPosicionHorizontal": 1.15,
			"factorPosicionVertical": 1.4,
			"factorPosicionTecho": 1.7
		}
	},
	huecosPreset: [
		{
			"id": "puerta_estandar",
			"nombre": "Puerta estándar",
			"tipo": "puerta",
			"ancho": .82,
			"alto": 2.1
		},
		{
			"id": "puerta_doble",
			"nombre": "Puerta doble",
			"tipo": "puerta",
			"ancho": 1.6,
			"alto": 2.1
		},
		{
			"id": "puerta_corredera",
			"nombre": "Puerta corredera",
			"tipo": "puerta",
			"ancho": 1.5,
			"alto": 2.1
		},
		{
			"id": "ventana_estandar",
			"nombre": "Ventana estándar",
			"tipo": "ventana",
			"ancho": 1.2,
			"alto": 1.2
		},
		{
			"id": "ventana_grande",
			"nombre": "Ventana grande",
			"tipo": "ventana",
			"ancho": 1.8,
			"alto": 1.5
		},
		{
			"id": "ventano_puerta",
			"nombre": "Puerta-ventana",
			"tipo": "puerta",
			"ancho": 2,
			"alto": 2.2
		}
	]
};
/** Acceso rápido por id de material. */
var porId = new Map(catalog.materiales.map((m) => [m.id, m]));
/** Acceso rápido por proveedor. */
var porProveedor = /* @__PURE__ */ new Map();
for (const m of catalog.materiales) {
	if (!m.proveedor) continue;
	const lista = porProveedor.get(m.proveedor) ?? [];
	lista.push(m);
	porProveedor.set(m.proveedor, lista);
}
/** Acceso rápido por sistema. */
var porSistema = /* @__PURE__ */ new Map();
for (const m of catalog.materiales) for (const s of m.sistemas) {
	const lista = porSistema.get(s) ?? [];
	lista.push(m);
	porSistema.set(s, lista);
}
/** Acceso rápido por categoría. */
var porCategoria = /* @__PURE__ */ new Map();
for (const m of catalog.materiales) {
	const lista = porCategoria.get(m.categoria) ?? [];
	lista.push(m);
	porCategoria.set(m.categoria, lista);
}
/** Devuelve un material por id o lanza un error si no existe. */
function material(id) {
	const m = porId.get(id);
	if (!m) throw new Error(`Material no encontrado en el catálogo: ${id}`);
	return m;
}
/** Devuelve todos los materiales del catálogo. */
function materiales() {
	return catalog.materiales;
}
/** Devuelve los materiales que pertenecen al sistema indicado. */
function materialesPorSistema(sistema) {
	return porSistema.get(sistema) ?? [];
}
/** Lista de proveedores definidos en el catálogo. */
function proveedores() {
	return catalog.proveedores;
}
/** Devuelve el nombre del proveedor o el id como fallback. */
function proveedorNombre(id) {
	if (!id) return "";
	return catalog.proveedores.find((p) => p.id === id)?.nombre ?? String(id);
}
/** Acceso directo al bloque `meta` del catálogo. */
function meta() {
	return catalog.meta;
}
//#endregion
export { meta as a, materialesPorSistema as i, material as n, proveedorNombre as o, materiales as r, proveedores as s, catalog as t };

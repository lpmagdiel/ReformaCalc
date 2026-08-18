import { b as escape_html, i as head, n as derived, r as ensure_array_like, t as attr_class, y as attr } from "../../../chunks/server.js";
var materials_default = {
	name: "reformacalc",
	version: "1.1.0",
	updatedAt: "2026-07-26",
	source: "Referencias de mercado en España (Obramat y Leroy Merlin); precios orientativos IVA incluido para Barcelona",
	disclaimer: "Los precios, stock y disponibilidad cambian por almacén y fecha. Verifica en la web del proveedor antes de comprar.",
	suppliers: [{
		"id": "obramat",
		"name": "Obramat",
		"url": "https://www.obramat.es/"
	}, {
		"id": "leroymerlin",
		"name": "Leroy Merlin",
		"url": "https://www.leroymerlin.es/"
	}],
	materials: [
		{
			"id": "pladur-standard-13",
			"category": "drywall",
			"name": "Placa de yeso laminado estándar 13 mm (1,2 x 2,5 m)",
			"supplier": "obramat",
			"unit": "placa",
			"coverageM2": 2.88,
			"price": 11.9,
			"waste": .1,
			"sourceUrl": "https://www.obramat.es/buscar?text=placa+yeso+laminado+estandar+13mm"
		},
		{
			"id": "pladur-hydro-13",
			"category": "drywall",
			"name": "Placa de yeso laminado hidrófuga 13 mm (1,2 x 2,5 m)",
			"supplier": "obramat",
			"unit": "placa",
			"coverageM2": 2.88,
			"price": 18.5,
			"waste": .1,
			"sourceUrl": "https://www.obramat.es/buscar?text=placa+yeso+hidrofuga+13mm"
		},
		{
			"id": "pladur-fire-15",
			"category": "drywall",
			"name": "Placa de yeso laminado ignífuga 15 mm (1,2 x 2,5 m)",
			"supplier": "obramat",
			"unit": "placa",
			"coverageM2": 2.88,
			"price": 22.9,
			"waste": .1,
			"sourceUrl": "https://www.obramat.es/buscar?text=placa+yeso+ignifuga+15mm"
		},
		{
			"id": "pladur-acoustic-13",
			"category": "drywall",
			"name": "Placa de yeso laminado acústica 13 mm (1,2 x 2,5 m)",
			"supplier": "leroymerlin",
			"unit": "placa",
			"coverageM2": 2.88,
			"price": 24.5,
			"waste": .1,
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=placa+yeso+acustica+13mm"
		},
		{
			"id": "pladur-transform-13",
			"category": "drywall",
			"name": "Placa transformada (alta dureza) 13 mm (1,2 x 2,5 m)",
			"supplier": "leroymerlin",
			"unit": "placa",
			"coverageM2": 2.88,
			"price": 26.9,
			"waste": .1,
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=placa+transformada+13mm"
		},
		{
			"id": "perfil-montante-48",
			"category": "drywall",
			"name": "Perfil montante galvanizado 48 mm x 3 m",
			"supplier": "obramat",
			"unit": "perfil",
			"lengthM": 3,
			"price": 4.25,
			"waste": .08,
			"sourceUrl": "https://www.obramat.es/buscar?text=perfil+montante+48mm"
		},
		{
			"id": "perfil-montante-70",
			"category": "drywall",
			"name": "Perfil montante galvanizado 70 mm x 3 m",
			"supplier": "obramat",
			"unit": "perfil",
			"lengthM": 3,
			"price": 5.75,
			"waste": .08,
			"sourceUrl": "https://www.obramat.es/buscar?text=perfil+montante+70mm"
		},
		{
			"id": "perfil-montante-90",
			"category": "drywall",
			"name": "Perfil montante galvanizado 90 mm x 3 m",
			"supplier": "obramat",
			"unit": "perfil",
			"lengthM": 3,
			"price": 7.95,
			"waste": .08,
			"sourceUrl": "https://www.obramat.es/buscar?text=perfil+montante+90mm"
		},
		{
			"id": "perfil-canal-48",
			"category": "drywall",
			"name": "Perfil canal galvanizado 48 mm x 3 m",
			"supplier": "obramat",
			"unit": "perfil",
			"lengthM": 3,
			"price": 3.95,
			"waste": .08,
			"sourceUrl": "https://www.obramat.es/buscar?text=perfil+canal+48mm"
		},
		{
			"id": "perfil-canal-70",
			"category": "drywall",
			"name": "Perfil canal galvanizado 70 mm x 3 m",
			"supplier": "obramat",
			"unit": "perfil",
			"lengthM": 3,
			"price": 5.35,
			"waste": .08,
			"sourceUrl": "https://www.obramat.es/buscar?text=perfil+canal+70mm"
		},
		{
			"id": "perfil-canal-90",
			"category": "drywall",
			"name": "Perfil canal galvanizado 90 mm x 3 m",
			"supplier": "obramat",
			"unit": "perfil",
			"lengthM": 3,
			"price": 7.45,
			"waste": .08,
			"sourceUrl": "https://www.obramat.es/buscar?text=perfil+canal+90mm"
		},
		{
			"id": "perfil-omega-leroy",
			"category": "drywall",
			"name": "Perfil omega 82 mm x 3 m",
			"supplier": "leroymerlin",
			"unit": "perfil",
			"lengthM": 3,
			"price": 4.95,
			"waste": .08,
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=perfil+omega+82mm"
		},
		{
			"id": "perfil-angular-leroy",
			"category": "drywall",
			"name": "Perfil angular 25 x 25 mm x 3 m",
			"supplier": "leroymerlin",
			"unit": "perfil",
			"lengthM": 3,
			"price": 3.65,
			"waste": .08,
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=perfil+angular+25x25"
		},
		{
			"id": "tornillo-pladur",
			"category": "drywall",
			"name": "Tornillo autorroscante para placa (caja 500 uds)",
			"supplier": "obramat",
			"unit": "caja",
			"coverageM2": 8,
			"price": 8.9,
			"waste": .05,
			"sourceUrl": "https://www.obramat.es/buscar?text=tornillo+placa+yeso"
		},
		{
			"id": "tornillo-metal",
			"category": "drywall",
			"name": "Tornillo metal-metal para estructura (caja 250 uds)",
			"supplier": "leroymerlin",
			"unit": "caja",
			"coverageM2": 12,
			"price": 11.5,
			"waste": .05,
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=tornillo+metal+metal+pladur"
		},
		{
			"id": "pasta-juntas",
			"category": "drywall",
			"name": "Pasta de juntas en polvo 5 kg",
			"supplier": "obramat",
			"unit": "saco",
			"coverageM2": 20,
			"price": 9.5,
			"waste": .05,
			"sourceUrl": "https://www.obramat.es/buscar?text=pasta+juntas+5kg"
		},
		{
			"id": "pasta-juntas-leroy",
			"category": "drywall",
			"name": "Pasta de juntas lista al uso 20 kg",
			"supplier": "leroymerlin",
			"unit": "bote",
			"coverageM2": 40,
			"price": 28.9,
			"waste": .05,
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=pasta+juntas+preparada"
		},
		{
			"id": "cinta-juntas",
			"category": "drywall",
			"name": "Cinta de juntas de papel microperforada (rollo 150 m)",
			"supplier": "obramat",
			"unit": "rollo",
			"lengthM": 150,
			"price": 8.5,
			"waste": .05,
			"sourceUrl": "https://www.obramat.es/buscar?text=cinta+juntas+pladur"
		},
		{
			"id": "cinta-juntas-leroy",
			"category": "drywall",
			"name": "Cinta de juntas de fibra de vidrio (rollo 90 m)",
			"supplier": "leroymerlin",
			"unit": "rollo",
			"lengthM": 90,
			"price": 9.9,
			"waste": .05,
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=cinta+juntas+fibra+vidrio"
		},
		{
			"id": "lana-roca-50",
			"category": "drywall",
			"name": "Panel de lana mineral 50 mm (4,32 m²/paq)",
			"supplier": "obramat",
			"unit": "paquete",
			"coverageM2": 4.32,
			"price": 28.9,
			"waste": .1,
			"sourceUrl": "https://www.obramat.es/buscar?text=lana+mineral+50mm"
		},
		{
			"id": "lana-roca-70",
			"category": "drywall",
			"name": "Panel de lana mineral 70 mm (5,76 m²/paq)",
			"supplier": "obramat",
			"unit": "paquete",
			"coverageM2": 5.76,
			"price": 39.9,
			"waste": .1,
			"sourceUrl": "https://www.obramat.es/buscar?text=lana+mineral+70mm"
		},
		{
			"id": "lana-roca-leroy",
			"category": "drywall",
			"name": "Panel de lana mineral 60 mm (6 m²/paq)",
			"supplier": "leroymerlin",
			"unit": "paquete",
			"coverageM2": 6,
			"price": 34.5,
			"waste": .1,
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=lana+mineral+60mm"
		},
		{
			"id": "bloque-hormigon-20",
			"category": "block",
			"name": "Bloque de hormigón 20 x 20 x 40 cm",
			"supplier": "obramat",
			"unit": "unidad",
			"coverageM2": .08,
			"price": 1.35,
			"waste": .08,
			"sourceUrl": "https://www.obramat.es/buscar?text=bloque+hormigon+20x20x40"
		},
		{
			"id": "bloque-hormigon-leroy",
			"category": "block",
			"name": "Bloque de hormigón gris 25 x 20 x 50 cm",
			"supplier": "leroymerlin",
			"unit": "unidad",
			"coverageM2": .1,
			"price": 1.95,
			"waste": .08,
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=bloque+hormigon+25x20x50"
		},
		{
			"id": "mortero-m10",
			"category": "block",
			"name": "Mortero seco M-10 gris 25 kg",
			"supplier": "obramat",
			"unit": "saco",
			"coverageM2": 2.5,
			"price": 5.2,
			"waste": .1,
			"sourceUrl": "https://www.obramat.es/buscar?text=mortero+seco+M10+25kg"
		},
		{
			"id": "mortero-leroy",
			"category": "block",
			"name": "Mortero de albañilería M-7,5 gris 25 kg",
			"supplier": "leroymerlin",
			"unit": "saco",
			"coverageM2": 2.2,
			"price": 4.95,
			"waste": .1,
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=mortero+albaileria+M7.5"
		},
		{
			"id": "ladrillo-hueco-9",
			"category": "brick",
			"name": "Ladrillo hueco cerámico 33 x 9 x 20 cm",
			"supplier": "obramat",
			"unit": "unidad",
			"coverageM2": .066,
			"price": .72,
			"waste": .1,
			"sourceUrl": "https://www.obramat.es/buscar?text=ladrillo+hueco+33x9x20"
		},
		{
			"id": "ladrillo-hueco-leroy",
			"category": "brick",
			"name": "Ladrillo hueco cerámico 33 x 11 x 20 cm",
			"supplier": "leroymerlin",
			"unit": "unidad",
			"coverageM2": .066,
			"price": .85,
			"waste": .1,
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=ladrillo+hueco+33x11x20"
		},
		{
			"id": "ladrillo-perforado-leroy",
			"category": "brick",
			"name": "Ladrillo perforado cerámico 24 x 11 x 10 cm",
			"supplier": "leroymerlin",
			"unit": "unidad",
			"coverageM2": .024,
			"price": .45,
			"waste": .1,
			"sourceUrl": "https://www.leroymerlin.es/buscar?text=ladrillo+perforado+24x11x10"
		}
	]
};
//#endregion
//#region src/routes/buscar/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const categoryLabels = {
			drywall: "Drywall",
			block: "Bloque",
			brick: "Ladrillo"
		};
		let productQuery = "";
		let productCategory = "all";
		let productSupplier = "all";
		const allCategories = Array.from(new Set(materials_default.materials.map((p) => p.category)));
		const allSuppliers = materials_default.suppliers;
		function supplierName(id) {
			if (!id) return null;
			return allSuppliers.find((s) => s.id === id)?.name ?? id;
		}
		function normalize(value) {
			return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		}
		let filteredProducts = derived(() => {
			const q = normalize(productQuery.trim());
			return materials_default.materials.filter((p) => {
				if (!q) return true;
				return normalize(p.name).includes(q) || normalize(p.category).includes(q) || normalize(p.unit).includes(q) || normalize(categoryLabels[p.category] ?? "").includes(q) || normalize(supplierName(p.supplier) ?? "").includes(q);
			});
		});
		function priceFormat(value) {
			return new Intl.NumberFormat("es-ES", {
				style: "currency",
				currency: "EUR"
			}).format(value);
		}
		head("4lhogl", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Buscar precios · ReformaCalc</title>`);
			});
			$$renderer.push(`<meta name="description" content="Consulta precios de referencia de materiales de construcción guardados en la base de datos."/>`);
		});
		$$renderer.push(`<div class="product-search svelte-4lhogl"><div class="search-head svelte-4lhogl"><p class="eyebrow menu-eyebrow svelte-4lhogl">CONSULTAR PRECIOS</p> <h1 class="svelte-4lhogl">Busca en la base de datos</h1> <p class="search-lead svelte-4lhogl">Encuentra precios de referencia de los productos guardados en el catálogo.</p></div> <div class="search-controls svelte-4lhogl"><div class="search-input svelte-4lhogl"><span class="search-icon svelte-4lhogl" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svelte-4lhogl"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg></span> <input type="search"${attr("value", productQuery)} placeholder="Buscar por nombre, categoría o proveedor..." aria-label="Buscar producto" class="svelte-4lhogl"/> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="filter-row svelte-4lhogl"><div class="category-pills svelte-4lhogl" role="tablist" aria-label="Filtro por categoría"><button role="tab"${attr_class("svelte-4lhogl", void 0, { "active": true })}>Todos</button> <!--[-->`);
		const each_array = ensure_array_like(allCategories);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let cat = each_array[$$index];
			$$renderer.push(`<button role="tab"${attr_class("svelte-4lhogl", void 0, { "active": productCategory === cat })}>${escape_html(categoryLabels[cat] ?? cat)}</button>`);
		}
		$$renderer.push(`<!--]--></div> <div class="supplier-pills svelte-4lhogl" role="tablist" aria-label="Filtro por proveedor"><button role="tab"${attr_class("svelte-4lhogl", void 0, { "active": true })}>Todos los proveedores</button> <!--[-->`);
		const each_array_1 = ensure_array_like(allSuppliers);
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let supplier = each_array_1[$$index_1];
			$$renderer.push(`<button role="tab"${attr_class("svelte-4lhogl", void 0, { "active": productSupplier === supplier.id })}>${escape_html(supplier.name)}</button>`);
		}
		$$renderer.push(`<!--]--></div></div></div> <div class="product-meta svelte-4lhogl"><span>${escape_html(filteredProducts().length)} de ${escape_html(materials_default.materials.length)} productos</span> <small class="svelte-4lhogl">Fuentes: ${escape_html(allSuppliers.map((s) => s.name).join(" · "))}</small></div> `);
		if (filteredProducts().length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="empty-state svelte-4lhogl"><span aria-hidden="true" class="svelte-4lhogl">⌕</span> <strong class="svelte-4lhogl">Sin resultados</strong> <p class="svelte-4lhogl">No hemos encontrado productos para "${escape_html(productQuery)}".</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<ul class="product-list svelte-4lhogl"><!--[-->`);
			const each_array_2 = ensure_array_like(filteredProducts());
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let product = each_array_2[$$index_2];
				$$renderer.push(`<li class="product-row svelte-4lhogl"><div class="product-info svelte-4lhogl"><div class="product-tags svelte-4lhogl"><span class="product-tag svelte-4lhogl">${escape_html(categoryLabels[product.category] ?? product.category)}</span> `);
				if (product.supplier) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span${attr_class("product-supplier svelte-4lhogl", void 0, { "leroy": product.supplier === "leroymerlin" })}>${escape_html(supplierName(product.supplier))}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <strong class="svelte-4lhogl">${escape_html(product.name)}</strong> <small class="svelte-4lhogl">Unidad: ${escape_html(product.unit)}${escape_html(product.coverageM2 ? ` · Rinde ${product.coverageM2} m²` : "")}${escape_html(product.lengthM ? ` · ${product.lengthM} m` : "")}</small></div> <div class="product-price svelte-4lhogl"><strong class="svelte-4lhogl">${escape_html(priceFormat(product.price))}</strong> <small class="svelte-4lhogl">/ ${escape_html(product.unit)}</small></div> `);
				if (product.sourceUrl) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<a class="product-link svelte-4lhogl"${attr("href", product.sourceUrl)} target="_blank" rel="noopener noreferrer" aria-label="Ver fuente del producto">↗</a>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></li>`);
			}
			$$renderer.push(`<!--]--></ul>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };

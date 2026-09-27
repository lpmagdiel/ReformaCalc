import { b as escape_html, i as head, n as derived, r as ensure_array_like, t as attr_class, y as attr } from "../../../chunks/server.js";
import { o as proveedorNombre, r as materiales, s as proveedores, t as catalog } from "../../../chunks/db.js";
//#region src/routes/buscar/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const categoryLabels = Object.fromEntries([
			"placa",
			"perfil",
			"tornilleria",
			"consumible",
			"aislamiento",
			"bloque",
			"ladrillo",
			"albanileria",
			"cuelgue",
			"panel",
			"suelo",
			"azulejo",
			"baldosa",
			"adhesivo",
			"microcemento",
			"sanitario",
			"griferia",
			"mampara",
			"fontaneria",
			"pintura",
			"demolicion",
			"mueble",
			"acabado",
			"herramienta"
		].map((cat) => [cat, etiquetaCategoria(cat)]));
		function etiquetaCategoria(cat) {
			return {
				placa: "Placa",
				perfil: "Perfil",
				tornilleria: "Tornillería",
				consumible: "Consumible",
				aislamiento: "Aislamiento",
				bloque: "Bloque",
				ladrillo: "Ladrillo",
				albanileria: "Albañilería",
				cuelgue: "Cuelgue",
				panel: "Panel",
				suelo: "Suelo",
				acabado: "Acabado",
				azulejo: "Azulejo",
				baldosa: "Baldosa",
				adhesivo: "Adhesivo",
				microcemento: "Microcemento",
				demolicion: "Demolición",
				herramienta: "Herramienta",
				fontaneria: "Fontanería",
				sanitario: "Sanitario",
				mueble: "Mueble",
				mampara: "Mampara",
				griferia: "Grifería",
				pintura: "Pintura",
				electrodo: "Electrodo",
				hilo_soldadura: "Hilo de soldadura",
				gas_soldadura: "Gas de soldadura",
				epi: "EPI / Protección"
			}[cat];
		}
		let productQuery = "";
		let productCategory = "all";
		let productSupplier = "all";
		const allProducts = materiales();
		const allCategories = Array.from(new Set(allProducts.map((p) => p.categoria)));
		const allSuppliers = proveedores();
		function normalize(value) {
			return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		}
		let filteredProducts = derived(() => {
			const q = normalize(productQuery.trim());
			return allProducts.filter((p) => {
				if (!q) return true;
				return normalize(p.nombre).includes(q) || normalize(p.categoria).includes(q) || normalize(p.unidad).includes(q) || normalize(categoryLabels[p.categoria] ?? "").includes(q) || normalize(proveedorNombre(p.proveedor)).includes(q);
			});
		});
		function priceFormat(value) {
			return new Intl.NumberFormat("es-ES", {
				style: "currency",
				currency: catalog.meta.moneda
			}).format(value);
		}
		function coverage(material) {
			const parts = [];
			if (material.superficieM2) parts.push(`Rinde ${material.superficieM2} m²`);
			if (material.longitudM) parts.push(`${material.longitudM} m`);
			if (material.udsPorEnvase) parts.push(`${material.udsPorEnvase} uds/envase`);
			if (material.kgPorEnvase) parts.push(`${material.kgPorEnvase} kg/envase`);
			if (material.volumenM3) parts.push(`${material.volumenM3} m³`);
			if (material.volumenLitros) parts.push(`${material.volumenLitros} L`);
			return parts.join(" · ");
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
			$$renderer.push(`<button role="tab"${attr_class("svelte-4lhogl", void 0, { "active": productSupplier === supplier.id })}>${escape_html(supplier.nombre)}</button>`);
		}
		$$renderer.push(`<!--]--></div></div></div> <div class="product-meta svelte-4lhogl"><span>${escape_html(filteredProducts().length)} de ${escape_html(allProducts.length)} productos</span> <small class="svelte-4lhogl">Fuentes: ${escape_html(allSuppliers.map((s) => s.nombre).join(" · "))}</small></div> `);
		if (filteredProducts().length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="empty-state svelte-4lhogl"><span aria-hidden="true" class="svelte-4lhogl">⌕</span> <strong class="svelte-4lhogl">Sin resultados</strong> <p class="svelte-4lhogl">No hemos encontrado productos para "${escape_html(productQuery)}".</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<ul class="product-list svelte-4lhogl"><!--[-->`);
			const each_array_2 = ensure_array_like(filteredProducts());
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let product = each_array_2[$$index_2];
				$$renderer.push(`<li class="product-row svelte-4lhogl"><div class="product-info svelte-4lhogl"><div class="product-tags svelte-4lhogl"><span class="product-tag svelte-4lhogl">${escape_html(categoryLabels[product.categoria] ?? product.categoria)}</span> `);
				if (product.proveedor) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span${attr_class("product-supplier svelte-4lhogl", void 0, { "leroy": product.proveedor === "leroymerlin" })}>${escape_html(proveedorNombre(product.proveedor))}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <strong class="svelte-4lhogl">${escape_html(product.nombre)}</strong> <small class="svelte-4lhogl">Unidad: ${escape_html(product.unidad)}${escape_html(coverage(product) ? ` · ${coverage(product)}` : "")}</small></div> <div class="product-price svelte-4lhogl"><strong class="svelte-4lhogl">${escape_html(priceFormat(product.precio))}</strong> <small class="svelte-4lhogl">/ ${escape_html(product.unidad)}</small></div> `);
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

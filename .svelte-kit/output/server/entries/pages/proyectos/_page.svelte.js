import "../../../chunks/index-server.js";
import { b as escape_html, i as head, n as derived, r as ensure_array_like, t as attr_class, y as attr } from "../../../chunks/server.js";
import { t as catalog } from "../../../chunks/db.js";
//#region src/routes/proyectos/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let history = [];
		let query = "";
		let filterCategory = "all";
		function formatCurrency(value) {
			return new Intl.NumberFormat("es-ES", {
				style: "currency",
				currency: catalog.meta.moneda
			}).format(value);
		}
		function formatDate(iso) {
			if (!iso) return "";
			const d = new Date(iso);
			return d.toLocaleDateString("es-ES", {
				day: "2-digit",
				month: "short",
				year: "numeric"
			}) + " " + d.toLocaleTimeString("es-ES", {
				hour: "2-digit",
				minute: "2-digit"
			});
		}
		let filtered = derived(() => {
			const q = query.trim().toLowerCase();
			return history.filter((p) => {
				if (!q) return true;
				return p.name.toLowerCase().includes(q) || p.system.toLowerCase().includes(q);
			});
		});
		const categories = [
			"wall",
			"roof",
			"floor",
			"bath"
		];
		const categoryLabel = {
			wall: "Pared",
			roof: "Techo",
			floor: "Suelo",
			bath: "Baño"
		};
		head("1xfv7j3", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Historial · ReformaCalc</title>`);
			});
		});
		$$renderer.push(`<div class="history-page svelte-1xfv7j3"><div class="history-head svelte-1xfv7j3"><p class="eyebrow menu-eyebrow svelte-1xfv7j3">PROYECTOS GUARDADOS</p> <h1 class="svelte-1xfv7j3">Historial de proyectos</h1> <p class="search-lead svelte-1xfv7j3">Los proyectos finalizados se guardan automáticamente en este dispositivo (máx. 30).</p></div> `);
		if (history.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="empty-state svelte-1xfv7j3"><span aria-hidden="true" class="svelte-1xfv7j3">▣</span> <strong class="svelte-1xfv7j3">No tienes proyectos guardados todavía.</strong> <p class="svelte-1xfv7j3">Calcula una reforma y pulsa "⇩ Exportar" para añadirla al historial.</p> <a href="/" class="ghost-btn svelte-1xfv7j3">← Volver al inicio</a></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="history-controls svelte-1xfv7j3"><input class="history-search svelte-1xfv7j3" type="search"${attr("value", query)} placeholder="Buscar por nombre o sistema…" aria-label="Buscar en el historial"/> <div class="filter-row svelte-1xfv7j3"><button${attr_class("svelte-1xfv7j3", void 0, { "active": true })}>Todos</button> <!--[-->`);
			const each_array = ensure_array_like(categories);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let cat = each_array[$$index];
				$$renderer.push(`<button${attr_class("svelte-1xfv7j3", void 0, { "active": filterCategory === cat })}>${escape_html(categoryLabel[cat] ?? cat)}</button>`);
			}
			$$renderer.push(`<!--]--></div> <button class="danger svelte-1xfv7j3">Borrar todo</button></div> <p class="count svelte-1xfv7j3">${escape_html(filtered().length)} de ${escape_html(history.length)} proyectos</p> <ul class="history-list svelte-1xfv7j3"><!--[-->`);
			const each_array_1 = ensure_array_like(filtered());
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let p = each_array_1[$$index_1];
				$$renderer.push(`<li class="history-row svelte-1xfv7j3"><button class="row-main svelte-1xfv7j3"><div class="row-info svelte-1xfv7j3"><strong class="svelte-1xfv7j3">${escape_html(p.name)}</strong> <small class="svelte-1xfv7j3">${escape_html(categoryLabel[p.category] ?? p.category)} · ${escape_html(p.system)} · ${escape_html(p.area.toFixed(2))} m²</small> <small class="date svelte-1xfv7j3">${escape_html(formatDate(p.savedAt))}</small></div> <div class="row-stats svelte-1xfv7j3"><div class="svelte-1xfv7j3"><span class="svelte-1xfv7j3">Total</span><strong class="svelte-1xfv7j3">${escape_html(formatCurrency(p.totalCost))}</strong></div> <div class="svelte-1xfv7j3"><span class="svelte-1xfv7j3">Materiales</span><strong class="svelte-1xfv7j3">${escape_html(formatCurrency(p.materialsCost))}</strong></div> <div class="svelte-1xfv7j3"><span class="svelte-1xfv7j3">Obra</span><strong class="svelte-1xfv7j3">${escape_html(formatCurrency(p.laborCost))}</strong></div> <div class="svelte-1xfv7j3"><span class="svelte-1xfv7j3">Tiempo</span><strong class="svelte-1xfv7j3">${escape_html(p.hours.toFixed(1))} h</strong></div></div></button> <button class="row-del svelte-1xfv7j3" aria-label="Eliminar proyecto">×</button></li>`);
			}
			$$renderer.push(`<!--]--></ul>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };

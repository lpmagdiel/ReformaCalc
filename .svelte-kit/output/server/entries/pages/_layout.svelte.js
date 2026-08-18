import "../../chunks/internal.js";
import "../../chunks/internal2.js";
import { o as slot } from "../../chunks/server.js";
import "../../chunks/paths.js";
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="app-shell svelte-12qhfyh"><header class="topbar svelte-12qhfyh"><a class="logo svelte-12qhfyh" href="/" aria-label="Inicio"><span class="brand-mark svelte-12qhfyh">R</span><span class="brand-name svelte-12qhfyh">Reforma<span class="brand-accent svelte-12qhfyh">Calc</span></span></a> <div class="header-actions svelte-12qhfyh"><a class="icon-btn svelte-12qhfyh" href="/buscar" aria-label="Buscar precios"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="svelte-12qhfyh"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg></a> <button class="icon-btn svelte-12qhfyh" aria-label="Cambiar tema">☼</button></div></header> <main class="svelte-12qhfyh"><!--[-->`);
		slot($$renderer, $$props, "default", {}, null);
		$$renderer.push(`<!--]--></main> <footer class="svelte-12qhfyh"><span>ReformaCalc <small class="svelte-12qhfyh">v1.2</small></span><span>Datos orientativos · Verificar precios en tienda</span></footer></div>`);
	});
}
//#endregion
export { _layout as default };

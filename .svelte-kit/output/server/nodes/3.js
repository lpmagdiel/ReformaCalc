

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/buscar/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.CasR-GIk.js","_app/immutable/chunks/D6ryFyCZ.js","_app/immutable/chunks/xihTtKlq.js"];
export const stylesheets = ["_app/immutable/assets/3.SVVZwvyH.css"];
export const fonts = [];

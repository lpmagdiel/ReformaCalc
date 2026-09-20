

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.CYvvauXw.js","_app/immutable/chunks/D-xaY2UH.js","_app/immutable/chunks/xihTtKlq.js","_app/immutable/chunks/7xBJbBxW.js"];
export const stylesheets = ["_app/immutable/assets/2.BMNpJDXR.css"];
export const fonts = [];

<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from 'svelte';

  onMount(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register(`${base}/sw.js`);
  });

  function toggleTheme(e: MouseEvent) {
    const btn = e.currentTarget as HTMLButtonElement;
    document.body.classList.toggle('dark');
    btn.textContent = document.body.classList.contains('dark') ? '☾' : '☼';
  }
</script>

<div class="app-shell">
  <header class="topbar">
    <a class="logo" href="/" aria-label="Inicio"><span class="brand-mark">R</span><span class="brand-name">Reforma<span class="brand-accent">Calc</span></span></a>
    <div class="header-actions">
      <a class="icon-btn" href="/proyectos" aria-label="Historial de proyectos" title="Historial">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M10 4v16"/></svg>
      </a>
      <a class="icon-btn" href="/buscar" aria-label="Buscar precios">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      </a>
      <button class="icon-btn" aria-label="Cambiar tema" onclick={toggleTheme}>☼</button>
    </div>
  </header>

  <main>
    <slot />
  </main>

  <footer><span>ReformaCalc <small>v1.2</small></span><span>Datos orientativos · Verificar precios en tienda</span></footer>
</div>

<style>
  :global(*) { box-sizing: border-box; }
  :global(body) { margin: 0; background: #f5f7f8; color: #172126; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; transition: background .3s, color .3s; }
  :global(body.dark) { background: #0f1719; color: #e7eef0; }
  :global(button), :global(input), :global(select) { font: inherit; }
  :global(body.dark) .topbar { border-color: #2a383b; }
  :global(body.dark) .icon-btn { background: #182328; border-color: #2a383b; color: #aab8ba; }
  :global(body.dark) .app-shell footer { color: #58676d; }
  :global(body.dark) .app-shell footer small { color: #6b7a7d; }

  .app-shell { min-height: 100vh; max-width: 1180px; margin: auto; padding: 0 34px; display: flex; flex-direction: column; }
  .topbar { height: 84px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #dfe5e7; }
  .logo { display: flex; align-items: center; gap: 10px; background: none; border: none; padding: 0; cursor: pointer; text-decoration: none; color: inherit; }
  .logo:focus-visible { outline: 2px solid #b8cd25; border-radius: 8px; }
  .brand-mark { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 10px; background: #d7ef4a; color: #202a26; font-size: 20px; }
  :global(body.dark) .brand-mark { background: #d7ef4a; color: #0f1719; }
  .brand-name { font-size: 21px; font-weight: 800; letter-spacing: -.6px; }
  .brand-accent { color: #8a9c17; }
  .header-actions { display: flex; gap: 9px; }
  .icon-btn { width: 38px; height: 38px; border: 1px solid #dfe5e7; border-radius: 10px; background: white; color: #58676d; cursor: pointer; transition: .2s; display: grid; place-items: center; text-decoration: none; }
  .icon-btn:hover { background: #f6f9e9; color: #31400d; }
  .icon-btn svg { width: 18px; height: 18px; }
  main { padding: 32px 0 60px; flex: 1; }
  .app-shell footer { display: flex; justify-content: space-between; color: #a2adaf; font-size: 11px; padding: 0 0 24px; }
  .app-shell footer small { color: #c1cccd; margin-left: 8px; }

  @media (max-width: 700px) {
    .app-shell { padding: 0 16px; }
    .topbar { height: 60px; }
    .app-shell footer { display: block; line-height: 1.8; font-size: 10px; }
  }
</style>

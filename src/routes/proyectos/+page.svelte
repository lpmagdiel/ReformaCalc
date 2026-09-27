<script lang="ts">
  import { catalog } from '$lib/data/db';
  import { onMount } from 'svelte';
  import type { Categoria } from '$lib/calc/types';

  type StoredProject = {
    id: string;
    name: string;
    category: Categoria | string;
    system: string;
    area: number;
    totalCost: number;
    materialsCost: number;
    laborCost: number;
    hours: number;
    createdAt: string;
    savedAt: string;
    snapshot: string;
  };

  const HISTORY_KEY = 'reformacalc:history';
  const MAX_HISTORY = 30;

  let history: StoredProject[] = $state([]);
  let query = $state('');
  let filterCategory = $state<'all' | string>('all');

  onMount(() => {
    loadHistory();
  });

  function loadHistory() {
    if (typeof localStorage === 'undefined') {
      history = [];
      return;
    }
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      history = raw ? JSON.parse(raw) : [];
    } catch {
      history = [];
    }
  }

  function saveHistory() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* cuota llena */
    }
  }

  function deleteProject(id: string) {
    history = history.filter((p) => p.id !== id);
    saveHistory();
  }

  function clearAll() {
    if (!confirm('¿Borrar todo el historial? Esta acción no se puede deshacer.')) return;
    history = [];
    saveHistory();
  }

  function openProject(p: StoredProject) {
    if (!p.snapshot) return;
    const url = `/?p=${p.snapshot}`;
    window.location.href = url;
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: catalog.meta.moneda }).format(value);
  }

  function formatDate(iso: string) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
      d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  let filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    return history.filter((p) => {
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.system.toLowerCase().includes(q);
    });
  });

  const categories = ['wall', 'roof', 'floor', 'bath'];
  const categoryLabel: Record<string, string> = {
    wall: 'Pared',
    roof: 'Techo',
    floor: 'Suelo',
    bath: 'Baño'
  };
</script>

<svelte:head>
  <title>Historial · ReformaCalc</title>
</svelte:head>

<div class="history-page">
  <div class="history-head">
    <p class="eyebrow menu-eyebrow">PROYECTOS GUARDADOS</p>
    <h1>Historial de proyectos</h1>
    <p class="search-lead">Los proyectos finalizados se guardan automáticamente en este dispositivo (máx. {MAX_HISTORY}).</p>
  </div>

  {#if history.length === 0}
    <div class="empty-state">
      <span aria-hidden="true">▣</span>
      <strong>No tienes proyectos guardados todavía.</strong>
      <p>Calcula una reforma y pulsa "⇩ Exportar" para añadirla al historial.</p>
      <a href="/" class="ghost-btn">← Volver al inicio</a>
    </div>
  {:else}
    <div class="history-controls">
      <input class="history-search" type="search" bind:value={query} placeholder="Buscar por nombre o sistema…" aria-label="Buscar en el historial" />
      <div class="filter-row">
        <button class:active={filterCategory === 'all'} onclick={() => (filterCategory = 'all')}>Todos</button>
        {#each categories as cat}
          <button class:active={filterCategory === cat} onclick={() => (filterCategory = cat)}>
            {categoryLabel[cat] ?? cat}
          </button>
        {/each}
      </div>
      <button class="danger" onclick={clearAll}>Borrar todo</button>
    </div>

    <p class="count">{filtered.length} de {history.length} proyectos</p>

    <ul class="history-list">
      {#each filtered as p (p.id)}
        <li class="history-row">
          <button class="row-main" onclick={() => openProject(p)}>
            <div class="row-info">
              <strong>{p.name}</strong>
              <small>{categoryLabel[p.category] ?? p.category} · {p.system} · {p.area.toFixed(2)} m²</small>
              <small class="date">{formatDate(p.savedAt)}</small>
            </div>
            <div class="row-stats">
              <div><span>Total</span><strong>{formatCurrency(p.totalCost)}</strong></div>
              <div><span>Materiales</span><strong>{formatCurrency(p.materialsCost)}</strong></div>
              <div><span>Obra</span><strong>{formatCurrency(p.laborCost)}</strong></div>
              <div><span>Tiempo</span><strong>{p.hours.toFixed(1)} h</strong></div>
            </div>
          </button>
          <button class="row-del" onclick={() => deleteProject(p.id)} aria-label="Eliminar proyecto">×</button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .history-page { max-width: 980px; }
  .menu-eyebrow { font-size: 11px; letter-spacing: 2px; font-weight: 800; color: #87949a; margin: 0 0 12px; padding-left: 4px; }
  .history-head h1 { font-size: clamp(28px, 4vw, 40px); line-height: 1.05; letter-spacing: -1.5px; margin: 0 0 10px; }
  .search-lead { color: #79878c; font-size: 14px; margin: 0; max-width: 520px; }
  :global(body.dark) .search-lead { color: #8a999c; }
  :global(body.dark) .menu-eyebrow { color: #6b7a7d; }

  .empty-state { padding: 40px 16px; text-align: center; background: white; border: 1px dashed #dde5e6; border-radius: 14px; color: #79878c; margin-top: 22px; display: grid; gap: 8px; justify-items: center; }
  .empty-state span { font-size: 32px; color: #a9b4b7; }
  .empty-state strong { display: block; color: #172126; font-size: 15px; }
  .empty-state p { margin: 0; font-size: 12px; }
  .ghost-btn { display: inline-block; margin-top: 10px; background: white; border: 1px solid #dde5e6; border-radius: 10px; padding: 9px 14px; color: #46545a; text-decoration: none; font-weight: 700; font-size: 12px; }
  .ghost-btn:hover { background: #f6f9e9; border-color: #b8cd25; color: #31400d; }
  :global(body.dark) .empty-state { background: #182328; border-color: #2a383b; color: #8a999c; }
  :global(body.dark) .empty-state strong { color: #e7eef0; }
  :global(body.dark) .ghost-btn { background: #182328; border-color: #2a383b; color: #aab8ba; }

  .history-controls { display: flex; gap: 12px; margin-top: 22px; align-items: center; flex-wrap: wrap; }
  .history-search { flex: 1; min-width: 200px; border: 1px solid #dce4e5; border-radius: 10px; padding: 10px 13px; font-size: 13px; background: white; color: #25353a; outline-color: #b8cd25; }
  .filter-row { display: flex; gap: 6px; flex-wrap: wrap; }
  .filter-row button { background: white; border: 1px solid #dde5e6; border-radius: 20px; padding: 6px 12px; font-size: 12px; color: #46545a; cursor: pointer; font-weight: 600; }
  .filter-row button.active { background: #d7ef4a; border-color: #d7ef4a; color: #31400d; }
  .danger { background: #fdecec; border: 1px solid #f5c2c2; color: #b03030; border-radius: 10px; padding: 9px 14px; font-size: 12px; font-weight: 700; cursor: pointer; }
  .danger:hover { background: #fbd5d5; }
  :global(body.dark) .history-search { background: #182328; border-color: #2a383b; color: #e7eef0; }
  :global(body.dark) .filter-row button { background: #182328; border-color: #2a383b; color: #aab8ba; }
  :global(body.dark) .filter-row button.active { background: #d7ef4a; color: #31400d; }
  :global(body.dark) .danger { background: #3a1212; border-color: #7a1f1f; color: #ffb4a2; }

  .count { font-size: 11px; color: #87949a; margin: 18px 4px 8px; }

  .history-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
  .history-row { display: grid; grid-template-columns: 1fr 36px; gap: 8px; align-items: stretch; }
  .row-main { display: grid; grid-template-columns: 1fr auto; gap: 16px; padding: 14px 16px; background: white; border: 1px solid #e3e8ea; border-radius: 14px; cursor: pointer; text-align: left; font: inherit; color: inherit; transition: .15s; }
  .row-main:hover { border-color: #b8cd25; transform: translateY(-1px); box-shadow: 0 6px 14px #25343b10; }
  .row-info { display: grid; gap: 3px; min-width: 0; }
  .row-info strong { font-size: 14px; }
  .row-info small { font-size: 11.5px; color: #79878c; }
  .row-info .date { color: #a0aaad; font-size: 11px; }
  .row-stats { display: grid; grid-auto-flow: column; gap: 18px; align-items: end; }
  .row-stats div { display: grid; gap: 2px; min-width: 78px; }
  .row-stats span { font-size: 9px; font-weight: 800; letter-spacing: 1px; color: #87949a; text-transform: uppercase; }
  .row-stats strong { font-size: 13px; color: #31400d; letter-spacing: -.3px; }
  .row-del { background: #fdecec; border: 1px solid #f5c2c2; color: #b03030; border-radius: 10px; cursor: pointer; font-size: 18px; line-height: 1; }
  .row-del:hover { background: #fbd5d5; }
  :global(body.dark) .row-main { background: #182328; border-color: #2a383b; }
  :global(body.dark) .row-main:hover { background: #1d2a17; }
  :global(body.dark) .row-info strong { color: #e7eef0; }
  :global(body.dark) .row-info small { color: #8a999c; }
  :global(body.dark) .row-stats strong { color: #d7ef4a; }
  :global(body.dark) .row-del { background: #3a1212; border-color: #7a1f1f; color: #ffb4a2; }

  @media (max-width: 700px) {
    .row-main { grid-template-columns: 1fr; }
    .row-stats { grid-auto-flow: row; grid-template-columns: repeat(2, 1fr); gap: 8px; }
  }
</style>

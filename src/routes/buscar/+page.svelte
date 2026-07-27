<script lang="ts">
  import products from '$lib/materials.json';

  type Product = (typeof products.materials)[number];
  type Supplier = (typeof products.suppliers)[number];

  const categoryLabels: Record<string, string> = {
    drywall: 'Drywall',
    block: 'Bloque',
    brick: 'Ladrillo'
  };

  let productQuery = $state('');
  let productCategory = $state<'all' | string>('all');
  let productSupplier = $state<'all' | string>('all');

  const allCategories = Array.from(new Set(products.materials.map((p) => p.category)));
  const allSuppliers = products.suppliers as Supplier[];

  function supplierName(id?: string) {
    if (!id) return null;
    return allSuppliers.find((s) => s.id === id)?.name ?? id;
  }

  function normalize(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  let filteredProducts = $derived.by(() => {
    const q = normalize(productQuery.trim());
    return products.materials.filter((p: Product) => {
      if (productCategory !== 'all' && p.category !== productCategory) return false;
      if (productSupplier !== 'all' && p.supplier !== productSupplier) return false;
      if (!q) return true;
      return (
        normalize(p.name).includes(q) ||
        normalize(p.category).includes(q) ||
        normalize(p.unit).includes(q) ||
        normalize(categoryLabels[p.category] ?? '').includes(q) ||
        normalize(supplierName(p.supplier) ?? '').includes(q)
      );
    });
  });

  function priceFormat(value: number) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  }
</script>

<svelte:head>
  <title>Buscar precios · ReformaCalc</title>
  <meta name="description" content="Consulta precios de referencia de materiales de construcción guardados en la base de datos." />
</svelte:head>

<div class="product-search">
  <div class="search-head">
    <p class="eyebrow menu-eyebrow">CONSULTAR PRECIOS</p>
    <h1>Busca en la base de datos</h1>
    <p class="search-lead">Encuentra precios de referencia de los productos guardados en el catálogo.</p>
  </div>

  <div class="search-controls">
    <div class="search-input">
      <span class="search-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      </span>
      <input
        type="search"
        bind:value={productQuery}
        placeholder="Buscar por nombre, categoría o proveedor..."
        aria-label="Buscar producto"
      />
      {#if productQuery}
        <button class="clear-btn" type="button" onclick={() => (productQuery = '')} aria-label="Limpiar búsqueda">×</button>
      {/if}
    </div>

    <div class="filter-row">
      <div class="category-pills" role="tablist" aria-label="Filtro por categoría">
        <button role="tab" class:active={productCategory === 'all'} onclick={() => (productCategory = 'all')}>Todos</button>
        {#each allCategories as cat}
          <button role="tab" class:active={productCategory === cat} onclick={() => (productCategory = cat)}>
            {categoryLabels[cat] ?? cat}
          </button>
        {/each}
      </div>
      <div class="supplier-pills" role="tablist" aria-label="Filtro por proveedor">
        <button role="tab" class:active={productSupplier === 'all'} onclick={() => (productSupplier = 'all')}>Todos los proveedores</button>
        {#each allSuppliers as supplier}
          <button role="tab" class:active={productSupplier === supplier.id} onclick={() => (productSupplier = supplier.id)}>
            {supplier.name}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <div class="product-meta">
    <span>{filteredProducts.length} de {products.materials.length} productos</span>
    <small>Fuentes: {allSuppliers.map((s) => s.name).join(' · ')}</small>
  </div>

  {#if filteredProducts.length === 0}
    <div class="empty-state">
      <span aria-hidden="true">⌕</span>
      <strong>Sin resultados</strong>
      <p>No hemos encontrado productos para "{productQuery}".</p>
    </div>
  {:else}
    <ul class="product-list">
      {#each filteredProducts as product (product.id)}
        <li class="product-row">
          <div class="product-info">
            <div class="product-tags">
              <span class="product-tag">{categoryLabels[product.category] ?? product.category}</span>
              {#if product.supplier}
                <span class="product-supplier" class:leroy={product.supplier === 'leroymerlin'}>{supplierName(product.supplier)}</span>
              {/if}
            </div>
            <strong>{product.name}</strong>
            <small>Unidad: {product.unit}{product.coverageM2 ? ` · Rinde ${product.coverageM2} m²` : ''}{product.lengthM ? ` · ${product.lengthM} m` : ''}</small>
          </div>
          <div class="product-price">
            <strong>{priceFormat(product.price)}</strong>
            <small>/ {product.unit}</small>
          </div>
          {#if product.sourceUrl}
            <a class="product-link" href={product.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label="Ver fuente del producto">↗</a>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .product-search { max-width: 760px; }
  .menu-eyebrow { font-size: 11px; letter-spacing: 2px; font-weight: 800; color: #87949a; margin: 0 0 12px; padding-left: 4px; }
  .search-head h1 { font-size: clamp(28px, 4vw, 40px); line-height: 1.05; letter-spacing: -1.5px; margin: 0 0 10px; }
  .search-lead { color: #79878c; font-size: 14px; margin: 0; max-width: 520px; }
  :global(body.dark) .search-lead { color: #8a999c; }
  :global(body.dark) .menu-eyebrow { color: #6b7a7d; }

  .search-controls { margin-top: 22px; display: grid; gap: 12px; }
  .search-input {
    position: relative;
    display: flex;
    align-items: center;
    background: white;
    border: 1px solid #dce4e5;
    border-radius: 12px;
    padding: 0 12px;
    transition: border-color .2s, box-shadow .2s;
  }
  .search-input:focus-within { border-color: #b8cd25; box-shadow: 0 0 0 3px #d7ef4a55; }
  .search-icon { display: grid; place-items: center; color: #98a3a6; width: 20px; height: 20px; flex: none; }
  .search-icon svg { width: 100%; height: 100%; }
  .search-input input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    padding: 13px 10px;
    font-size: 14px;
    color: #25353a;
    min-width: 0;
  }
  .clear-btn { background: none; border: none; color: #98a3a6; font-size: 22px; line-height: 1; cursor: pointer; padding: 4px 8px; border-radius: 8px; transition: background .2s, color .2s; }
  .clear-btn:hover { background: #f1f3f4; color: #31400d; }

  .filter-row { display: grid; gap: 10px; }
  .category-pills, .supplier-pills { display: flex; flex-wrap: wrap; gap: 6px; }
  .category-pills button, .supplier-pills button { background: white; border: 1px solid #dde5e6; border-radius: 20px; padding: 7px 13px; font-size: 12px; color: #46545a; cursor: pointer; font-weight: 600; transition: .2s; }
  .category-pills button:hover, .supplier-pills button:hover { border-color: #b8cd25; color: #31400d; }
  .category-pills button.active, .supplier-pills button.active { background: #d7ef4a; border-color: #d7ef4a; color: #31400d; }
  .supplier-pills button.active { background: #31400d; color: #d7ef4a; border-color: #31400d; }

  .product-meta { display: flex; justify-content: space-between; gap: 10px; margin: 22px 4px 10px; font-size: 11px; color: #87949a; }
  .product-meta small { color: #a0aaad; }

  .product-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
  .product-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 16px;
    padding: 14px 16px;
    background: white;
    border: 1px solid #e3e8ea;
    border-radius: 14px;
    transition: transform .15s, border-color .15s, box-shadow .15s;
  }
  .product-row:hover { transform: translateY(-1px); border-color: #b8cd25; box-shadow: 0 6px 14px #25343b10; }
  .product-info { display: grid; gap: 4px; min-width: 0; }
  .product-tags { display: flex; flex-wrap: wrap; gap: 5px; }
  .product-tag { font-size: 9.5px; font-weight: 800; letter-spacing: 1.1px; text-transform: uppercase; color: #627311; background: #ecf6b5; padding: 3px 8px; border-radius: 10px; width: fit-content; }
  .product-supplier { font-size: 9.5px; font-weight: 700; letter-spacing: 0.5px; color: #2f6bd9; background: #eaf2ff; padding: 3px 8px; border-radius: 10px; width: fit-content; }
  .product-supplier.leroy { color: #4ea84e; background: #e8f6e8; }
  .product-info strong { font-size: 14px; color: #172126; }
  .product-info small { font-size: 11.5px; color: #79878c; }
  .product-price { display: flex; align-items: baseline; gap: 4px; white-space: nowrap; }
  .product-price strong { font-size: 17px; color: #31400d; letter-spacing: -.5px; }
  .product-price small { font-size: 11px; color: #79878c; }
  .product-link { width: 32px; height: 32px; border-radius: 10px; background: #f5f7f8; color: #46545a; display: grid; place-items: center; text-decoration: none; font-size: 16px; transition: .2s; }
  .product-link:hover { background: #d7ef4a; color: #31400d; }

  .empty-state { padding: 28px 16px; text-align: center; background: white; border: 1px dashed #dde5e6; border-radius: 14px; color: #79878c; }
  .empty-state span { font-size: 28px; color: #a9b4b7; display: block; margin-bottom: 6px; }
  .empty-state strong { display: block; color: #172126; font-size: 14px; margin-bottom: 4px; }
  .empty-state p { margin: 0; font-size: 12px; }

  :global(body.dark) .search-input { background: #182328; border-color: #2a383b; }
  :global(body.dark) .search-input input { color: #e7eef0; }
  :global(body.dark) .clear-btn { color: #6b7a7d; }
  :global(body.dark) .clear-btn:hover { background: #1f2a2c; color: #d7ef4a; }
  :global(body.dark) .category-pills button, :global(body.dark) .supplier-pills button { background: #182328; border-color: #2a383b; color: #aab8ba; }
  :global(body.dark) .category-pills button.active { background: #d7ef4a; color: #31400d; border-color: #d7ef4a; }
  :global(body.dark) .supplier-pills button.active { background: #31400d; color: #d7ef4a; border-color: #31400d; }
  :global(body.dark) .product-row { background: #182328; border-color: #2a383b; }
  :global(body.dark) .product-info strong { color: #e7eef0; }
  :global(body.dark) .product-info small { color: #8a999c; }
  :global(body.dark) .product-price strong { color: #d7ef4a; }
  :global(body.dark) .product-tag { background: #3d4a1c; color: #d7ef4a; }
  :global(body.dark) .product-supplier { background: #1d2a3a; color: #6da4ff; }
  :global(body.dark) .product-supplier.leroy { background: #1d2e1d; color: #7fc97f; }
  :global(body.dark) .product-link { background: #0f1719; color: #aab8ba; }
  :global(body.dark) .product-link:hover { background: #d7ef4a; color: #31400d; }
  :global(body.dark) .empty-state { background: #182328; border-color: #2a383b; color: #8a999c; }
  :global(body.dark) .empty-state strong { color: #e7eef0; }

  @media (max-width: 700px) {
    .search-head h1 { font-size: 26px; letter-spacing: -1px; }
    .product-row { grid-template-columns: 1fr auto; padding: 12px 14px; gap: 12px; border-radius: 12px; }
    .product-link { grid-column: 2; }
    .product-info strong { font-size: 13px; }
    .product-price strong { font-size: 15px; }
  }
</style>

<script lang="ts">
  import materials from '$lib/data/materiales.json';

  type Kind = 'drywall' | 'block' | 'ladrillo';
  type Material = (typeof materials.materiales)[number];
  type Line = { material: Material; quantity: number; total: number; detail: string };

  type MenuItem = {
    id: 'wall' | 'roof' | 'floor' | 'bath';
    title: string;
    subtitle: string;
    available: boolean;
    icon: 'wall' | 'roof' | 'floor' | 'bath';
  };

  const menuItems: MenuItem[] = [
    { id: 'wall', title: 'Pared simple', subtitle: 'Tabique de drywall, bloque o ladrillo', available: true, icon: 'wall' },
    { id: 'roof', title: 'Techo', subtitle: 'Falso techo continuo o desmontable', available: false, icon: 'roof' },
    { id: 'floor', title: 'Suelo', subtitle: 'Tarima, cerámica o microcemento', available: false, icon: 'floor' },
    { id: 'bath', title: 'Baño completo', subtitle: 'Reforma integral de baño', available: false, icon: 'bath' }
  ];

  let menu: 'home' | 'wizard' = $state('home');

  let step: 1 | 2 | 3 = $state(1);
  let kind: Kind = $state('drywall');
  let width: number = $state(3.2);
  let height: number = $state(2.6);
  let openings: number = $state(0);
  let thickness: 'M48' | 'M70' | 'M90' = $state('M48');
  let studSpacing: 40 | 50 | 60 | 80 = $state(60);
  let withInsulation = $state(true);
  let laborOn = $state(true);
  let projectName = $state('Pared salón');

  function startWizard() {
    menu = 'wizard';
  }

  function goHome() {
    menu = 'home';
    step = 1;
  }

  const kinds = [
    { id: 'drywall' as Kind, label: 'Pladur', subtitle: 'Ligero y rápido', icon: '▧' },
    { id: 'block' as Kind, label: 'Block', subtitle: 'Resistente', icon: '▦' },
    { id: 'ladrillo' as Kind, label: 'Ladrillo', subtitle: 'Tradicional', icon: '▤' }
  ];

  function byId(id: string) {
    return materials.materiales.find((item) => item.id === id)!;
  }

  function ceilWithWaste(value: number, waste = 0) {
    return Math.ceil(value * (1 + waste));
  }

  function calculate() {
    const area = Math.max(0, width * height - openings);
    const lines: Line[] = [];
    if (kind === 'drywall') {
      const plates = byId('placa_yeso_estandar');
      const studs = byId('montante_m48');
      const tracks = byId('canal_c48');
      const screws = byId('tornillos_placa');
      const structureScrews = byId('tornillos_estructura');
      const jointTape = byId('cinta_juntas');
      const joint = byId('pasta_juntas');
      const insulation = byId('lana_mineral');
      const consumos = materials.consumos.drywall;
      const plateCount = ceilWithWaste((area * 2) / Number(plates.superficieM2), consumos.desperdicioPlacas);
      const studCount = Math.ceil(width / (studSpacing / 100)) + 1;
      const trackCount = ceilWithWaste((width * 2) / Number(tracks.longitudM), 0.08);
      lines.push({ material: plates, quantity: plateCount, total: 0, detail: '2 caras · 2,5 × 1,2 m' });
      lines.push({ material: studs, quantity: studCount, total: 0, detail: `Montante vertical cada ${studSpacing} cm` });
      lines.push({ material: tracks, quantity: trackCount, total: 0, detail: 'Canal superior e inferior' });
      if (withInsulation) {
        lines.push({ material: insulation, quantity: Math.ceil(area / Number(insulation.superficieM2)), total: 0, detail: 'Aislamiento interior' });
      }
      lines.push({ material: screws, quantity: Math.ceil((area * 2 * consumos.tornillosPorM2Placa) / Number(screws.udsPorEnvase)), total: 0, detail: screws.formato });
      lines.push({ material: structureScrews, quantity: Math.ceil((studCount * consumos.tornillosEstructuraPorMontante) / Number(structureScrews.udsPorEnvase)), total: 0, detail: structureScrews.formato });
      lines.push({ material: jointTape, quantity: Math.ceil((plateCount * consumos.cintaMetrosPorPlaca) / Number(jointTape.longitudM)), total: 0, detail: jointTape.formato });
      lines.push({ material: joint, quantity: Math.ceil((area * 2 * consumos.pastaKgPorM2Placa) / Number(joint.kgPorEnvase)), total: 0, detail: joint.formato });
    } else {
      const unit = byId(kind === 'block' ? 'bloque_hormigon_15' : 'ladrillo_hueco_doble');
      const mortar = byId('mortero_seco');
      const consumos = materials.consumos[kind];
      lines.push({ material: unit, quantity: Math.ceil(area * consumos.udsPorM2 * (1 + consumos.desperdicio)), total: 0, detail: `${consumos.udsPorM2} uds./m² · ${unit.formato}` });
      lines.push({ material: mortar, quantity: Math.ceil((area * consumos.morteroKgPorM2) / Number(mortar.kgPorEnvase)), total: 0, detail: `${consumos.morteroKgPorM2} kg/m² · ${mortar.formato}` });
    }
    lines.forEach((line) => (line.total = line.quantity * line.material.precio));
    const laborRate = materials.manoObra[kind].precioM2;
    const labor = laborOn ? area * laborRate : 0;
    const hours = Math.max(1, (area / materials.manoObra[kind].m2PorDia) * 8);
    return { area, lines, total: lines.reduce((sum, line) => sum + line.total, 0), labor, hours, grandTotal: lines.reduce((sum, line) => sum + line.total, 0) + labor };
  }

  let result = $derived(calculate());

  function euro(value: number) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: materials.meta.moneda }).format(value);
  }

  function next() { if (step < 3) step = (step + 1) as 1 | 2 | 3; }
  function back() { if (step > 1) step = (step - 1) as 1 | 2 | 3; }
  function reset() { width = 3.2; height = 2.6; openings = 0; thickness = 'M48'; studSpacing = 60; withInsulation = true; laborOn = true; step = 1; menu = 'home'; }
</script>

<svelte:head>
  <title>ReformaCalc · Calcula tu reforma</title>
  <meta name="description" content="Calcula materiales, presupuesto y tiempo para tus reformas." />
  <meta name="theme-color" content="#f8fafb" />
  <link rel="manifest" href="/manifest.webmanifest" />
</svelte:head>

<div class="app-shell">
  <main>
    {#if menu === 'home'}
      <section class="menu-screen">
        <p class="eyebrow menu-eyebrow">¿QUÉ QUIERES CONSTRUIR?</p>
        <div class="menu-list">
          {#each menuItems as item}
            <button class="menu-card" class:enabled={item.available} disabled={!item.available} onclick={() => item.available && startWizard()}>
              <span class="menu-icon" aria-hidden="true">
                {#if item.icon === 'wall'}
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 26h20M6 22h20M6 18h20M6 14h20M6 10h20M6 6h20"/></svg>
                {:else if item.icon === 'roof'}
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 16h22M9 11h14M13 6h6"/></svg>
                {:else if item.icon === 'floor'}
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="6" y="6" width="8" height="8"/><rect x="18" y="6" width="8" height="8"/><rect x="6" y="18" width="8" height="8"/><rect x="18" y="18" width="8" height="8"/></svg>
                {:else if item.icon === 'bath'}
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16h22v3a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5v-3z"/><path d="M9 16V8a3 3 0 0 1 6 0M7 11h2"/></svg>
                {/if}
              </span>
              <span class="menu-text">
                <strong>{item.title}</strong>
                <small>{item.subtitle}</small>
              </span>
              {#if item.available}
                <span class="menu-arrow" aria-hidden="true">→</span>
              {:else}
                <span class="menu-soon">PRÓXIMAMENTE</span>
              {/if}
            </button>
          {/each}
        </div>
      </section>
    {:else}
      <section class="intro">
        <div>
          <p class="eyebrow">CALCULADORA DE MATERIALES</p>
          <h1>Hazlo bien.<br /><span>Desde el principio.</span></h1>
          <p class="lead">Calcula materiales, presupuesto y tiempo para tus reformas en segundos.</p>
          <div class="project-input">
            <label>Nombre del proyecto <input type="text" bind:value={projectName} placeholder="Ej: Pared salón" /></label>
          </div>
        </div>
        <div class="hero-art" aria-hidden="true"><div class="sun"></div><div class="house"><i></i><i></i><i></i><i></i></div><div class="ground"></div></div>
      </section>

      <div class="stepper">
        <button class:done={step > 1} class:active={step === 1} onclick={() => (step = 1)}><span>01</span><em>Configuración</em></button>
        <i></i>
        <button class:done={step > 2} class:active={step === 2} onclick={() => (step = 2)}><span>02</span><em>Medidas</em></button>
        <i></i>
        <button class:active={step === 3} onclick={() => (step = 3)}><span>03</span><em>Resultado</em></button>
      </div>

    {#if step === 1}
      <section class="card step-pane">
        <div class="section-heading"><div><p class="eyebrow">PASO 01</p><h2>¿Qué vas a construir?</h2></div><span class="step-badge">1/3</span></div>
        <div class="kind-grid">{#each kinds as option}<button class:chosen={kind === option.id} class="kind" onclick={() => { kind = option.id; }}><span class="kind-icon">{option.icon}</span><strong>{option.label}</strong><small>{option.subtitle}</small>{#if kind === option.id}<b class="check">✓</b>{/if}</button>{/each}</div>
        {#if kind === 'drywall'}<label class="select-label">TIPO DE SISTEMA <select bind:value={thickness}><option>M48</option><option>M70</option><option>M90</option></select></label>{/if}
        {#if kind === 'drywall'}<label class="select-label">SEPARACIÓN ENTRE MONTANTES <select bind:value={studSpacing}><option value={40}>40 cm</option><option value={50}>50 cm</option><option value={60}>60 cm</option><option value={80}>80 cm</option></select></label>{/if}
        {#if kind === 'drywall'}<label class="toggle"><input type="checkbox" bind:checked={withInsulation} /><span class="track"><i></i></span><span>Incluir aislamiento interior</span></label>{/if}
        <label class="toggle"><input type="checkbox" bind:checked={laborOn} /><span class="track"><i></i></span><span>Incluir mano de obra</span></label>
        <div class="step-nav"><span></span><button class="primary" onclick={next}>Siguiente →</button></div>
      </section>
    {/if}

    {#if step === 2}
      <section class="card step-pane">
        <div class="section-heading"><div><p class="eyebrow">PASO 02</p><h2>Introduce las medidas</h2></div><span class="step-badge muted">2/3</span></div>
        <div class="fields">
          <label><span>ANCHO <small>metros</small></span><div class="stepper-input"><button onclick={() => width = Math.max(0.1, +(width - 0.1).toFixed(2))}>−</button><input type="number" min="0.1" step="0.1" bind:value={width} /><button onclick={() => width = +(width + 0.1).toFixed(2)}>+</button></div></label>
          <span class="times">×</span>
          <label><span>ALTO <small>metros</small></span><div class="stepper-input"><button onclick={() => height = Math.max(0.1, +(height - 0.1).toFixed(2))}>−</button><input type="number" min="0.1" step="0.1" bind:value={height} /><button onclick={() => height = +(height + 0.1).toFixed(2)}>+</button></div></label>
        </div>
        <label class="opening-field"><span>HUECOS (PUERTAS / VENTANAS) <small>m² a descontar</small></span><div class="stepper-input"><button onclick={() => openings = Math.max(0, +(openings - 0.1).toFixed(2))}>−</button><input type="number" min="0" step="0.1" bind:value={openings} /><button onclick={() => openings = +(openings + 0.1).toFixed(2)}>+</button></div></label>
        <div class="presets"><span>Preset:</span><button onclick={() => { width = 3; height = 2.5; openings = 1.8; }}>Habitación</button><button onclick={() => { width = 1.2; height = 2.6; openings = 0; }}>Pasillo</button><button onclick={() => { width = 5; height = 3; openings = 2.5; }}>Salón grande</button></div>
        <div class="area-note"><span>▧</span><strong>Superficie a cubrir</strong><b>{result.area.toFixed(2)} m²</b></div>
        <div class="step-nav"><button class="ghost" onclick={back}>← Atrás</button><button class="primary" onclick={next}>Calcular →</button></div>
      </section>
    {/if}

    {#if step === 3}
      <section class="result-card step-pane">
        <div class="result-top">
          <div>
            <p class="eyebrow light">ESTIMACIÓN DEL PROYECTO</p>
            <h2>{projectName || 'Tu lista de compra'}</h2>
            <p>Pared de {result.area.toFixed(2)} m² · {kinds.find((item) => item.id === kind)?.label}</p>
          </div>
          <span class="step-badge light-badge">3/3</span>
        </div>
        <div class="stats">
          <div><span>Materiales</span><strong>{euro(result.total)}</strong><small>Precios estimados</small></div>
          {#if laborOn}<div><span>Mano de obra</span><strong>{euro(result.labor)}</strong><small>{materials.manoObra[kind].precioM2} €/m²</small></div>{/if}
          <div><span>Total</span><strong>{euro(result.grandTotal)}</strong><small>Materiales + obra</small></div>
          <div><span>Tiempo</span><strong>{result.hours.toFixed(1)} h</strong><small>Rendimiento orientativo</small></div>
        </div>
        <div class="shopping-list">
          {#each result.lines as line}
            <div class="material-row">
              <div class="material-icon">{line.material.categoria === 'drywall' ? '▧' : '▤'}</div>
              <div class="material-name"><strong>{line.material.nombre}</strong><small>{line.detail} · {euro(line.material.precio)} / {line.material.unidad}</small></div>
              <b class="qty">{line.quantity} {line.material.unidad === 'unidad' ? 'uds.' : line.material.unidad}s</b>
              <span class="price">{euro(line.total)}</span>
            </div>
          {/each}
        </div>
        <div class="actions">
          <button onclick={() => window.print()}>⎙ Imprimir / PDF</button>
          <button onclick={() => { const text = `${projectName}\n${result.lines.map((l) => `- ${l.quantity} ${l.material.unidad === 'unidad' ? 'uds.' : l.material.unidad}s · ${l.material.nombre} = ${euro(l.total)}`).join('\n')}\nMateriales: ${euro(result.total)}\nMano de obra: ${euro(result.labor)}\nTotal: ${euro(result.grandTotal)}`; navigator.clipboard?.writeText(text); }}>⎘ Copiar</button>
          <button onclick={reset}>↺ Nuevo</button>
        </div>
        <div class="step-nav"><button class="ghost" onclick={back}>← Atrás</button><button class="primary" onclick={() => (step = 2)}>Modificar medidas</button></div>
        <div class="notice"><span>i</span><p>Estimación orientativa con precios de referencia de Obramat (actualizados {materials.meta.fechaActualizacion}). Incluye merma y consumos técnicos. Mano de obra orientativa; verifica precios y stock en tu almacén.</p></div>
      </section>
    {/if}
    {/if}
  </main>
</div>

<style>
  :global(*) { box-sizing: border-box; }
  :global(body) { margin: 0; background: #f5f7f8; color: #172126; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; transition: background .3s, color .3s; }
  :global(body.dark) { background: #0f1719; color: #e7eef0; }
  :global(body.dark) .card { background: #182328; border-color: #2a383b; box-shadow: 0 5px 20px #00000040; }
  :global(body.dark) .kind { background: #182328; border-color: #2a383b; }
  :global(body.dark) .kind.chosen, :global(body.dark) .kind:hover { background: #1d2a17; }
  :global(body.dark) .fields input, :global(body.dark) .opening-field input, :global(body.dark) .select-label select, :global(body.dark) .stepper-input input, :global(body.dark) .project-input input { background: #0f1719; border-color: #2a383b; color: #e7eef0; }
  :global(body.dark) .stepper-input button { background: #0f1719; border-color: #2a383b; color: #aab8ba; }
  :global(body.dark) .area-note { background: #1d2a17; color: #c8db7a; }
  :global(body.dark) .area-note b { color: #d7ef4a; }
  :global(body.dark) .stepper button { background: #0f1719; border-color: #2a383b; color: #aab8ba; }
  :global(body.dark) .stepper em { color: #6b7a7d; }
  :global(body.dark) .stepper i { background: #2a383b; }
  :global(body.dark) .eyebrow { color: #6b7a7d; }
  :global(body.dark) .intro h1 { color: #e7eef0; }
  :global(body.dark) .lead { color: #8a999c; }
  :global(body.dark) .presets button { background: #182328; border-color: #2a383b; color: #aab8ba; }
  :global(body.dark) .toggle .track { background: #2a383b; }
  :global(body.dark) .notice { background: #1d2a17; }
  :global(body.dark) button.ghost { background: #182328; border-color: #2a383b; color: #aab8ba; }
  :global(body.dark) .step-nav button.ghost { background: #0f1719; }
  :global(body.dark) .actions button { background: #314144; border-color: #46555a; color: #e7eef0; }

  .app-shell { max-width: 1180px; margin: auto; padding: 0 34px; }

  .menu-screen { padding: 18px 0 20px; }
  .menu-eyebrow { font-size: 11px; letter-spacing: 2px; font-weight: 800; color: #87949a; margin: 0 0 18px; padding-left: 4px; }
  .menu-list { display: grid; gap: 12px; max-width: 560px; }
  .menu-card {
    display: grid;
    grid-template-columns: 56px 1fr auto;
    align-items: center;
    gap: 18px;
    width: 100%;
    padding: 18px 20px;
    background: white;
    border: 1px solid #e3e8ea;
    border-radius: 16px;
    cursor: pointer;
    text-align: left;
    font: inherit;
    color: #172126;
    transition: transform .2s, box-shadow .2s, border-color .2s, background .2s;
  }
  .menu-card.enabled:hover { transform: translateY(-2px); border-color: #b8cd25; box-shadow: 0 6px 18px #25343b10; }
  .menu-card.enabled:hover .menu-arrow { color: #31400d; transform: translateX(2px); }
  .menu-card:disabled { cursor: not-allowed; }
  .menu-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: #eaf2ff;
    color: #2f6bd9;
    display: grid; place-items: center;
    flex: none;
  }
  .menu-icon svg { width: 24px; height: 24px; }
  .menu-card:disabled .menu-icon { background: #f1f3f4; color: #a9b4b7; }
  .menu-text { display: grid; gap: 3px; min-width: 0; }
  .menu-text strong { font-size: 16px; font-weight: 800; letter-spacing: -.3px; color: #172126; }
  .menu-text small { font-size: 12.5px; color: #79878c; line-height: 1.35; }
  .menu-card:disabled .menu-text strong { color: #b1bbbe; }
  .menu-arrow { font-size: 20px; color: #98a3a6; font-weight: 700; transition: transform .2s, color .2s; }
  .menu-soon { font-size: 10px; font-weight: 800; letter-spacing: 1.2px; color: #98a3a6; }
  :global(body.dark) .menu-card { background: #182328; border-color: #2a383b; }
  :global(body.dark) .menu-text strong { color: #e7eef0; }
  :global(body.dark) .menu-text small { color: #8a999c; }
  :global(body.dark) .menu-card:disabled .menu-text strong { color: #58676d; }
  :global(body.dark) .menu-icon { background: #1d2a3a; color: #6da4ff; }
  :global(body.dark) .menu-card:disabled .menu-icon { background: #1f2a2c; color: #58676d; }
  :global(body.dark) .menu-eyebrow { color: #6b7a7d; }
  :global(body.dark) .menu-arrow, :global(body.dark) .menu-soon { color: #58676d; }
  .intro { min-height: 170px; display:flex; justify-content:space-between; align-items:center; overflow:hidden; }
  .eyebrow { color:#87949a; font-size:11px; letter-spacing:1.8px; font-weight:800; margin:0 0 12px; }
  .intro h1 { font-size:clamp(30px, 5vw, 52px); line-height:1; letter-spacing:-2px; margin:0; }
  .intro h1 span { color:#94aa1b; }
  .lead { color:#79878c; font-size:14px; max-width:380px; line-height:1.5; margin-top:14px; }
  .project-input { margin-top: 14px; }
  .project-input label { font-size:11px; font-weight:700; color:#6b7a7d; letter-spacing:1px; }
  .project-input input { display:block; margin-top:6px; width:100%; max-width:280px; border:1px solid #dce4e5; border-radius:9px; padding:9px 11px; font-size:14px; background:white; color:#25353a; outline-color:#b8cd25; }
  .hero-art { position:relative;width:240px;height:140px; flex:none; }
  .sun { position:absolute;right:32px;top:9px;width:50px;height:50px;border-radius:50%;background:#e1ef74; animation: pulse 4s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.08); } }
  .house { position:absolute;bottom:24px;left:34px;width:155px;height:85px;background:#c9d2d1;clip-path:polygon(0 35%,50% 0,100% 35%,100% 100%,0 100%);padding:30px 13px 0;display:grid;grid-template-columns:repeat(2,1fr);gap:11px; }
  .house i { display:block;background:#f5f7f8;border:3px solid #93a2a1; }
  .ground {position:absolute;bottom:22px;left:0;width:100%;height:4px;background:#97a6a5;border-radius:10px;}

  .stepper { display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:8px;align-items:center;margin:18px 0 18px; }
  .stepper button { background:#f5f7f8; border:1px solid #d9e0e1; border-radius:12px; padding:8px 10px; display:flex; align-items:center; gap:8px; cursor:pointer; transition:.25s; color:#a9b4b7; font-weight:700; }
  .stepper button span { width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:#f5f7f8; border:1px solid #d9e0e1; font-size:11px; flex:none; transition:.25s; }
  .stepper button em { font-style:normal; font-size:11px; letter-spacing:.5px; }
  .stepper button:hover { border-color:#b8cd25; color:#31400d; }
  .stepper button.active { background:#d7ef4a; border-color:#d7ef4a; color:#31400d; }
  .stepper button.active span { background:#31400d; color:#d7ef4a; border-color:#31400d; }
  .stepper button.done { background:#fcfef2; border-color:#b8cd25; color:#31400d; }
  .stepper button.done span { background:#b8cd25; color:#31400d; border-color:#b8cd25; }
  .stepper i { display:none; }

  .card { background:white;border:1px solid #e0e6e8;border-radius:18px;padding:24px 26px;margin-bottom:16px;box-shadow:0 5px 20px #25343b05; transition:.3s; }
  .step-pane { animation: fadeIn .3s ease; }
  @keyframes fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:none; } }
  .section-heading {display:flex;justify-content:space-between;align-items:flex-start;}
  .section-heading h2,.result-card h2 {font-size:22px;letter-spacing:-1px;margin:0 0 18px;}
  .step-badge {border-radius:20px;padding:6px 11px;background:#ecf6b5;color:#627311;font-size:11px;font-weight:800;}
  .step-badge.muted {background:#f2f4f4;color:#98a3a6;}

  .kind-grid {display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
  .kind {position:relative;text-align:left;border:1px solid #dde5e6;border-radius:13px;background:#fff;padding:16px;cursor:pointer;display:grid;gap:4px;transition:.2s;}
  .kind:hover { transform: translateY(-2px); box-shadow: 0 6px 14px #25343b10; }
  .kind.chosen {border-color:#b8cd25;background:#fcfef2;box-shadow:0 0 0 2px #d7ef4a33;}
  .kind-icon {font-size:28px;color:#aebabb;margin-bottom:7px;}
  .kind strong {font-size:14px;}
  .kind small,.material-row small {color:#89979b;font-size:12px;}
  .check {position:absolute;right:11px;top:11px;background:#d7ef4a;border-radius:50%;width:20px;height:20px;display:grid;place-items:center;font-size:11px;color:#3f4b0c;}
  .select-label {display:block;margin-top:16px;color:#87949a;font-size:10px;font-weight:800;letter-spacing:1px;}
  .select-label select {display:block;margin-top:6px;width:240px;border:1px solid #dce4e5;padding:9px 11px;border-radius:9px;background:white;color:#304046; outline-color:#b8cd25;}

  .toggle { display:flex; align-items:center; gap:11px; margin-top:12px; cursor:pointer; user-select:none; font-size:13px; color:#46545a; }
  .toggle input { display:none; }
  .toggle .track { width:36px; height:21px; background:#dde5e6; border-radius:30px; position:relative; transition:.25s; flex:none; }
  .toggle .track i { position:absolute; top:2px; left:2px; width:17px; height:17px; background:white; border-radius:50%; transition:.25s; box-shadow:0 1px 3px #00000030; }
  .toggle input:checked + .track { background:#d7ef4a; }
  .toggle input:checked + .track i { left:17px; background:#31400d; }

  .fields {display:grid;grid-template-columns:1fr 24px 1fr;align-items:end;gap:12px;max-width:480px;}
  .fields label,.opening-field {display:grid;gap:6px;}
  .fields label > span,.opening-field > span {font-size:10px;font-weight:800;letter-spacing:1.2px;color:#77868b;}
  .fields small,.opening-field small {font-size:11px;color:#a0aaad;font-weight:500;letter-spacing:0;}
  .stepper-input { display:flex; align-items:center; border:1px solid #dce4e5; border-radius:9px; overflow:hidden; background:white; transition:.2s; }
  .stepper-input:focus-within { box-shadow:0 0 0 2px #d7ef4a55; border-color:#b8cd25; }
  .stepper-input button { background:white; border:none; padding:10px 12px; cursor:pointer; font-size:17px; color:#58676d; font-weight:700; transition:.15s; }
  .stepper-input button:hover { background:#f6f9e9; color:#31400d; }
  .stepper-input input { border:none; text-align:center; width:100%; padding:11px 0; font-size:17px; font-weight:700; color:#25353a; outline:none; -webkit-appearance:none; appearance:none; -moz-appearance:textfield; }
  .stepper-input input::-webkit-outer-spin-button, .stepper-input input::-webkit-inner-spin-button { -webkit-appearance: none; margin:0; }
  .times {color:#bdc6c7;text-align:center;padding-bottom:12px;font-size:20px;}
  .opening-field {max-width:480px;margin-top:16px;}

  .presets { display:flex; flex-wrap:wrap; gap:6px; margin-top:14px; align-items:center; }
  .presets > span { font-size:10px; font-weight:800; color:#87949a; letter-spacing:1px; }
  .presets button { background:white; border:1px solid #dde5e6; border-radius:20px; padding:6px 12px; font-size:12px; color:#46545a; cursor:pointer; transition:.2s; font-weight:600; }
  .presets button:hover { background:#f6f9e9; border-color:#b8cd25; }

  .area-note {max-width:480px;background:#f6f9e9;border-radius:10px;padding:12px 14px;margin-top:16px;display:flex;align-items:center;gap:10px;color:#54620e;font-size:13px; transition:.3s;}
  .area-note span {font-size:18px;}
  .area-note b {margin-left:auto;font-size:15px;color:#3b470e;}

  .step-nav { display:flex; justify-content:space-between; align-items:center; margin-top:22px; padding-top:18px; border-top:1px solid #eef0f1; }
  :global(body.dark) .step-nav { border-color:#2a383b; }
  .step-nav button { border:none; padding:11px 22px; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; transition:.2s; }
  .step-nav button.primary { background:#d7ef4a; color:#31400d; }
  .step-nav button.primary:hover { background:#c5dd3c; transform: translateY(-1px); }
  .step-nav button.ghost { background:white; color:#46545a; border:1px solid #dde5e6; }
  .step-nav button.ghost:hover { background:#f6f9e9; }

  .result-card {background:#202d31;color:white;border-radius:18px;padding:24px 26px;margin-top:6px; transition:.3s;}
  :global(body.dark) .result-card { background:#0f1719; border:1px solid #2a383b; }
  .result-top {display:flex;justify-content:space-between;align-items:flex-start;gap:15px;}
  .result-card h2 {margin-bottom:6px;font-size:24px;}
  .result-card p:not(.eyebrow) {color:#aab8ba;margin:0;font-size:12px;}
  .eyebrow.light {color:#a6bc2c;}
  .light-badge {background:#3d4a4d;color:#d7ef4a;}
  .stats {display:flex;flex-wrap:wrap;gap:18px 32px;border-top:1px solid #405054;border-bottom:1px solid #405054;margin:18px 0;padding:14px 0; }
  :global(body.dark) .stats { border-color:#2a383b; }
  .stats div {display:grid;gap:3px;min-width:100px;}
  .stats span,.stats small {color:#9eabad;font-size:10px;}
  .stats strong {font-size:22px;letter-spacing:-1px;color:white;}
  :global(body.dark) .stats strong { color: #e7eef0; }
  .shopping-list {display:grid;gap:2px;}
  .material-row {display:grid;grid-template-columns:34px 1fr auto auto;gap:11px;align-items:center;border-bottom:1px solid #344447;padding:10px 0; transition:.2s;}
  .material-row:hover { background:#1a2628; padding-left:6px; padding-right:6px; border-radius:8px; }
  :global(body.dark) .material-row { border-color:#2a383b; }
  :global(body.dark) .material-row:hover { background:#1a2628; }
  .material-icon {width:32px;height:32px;border-radius:8px;background:#314144;color:#d7ef4a;display:grid;place-items:center;font-size:18px;}
  .material-name {display:grid;gap:2px;min-width:0;}
  .material-name strong { font-size:13px; }
  .material-row .qty {font-size:11px;color:#cbd4d4;font-weight:600;white-space:nowrap;}
  .material-row .price {font-size:13px;min-width:64px;text-align:right;font-weight:700;}

  .actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }
  .actions button { background:#314144; border:1px solid #46555a; color:white; padding:9px 14px; border-radius:9px; cursor:pointer; font-size:12px; font-weight:700; transition:.2s; }
  .actions button:hover { background:#3d5054; transform: translateY(-1px); }

  .notice {display:flex;gap:9px;background:#29383b;border-radius:10px;padding:11px 12px;margin-top:14px;align-items:flex-start;}
  .notice span {border:1px solid #b7ce3b;color:#d7ef4a;border-radius:50%;width:16px;height:16px;display:grid;place-items:center;font-size:10px;flex:none;}
  .notice p {font-size:11px!important;line-height:1.4;}

  @media (max-width: 700px) {
    .app-shell {padding:0 16px;}
    .menu-card { grid-template-columns: 44px 1fr auto; padding: 14px 14px; gap: 14px; border-radius: 14px; }
    .menu-icon { width: 38px; height: 38px; border-radius: 10px; }
    .menu-icon svg { width: 20px; height: 20px; }
    .menu-text strong { font-size: 14px; }
    .menu-text small { font-size: 11.5px; }
    .menu-soon { font-size: 9px; }
    .intro{min-height:0;flex-direction:column;align-items:flex-start;gap:10px;}
    .hero-art{display:none;}
    .intro h1{font-size:30px;letter-spacing:-1.5px;}
    .lead{font-size:12px;margin-top:8px;}
    .project-input input{max-width:100%;padding:8px 10px;font-size:13px;}
    .stepper{margin:14px 0 12px;gap:6px;}
    .stepper button{padding:7px 6px;gap:5px;}
    .stepper button span{width:22px;height:22px;font-size:10px;}
    .stepper button em{font-size:9px;letter-spacing:0;}
    .card,.result-card{padding:18px 16px;border-radius:15px;}
    .section-heading h2{font-size:18px;margin-bottom:14px;}
    .result-card h2{font-size:20px;}
    .kind-grid{gap:7px;}
    .kind{padding:11px 10px;}
    .kind-icon{font-size:22px;margin-bottom:4px;}
    .kind strong{font-size:12px;}
    .kind small{font-size:10px;}
    .check{right:8px;top:8px;width:17px;height:17px;font-size:10px;}
    .select-label select{width:100%;max-width:100%;}
    .fields{gap:8px;}
    .fields label > span, .opening-field > span {font-size:9px;}
    .stepper-input button{padding:9px 10px;font-size:15px;}
    .stepper-input input{padding:10px 0;font-size:15px;}
    .opening-field{margin-top:14px;}
    .presets button{padding:5px 10px;font-size:11px;}
    .area-note{padding:10px 12px;font-size:12px;}
    .area-note b{font-size:14px;}
    .step-nav{margin-top:16px;padding-top:14px;}
    .step-nav button{padding:10px 16px;font-size:12px;}
    .stats{gap:14px 22px;padding:12px 0;margin:14px 0;}
    .stats div{min-width:85px;}
    .stats strong{font-size:18px;}
    .material-row{grid-template-columns:28px 1fr auto;gap:8px;padding:9px 0;}
    .material-row .price{grid-column:2;text-align:left;font-size:10px;color:#d7ef4a;min-width:0;}
    .material-row .qty{font-size:10px;}
    .material-icon{width:28px;height:28px;font-size:15px;}
    .material-name strong{font-size:12px;}
    .actions{flex-direction:row;}
    .actions button{flex:1;padding:8px 8px;font-size:11px;}
  }
</style>

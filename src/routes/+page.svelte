<script lang="ts">
  import {
    catalog,
    material as materialById,
    manoObra as manoObraBySistema,
    meta as catalogMeta,
    materiales,
    materialesPorSistema
  } from '$lib/data/db';
  import { downloadProject, copyProjectToClipboard, importProject } from '$lib/projectExchange.js';
  import type { ReformaCalcProject } from '$lib/projectExchange.js';
  import { downloadData, copyToClipboardData } from '$lib/exporters/exportManager.js';
  import { onMount } from 'svelte';
  import type { Categoria, Material, Sistema } from '$lib/calc/types';
  import {
    calculateWall,
    WALL_DEFAULTS,
    type WallKind,
    type WallOptions,
    type WallThickness
  } from '$lib/calc/wall';
  import {
    calculateRoof,
    ROOF_DEFAULTS,
    type RoofKind,
    type RoofOptions
  } from '$lib/calc/roof';
  import {
    calculateFloor,
    FLOOR_DEFAULTS,
    type FloorKind,
    type FloorOptions,
    type FloorSurface,
    type AdhesiveType,
    type UnderlaymentType
  } from '$lib/calc/floor';
  import {
    calculateBath,
    BATH_DEFAULTS,
    type BathOptions
  } from '$lib/calc/bath';
  import {
    calculateWelding,
    WELDING_DEFAULTS,
    PROCESS_META,
    METAL_META,
    JOINT_META,
    POSITION_META,
    diametrosDisponibles,
    type WeldingOptions,
    type WeldingProcess,
    type BaseMetal,
    type JointType,
    type WeldingPosition,
    type WeldingResult
  } from '$lib/calc/welding';
  import type { CalculationResult, Line } from '$lib/calc/calc';

  type Category = 'wall' | 'roof' | 'floor' | 'bath' | 'welding';
  type Kind = WallKind | RoofKind | FloorKind | 'bano' | WeldingProcess;
  type WizardOptions = WallOptions | RoofOptions | FloorOptions | BathOptions | WeldingOptions;

  type MenuItem = {
    id: Category;
    title: string;
    subtitle: string;
    icon: 'wall' | 'roof' | 'floor' | 'bath' | 'welding';
  };

  const menuItems: MenuItem[] = [
    { id: 'wall', title: 'Pared simple', subtitle: 'Tabique de drywall, bloque o ladrillo', icon: 'wall' },
    { id: 'roof', title: 'Techo', subtitle: 'Falso techo continuo o desmontable', icon: 'roof' },
    { id: 'floor', title: 'Suelo', subtitle: 'Tarima, cerámica o microcemento', icon: 'floor' },
    { id: 'bath', title: 'Baño completo', subtitle: 'Reforma integral de baño', icon: 'bath' },
    { id: 'welding', title: 'Soldadura', subtitle: 'Electrodo, MIG/MAG o TIG por metal y trabajo', icon: 'welding' }
  ];

  let menu: 'home' | 'wizard' = $state('home');
  let step: 1 | 2 | 3 = $state(1);
  let category: Category = $state('wall');
  let kind: Kind = $state('drywall');

  // Estado común del wizard
  let wallOptions: WallOptions = $state({ ...WALL_DEFAULTS });
  let roofOptions: RoofOptions = $state({ ...ROOF_DEFAULTS });
  let floorOptions: FloorOptions = $state({ ...FLOOR_DEFAULTS });
  let bathOptions: BathOptions = $state({ ...BATH_DEFAULTS });
  let weldingOptions: WeldingOptions = $state({ ...WELDING_DEFAULTS });

  let projectName = $state('Pared salón');
  let projectId = $state('');
  let createdAt = $state('');
  let fileInput: HTMLInputElement | null = $state(null);
  let toast: { message: string; type: 'success' | 'error' } | null = $state(null);
  let toastTimer: ReturnType<typeof setTimeout> | undefined = $state();

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    toast = { message, type };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast = null), 3400);
  }

  function round2(value: number) {
    return Math.round(value * 100) / 100;
  }

  function ensureProjectIdentity() {
    if (!projectId) {
      projectId = crypto.randomUUID?.() ?? `rcp-${Date.now().toString(36)}`;
      createdAt = new Date().toISOString();
    }
  }

  const STORAGE_KEY = 'reformacalc:draft';
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  function draftSnapshot() {
    return {
      projectId,
      createdAt,
      projectName,
      category,
      kind,
      wallOptions,
      roofOptions,
      floorOptions,
      bathOptions,
      weldingOptions,
      savedAt: new Date().toISOString()
    };
  }

  function persistDraft() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftSnapshot()));
    } catch {
      /* cuota llena o sin localStorage */
    }
  }

  function schedulePersist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persistDraft, 400);
  }

  function restoreDraft(): boolean {
    if (typeof localStorage === 'undefined') return false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      projectId = d.projectId ?? '';
      createdAt = d.createdAt ?? '';
      projectName = d.projectName ?? projectName;
      category = d.category ?? 'wall';
      kind = d.kind ?? 'drywall';
      if (d.wallOptions) wallOptions = { ...WALL_DEFAULTS, ...d.wallOptions };
      if (d.roofOptions) roofOptions = { ...ROOF_DEFAULTS, ...d.roofOptions };
      if (d.floorOptions) floorOptions = { ...FLOOR_DEFAULTS, ...d.floorOptions };
      if (d.bathOptions) bathOptions = { ...BATH_DEFAULTS, ...d.bathOptions };
      if (d.weldingOptions) weldingOptions = { ...WELDING_DEFAULTS, ...d.weldingOptions };
      return true;
    } catch {
      return false;
    }
  }

  function clearDraft() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }

  $effect(() => {
    void projectName;
    void category;
    void kind;
    void wallOptions;
    void roofOptions;
    void floorOptions;
    void bathOptions;
    void weldingOptions;
    syncKindIntoOptions();
    schedulePersist();
  });

  const APP_METADATA = {
    app: 'ReformaCalc',
    appVersion: '1.3',
    currency: catalogMeta().moneda,
    language: 'es'
  };

  const spacingOptions: (40 | 50 | 60 | 80)[] = [40, 50, 60, 80];

  function nearestSpacing(cm: number): 40 | 50 | 60 | 80 {
    return spacingOptions.reduce((best, s) => (Math.abs(s - cm) < Math.abs(best - cm) ? s : best), spacingOptions[0]);
  }

  function startWizard(selectedCategory: Category) {
    category = selectedCategory;
    if (selectedCategory === 'roof') {
      roofOptions = { ...ROOF_DEFAULTS };
      kind = 'continuo';
    } else if (selectedCategory === 'floor') {
      floorOptions = { ...FLOOR_DEFAULTS };
      kind = 'tarima';
    } else if (selectedCategory === 'bath') {
      bathOptions = { ...BATH_DEFAULTS };
      kind = 'bano';
    } else if (selectedCategory === 'welding') {
      weldingOptions = { ...WELDING_DEFAULTS };
      kind = 'smaw';
    } else {
      wallOptions = { ...WALL_DEFAULTS };
      kind = 'drywall';
    }
    syncKindIntoOptions();
    step = 1;
    menu = 'wizard';
  }

  /**
   * Sincroniza el `kind` global con el campo `kind` específico de cada
   * sistema. Sin esto, los módulos de cálculo reciben el `kind` antiguo y
   * siempre devuelven la misma lista de materiales.
   */
  function syncKindIntoOptions() {
    if (category === 'wall') {
      const next: WallKind = (kind === 'block' || kind === 'ladrillo') ? kind : 'drywall';
      if (wallOptions.kind !== next) {
        wallOptions = { ...wallOptions, kind: next };
      }
    } else if (category === 'roof') {
      const next: RoofKind = kind === 'desmontable' ? 'desmontable' : 'continuo';
      if (roofOptions.kind !== next) {
        roofOptions = { ...roofOptions, kind: next };
      }
    } else if (category === 'floor') {
      const next: FloorKind = (kind === 'ceramica' || kind === 'microcemento') ? kind : 'tarima';
      if (floorOptions.kind !== next) {
        floorOptions = { ...floorOptions, kind: next };
      }
    } else if (category === 'welding') {
      const next: WeldingProcess = (kind === 'gmaw' || kind === 'gtaw' || kind === 'fcaw') ? kind : 'smaw';
      if (weldingOptions.process !== next) {
        weldingOptions = { ...weldingOptions, process: next };
      }
    }
  }

  function goHome() {
    menu = 'home';
    step = 1;
  }

  function reset() {
    wallOptions = { ...WALL_DEFAULTS };
    roofOptions = { ...ROOF_DEFAULTS };
    floorOptions = { ...FLOOR_DEFAULTS };
    bathOptions = { ...BATH_DEFAULTS };
    weldingOptions = { ...WELDING_DEFAULTS };
    category = 'wall';
    kind = 'drywall';
    step = 1;
    menu = 'home';
    projectId = '';
    createdAt = '';
    clearDraft();
  }

  onMount(() => {
    if (loadFromUrl()) {
      showToast('Proyecto cargado desde enlace.');
    } else if (restoreDraft()) {
      showToast('Borrador restaurado del almacenamiento local.');
    }
  });

  const wallKinds: { id: WallKind; label: string; subtitle: string; icon: string }[] = [
    { id: 'drywall', label: 'Pladur', subtitle: 'Ligero y rápido', icon: '▧' },
    { id: 'block', label: 'Block', subtitle: 'Resistente', icon: '▦' },
    { id: 'ladrillo', label: 'Ladrillo', subtitle: 'Tradicional', icon: '▤' }
  ];

  const roofKinds: { id: RoofKind; label: string; subtitle: string; icon: string }[] = [
    { id: 'continuo', label: 'Continuo', subtitle: 'Placa lisa con juntas', icon: '▭' },
    { id: 'desmontable', label: 'Desmontable', subtitle: 'Perfilería T + paneles', icon: '▦' }
  ];

  const floorKinds: { id: FloorKind; label: string; subtitle: string; icon: string }[] = [
    { id: 'tarima', label: 'Tarima', subtitle: 'Laminada o madera', icon: '▤' },
    { id: 'ceramica', label: 'Cerámica', subtitle: 'Gres o azulejo', icon: '▦' },
    { id: 'microcemento', label: 'Microcemento', subtitle: 'Continuo sin juntas', icon: '▭' }
  ];

  let kinds = $derived.by(() => {
    const cat: Category = category;
    if (cat === 'roof') return roofKinds;
    if (cat === 'floor') return floorKinds;
    if (cat === 'welding') return weldingKinds;
    if (cat === 'bath') return [{ id: 'bano' as const, label: 'Integral', subtitle: 'Todos los bloques', icon: '▭' }];
    return wallKinds;
  });

  const weldingKinds = (['smaw', 'gmaw', 'gtaw', 'fcaw'] as WeldingProcess[]).map((id) => ({
    id,
    label: PROCESS_META[id].label,
    subtitle: PROCESS_META[id].subtitle,
    icon: PROCESS_META[id].icon
  }));

  let result: CalculationResult = $derived.by(() => {
    if (category === 'wall') return calculateWall(wallOptions);
    if (category === 'roof') return calculateRoof(roofOptions);
    if (category === 'floor') return calculateFloor(floorOptions);
    if (category === 'welding') return calculateWelding(weldingOptions);
    return calculateBath(bathOptions);
  });

  function euro(value: number) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: catalogMeta().moneda }).format(value);
  }

  function iconForCategoria(cat: Categoria): string {
    if (cat === 'panel' || cat === 'baldosa' || cat === 'azulejo' || cat === 'suelo') return '▭';
    if (cat === 'placa' || cat === 'perfil') return '▧';
    if (cat === 'sanitario' || cat === 'mueble') return '◆';
    if (cat === 'pintura' || cat === 'demolicion') return '◇';
    if (cat === 'electrodo' || cat === 'hilo_soldadura') return '⌇';
    if (cat === 'gas_soldadura') return '◌';
    if (cat === 'epi') return '◉';
    return '▤';
  }

  function systemLabel(kind: Kind): Sistema {
    switch (kind) {
      case 'drywall':
      case 'block':
      case 'ladrillo':
        return kind;
      case 'continuo':
        return 'techo_continuo';
      case 'desmontable':
        return 'techo_desmontable';
      case 'tarima':
        return 'tarima';
      case 'ceramica':
        return 'ceramica';
      case 'microcemento':
        return 'microcemento';
      case 'bano':
        return 'bano_alicatado';
      case 'smaw':
      case 'gmaw':
      case 'gtaw':
      case 'fcaw':
        return 'welding';
    }
  }

  function systemPrettyLabel(kind: Kind): string {
    switch (kind) {
      case 'drywall': return 'Pladur';
      case 'block': return 'Block';
      case 'ladrillo': return 'Ladrillo';
      case 'continuo': return 'Falso techo continuo';
      case 'desmontable': return 'Falso techo desmontable';
      case 'tarima': return 'Tarima';
      case 'ceramica': return 'Cerámica';
      case 'microcemento': return 'Microcemento';
      case 'bano': return 'Reforma integral de baño';
      case 'smaw': return 'Soldadura por electrodo';
      case 'gmaw': return 'Soldadura MIG/MAG';
      case 'gtaw': return 'Soldadura TIG';
      case 'fcaw': return 'Soldadura hilo tubular';
    }
  }

  function categoryPrettyName(): string {
    switch (category) {
      case 'wall': return 'Pared';
      case 'roof': return 'Techo';
      case 'floor': return 'Suelo';
      case 'bath': return 'Baño';
      case 'welding': return 'Soldadura';
    }
  }

  const HISTORY_KEY = 'reformacalc:history';
  const MAX_HISTORY = 30;

  function pushHistory() {
    if (typeof localStorage === 'undefined') return;
    ensureProjectIdentity();
    const summary = {
      id: projectId,
      name: projectName,
      category,
      system: systemLabel(kind),
      area: result.area,
      totalCost: result.grandTotal,
      materialsCost: result.total,
      laborCost: result.labor,
      hours: result.hours,
      createdAt,
      savedAt: new Date().toISOString(),
      snapshot: ''
    };
    try {
      const snapshot = {
        v: 1,
        category,
        kind,
        projectName,
        wallOptions,
        roofOptions,
        floorOptions,
        bathOptions,
        weldingOptions
      };
      const json = JSON.stringify(snapshot);
      summary.snapshot = btoa(unescape(encodeURIComponent(json)));
    } catch {
      /* noop */
    }
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const filtered = list.filter((p) => p.id !== summary.id);
      filtered.unshift(summary);
      const trimmed = filtered.slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch {
      /* cuota llena */
    }
  }

  function buildProject() {
    ensureProjectIdentity();
    const dims =
      category === 'wall'
        ? { width: wallOptions.width, height: wallOptions.height, area: result.area }
        : category === 'roof'
          ? { width: roofOptions.width, height: roofOptions.length, area: result.area }
          : category === 'floor'
            ? { width: floorOptions.width, height: floorOptions.length, area: result.area }
            : category === 'welding'
              ? { width: weldingOptions.thicknessMm, height: weldingOptions.totalLengthM, area: result.area }
              : { width: bathOptions.width, height: bathOptions.length, area: result.area };

    const cfg =
      category === 'wall'
        ? {
            faces: 2,
            studSpacing: wallOptions.studSpacing / 100,
            insulation: wallOptions.withInsulation
          }
        : category === 'roof'
          ? {
              faces: 1,
              studSpacing: 0,
              insulation: roofOptions.withInsulation
            }
          : category === 'floor'
            ? {
                faces: 0,
                studSpacing: 0,
                insulation: false
              }
            : category === 'welding'
              ? {
                  faces: 0,
                  studSpacing: 0,
                  insulation: false
                }
              : {
                  faces: 0,
                  studSpacing: 0,
                  insulation: false
                };

    return {
      project: { id: projectId, name: projectName, description: '', createdAt, updatedAt: new Date().toISOString() },
      calculation: {
        category,
        system: systemLabel(kind),
        dimensions: dims,
        configuration: cfg
      },
      summary: {
        materials: round2(result.total),
        labor: round2(result.labor),
        total: round2(result.grandTotal),
        hours: result.hours
      },
      materials: result.lines.map((line) => ({
        id: line.material.id,
        name: line.material.nombre,
        category: line.material.categoria,
        unit: line.material.unidad,
        quantity: line.quantity,
        unitPrice: line.material.precio,
        total: round2(line.total)
      }))
    };
  }

  function handleExport() {
    downloadProject(buildProject());
    pushHistory();
    showToast('Proyecto exportado correctamente.');
  }

  async function handleCopyJson() {
    const ok = await copyProjectToClipboard(buildProject());
    showToast(ok ? 'Proyecto copiado al portapapeles.' : 'No se pudo copiar el proyecto.', ok ? 'success' : 'error');
  }

  function buildAppData() {
    ensureProjectIdentity();
    return {
      id: projectId,
      title: projectName,
      description: '',
      system: systemLabel(kind),
      area: result.area,
      dimensions:
        category === 'wall'
          ? { width: wallOptions.width, height: wallOptions.height, length: 0 }
          : category === 'roof'
            ? { width: roofOptions.width, height: roofOptions.length, length: 0 }
            : category === 'floor'
              ? { width: floorOptions.width, height: floorOptions.length, length: 0 }
              : category === 'welding'
                ? { width: weldingOptions.thicknessMm, height: weldingOptions.totalLengthM, length: 0 }
                : { width: bathOptions.width, height: bathOptions.length, length: bathOptions.wallHeight },
      estimatedHours: result.hours,
      materialsCost: round2(result.total),
      laborCost: round2(result.labor),
      totalCost: round2(result.grandTotal),
      materials: result.lines.map((line) => ({
        id: line.material.id,
        name: line.material.nombre,
        quantity: line.quantity,
        unit: line.material.unidad,
        unitPrice: line.material.precio,
        totalPrice: round2(line.total)
      }))
    };
  }

  function handleExportRCX() {
    try {
      downloadData('rcx', buildAppData(), { filename: projectName, appMetadata: APP_METADATA });
      pushHistory();
      showToast('Proyecto exportado en formato RCX.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo exportar el proyecto en formato RCX.', 'error');
    }
  }

  async function handleCopyRCX() {
    let ok = false;
    try {
      ok = await copyToClipboardData('rcx', buildAppData(), { appMetadata: APP_METADATA });
    } catch {
      ok = false;
    }
    showToast(ok ? 'Proyecto copiado al portapapeles en formato RCX.' : 'No se pudo copiar el proyecto en formato RCX.', ok ? 'success' : 'error');
  }

  function handleExportCSV() {
    try {
      downloadData('csv', buildAppData(), { filename: projectName });
      pushHistory();
      showToast('CSV exportado.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo exportar el CSV.', 'error');
    }
  }

  async function handleCopyCSV() {
    let ok = false;
    try {
      ok = await copyToClipboardData('csv', buildAppData(), {});
    } catch {
      ok = false;
    }
    showToast(ok ? 'CSV copiado al portapapeles.' : 'No se pudo copiar el CSV.', ok ? 'success' : 'error');
  }

  function encodeProjectToUrl(): string {
    const snapshot = {
      v: 1,
      category,
      kind,
      projectName,
      wallOptions,
      roofOptions,
      floorOptions,
      bathOptions,
      weldingOptions
    };
    const json = JSON.stringify(snapshot);
    const b64 = typeof btoa !== 'undefined' ? btoa(unescape(encodeURIComponent(json))) : '';
    const url = new URL(window.location.href);
    url.searchParams.set('p', b64);
    return url.toString();
  }

  async function handleShareUrl() {
    ensureProjectIdentity();
    const url = encodeProjectToUrl();
    try {
      await navigator.clipboard?.writeText(url);
      showToast('Enlace copiado al portapapeles.');
    } catch {
      showToast('No se pudo copiar el enlace. Cópialo manualmente de la barra de direcciones.', 'error');
    }
    window.history.replaceState({}, '', url);
  }

  function loadFromUrl(): boolean {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const p = params.get('p');
    if (!p) return false;
    try {
      const json = typeof atob !== 'undefined' ? decodeURIComponent(escape(atob(p))) : '';
      const data = JSON.parse(json);
      if (data.category) category = data.category;
      if (data.kind) kind = data.kind;
      if (data.projectName) projectName = data.projectName;
      if (data.wallOptions) wallOptions = { ...WALL_DEFAULTS, ...data.wallOptions };
      if (data.roofOptions) roofOptions = { ...ROOF_DEFAULTS, ...data.roofOptions };
      if (data.floorOptions) floorOptions = { ...FLOOR_DEFAULTS, ...data.floorOptions };
      if (data.bathOptions) bathOptions = { ...BATH_DEFAULTS, ...data.bathOptions };
      if (data.weldingOptions) weldingOptions = { ...WELDING_DEFAULTS, ...data.weldingOptions };
      return true;
    } catch {
      return false;
    }
  }

  const systemToKind: Record<string, Kind> = {
    drywall: 'drywall',
    pladur: 'drywall',
    pladur_seco: 'drywall',
    block: 'block',
    bloque: 'block',
    ladrillo: 'ladrillo',
    techo_continuo: 'continuo',
    continuo: 'continuo',
    falso_techo_continuo: 'continuo',
    techo_desmontable: 'desmontable',
    desmontable: 'desmontable',
    falso_techo_desmontable: 'desmontable',
    registrable: 'desmontable',
    tarima: 'tarima',
    ceramica: 'ceramica',
    microcemento: 'microcemento',
    bano: 'bano',
    smaw: 'smaw',
    gmaw: 'gmaw',
    mig: 'gmaw',
    mag: 'gmaw',
    gtaw: 'gtaw',
    tig: 'gtaw',
    fcaw: 'fcaw',
    welding: 'smaw'
  };

  const systemToCategory: Record<string, Category> = {
    drywall: 'wall',
    pladur: 'wall',
    pladur_seco: 'wall',
    block: 'wall',
    bloque: 'wall',
    ladrillo: 'wall',
    techo_continuo: 'roof',
    continuo: 'roof',
    falso_techo_continuo: 'roof',
    techo_desmontable: 'roof',
    desmontable: 'roof',
    falso_techo_desmontable: 'roof',
    registrable: 'roof',
    tarima: 'floor',
    ceramica: 'floor',
    microcemento: 'floor',
    bano: 'bath',
    bano_alicatado: 'bath',
    bano_completo: 'bath',
    smaw: 'welding',
    gmaw: 'welding',
    mig: 'welding',
    mag: 'welding',
    gtaw: 'welding',
    tig: 'welding',
    fcaw: 'welding',
    welding: 'welding',
    soldadura: 'welding'
  };

  function handleImportClick() {
    fileInput?.click();
  }

  async function handleImport(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      applyProject(importProject(text));
      showToast('Proyecto importado correctamente.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo importar el proyecto.', 'error');
    } finally {
      input.value = '';
    }
  }

  function applyProject(project: ReformaCalcProject) {
    const calc = project.calculation ?? ({} as ReformaCalcProject['calculation']);
    const dims = calc.dimensions ?? ({} as ReformaCalcProject['calculation']['dimensions']);
    const cfg = calc.configuration ?? ({} as ReformaCalcProject['calculation']['configuration']);
    const meta = project.project ?? ({} as ReformaCalcProject['project']);
    if (meta.id) projectId = meta.id;
    if (meta.createdAt) createdAt = meta.createdAt;
    projectName = meta.name || projectName;
    const resolvedKind = systemToKind[calc.system] ?? kind;
    const resolvedCategory: Category =
      (calc.category as Category) ?? systemToCategory[calc.system] ?? (resolvedKind === 'continuo' || resolvedKind === 'desmontable' ? 'roof' : resolvedKind === 'tarima' || resolvedKind === 'ceramica' || resolvedKind === 'microcemento' ? 'floor' : resolvedKind === 'bano' ? 'bath' : (resolvedKind === 'smaw' || resolvedKind === 'gmaw' || resolvedKind === 'gtaw' || resolvedKind === 'fcaw') ? 'welding' : 'wall');
    category = resolvedCategory;
    kind = resolvedKind;

    if (category === 'wall') {
      const areaBruta = (dims.width ?? 0) * (dims.height ?? 0);
      const deducido = Math.max(0, areaBruta - (dims.area ?? 0));
      wallOptions = {
        kind: resolvedKind === 'block' || resolvedKind === 'ladrillo' ? resolvedKind : 'drywall',
        width: typeof dims.width === 'number' ? dims.width : wallOptions.width,
        height: typeof dims.height === 'number' && dims.height > 0 ? dims.height : wallOptions.height,
        huecos: deducido > 0
          ? [{ id: crypto.randomUUID?.() ?? 'h-import', tipo: 'ventana', nombre: 'Hueco importado', ancho: Math.sqrt(deducido), alto: Math.sqrt(deducido), cantidad: 1 }]
          : [],
        studSpacing: typeof cfg.studSpacing === 'number' && cfg.studSpacing > 0 ? nearestSpacing(cfg.studSpacing * 100) : wallOptions.studSpacing,
        thickness: wallOptions.thickness,
        withInsulation: cfg.insulation !== false,
        laborOn: true,
        merma: wallOptions.merma
      };
    } else if (category === 'roof') {
      roofOptions = {
        kind: resolvedKind === 'desmontable' ? 'desmontable' : 'continuo',
        width: typeof dims.width === 'number' ? dims.width : roofOptions.width,
        length: typeof dims.height === 'number' ? dims.height : roofOptions.length,
        withInsulation: cfg.insulation === true,
        roofDropCm: roofOptions.roofDropCm,
        laborOn: true
      };
    } else if (category === 'floor') {
      floorOptions = {
        kind: resolvedKind === 'ceramica' || resolvedKind === 'microcemento' ? resolvedKind : 'tarima',
        width: typeof dims.width === 'number' ? dims.width : floorOptions.width,
        length: typeof dims.height === 'number' ? dims.height : floorOptions.length,
        laborOn: true
      };
    } else if (category === 'welding') {
      weldingOptions = {
        ...weldingOptions,
        process: resolvedKind === 'gmaw' || resolvedKind === 'gtaw' || resolvedKind === 'fcaw' ? resolvedKind : 'smaw',
        thicknessMm: typeof dims.width === 'number' ? dims.width : weldingOptions.thicknessMm,
        totalLengthM: typeof dims.height === 'number' ? dims.height : weldingOptions.totalLengthM,
        laborOn: true
      };
    } else if (category === 'bath') {
      bathOptions = {
        ...bathOptions,
        width: typeof dims.width === 'number' ? dims.width : bathOptions.width,
        length: typeof dims.height === 'number' ? dims.height : bathOptions.length,
        wallHeight: typeof dims.area === 'number' && dims.area > 0 ? dims.area / 4 : bathOptions.wallHeight,
        laborOn: true
      };
    }

    step = 3;
    menu = 'wizard';
  }

  function next() { if (step < 3) step = (step + 1) as 1 | 2 | 3; }
  function back() { if (step > 1) step = (step - 1) as 1 | 2 | 3; }

  // Catálogos auxiliares para los selects del wizard de suelo y baño.
  const tarimaSurfaces: { id: FloorSurface; label: string; materialId: string }[] = [
    { id: 'tarima_laminada', label: 'Laminada AC4', materialId: 'tarima_laminada_ac4' },
    { id: 'tarima_madera', label: 'Madera roble', materialId: 'tarima_madera_roble' }
  ];

  const baldosas = materialesPorSistema('ceramica').filter((m) => m.categoria === 'azulejo' || m.categoria === 'baldosa');

  const floorAdhesiveOptions: { id: AdhesiveType; label: string }[] = [
    { id: 'C1', label: 'C1 estándar' },
    { id: 'C2TE', label: 'C2TE flexible (recomendado baños)' }
  ];

  const underlaymentOptions: { id: UnderlaymentType; label: string }[] = [
    { id: 'espuma', label: 'Espuma PE 3 mm' },
    { id: 'corcho', label: 'Corcho 2 mm' }
  ];
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
            <button class="menu-card enabled" onclick={() => startWizard(item.id)}>
              <span class="menu-icon" aria-hidden="true">
                {#if item.icon === 'wall'}
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 26h20M6 22h20M6 18h20M6 14h20M6 10h20M6 6h20"/></svg>
                {:else if item.icon === 'roof'}
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 16h22M9 11h14M13 6h6"/></svg>
                {:else if item.icon === 'floor'}
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="6" y="6" width="8" height="8"/><rect x="18" y="6" width="8" height="8"/><rect x="6" y="18" width="8" height="8"/><rect x="18" y="18" width="8" height="8"/></svg>
                {:else if item.icon === 'bath'}
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16h22v3a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5v-3z"/><path d="M9 16V8a3 3 0 0 1 6 0M7 11h2"/></svg>
                {:else if item.icon === 'welding'}
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3v9"/><path d="m11 8 5 4 5-4"/><path d="M5 18h22"/><path d="M5 18v8a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3v-8"/><circle cx="11" cy="25" r="1.5"/><circle cx="21" cy="25" r="1.5"/></svg>
                {/if}
              </span>
              <span class="menu-text">
                <strong>{item.title}</strong>
                <small>{item.subtitle}</small>
              </span>
              <span class="menu-arrow" aria-hidden="true">→</span>
            </button>
          {/each}
        </div>
        <button class="import-btn" onclick={handleImportClick}>⇤ Importar proyecto</button>
        <input type="file" accept=".rcp.json,.json,application/json" hidden bind:this={fileInput} onchange={handleImport} />
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
        <div class="section-heading"><div><p class="eyebrow">PASO 01</p><h2>{categoryPrettyName()} · ¿Qué tipo?</h2></div><span class="step-badge">1/3</span></div>
        {#if kinds.length > 1}
          <div class="kind-grid">{#each kinds as option}<button class:chosen={kind === option.id} class="kind" onclick={() => { kind = option.id; syncKindIntoOptions(); }}><span class="kind-icon">{option.icon}</span><strong>{option.label}</strong><small>{option.subtitle}</small>{#if kind === option.id}<b class="check">✓</b>{/if}</button>{/each}</div>
        {/if}

        {#if category === 'wall'}
          {#if kind === 'drywall'}
            <label class="select-label">TIPO DE SISTEMA
              <select bind:value={wallOptions.thickness}>
                <option value="M48">M48</option>
                <option value="M70">M70</option>
                <option value="M90">M90</option>
              </select>
            </label>
            <label class="select-label">SEPARACIÓN ENTRE MONTANTES
              <select bind:value={wallOptions.studSpacing}>
                {#each spacingOptions as s}<option value={s}>{s} cm</option>{/each}
              </select>
            </label>
          {/if}
          {#if kind === 'drywall'}
            <label class="toggle"><input type="checkbox" bind:checked={wallOptions.withInsulation} /><span class="track"><i></i></span><span>Incluir aislamiento interior</span></label>
          {/if}
          <label class="toggle"><input type="checkbox" bind:checked={wallOptions.laborOn} /><span class="track"><i></i></span><span>Incluir mano de obra</span></label>
          {#if wallOptions.laborOn}
            <label class="select-label">
              TARIFA MANO DE OBRA <small>€/m² · por defecto {manoObraBySistema(wallOptions.kind).precioM2} €/m²</small>
              <input type="number" min="0" step="0.5" placeholder={String(manoObraBySistema(wallOptions.kind).precioM2 ?? '')} bind:value={wallOptions.laborRate} />
            </label>
          {/if}
        {/if}

        {#if category === 'roof'}
          {#if kind === 'continuo'}
            <label class="select-label">CAÍDA DEL TECHO
              <div class="stepper-input">
                <button onclick={() => roofOptions.roofDropCm = Math.max(0, roofOptions.roofDropCm - 1)}>−</button>
                <input type="number" min="0" max="50" step="1" bind:value={roofOptions.roofDropCm} />
                <button onclick={() => roofOptions.roofDropCm = Math.min(50, roofOptions.roofDropCm + 1)}>+</button>
              </div>
              <small class="hint">Distancia entre forjado y placa (cm). Se calcula con varilla M6 estándar.</small>
            </label>
          {/if}
          <label class="toggle"><input type="checkbox" bind:checked={roofOptions.withInsulation} /><span class="track"><i></i></span><span>Incluir aislamiento sobre el techo</span></label>
          <label class="toggle"><input type="checkbox" bind:checked={roofOptions.laborOn} /><span class="track"><i></i></span><span>Incluir mano de obra</span></label>
        {/if}

        {#if category === 'floor'}
          {#if kind === 'tarima'}
            <label class="select-label">TIPO DE TARIMA
              <select bind:value={floorOptions.tarimaSurface}>
                {#each tarimaSurfaces as s}<option value={s.id}>{s.label}</option>{/each}
              </select>
            </label>
            <label class="select-label">UNDERLAYMENT
              <select bind:value={floorOptions.underlayment}>
                {#each underlaymentOptions as u}<option value={u.id}>{u.label}</option>{/each}
              </select>
            </label>
          {/if}
          {#if kind === 'ceramica'}
            <label class="select-label">TIPO DE ADHESIVO
              <select bind:value={floorOptions.adhesive}>
                {#each floorAdhesiveOptions as a}<option value={a.id}>{a.label}</option>{/each}
              </select>
            </label>
          {/if}
          <label class="toggle"><input type="checkbox" bind:checked={floorOptions.aplicarNivelacion} /><span class="track"><i></i></span><span>Aplicar mortero de nivelación previo</span></label>
          <label class="toggle"><input type="checkbox" bind:checked={floorOptions.laborOn} /><span class="track"><i></i></span><span>Incluir mano de obra</span></label>
        {/if}

        {#if category === 'bath'}
          <p class="hint">Marca los bloques que incluirá la reforma. Puedes modificar después.</p>
          <label class="toggle"><input type="checkbox" bind:checked={bathOptions.withDemolicion} /><span class="track"><i></i></span><span>Demolición + retirada de escombros</span></label>
          <label class="toggle"><input type="checkbox" bind:checked={bathOptions.withAlicatado} /><span class="track"><i></i></span><span>Alicatado de paredes y suelo</span></label>
          <label class="toggle"><input type="checkbox" bind:checked={bathOptions.withFontaneria} /><span class="track"><i></i></span><span>Fontanería (tubería y puntos de agua)</span></label>
          <label class="toggle"><input type="checkbox" bind:checked={bathOptions.withSanitarios} /><span class="track"><i></i></span><span>Sanitarios y grifería</span></label>
          <label class="toggle"><input type="checkbox" bind:checked={bathOptions.withPintura} /><span class="track"><i></i></span><span>Pintura de techo</span></label>
          <hr style="border:none;border-top:1px solid #e3e8ea;margin:14px 0;" />
          <p class="hint">Sanitarios a instalar:</p>
          <label class="toggle"><input type="checkbox" bind:checked={bathOptions.inodoro} /><span class="track"><i></i></span><span>Inodoro</span></label>
          <label class="toggle"><input type="checkbox" bind:checked={bathOptions.lavabo} /><span class="track"><i></i></span><span>Lavabo + mueble</span></label>
          <label class="toggle"><input type="checkbox" bind:checked={bathOptions.platoDucha} /><span class="track"><i></i></span><span>Plato de ducha + grifería</span></label>
          <label class="toggle"><input type="checkbox" bind:checked={bathOptions.mampara} /><span class="track"><i></i></span><span>Mampara</span></label>
          <label class="toggle"><input type="checkbox" bind:checked={bathOptions.espejo} /><span class="track"><i></i></span><span>Espejo</span></label>
          <label class="toggle"><input type="checkbox" bind:checked={bathOptions.laborOn} /><span class="track"><i></i></span><span>Incluir mano de obra</span></label>
        {/if}

        {#if category === 'welding'}
          <label class="select-label">METAL BASE
            <select bind:value={weldingOptions.metal}>
              {#each Object.values(METAL_META) as m}
                <option value={m.id}>{m.label} · {m.note}</option>
              {/each}
            </select>
          </label>
          <label class="select-label">TIPO DE JUNTA
            <select bind:value={weldingOptions.joint}>
              {#each Object.values(JOINT_META) as j}
                <option value={j.id}>{j.label}</option>
              {/each}
            </select>
          </label>
          <label class="select-label">POSICIÓN DE SOLDADURA
            <select bind:value={weldingOptions.position}>
              {#each Object.values(POSITION_META) as p}
                <option value={p.id}>{p.label}</option>
              {/each}
            </select>
          </label>
          <label class="merma-field">
            <span>MERMA ADICIONAL <small>{((weldingOptions.merma ?? 0) * 100).toFixed(0)}% sobre el consumo teórico</small></span>
            <input type="range" min="0" max="0.25" step="0.01" bind:value={weldingOptions.merma} />
          </label>
          <label class="toggle"><input type="checkbox" bind:checked={weldingOptions.laborOn} /><span class="track"><i></i></span><span>Incluir mano de obra</span></label>
        {/if}

        <div class="step-nav"><span></span><button class="primary" onclick={next}>Siguiente →</button></div>
      </section>
    {/if}

    {#if step === 2}
      <section class="card step-pane">
        <div class="section-heading"><div><p class="eyebrow">PASO 02</p><h2>
          {category === 'wall' ? 'Introduce las medidas' :
           category === 'roof' ? 'Medidas del techo' :
           category === 'floor' ? 'Medidas del suelo' :
           category === 'welding' ? 'Espesor y longitud del cordón' :
           'Medidas del baño'}
        </h2></div><span class="step-badge muted">2/3</span></div>
        <div class="fields">
          {#if category === 'wall'}
            <label><span>ANCHO <small>metros</small></span>
              <div class="stepper-input"><button onclick={() => wallOptions.width = Math.max(0.1, +(wallOptions.width - 0.1).toFixed(2))}>−</button><input type="number" min="0.1" step="0.1" bind:value={wallOptions.width} /><button onclick={() => wallOptions.width = +(wallOptions.width + 0.1).toFixed(2)}>+</button></div>
            </label>
            <span class="times">×</span>
            <label><span>ALTO <small>metros</small></span>
              <div class="stepper-input"><button onclick={() => wallOptions.height = Math.max(0.1, +(wallOptions.height - 0.1).toFixed(2))}>−</button><input type="number" min="0.1" step="0.1" bind:value={wallOptions.height} /><button onclick={() => wallOptions.height = +(wallOptions.height + 0.1).toFixed(2)}>+</button></div>
            </label>
          {:else if category === 'roof'}
            <label><span>LARGO <small>metros</small></span>
              <div class="stepper-input"><button onclick={() => roofOptions.width = Math.max(0.1, +(roofOptions.width - 0.1).toFixed(2))}>−</button><input type="number" min="0.1" step="0.1" bind:value={roofOptions.width} /><button onclick={() => roofOptions.width = +(roofOptions.width + 0.1).toFixed(2)}>+</button></div>
            </label>
            <span class="times">×</span>
            <label><span>ANCHO <small>metros</small></span>
              <div class="stepper-input"><button onclick={() => roofOptions.length = Math.max(0.1, +(roofOptions.length - 0.1).toFixed(2))}>−</button><input type="number" min="0.1" step="0.1" bind:value={roofOptions.length} /><button onclick={() => roofOptions.length = +(roofOptions.length + 0.1).toFixed(2)}>+</button></div>
            </label>
          {:else if category === 'floor'}
            <label><span>ANCHO <small>metros</small></span>
              <div class="stepper-input"><button onclick={() => floorOptions.width = Math.max(0.1, +(floorOptions.width - 0.1).toFixed(2))}>−</button><input type="number" min="0.1" step="0.1" bind:value={floorOptions.width} /><button onclick={() => floorOptions.width = +(floorOptions.width + 0.1).toFixed(2)}>+</button></div>
            </label>
            <span class="times">×</span>
            <label><span>LARGO <small>metros</small></span>
              <div class="stepper-input"><button onclick={() => floorOptions.length = Math.max(0.1, +(floorOptions.length - 0.1).toFixed(2))}>−</button><input type="number" min="0.1" step="0.1" bind:value={floorOptions.length} /><button onclick={() => floorOptions.length = +(floorOptions.length + 0.1).toFixed(2)}>+</button></div>
            </label>
          {:else if category === 'welding'}
            <label><span>ESPESOR <small>milímetros</small></span>
              <div class="stepper-input"><button onclick={() => weldingOptions.thicknessMm = Math.max(0.5, +(weldingOptions.thicknessMm - 0.5).toFixed(2))}>−</button><input type="number" min="0.5" max="40" step="0.5" bind:value={weldingOptions.thicknessMm} /><button onclick={() => weldingOptions.thicknessMm = Math.min(40, +(weldingOptions.thicknessMm + 0.5).toFixed(2))}>+</button></div>
            </label>
            <span class="times">×</span>
            <label><span>LONGITUD CORDÓN <small>metros lineales</small></span>
              <div class="stepper-input"><button onclick={() => weldingOptions.totalLengthM = Math.max(0.1, +(weldingOptions.totalLengthM - 0.1).toFixed(2))}>−</button><input type="number" min="0.1" step="0.1" bind:value={weldingOptions.totalLengthM} /><button onclick={() => weldingOptions.totalLengthM = +(weldingOptions.totalLengthM + 0.1).toFixed(2)}>+</button></div>
            </label>
          {:else}
            <label><span>ANCHO <small>metros</small></span>
              <div class="stepper-input"><button onclick={() => bathOptions.width = Math.max(0.5, +(bathOptions.width - 0.1).toFixed(2))}>−</button><input type="number" min="0.5" step="0.1" bind:value={bathOptions.width} /><button onclick={() => bathOptions.width = +(bathOptions.width + 0.1).toFixed(2)}>+</button></div>
            </label>
            <span class="times">×</span>
            <label><span>LARGO <small>metros</small></span>
              <div class="stepper-input"><button onclick={() => bathOptions.length = Math.max(0.5, +(bathOptions.length - 0.1).toFixed(2))}>−</button><input type="number" min="0.5" step="0.1" bind:value={bathOptions.length} /><button onclick={() => bathOptions.length = +(bathOptions.length + 0.1).toFixed(2)}>+</button></div>
            </label>
          {/if}
        </div>
        {#if category === 'wall'}
          <div class="huecos-section">
            <div class="huecos-head">
              <span class="huecos-title">HUECOS (PUERTAS / VENTANAS)</span>
              <small class="hint">{wallOptions.huecos.reduce((s, h) => s + h.ancho * h.alto * h.cantidad, 0).toFixed(2)} m² a descontar</small>
            </div>
            {#if wallOptions.huecos.length > 0}
              <ul class="huecos-list">
                {#each wallOptions.huecos as h, i (h.id)}
                  <li class="hueco-row">
                    <select bind:value={h.tipo} aria-label="Tipo">
                      <option value="puerta">Puerta</option>
                      <option value="ventana">Ventana</option>
                    </select>
                    <input class="hueco-nombre" type="text" bind:value={h.nombre} placeholder="Nombre" aria-label="Nombre" />
                    <label class="hueco-dim"><span>ancho</span><input type="number" min="0.1" step="0.01" bind:value={h.ancho} /></label>
                    <label class="hueco-dim"><span>alto</span><input type="number" min="0.1" step="0.01" bind:value={h.alto} /></label>
                    <label class="hueco-dim"><span>uds.</span><input type="number" min="1" step="1" bind:value={h.cantidad} /></label>
                    <button class="hueco-del" onclick={() => wallOptions.huecos.splice(i, 1)} aria-label="Eliminar hueco">×</button>
                  </li>
                {/each}
              </ul>
            {:else}
              <p class="hint">No has añadido huecos. La superficie a cubrir será el área bruta.</p>
            {/if}
            <div class="huecos-actions">
              <select onchange={(e) => { const opt = (e.currentTarget as HTMLSelectElement).selectedOptions[0]; const preset = catalog.huecosPreset.find((p) => p.id === opt.value); if (preset) { wallOptions.huecos.push({ id: crypto.randomUUID?.() ?? `h-${Date.now()}`, tipo: preset.tipo, nombre: preset.nombre, ancho: preset.ancho, alto: preset.alto, cantidad: 1 }); wallOptions.huecos = [...wallOptions.huecos]; } (e.currentTarget as HTMLSelectElement).value = ''; }} aria-label="Añadir hueco predefinido">
                <option value="">+ Añadir hueco predefinido…</option>
                {#each catalog.huecosPreset as preset}<option value={preset.id}>{preset.nombre} ({preset.ancho.toFixed(2)} × {preset.alto.toFixed(2)} m)</option>{/each}
              </select>
              <button class="ghost-btn" onclick={() => wallOptions.huecos.push({ id: crypto.randomUUID?.() ?? `h-${Date.now()}`, tipo: 'puerta', nombre: 'Personalizado', ancho: 0.82, alto: 2.10, cantidad: 1 }) && (wallOptions.huecos = [...wallOptions.huecos])}>+ Hueco manual</button>
            </div>
            <label class="merma-field">
              <span>MERMA ADICIONAL <small>{(wallOptions.merma * 100).toFixed(0)}% sobre la base del sistema</small></span>
              <input type="range" min="0" max="0.15" step="0.01" bind:value={wallOptions.merma} />
            </label>
          </div>
        {:else if category === 'bath'}
          <label class="opening-field"><span>ALTURA PAREDES <small>metros</small></span>
            <div class="stepper-input"><button onclick={() => bathOptions.wallHeight = Math.max(1.8, +(bathOptions.wallHeight - 0.1).toFixed(2))}>−</button><input type="number" min="1.8" max="3.5" step="0.1" bind:value={bathOptions.wallHeight} /><button onclick={() => bathOptions.wallHeight = +(bathOptions.wallHeight + 0.1).toFixed(2)}>+</button></div>
          </label>
          {#if bathOptions.withFontaneria}
            <label class="opening-field"><span>PUNTOS DE AGUA <small>uds. (fría + caliente)</small></span>
              <div class="stepper-input"><button onclick={() => bathOptions.puntosAgua = Math.max(1, bathOptions.puntosAgua - 1)}>−</button><input type="number" min="1" max="20" step="1" bind:value={bathOptions.puntosAgua} /><button onclick={() => bathOptions.puntosAgua = Math.min(20, bathOptions.puntosAgua + 1)}>+</button></div>
            </label>
          {/if}
          {#if bathOptions.withAlicatado}
            <label class="select-label">AZULEJO
              <select bind:value={bathOptions.baldosaId}>
                {#each baldosas as b}<option value={b.id}>{b.nombre}</option>{/each}
              </select>
            </label>
          {/if}
        {:else if category === 'welding'}
          <div class="welding-summary">
            <p class="hint roof-hint">Indica el espesor del metal base y la longitud total del cordón. El cálculo selecciona automáticamente diámetro del electrodo, amperaje, voltaje, velocidad de avance, gas y potencia del equipo.</p>
            <div class="welding-presets">
              {#each diametrosDisponibles(weldingOptions.process, weldingOptions.metal, weldingOptions.thicknessMm) as d}
                <button type="button" class:chosen={weldingOptions.diametroMm === d} onclick={() => weldingOptions.diametroMm = d}>⌀ {d} mm</button>
              {/each}
              <button type="button" class="ghost" onclick={() => weldingOptions.diametroMm = undefined}>Automático</button>
            </div>
          </div>
        {:else}
          <p class="hint roof-hint">Mide largo y ancho de la superficie. Se aplica un 10% de merma por cortes.</p>
        {/if}
        <div class="presets">
          <span>Preset:</span>
          {#if category === 'wall'}
            <button onclick={() => { wallOptions.width = 3; wallOptions.height = 2.5; wallOptions.huecos = [{ id: crypto.randomUUID?.() ?? 'h1', tipo: 'ventana', nombre: 'Ventana habitación', ancho: 1.20, alto: 1.20, cantidad: 1 }]; }}>Habitación</button>
            <button onclick={() => { wallOptions.width = 1.2; wallOptions.height = 2.6; wallOptions.huecos = [{ id: crypto.randomUUID?.() ?? 'h1', tipo: 'puerta', nombre: 'Puerta pasillo', ancho: 0.82, alto: 2.10, cantidad: 1 }]; }}>Pasillo</button>
            <button onclick={() => { wallOptions.width = 5; wallOptions.height = 3; wallOptions.huecos = [{ id: crypto.randomUUID?.() ?? 'h1', tipo: 'ventana', nombre: 'Ventana grande', ancho: 1.80, alto: 1.50, cantidad: 1 }, { id: crypto.randomUUID?.() ?? 'h2', tipo: 'puerta', nombre: 'Puerta salón', ancho: 0.82, alto: 2.10, cantidad: 1 }]; }}>Salón grande</button>
          {:else if category === 'roof'}
            <button onclick={() => { roofOptions.width = 3.5; roofOptions.length = 4; }}>Habitación</button>
            <button onclick={() => { roofOptions.width = 1.5; roofOptions.length = 4; }}>Pasillo</button>
            <button onclick={() => { roofOptions.width = 5; roofOptions.length = 6; }}>Salón grande</button>
            <button onclick={() => { roofOptions.width = 8; roofOptions.length = 4; }}>Cocina office</button>
          {:else if category === 'floor'}
            <button onclick={() => { floorOptions.width = 3.5; floorOptions.length = 4; }}>Habitación</button>
            <button onclick={() => { floorOptions.width = 1.5; floorOptions.length = 4; }}>Pasillo</button>
            <button onclick={() => { floorOptions.width = 5; floorOptions.length = 6; }}>Salón grande</button>
          {:else if category === 'welding'}
            <button onclick={() => { weldingOptions.thicknessMm = 2; weldingOptions.totalLengthM = 0.5; }}>Chapa fina</button>
            <button onclick={() => { weldingOptions.thicknessMm = 6; weldingOptions.totalLengthM = 1; }}>Estructura ligera</button>
            <button onclick={() => { weldingOptions.thicknessMm = 10; weldingOptions.totalLengthM = 2; }}>Carpintería metálica</button>
            <button onclick={() => { weldingOptions.thicknessMm = 20; weldingOptions.totalLengthM = 5; }}>Estructura pesada</button>
          {:else}
            <button onclick={() => { bathOptions.width = 2; bathOptions.length = 2.5; bathOptions.wallHeight = 2.4; }}>Baño pequeño</button>
            <button onclick={() => { bathOptions.width = 2.5; bathOptions.length = 3; bathOptions.wallHeight = 2.4; }}>Baño medio</button>
            <button onclick={() => { bathOptions.width = 3; bathOptions.length = 3.5; bathOptions.wallHeight = 2.4; }}>Baño grande</button>
          {/if}
        </div>
        <div class="area-note"><span>{category === 'roof' ? '▭' : category === 'floor' ? '▤' : category === 'bath' ? '◆' : category === 'welding' ? '⚡' : '▧'}</span><strong>{category === 'welding' ? 'Longitud total del cordón' : 'Superficie total'}</strong><b>{(category === 'wall' ? result.area : category === 'floor' ? result.area : category === 'bath' ? result.area : category === 'welding' ? weldingOptions.totalLengthM : result.area).toFixed(2)} {category === 'welding' ? 'm' : 'm²'}</b></div>
        <div class="step-nav"><button class="ghost" onclick={back}>← Atrás</button><button class="primary" onclick={next}>Calcular →</button></div>
      </section>
    {/if}

    {#if step === 3}
      <section class="result-card step-pane">
        <div class="result-top">
          <div>
            <p class="eyebrow light">ESTIMACIÓN DEL PROYECTO</p>
            <h2>{projectName || 'Tu lista de compra'}</h2>
            <p>{categoryPrettyName()}{category === 'welding' ? ` · ${weldingOptions.totalLengthM.toFixed(2)} m de cordón` : ` de ${result.area.toFixed(2)} m²`} · {systemPrettyLabel(kind)}</p>
          </div>
          <span class="step-badge light-badge">3/3</span>
        </div>
        {#if category === 'welding'}
          {@const wres = result as WeldingResult}
          <div class="welding-params">
            <div class="welding-params-head">
              <strong>Parámetros operativos</strong>
              <small>Calculados según proceso, metal y espesor</small>
            </div>
            <div class="welding-grid">
              <div><span>Intensidad</span><b>{wres.parametros.amperaje} A</b></div>
              <div><span>Voltaje</span><b>{wres.parametros.voltaje} V</b></div>
              <div><span>⌀ Electrodo / hilo</span><b>{wres.parametros.diametroMm} mm</b></div>
              <div><span>Velocidad</span><b>{wres.parametros.velocidadCmMin} cm/min</b></div>
              <div><span>Heat input</span><b>{wres.parametros.heatInput} kJ/mm</b></div>
              <div><span>Potencia equipo</span><b>{wres.parametros.potenciaKVA} kVA</b></div>
              {#if wres.parametros.gasFlujoLMin > 0}
                <div><span>Caudal de gas</span><b>{wres.parametros.gasFlujoLMin} l/min</b></div>
              {/if}
              <div><span>Aporte necesario</span><b>{wres.parametros.aporteKg} kg</b></div>
              <div><span>Tiempo total</span><b>{wres.parametros.horasTotales} h</b></div>
            </div>
            {#if wres.recomendaciones.length > 0}
              <ul class="welding-tips">
                {#each wres.recomendaciones as r}<li>{r}</li>{/each}
              </ul>
            {/if}
          </div>
        {/if}
        <div class="stats">
          <div><span>Materiales</span><strong>{euro(result.total)}</strong><small>Precios estimados</small></div>
          {#if result.labor > 0}<div><span>Mano de obra</span><strong>{euro(result.labor)}</strong><small>Precio orientativo</small></div>{/if}
          <div><span>Total</span><strong>{euro(result.grandTotal)}</strong><small>Materiales + obra</small></div>
          <div><span>Tiempo</span><strong>{result.hours.toFixed(1)} h</strong><small>Rendimiento orientativo</small></div>
        </div>
        <div class="shopping-list">
          {#each result.lines as line}
            <div class="material-row">
              <div class="material-icon">{iconForCategoria(line.material.categoria)}</div>
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
          <button onclick={handleExport}>⇩ Exportar</button>
          <button onclick={handleCopyJson}>⧉ Copiar JSON</button>
          <button onclick={handleExportRCX} title="Descargar proyecto en el estándar RCX (.rcx.json)">⇩ Exportar a RCX</button>
          <button onclick={handleCopyRCX} title="Copiar proyecto en el estándar RCX">⧉ Copiar RCX</button>
          <button onclick={handleExportCSV} title="Descargar lista de materiales en CSV (Excel)">⇩ Exportar CSV</button>
          <button onclick={handleCopyCSV} title="Copiar CSV al portapapeles">⧉ Copiar CSV</button>
          <button onclick={handleShareUrl} title="Copiar URL compartible del proyecto">🔗 Compartir enlace</button>
        </div>
        <div class="step-nav"><button class="ghost" onclick={back}>← Atrás</button><button class="primary" onclick={() => (step = 2)}>Modificar medidas</button></div>
        <div class="notice"><span>i</span><p>Estimación orientativa con precios de referencia de Obramat y Leroy Merlin (actualizados {catalogMeta().fechaActualizacion}). Incluye merma y consumos técnicos. Mano de obra orientativa; verifica precios y stock en tu almacén.</p></div>
      </section>
    {/if}
    {/if}
  </main>

  {#if toast}
    <div class="toast" class:error={toast.type === 'error'} role="status" aria-live="polite">
      <span class="toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
      <span>{toast.message}</span>
    </div>
  {/if}
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
  .menu-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: #eaf2ff;
    color: #2f6bd9;
    display: grid; place-items: center;
    flex: none;
  }
  .menu-icon svg { width: 24px; height: 24px; }
  .menu-text { display: grid; gap: 3px; min-width: 0; }
  .menu-text strong { font-size: 16px; font-weight: 800; letter-spacing: -.3px; color: #172126; }
  .menu-text small { font-size: 12.5px; color: #79878c; line-height: 1.35; }
  .menu-arrow { font-size: 20px; color: #98a3a6; font-weight: 700; transition: transform .2s, color .2s; }
  :global(body.dark) .menu-card { background: #182328; border-color: #2a383b; }
  :global(body.dark) .menu-text strong { color: #e7eef0; }
  :global(body.dark) .menu-text small { color: #8a999c; }
  :global(body.dark) .menu-icon { background: #1d2a3a; color: #6da4ff; }
  :global(body.dark) .menu-arrow { color: #58676d; }
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

  .huecos-section { margin-top: 18px; padding: 14px; border: 1px dashed #dde5e6; border-radius: 12px; max-width: 640px; }
  .huecos-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-bottom: 8px; }
  .huecos-title { font-size: 10px; font-weight: 800; letter-spacing: 1.2px; color: #77868b; }
  .huecos-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
  .hueco-row { display: grid; grid-template-columns: 100px 1fr repeat(3, 90px) 30px; gap: 6px; align-items: center; }
  .hueco-row select, .hueco-row input[type="text"], .hueco-row input[type="number"] {
    border: 1px solid #dce4e5; border-radius: 8px; padding: 7px 9px; font-size: 12px; background: white; color: #25353a; outline-color: #b8cd25; min-width: 0;
  }
  .hueco-nombre { font-weight: 600; }
  .hueco-dim { display: grid; gap: 2px; font-size: 9px; font-weight: 700; letter-spacing: 0.6px; color: #87949a; }
  .hueco-dim input { font-size: 13px; font-weight: 700; text-align: center; }
  .hueco-del { background: #fdecec; border: 1px solid #f5c2c2; color: #b03030; border-radius: 8px; cursor: pointer; height: 30px; font-size: 18px; line-height: 1; }
  .hueco-del:hover { background: #fbd5d5; }
  .huecos-actions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
  .huecos-actions select, .huecos-actions .ghost-btn { border: 1px solid #dde5e6; border-radius: 20px; padding: 6px 12px; font-size: 12px; background: white; color: #46545a; cursor: pointer; font-weight: 600; }
  .huecos-actions .ghost-btn:hover { background: #f6f9e9; border-color: #b8cd25; }
  .merma-field { display: block; margin-top: 14px; }
  .merma-field span { display: block; font-size: 10px; font-weight: 800; letter-spacing: 1.2px; color: #77868b; }
  .merma-field input[type="range"] { display: block; width: 100%; margin-top: 8px; accent-color: #d7ef4a; }
  :global(body.dark) .huecos-section { border-color: #2a383b; background: #0f1719; }
  :global(body.dark) .hueco-row select, :global(body.dark) .hueco-row input { background: #182328; border-color: #2a383b; color: #e7eef0; }
  :global(body.dark) .hueco-del { background: #3a1212; border-color: #7a1f1f; color: #ffb4a2; }
  :global(body.dark) .huecos-actions select, :global(body.dark) .huecos-actions .ghost-btn { background: #182328; border-color: #2a383b; color: #aab8ba; }
  :global(body.dark) .huecos-actions .ghost-btn:hover { background: #1d2a17; border-color: #b8cd25; color: #d7ef4a; }

  .hint { display:block; margin-top:6px; font-size:11px; color:#79878c; line-height:1.4; }
  .roof-hint { max-width:480px; margin-top:14px; padding:10px 12px; background:#f6f9e9; border-radius:9px; color:#54620e; font-size:12px; }
  :global(body.dark) .roof-hint { background:#1d2a17; color:#c8db7a; }
  .select-label .stepper-input { margin-top:6px; width:240px; }
  .select-label .stepper-input input { padding:9px 0; font-size:14px; }
  .select-label .stepper-input button { padding:9px 10px; font-size:14px; }

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

  .welding-summary { max-width:560px; margin-top:16px; }
  .welding-presets { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
  .welding-presets button { background:white; border:1px solid #dde5e6; color:#46545a; border-radius:18px; padding:5px 11px; font-size:12px; font-weight:600; cursor:pointer; transition:.2s; }
  .welding-presets button:hover { background:#f6f9e9; border-color:#b8cd25; }
  .welding-presets button.chosen { background:#fcfef2; border-color:#b8cd25; color:#31400d; }
  .welding-presets button.ghost { font-style:italic; color:#79878c; }

  .welding-params { margin:18px 0 4px; padding:14px 16px; border:1px solid #b8cd25; border-radius:14px; background:#fcfef2; }
  :global(body.dark) .welding-params { background:#1d2a17; border-color:#3a4d0d; }
  .welding-params-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:10px; }
  .welding-params-head strong { font-size:13px; letter-spacing:.3px; color:#3f4b0c; }
  :global(body.dark) .welding-params-head strong { color:#d7ef4a; }
  .welding-params-head small { font-size:11px; color:#79878c; }
  .welding-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:10px 14px; }
  .welding-grid > div { display:grid; gap:2px; }
  .welding-grid > div span { font-size:10px; letter-spacing:.8px; color:#79878c; text-transform:uppercase; font-weight:700; }
  .welding-grid > div b { font-size:18px; color:#3f4b0c; letter-spacing:-.4px; }
  :global(body.dark) .welding-grid > div b { color:#d7ef4a; }
  .welding-tips { margin:14px 0 0; padding:10px 14px 10px 28px; background:#fff7d6; border:1px solid #f0d97a; border-radius:10px; font-size:12px; color:#5a4710; line-height:1.5; }
  :global(body.dark) .welding-tips { background:#3a2e0d; border-color:#7a6210; color:#f0d97a; }
  .welding-tips li { margin:3px 0; }

  .notice {display:flex;gap:9px;background:#29383b;border-radius:10px;padding:11px 12px;margin-top:14px;align-items:flex-start;}
  .notice span {border:1px solid #b7ce3b;color:#d7ef4a;border-radius:50%;width:16px;height:16px;display:grid;place-items:center;font-size:10px;flex:none;}
  .notice p {font-size:11px!important;line-height:1.4;}

  .import-btn {
    margin-top: 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: white;
    border: 1px solid #dde5e6;
    border-radius: 12px;
    padding: 11px 16px;
    font-size: 13px;
    font-weight: 700;
    color: #46545a;
    cursor: pointer;
    transition: .2s;
  }
  .import-btn:hover { background: #f6f9e9; border-color: #b8cd25; color: #31400d; }
  :global(body.dark) .import-btn { background: #182328; border-color: #2a383b; color: #aab8ba; }
  :global(body.dark) .import-btn:hover { background: #1d2a17; border-color: #b8cd25; color: #d7ef4a; }

  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 9px;
    max-width: min(90vw, 460px);
    background: #202d31;
    color: white;
    padding: 12px 18px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 8px 24px #00000030;
    z-index: 50;
    animation: toastIn .25s ease;
  }
  .toast.error { background: #7a1f1f; }
  .toast-icon { color: #d7ef4a; font-weight: 800; flex: none; }
  .toast.error .toast-icon { color: #ffb4a2; }
  :global(body.dark) .toast { background: #0f1719; border: 1px solid #2a383b; }
  :global(body.dark) .toast.error { background: #3a1212; border-color: #7a1f1f; }
  @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }

  @media print {
    :global(body) { background: white !important; color: black !important; }
    :global(.topbar), :global(.app-shell footer), :global(.header-actions), :global(.import-btn), :global(.intro), :global(.stepper), :global(.toast), :global(.step-nav) { display: none !important; }
    :global(.menu-screen) { display: none !important; }
    .app-shell { max-width: 100% !important; padding: 0 !important; }
    .result-card { background: white !important; color: black !important; border: 1px solid #ccc !important; padding: 16px !important; box-shadow: none !important; page-break-inside: avoid; }
    .result-card h2 { color: black !important; }
    .eyebrow.light { color: #555 !important; }
    .light-badge { background: #eee !important; color: #31400d !important; border: 1px solid #ccc; }
    .stats { border-color: #ddd !important; }
    .stats strong { color: black !important; }
    .material-row { color: black !important; border-color: #ddd !important; }
    .material-row:hover { background: transparent !important; }
    .material-icon { background: #f0f0f0 !important; color: #31400d !important; }
    .material-name strong, .material-row .qty, .material-row .price { color: black !important; }
    .actions { display: none !important; }
    .notice { background: #f5f5f5 !important; color: #333 !important; }
    .notice span { color: #31400d !important; border-color: #31400d !important; }
    .welding-params { background: #f8f8f8 !important; border-color: #ccc !important; }
    .welding-params-head strong, .welding-grid > div b { color: black !important; }
    .welding-tips { background: #fff8e0 !important; color: #333 !important; border-color: #c0a040 !important; }
  }

  @media (max-width: 700px) {
    .app-shell {padding:0 16px;}
    .menu-card { grid-template-columns: 44px 1fr auto; padding: 14px 14px; gap: 14px; border-radius: 14px; }
    .menu-icon { width: 38px; height: 38px; border-radius: 10px; }
    .menu-icon svg { width: 20px; height: 20px; }
    .menu-text strong { font-size: 14px; }
    .menu-text small { font-size: 11.5px; }
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

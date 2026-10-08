/**
 * ==========================================================================
 * EMULSION STABILITY LAB & COLLOID SIMULATOR
 * Core Physics & Physical Chemistry Engine for Emulsion Stability Assistant
 * Models: Stokes' Law, DLVO Electrostatics, Carreau Rheology, Droplet Breakup
 * ==========================================================================
 */

const EmulsionLab = (() => {
  // Configuración de Densidades y Propiedades Fisicoquímicas
  const OILS = {
    chia: { name: 'Aceite de Chía (Alto ALA ω-3)', density: 925, viscosity: 32 },
    olive: { name: 'Aceite de Oliva Extra Virgen', density: 915, viscosity: 45 },
    sunflower: { name: 'Aceite de Girasol Alto Oleico', density: 920, viscosity: 38 },
    palm: { name: 'Oleína de Palma Fraccionada', density: 910, viscosity: 52 },
    avocado: { name: 'Aceite de Aguacate Prensado', density: 918, viscosity: 48 },
    mct: { name: 'Triglicéridos de Cadena Media (MCT)', density: 945, viscosity: 25 }
  };

  const EMULSIFIERS = {
    spi: { name: 'Aislado de Proteína de Soya (SPI)', pI: 4.5, gammaSat: 2.2, mw: 'Globular 7S/11S' },
    wpi: { name: 'Aislado de Proteína de Suero (WPI)', pI: 5.1, gammaSat: 1.8, mw: 'β-Lactoglobulina' },
    caseinate: { name: 'Caseinato de Sodio', pI: 4.6, gammaSat: 2.5, mw: 'Desordenado/Flexible' },
    lecithin: { name: 'Lecitina de Soya (Fosfolípidos)', pI: 3.5, gammaSat: 1.2, mw: 'Anfifílico Zwitteriónico' },
    pea: { name: 'Aislado de Proteína de Arveja', pI: 4.8, gammaSat: 2.4, mw: 'Vicilina/Legumina' }
  };

  const HYDROCOLLOIDS = {
    xanthan: { name: 'Goma Xantana (Reticular rígido)', yieldStressFactor: 0.85, etaFactor: 1100, critDepletion: 0.28 },
    guar: { name: 'Goma Guar (Galactomanano neutro)', yieldStressFactor: 0.15, etaFactor: 550, critDepletion: 0.45 },
    cmc: { name: 'Carboximetilcelulosa (CMC aniónica)', yieldStressFactor: 0.25, etaFactor: 320, critDepletion: 0.50 },
    starch: { name: 'Almidón Modificado Reticulado', yieldStressFactor: 0.40, etaFactor: 240, critDepletion: 0.70 },
    none: { name: 'Sin estabilizante adicional', yieldStressFactor: 0.0, etaFactor: 0.0, critDepletion: 99.0 }
  };

  // Presets Industriales
  const PRESETS = {
    chia_spread: {
      name: 'Crema Untable de Chía y Soya (Prompt Oficial)',
      oilType: 'chia',
      oilFraction: 25,
      emulsifier: 'spi',
      emulsifierDose: 3.0,
      hydrocolloid: 'xanthan',
      hydrocolloidDose: 0.20,
      ph: 6.2,
      pressure: 20,
      temp: 20
    },
    plant_milk: {
      name: 'Bebida Vegetal Funcional (Baja Viscosidad)',
      oilType: 'sunflower',
      oilFraction: 8,
      emulsifier: 'pea',
      emulsifierDose: 1.8,
      hydrocolloid: 'xanthan',
      hydrocolloidDose: 0.06,
      ph: 6.8,
      pressure: 35,
      temp: 20
    },
    acid_dressing: {
      name: 'Aderezo Ensalada Ácido (Riesgo Isoeléctrico)',
      oilType: 'olive',
      oilFraction: 18,
      emulsifier: 'caseinate',
      emulsifierDose: 2.2,
      hydrocolloid: 'guar',
      hydrocolloidDose: 0.35,
      ph: 4.4, // Muy cercano al pI de caseinato 4.6!
      pressure: 15,
      temp: 20
    },
    mayo_light: {
      name: 'Mayonesa Light O/W 45% Aceite',
      oilType: 'sunflower',
      oilFraction: 45,
      emulsifier: 'lecithin',
      emulsifierDose: 3.5,
      hydrocolloid: 'xanthan',
      hydrocolloidDose: 0.28,
      ph: 3.8,
      pressure: 12,
      temp: 20
    }
  };

  // Estado Actual del Laboratorio
  let state = {
    oilType: 'chia',
    oilFraction: 25, // %
    emulsifier: 'spi',
    emulsifierDose: 3.0, // %
    hydrocolloid: 'xanthan',
    hydrocolloidDose: 0.20, // %
    ph: 6.2,
    pressure: 20, // MPa
    temp: 20, // °C
    centrifugationMode: false,
    isPaused: false
  };

  // Canvas y Partículas
  let canvas, ctx;
  let particles = [];
  let animFrameId = null;

  // Inicialización de DOM
  function init() {
    canvas = document.getElementById('droplet-canvas');
    if (canvas) {
      ctx = canvas.getContext('2d');
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
    }

    bindInputs();
    bindPresets();
    bindCanvasControls();
    loadPreset('chia_spread');
    calculateAndRender();
    initParticles();
    animate();
  }

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = 280 * (window.devicePixelRatio || 1);
    if (ctx) ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  function bindInputs() {
    // Sliders & selects
    const oilSelect = document.getElementById('lab-oil-type');
    const oilFractionSlider = document.getElementById('lab-oil-fraction');
    const oilFractionVal = document.getElementById('val-oil-fraction');

    const emulSelect = document.getElementById('lab-emul-type');
    const emulDoseSlider = document.getElementById('lab-emul-dose');
    const emulDoseVal = document.getElementById('val-emul-dose');

    const hydroSelect = document.getElementById('lab-hydro-type');
    const hydroDoseSlider = document.getElementById('lab-hydro-dose');
    const hydroDoseVal = document.getElementById('val-hydro-dose');

    const phSlider = document.getElementById('lab-ph');
    const phVal = document.getElementById('val-ph');

    const pressSlider = document.getElementById('lab-pressure');
    const pressVal = document.getElementById('val-pressure');

    if (oilSelect) {
      oilSelect.addEventListener('change', (e) => {
        state.oilType = e.target.value;
        calculateAndRender();
      });
    }

    if (oilFractionSlider) {
      oilFractionSlider.addEventListener('input', (e) => {
        state.oilFraction = parseFloat(e.target.value);
        if (oilFractionVal) oilFractionVal.textContent = `${state.oilFraction}%`;
        calculateAndRender();
      });
    }

    if (emulSelect) {
      emulSelect.addEventListener('change', (e) => {
        state.emulsifier = e.target.value;
        calculateAndRender();
      });
    }

    if (emulDoseSlider) {
      emulDoseSlider.addEventListener('input', (e) => {
        state.emulsifierDose = parseFloat(e.target.value);
        if (emulDoseVal) emulDoseVal.textContent = `${state.emulsifierDose.toFixed(1)}%`;
        calculateAndRender();
      });
    }

    if (hydroSelect) {
      hydroSelect.addEventListener('change', (e) => {
        state.hydrocolloid = e.target.value;
        calculateAndRender();
      });
    }

    if (hydroDoseSlider) {
      hydroDoseSlider.addEventListener('input', (e) => {
        state.hydrocolloidDose = parseFloat(e.target.value);
        if (hydroDoseVal) hydroDoseVal.textContent = `${state.hydrocolloidDose.toFixed(2)}%`;
        calculateAndRender();
      });
    }

    if (phSlider) {
      phSlider.addEventListener('input', (e) => {
        state.ph = parseFloat(e.target.value);
        if (phVal) phVal.textContent = state.ph.toFixed(1);
        calculateAndRender();
      });
    }

    if (pressSlider) {
      pressSlider.addEventListener('input', (e) => {
        state.pressure = parseFloat(e.target.value);
        if (pressVal) pressVal.textContent = `${state.pressure} MPa`;
        calculateAndRender();
      });
    }
  }

  function bindPresets() {
    const presetBtns = document.querySelectorAll('.btn-preset');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.getAttribute('data-preset');
        if (PRESETS[presetKey]) {
          presetBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          loadPreset(presetKey);
        }
      });
    });
  }

  function loadPreset(key) {
    const p = PRESETS[key];
    if (!p) return;
    state.oilType = p.oilType;
    state.oilFraction = p.oilFraction;
    state.emulsifier = p.emulsifier;
    state.emulsifierDose = p.emulsifierDose;
    state.hydrocolloid = p.hydrocolloid;
    state.hydrocolloidDose = p.hydrocolloidDose;
    state.ph = p.ph;
    state.pressure = p.pressure;
    state.temp = p.temp;

    // Update form elements
    const oilSelect = document.getElementById('lab-oil-type');
    const oilFractionSlider = document.getElementById('lab-oil-fraction');
    const oilFractionVal = document.getElementById('val-oil-fraction');

    const emulSelect = document.getElementById('lab-emul-type');
    const emulDoseSlider = document.getElementById('lab-emul-dose');
    const emulDoseVal = document.getElementById('val-emul-dose');

    const hydroSelect = document.getElementById('lab-hydro-type');
    const hydroDoseSlider = document.getElementById('lab-hydro-dose');
    const hydroDoseVal = document.getElementById('val-hydro-dose');

    const phSlider = document.getElementById('lab-ph');
    const phVal = document.getElementById('val-ph');

    const pressSlider = document.getElementById('lab-pressure');
    const pressVal = document.getElementById('val-pressure');

    if (oilSelect) oilSelect.value = state.oilType;
    if (oilFractionSlider) oilFractionSlider.value = state.oilFraction;
    if (oilFractionVal) oilFractionVal.textContent = `${state.oilFraction}%`;

    if (emulSelect) emulSelect.value = state.emulsifier;
    if (emulDoseSlider) emulDoseSlider.value = state.emulsifierDose;
    if (emulDoseVal) emulDoseVal.textContent = `${state.emulsifierDose.toFixed(1)}%`;

    if (hydroSelect) hydroSelect.value = state.hydrocolloid;
    if (hydroDoseSlider) hydroDoseSlider.value = state.hydrocolloidDose;
    if (hydroDoseVal) hydroDoseVal.textContent = `${state.hydrocolloidDose.toFixed(2)}%`;

    if (phSlider) phSlider.value = state.ph;
    if (phVal) phVal.textContent = state.ph.toFixed(1);

    if (pressSlider) pressSlider.value = state.pressure;
    if (pressVal) pressVal.textContent = `${state.pressure} MPa`;

    calculateAndRender();
    initParticles();
  }

  function bindCanvasControls() {
    const pauseBtn = document.getElementById('btn-canvas-pause');
    const centriBtn = document.getElementById('btn-canvas-centri');
    const resetBtn = document.getElementById('btn-canvas-reset');

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        state.isPaused = !state.isPaused;
        pauseBtn.textContent = state.isPaused ? '▶ Reanudar' : '⏸ Pausar';
      });
    }

    if (centriBtn) {
      centriBtn.addEventListener('click', () => {
        state.centrifugationMode = !state.centrifugationMode;
        centriBtn.style.color = state.centrifugationMode ? 'var(--accent-amber)' : '';
        centriBtn.textContent = state.centrifugationMode ? '⚡ Centrifugación: 1000g ON' : '🌀 Centrifugar (1000g)';
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        initParticles();
      });
    }
  }

  // CÁLCULO CIENTÍFICO CENTRAL
  function calculateModel() {
    const oilInfo = OILS[state.oilType] || OILS.chia;
    const emulInfo = EMULSIFIERS[state.emulsifier] || EMULSIFIERS.spi;
    const hydroInfo = HYDROCOLLOIDS[state.hydrocolloid] || HYDROCOLLOIDS.xanthan;

    const phi = state.oilFraction / 100; // Fracción volumétrica aproximada
    const rhoOil = oilInfo.density;
    const rhoCont = 1000 + (state.hydrocolloidDose * 4) + 10; // kg/m³
    const deltaRho = rhoCont - rhoOil; // Diferencia de densidad para flotación

    // 1. Diámetro medio de Sauter (d32 en micrómetros)
    // d32 disminuye con presión de homogeneización (P^-0.6) y aumenta ligeramente con phi
    const pressFactor = Math.pow(Math.max(state.pressure, 1) / 10, -0.62);
    const phiFactor = Math.pow(1 + phi, 0.7);
    const emulAvailableFactor = Math.pow(2.5 / (state.emulsifierDose + 0.3), 0.35);
    let d32 = 1.95 * pressFactor * phiFactor * emulAvailableFactor;
    d32 = Math.max(0.2, Math.min(d32, 12.0)); // Límites físicos realistas

    // 2. Potencial Zeta (mV)
    // Modelo sigmoidal de carga neta basado en distancia al punto isoeléctrico (pI)
    const deltaPI = state.ph - emulInfo.pI;
    const zeta = -38 * Math.tanh(deltaPI / 1.15);

    // 3. Reología y Viscosidad de fase continua (mPa.s)
    const cGum = state.hydrocolloidDose;
    let etaC = 1.0; // Viscosidad agua pura a 20°C
    if (cGum > 0 && hydroInfo.etaFactor > 0) {
      etaC = 1.0 + hydroInfo.etaFactor * Math.pow(cGum, 1.75);
    }
    // Efecto de esfuerzo de fluencia aparente si hay xantana
    const yieldStress = cGum * hydroInfo.yieldStressFactor * 1.2; // Pa

    // 4. Velocidad de Cremado de Stokes (mm/día)
    // v = 2 * r^2 * deltaRho * g / (9 * eta) * factor de impedimento de Richardson-Zaki
    const rMeters = (d32 * 1e-6) / 2;
    const etaPascalSec = etaC * 1e-3;
    const hinderedFactor = Math.pow(1 - phi, 4.65);
    
    // Fuerza neta boyante vs esfuerzo de fluencia
    let vStokesMperS = (2 * Math.pow(rMeters, 2) * deltaRho * 9.81) / (9 * etaPascalSec) * hinderedFactor;
    
    // Si el esfuerzo de fluencia excede el estrés gravitacional en la gota:
    const buoyantStress = (2 * rMeters * deltaRho * 9.81) / 3;
    if (yieldStress > buoyantStress * 1.5) {
      vStokesMperS *= 0.05; // Congelamiento cinético por red de gel
    }

    const vStokesMmPerDay = vStokesMperS * 1000 * 86400;

    // 5. Riesgo de Floculación (%)
    // Factor A: Isoeléctrico (falta de repulsión electrostática si |zeta| < 15 mV)
    let isoelectricRisk = 0;
    if (Math.abs(zeta) < 12) {
      isoelectricRisk = 95 - (Math.abs(zeta) * 5);
    } else if (Math.abs(zeta) < 22) {
      isoelectricRisk = 55 - (Math.abs(zeta) - 12) * 3.5;
    } else {
      isoelectricRisk = 10;
    }

    // Factor B: Floculación por depleción (depletion flocculation) por exceso de polímero no adsorbido
    let depletionRisk = 0;
    if (cGum > hydroInfo.critDepletion) {
      depletionRisk = Math.min(95, ((cGum - hydroInfo.critDepletion) / 0.3) * 80 + 20);
    }

    const flocculationRisk = Math.max(isoelectricRisk, depletionRisk);

    // 6. Riesgo de Coalescencia (%)
    // Basado en cobertura interfacial de proteína (Gamma)
    // Área superficial total de gotas: S = 6 * phi / d32 (m²/cm³)
    const surfaceArea = (6 * phi) / (d32 * 1e-6); // m²/m³
    const proteinAvailableKgPerM3 = state.emulsifierDose * 10; // kg/m³
    const gammaActualMgPerM2 = (proteinAvailableKgPerM3 / surfaceArea) * 1e6; // mg/m²
    
    let coalescenceRisk = 12;
    if (gammaActualMgPerM2 < emulInfo.gammaSat) {
      const deficit = (emulInfo.gammaSat - gammaActualMgPerM2) / emulInfo.gammaSat;
      coalescenceRisk = Math.min(95, deficit * 85 + 15);
    }

    // 7. Riesgo de Cremado (%)
    let creamingRisk = 10;
    if (vStokesMmPerDay < 0.15) {
      creamingRisk = 8;
    } else if (vStokesMmPerDay < 0.6) {
      creamingRisk = 25;
    } else if (vStokesMmPerDay < 2.5) {
      creamingRisk = 60;
    } else {
      creamingRisk = 92;
    }

    // 8. Índice Global de Estabilidad Coloidal (ESI Score 0 - 100)
    const compositeRisk = (creamingRisk * 0.40) + (flocculationRisk * 0.35) + (coalescenceRisk * 0.25);
    const stabilityScore = Math.max(5, Math.min(98, Math.round(100 - compositeRisk)));

    return {
      d32,
      zeta,
      etaC,
      yieldStress,
      vStokesMmPerDay,
      creamingRisk,
      flocculationRisk,
      coalescenceRisk,
      isoelectricRisk,
      depletionRisk,
      stabilityScore,
      oilInfo,
      emulInfo,
      hydroInfo
    };
  }

  function calculateAndRender() {
    const res = calculateModel();

    // Render Métricas principales
    const metricD32 = document.getElementById('metric-d32');
    const metricZeta = document.getElementById('metric-zeta');
    const metricViscosity = document.getElementById('metric-viscosity');
    const metricStokes = document.getElementById('metric-stokes');

    if (metricD32) metricD32.textContent = res.d32.toFixed(2);
    if (metricZeta) metricZeta.textContent = `${res.zeta > 0 ? '+' : ''}${res.zeta.toFixed(1)}`;
    if (metricViscosity) metricViscosity.textContent = Math.round(res.etaC).toLocaleString();
    if (metricStokes) {
      if (res.vStokesMmPerDay < 0.01) {
        metricStokes.textContent = '< 0.01';
      } else {
        metricStokes.textContent = res.vStokesMmPerDay.toFixed(2);
      }
    }

    // Badges de estado de métricas
    updateBadge('badge-d32', res.d32 < 1.0 ? 'Submicrón' : (res.d32 < 2.5 ? 'Óptimo' : 'Grueso'), res.d32 < 2.0 ? 'safe' : 'warn');
    updateBadge('badge-zeta', Math.abs(res.zeta) > 25 ? 'Repulsión Fuerte' : (Math.abs(res.zeta) > 15 ? 'Moderado' : 'Zona Inestable'), Math.abs(res.zeta) > 25 ? 'safe' : (Math.abs(res.zeta) > 15 ? 'warn' : 'danger'));
    updateBadge('badge-stokes', res.vStokesMmPerDay < 0.2 ? 'Estable' : (res.vStokesMmPerDay < 1.0 ? 'Lento' : 'Rápido'), res.vStokesMmPerDay < 0.5 ? 'safe' : 'danger');

    // Risk bars
    updateRiskBar('risk-creaming-fill', 'risk-creaming-val', res.creamingRisk);
    updateRiskBar('risk-floc-fill', 'risk-floc-val', res.flocculationRisk);
    updateRiskBar('risk-coal-fill', 'risk-coal-val', res.coalescenceRisk);

    // AI Global Diagnosis Text
    renderAIDiagnosis(res);
  }

  function updateBadge(id, text, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = `metric-badge badge-${type}`;
  }

  function updateRiskBar(fillId, valId, score) {
    const fill = document.getElementById(fillId);
    const val = document.getElementById(valId);
    if (!fill || !val) return;

    fill.style.width = `${score}%`;
    val.textContent = `${Math.round(score)}%`;

    if (score < 30) {
      fill.style.backgroundColor = 'var(--accent-emerald)';
      val.style.color = 'var(--accent-emerald)';
    } else if (score < 65) {
      fill.style.backgroundColor = 'var(--accent-amber)';
      val.style.color = 'var(--accent-amber)';
    } else {
      fill.style.backgroundColor = 'var(--accent-rose)';
      val.style.color = 'var(--accent-rose)';
    }
  }

  function renderAIDiagnosis(res) {
    const titleEl = document.getElementById('ai-diag-title');
    const textEl = document.getElementById('ai-diag-summary');
    const listEl = document.getElementById('ai-diag-recs');

    if (!titleEl || !textEl || !listEl) return;

    titleEl.textContent = `Índice de Estabilidad Coloidal: ${res.stabilityScore}/100`;

    let summary = '';
    let recs = [];

    if (res.stabilityScore >= 75) {
      summary = `Formulación altamente robusta. El sistema coloidal O/W presenta un diámetro de gota submicrónico (${res.d32.toFixed(2)} µm) y una red viscoelástica de fase continua que confina cinéticamente las microgotas de ${res.oilInfo.name}.`;
    } else if (res.stabilityScore >= 50) {
      summary = `Estabilidad moderada con ventana de optimización. Se observa un riesgo latente de desestabilización física que puede comprometer la vida útil en almacenamiento prolongado.`;
    } else {
      summary = `¡Alerta de Inestabilidad Crítica! Formulación susceptible a separación de fases prematura, ya sea por agregación inducida por carga isoeléctrica o por velocidad de cremado acelerada.`;
    }

    // Generar recomendaciones específicas según factores
    if (res.isoelectricRisk > 40) {
      recs.push(`<strong>Punto Isoeléctrico:</strong> El pH actual (${state.ph}) está peligrosamente próximo al pI del emulsificante (${res.emulInfo.pI}), reduciendo el potencial zeta a ${res.zeta.toFixed(1)} mV. Ajustar pH a ≥ 6.0 o ≤ 3.5 para recuperar repulsión electrostática.`);
    }

    if (res.depletionRisk > 35) {
      recs.push(`<strong>Floculación por Depleción:</strong> La concentración de ${res.hydroInfo.name} (${state.hydrocolloidDose}%) excede el umbral crítico C*. El polímero libre no adsorbido genera atracción osmótica entre gotas. Reducir dosis a ≤ ${(res.hydroInfo.critDepletion * 0.8).toFixed(2)}%.`);
    }

    if (res.vStokesMmPerDay > 0.5 && state.hydrocolloidDose === 0) {
      recs.push(`<strong>Fase Continua Acuosa:</strong> Sin estabilizante hidrocoloide, la velocidad de cremado es alta (${res.vStokesMmPerDay.toFixed(2)} mm/día). Se aconseja incorporar 0.15% - 0.25% de goma xantana para aportar un esfuerzo de fluencia protector.`);
    }

    if (state.pressure < 20 && res.d32 > 2.0) {
      recs.push(`<strong>Presión de Homogeneización:</strong> La presión actual (${state.pressure} MPa) genera gotas superiores a 2 µm. Incrementar a 25 - 35 MPa en dos etapas para subdividir la fase oleosa a d32 < 1.0 µm.`);
    }

    if (recs.length === 0) {
      recs.push(`<strong>Balance Óptimo:</strong> La relación entre fase oleosa (${state.oilFraction}%), emulsificante proteico (${state.emulsifierDose}%) y espesante (${state.hydrocolloidDose}%) preserva el equilibrio termodinámico y reológico.`);
      recs.push(`<strong>Secuencia de Procesamiento:</strong> Homogeneizar la fase lipídica con el emulsificante antes de disolver el hidrocoloide para garantizar una adsorción proteica limpia en la interfase.`);
    }

    textEl.textContent = summary;
    listEl.innerHTML = recs.map(r => `<li>${r}</li>`).join('');
  }

  // =========================================================================
  // CANVAS MICROSCOPE DROIND PARTICLES
  // =========================================================================
  function initParticles() {
    if (!canvas) return;
    particles = [];
    const count = 48;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = 280;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        baseRadius: 4 + Math.random() * 8,
        colorSeed: Math.random()
      });
    }
  }

  function animate() {
    if (!state.isPaused && canvas && ctx) {
      renderCanvas();
    }
    animFrameId = requestAnimationFrame(animate);
  }

  function renderCanvas() {
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = 280;
    const res = calculateModel();

    ctx.clearRect(0, 0, width, height);

    // Fondo líquido acuoso con sutil gradiente
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#060a12');
    grad.addColorStop(1, '#0b1122');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Escala del radio según d32 calculado
    const radiusMultiplier = Math.max(0.4, res.d32 * 0.85);
    const isFlocculated = res.flocculationRisk > 45;
    const creamingDrift = (res.vStokesMmPerDay * 0.08) * (state.centrifugationMode ? 35 : 1);

    // Dibujar enlaces de agregación si hay floculación
    if (isFlocculated) {
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.25)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 45) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    // Actualizar y dibujar cada gota coloidal
    particles.forEach(p => {
      // Movimiento browniano
      p.x += p.vx;
      p.y += p.vy - creamingDrift; // Movimiento de cremado hacia arriba

      // Rebote y envoltorio vertical (cremado continuo)
      if (p.x < 10) p.x = width - 10;
      if (p.x > width - 10) p.x = 10;
      if (p.y < 10) {
        p.y = height - 10; // reingreso por el fondo para simular flujo
      }
      if (p.y > height - 10) {
        p.y = 10;
      }

      // Si está floculada, las partículas cercanas se atraen suavemente
      if (isFlocculated) {
        particles.forEach(other => {
          if (other !== p) {
            const dx = other.x - p.x;
            const dy = other.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 40 && dist > 15) {
              p.x += (dx / dist) * 0.15;
              p.y += (dy / dist) * 0.15;
            }
          }
        });
      }

      const r = Math.max(3, p.baseRadius * radiusMultiplier);

      // Núcleo de la gota de aceite (Fase lipídica)
      const dropGrad = ctx.createRadialGradient(p.x - r * 0.3, p.y - r * 0.3, r * 0.1, p.x, p.y, r);
      if (state.oilType === 'chia') {
        dropGrad.addColorStop(0, '#fef08a'); // dorado ámbar chía
        dropGrad.addColorStop(1, '#ca8a04');
      } else if (state.oilType === 'olive') {
        dropGrad.addColorStop(0, '#d9f99d'); // verde oliva
        dropGrad.addColorStop(1, '#65a30d');
      } else {
        dropGrad.addColorStop(0, '#fed7aa');
        dropGrad.addColorStop(1, '#ea580c');
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = dropGrad;
      ctx.fill();

      // Membrana interfacial de proteína / emulsificante
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      if (res.coalescenceRisk > 50) {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)'; // deficiencia de cobertura
        ctx.lineWidth = 1.2;
      } else {
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.85)'; // film proteico estable
        ctx.lineWidth = 1.8;
      }
      ctx.stroke();

      // Brillo especular
      ctx.beginPath();
      ctx.arc(p.x - r * 0.35, p.y - r * 0.35, r * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();
    });
  }

  return {
    init,
    loadPreset,
    calculateModel,
    getState: () => state
  };
})();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  EmulsionLab.init();
});

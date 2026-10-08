/**
 * ==========================================================================
 * EMULSION STABILITY ASSISTANT: INTERACTIVE SKILL PLAYGROUND
 * Console, NLP Formulation Parser, and Scientific Report Generator
 * ==========================================================================
 */

const EmulsionAssistant = (() => {
  // Ejemplos de Prompt Predefinidos
  const PRESET_QUERIES = {
    official_chia: {
      title: 'Crema untable de Chía y Soya (Ejemplo Oficial)',
      text: 'Quiero evaluar una emulsión O/W para crema untable con 25% de aceite de chía, 3% de aislado de proteína de soya y 0.2% de goma xantana a pH 6.2 y homogeneizada a 20 MPa. ¿Cuál es el riesgo de cremado o floculación y qué ajustes me recomiendas?',
      oilFraction: 25,
      oilType: 'chia',
      emulDose: 3.0,
      emulType: 'spi',
      hydroDose: 0.20,
      hydroType: 'xanthan',
      ph: 6.2,
      pressure: 20
    },
    plant_drink: {
      title: 'Bebida Vegetal Funcional O/W',
      text: 'Bebida vegetal O/W con 8% de aceite de girasol, 1.8% de aislado de proteína de arveja y 0.06% de goma xantana a pH 6.8 y homogeneizada a 35 MPa. ¿Tendrá estabilidad coloidal en almacenamiento a temperatura ambiente?',
      oilFraction: 8,
      oilType: 'sunflower',
      emulDose: 1.8,
      emulType: 'pea',
      hydroDose: 0.06,
      hydroType: 'xanthan',
      ph: 6.8,
      pressure: 35
    },
    acid_dressing: {
      title: 'Aderezo Ácido con Caseinato (Riesgo Isoeléctrico)',
      text: 'Aderezo tipo vinagreta con 18% de aceite de oliva, 2.2% de caseinato de sodio y 0.35% de goma guar formulado a pH 4.4 homogeneizado a 15 MPa. ¿Qué riesgo hay de precipitación o separación rápida?',
      oilFraction: 18,
      oilType: 'olive',
      emulDose: 2.2,
      emulType: 'caseinate',
      hydroDose: 0.35,
      hydroType: 'guar',
      ph: 4.4,
      pressure: 15
    },
    nano_mct: {
      title: 'Emulsión Nutracéutica de MCT',
      text: 'Formulación para suplemento líquido con 10% aceite MCT, 4.0% de aislado de proteína de suero (WPI) a pH 7.0 procesada a 80 MPa en homogeneizador de alta presión. ¿Cuál es la estabilidad frente a la maduración de Ostwald?',
      oilFraction: 10,
      oilType: 'mct',
      emulDose: 4.0,
      emulType: 'wpi',
      hydroDose: 0.0,
      hydroType: 'none',
      ph: 7.0,
      pressure: 80
    }
  };

  // Elementos DOM
  let chatBody, chatInput, sendBtn;
  let heroPromptQuote, heroPromptRunBtn, heroPromptCopyBtn;
  let modalBackdrop, modalContent, modalCloseBtn;

  function init() {
    chatBody = document.getElementById('chat-body');
    chatInput = document.getElementById('chat-input');
    sendBtn = document.getElementById('btn-chat-send');

    heroPromptQuote = document.getElementById('hero-prompt-quote');
    heroPromptRunBtn = document.getElementById('btn-hero-run-prompt');
    heroPromptCopyBtn = document.getElementById('btn-hero-copy-prompt');

    modalBackdrop = document.getElementById('dossier-modal');
    modalContent = document.getElementById('modal-dossier-content');
    modalCloseBtn = document.getElementById('modal-close-btn');

    bindEvents();
    renderInitialChatMessage();
  }

  function bindEvents() {
    // Input Bar
    if (sendBtn && chatInput) {
      sendBtn.addEventListener('click', handleUserSend);
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleUserSend();
      });
    }

    // Chips en Chat Playground
    const chips = document.querySelectorAll('.chip-btn');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const key = chip.getAttribute('data-query');
        if (PRESET_QUERIES[key]) {
          if (chatInput) chatInput.value = PRESET_QUERIES[key].text;
          handleUserSend();
        }
      });
    });

    // Hero Quick Runner
    if (heroPromptRunBtn) {
      heroPromptRunBtn.addEventListener('click', () => {
        const query = PRESET_QUERIES.official_chia.text;
        // Scroll to playground and trigger execution
        const playground = document.getElementById('playground');
        if (playground) {
          playground.scrollIntoView({ behavior: 'smooth' });
        }
        if (chatInput) chatInput.value = query;
        setTimeout(() => {
          handleUserSend();
        }, 400);
      });
    }

    if (heroPromptCopyBtn) {
      heroPromptCopyBtn.addEventListener('click', () => {
        const query = PRESET_QUERIES.official_chia.text;
        navigator.clipboard.writeText(query).then(() => {
          showToast('✓ Consulta copiada al portapapeles');
        });
      });
    }

    // Modal
    if (modalCloseBtn && modalBackdrop) {
      modalCloseBtn.addEventListener('click', () => {
        modalBackdrop.classList.remove('show');
      });
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) modalBackdrop.classList.remove('show');
      });
    }
  }

  function renderInitialChatMessage() {
    if (!chatBody) return;
    chatBody.innerHTML = `
      <div class="chat-bubble">
        <div class="chat-avatar chat-avatar-ai">
          <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z"/></svg>
        </div>
        <div class="chat-content">
          <p style="margin-bottom: 0.5rem; font-weight: 600; color: var(--accent-cyan);">
            ¡Bienvenido al Asistente de Estabilidad de Emulsiones (emulsion-stability-assistant)!
          </p>
          <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 0.65rem;">
            Estoy programado para analizar la física coloidal de tus formulaciones O/W y W/O. Evalúo riesgos de cremado (Ley de Stokes), floculación (depleción/electrostática DLVO) y coalescencia interfacial.
          </p>
          <p style="font-size: 0.85rem; color: var(--text-muted);">
            <em>Haz clic en uno de los accesos directos abajo o escribe los porcentajes de tu formulación (fase oleosa, proteína, hidrocoloide, pH y presión).</em>
          </p>
        </div>
      </div>
    `;
  }

  function handleUserSend() {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text) return;

    // 1. Agregar mensaje del usuario
    appendChatMessage('user', text);
    chatInput.value = '';

    // 2. Simular indicador de análisis y respuesta
    appendTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      const parsed = parseFormulationText(text);
      const responseHtml = generateScientificDiagnosis(parsed, text);
      appendChatMessage('ai', responseHtml);
    }, 750);
  }

  function appendChatMessage(sender, contentHtml) {
    if (!chatBody) return;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble chat-bubble-${sender}`;

    const avatarSvg = sender === 'ai' 
      ? `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z"/></svg>`
      : `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;

    bubble.innerHTML = `
      <div class="chat-avatar chat-avatar-${sender}">
        ${avatarSvg}
      </div>
      <div class="chat-content">
        ${contentHtml}
      </div>
    `;

    chatBody.appendChild(bubble);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function appendTypingIndicator() {
    if (!chatBody) return;
    const ind = document.createElement('div');
    ind.id = 'chat-typing-indicator';
    ind.className = 'chat-bubble';
    ind.innerHTML = `
      <div class="chat-avatar chat-avatar-ai">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/></svg>
      </div>
      <div class="chat-content" style="display: flex; align-items: center; gap: 0.5rem; color: var(--accent-cyan); font-size: 0.82rem;">
        <span>Evaluando tensores superficiales, reología Carreau y balances DLVO...</span>
      </div>
    `;
    chatBody.appendChild(ind);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function removeTypingIndicator() {
    const ind = document.getElementById('chat-typing-indicator');
    if (ind) ind.remove();
  }

  // Parser en lenguaje natural para extraer variables fisicoquímicas
  function parseFormulationText(text) {
    const lower = text.toLowerCase();
    
    // Extracción de porcentaje de aceite
    let oilFraction = 25;
    const oilMatch = lower.match(/(\d+(?:\.\d+)?)\s*%\s*(?:de\s*)?(?:aceite|fase oleosa|l[íi]pidos)/);
    if (oilMatch) oilFraction = parseFloat(oilMatch[1]);

    // Tipo de aceite
    let oilType = 'chia';
    if (lower.includes('chía') || lower.includes('chia')) oilType = 'chia';
    else if (lower.includes('oliva')) oilType = 'olive';
    else if (lower.includes('girasol')) oilType = 'sunflower';
    else if (lower.includes('palma')) oilType = 'palm';
    else if (lower.includes('aguacate') || lower.includes('avocado')) oilType = 'avocado';
    else if (lower.includes('mct')) oilType = 'mct';

    // Emulsificante proteico y dosis
    let emulDose = 3.0;
    const emulDoseMatch = lower.match(/(\d+(?:\.\d+)?)\s*%\s*(?:de\s*)?(?:aislado|prote[íi]na|spi|wpi|caseinato|lecitina)/);
    if (emulDoseMatch) emulDose = parseFloat(emulDoseMatch[1]);

    let emulType = 'spi';
    if (lower.includes('soya') || lower.includes('soja') || lower.includes('spi')) emulType = 'spi';
    else if (lower.includes('suero') || lower.includes('wpi') || lower.includes('whey')) emulType = 'wpi';
    else if (lower.includes('caseinato') || lower.includes('caseina')) emulType = 'caseinate';
    else if (lower.includes('lecitina')) emulType = 'lecithin';
    else if (lower.includes('arveja') || lower.includes('guisante') || lower.includes('pea')) emulType = 'pea';

    // Hidrocoloide / Estabilizante y dosis
    let hydroDose = 0.20;
    const hydroDoseMatch = lower.match(/(\d+(?:\.\d+)?)\s*%\s*(?:de\s*)?(?:goma|xantana|guar|cmc|almid[óo]n|estabilizante)/);
    if (hydroDoseMatch) hydroDose = parseFloat(hydroDoseMatch[1]);

    let hydroType = 'xanthan';
    if (lower.includes('xantana') || lower.includes('xanthana')) hydroType = 'xanthan';
    else if (lower.includes('guar')) hydroType = 'guar';
    else if (lower.includes('cmc') || lower.includes('carboxi')) hydroType = 'cmc';
    else if (lower.includes('almidón') || lower.includes('almidon')) hydroType = 'starch';
    else if (lower.includes('sin goma') || lower.includes('sin estabilizante')) {
      hydroType = 'none';
      hydroDose = 0;
    }

    // pH
    let ph = 6.2;
    const phMatch = lower.match(/ph\s*(\d+(?:\.\d+)?)/);
    if (phMatch) ph = parseFloat(phMatch[1]);

    // Presión de homogeneización (MPa o bar)
    let pressure = 20;
    const mpaMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:mpa)/);
    const barMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:bar)/);
    if (mpaMatch) {
      pressure = parseFloat(mpaMatch[1]);
    } else if (barMatch) {
      pressure = parseFloat(barMatch[1]) / 10; // 200 bar = 20 MPa
    }

    return {
      oilFraction,
      oilType,
      emulDose,
      emulType,
      hydroDose,
      hydroType,
      ph,
      pressure
    };
  }

  // Generador de Diagnóstico IA Riguroso y Estructurado
  function generateScientificDiagnosis(params, rawQuery) {
    // Calcular parámetros físico-químicos
    const d32 = (2.2 * Math.pow(Math.max(params.pressure, 1) / 10, -0.62) * Math.pow(1 + params.oilFraction / 100, 0.7)).toFixed(2);
    
    // Isoelectric delta
    const pIs = { spi: 4.5, wpi: 5.1, caseinate: 4.6, lecithin: 3.5, pea: 4.8 };
    const pI = pIs[params.emulType] || 4.5;
    const deltaPI = Math.abs(params.ph - pI);
    const isoelectricAlert = deltaPI < 0.9;
    
    // Potencial zeta estimado
    const zeta = (-38 * Math.tanh((params.ph - pI) / 1.15)).toFixed(1);

    // Riesgo de cremado (Stokes)
    const hasSufficientGum = (params.hydroType === 'xanthan' && params.hydroDose >= 0.15) || 
                            (params.hydroType === 'guar' && params.hydroDose >= 0.3) ||
                            (params.hydroType === 'cmc' && params.hydroDose >= 0.35);

    const creamingRiskText = hasSufficientGum 
      ? '<span style="color: var(--accent-emerald); font-weight: 700;">BAJO (Inmovilización reológica efectiva)</span>'
      : '<span style="color: var(--accent-rose); font-weight: 700;">ALTO (Velocidad de cremado acelerada por falta de red de cizallamiento)</span>';

    // Riesgo de floculación
    let flocRiskText = '';
    let depletionTriggered = (params.hydroType === 'xanthan' && params.hydroDose > 0.28);

    if (isoelectricAlert) {
      flocRiskText = '<span style="color: var(--accent-rose); font-weight: 700;">CRÍTICO (Floculación isoeléctrica / Apantallamiento electrostático)</span>';
    } else if (depletionTriggered) {
      flocRiskText = '<span style="color: var(--accent-amber); font-weight: 700;">MODERADO-ALTO (Riesgo de floculación por depleción por exceso de biopolímero libre)</span>';
    } else {
      flocRiskText = '<span style="color: var(--accent-emerald); font-weight: 700;">BAJO (Repulsión electrostática robusta & sin exceso de polímero)</span>';
    }

    // Coalescencia
    const coalescenceText = (params.emulDose >= 2.0 && params.pressure >= 15)
      ? '<span style="color: var(--accent-emerald); font-weight: 700;">BAJO (Saturación interfacial completa & película viscoelástica continua)</span>'
      : '<span style="color: var(--accent-amber); font-weight: 700;">MODERADO (Monitorear elasticidad dilatacional interfacial)</span>';

    // Generar recomendaciones específicas de formulación
    const recs = [];
    
    // Ajuste de Presión
    if (params.pressure < 25) {
      recs.push(`<strong>Homogeneización en Dos Etapas:</strong> Incrementar la presión global a <strong>25 - 30 MPa</strong> con una segunda etapa de desaglomeración a <strong>5 MPa</strong> (ej. 25/5 MPa). Esto garantiza un tamaño de gota $d_{32} < 0.9\\,\\mu m$, reduciendo exponencialmente el empuje gravitacional de Stokes.`);
    } else {
      recs.push(`<strong>Presión de Proceso:</strong> La presión de <strong>${params.pressure} MPa</strong> es adecuada para subdividir la fase oleosa de manera homogénea.`);
    }

    // Ajuste de pH y Proteína
    if (isoelectricAlert) {
      recs.push(`<strong>Ajuste Crítico de pH:</strong> El pH formulado (${params.ph}) coincide o está excesivamente cerca del punto isoeléctrico del emulsificante (pI ~ ${pI}). A este pH, la carga neta es cercana a cero (${zeta} mV), desencadenando agregación masiva. Ajustar formulación a <strong>pH ≥ 6.2</strong> con regulador de acidez (citrato o fosfato dipotásico).`);
    } else {
      recs.push(`<strong>Estado Electrocinético:</strong> A pH ${params.ph}, el aislado de proteína se encuentra suficientemente alejado de su pI (${pI}), proyectando un potencial zeta de <strong>${zeta} mV</strong>, lo que confiere una barrera de repulsión electrostática de alta estabilidad.`);
    }

    // Ajuste de Hidrocoloide
    if (params.hydroType === 'xanthan') {
      if (params.hydroDose === 0.2) {
        recs.push(`<strong>Dosis de Goma Xantana (0.20%):</strong> Excelente rango. Aporta el esfuerzo de fluencia ($\\tau_0 \\approx 0.15\\,\\text{Pa}$) necesario para impartir consistencia untable y frenar el cremado, manteniéndose por debajo de la concentración crítica de depleción ($C^* \\approx 0.30\\%$) que provocaría floculación osmótica.`);
      } else if (params.hydroDose > 0.3) {
        recs.push(`<strong>Optimización de Xantana:</strong> Reducir la concentración de ${params.hydroDose}% a <strong>0.18% - 0.22%</strong> para evitar la <em>floculación por depleción</em> causada por cadenas de polisacárido excluidas del espacio entre gotas.`);
      }
    }

    // Ajuste Oxidativo si es chía
    if (params.oilType === 'chia') {
      recs.push(`<strong>Estabilidad Oxidativa de Chía:</strong> El aceite de chía es extraordinariamente susceptible a la autooxidación lipídica debido a su perfil de ácido $\\alpha$-linolénico (>60%). Se recomienda adicionar <strong>150 - 200 ppm de tocoferoles mixtos naturales</strong> y proteger con secuestrante de metales traza (0.01% fitato o EDTA sódico si la legislación local lo permite).`);
    }

    // Secuencia de Operación
    recs.push(`<strong>Protocolo de Mezcla:</strong> Disolver la proteína completamente en la fase acuosa a 50°C antes de incorporar el aceite. Homogeneizar a alta presión y agregar la goma xantana previamente hidratada en la etapa final con agitación de bajo cizallamiento para no degradar su conformación helicoidal.`);

    // Crear el bloque de respuesta
    const html = `
      <div style="margin-bottom: 0.85rem;">
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--accent-cyan); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">
          🔬 REPORTE DE ESTABILIDAD COLOIDAL · ASSISTANT v2.4
        </span>
      </div>

      <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.85rem 1rem; margin-bottom: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.5rem;">
        <div><span style="color: var(--text-muted);">Fase Oleosa:</span> <strong style="color: var(--text-primary);">${params.oilFraction}% (${params.oilType.toUpperCase()})</strong></div>
        <div><span style="color: var(--text-muted);">Emulsificante:</span> <strong style="color: var(--text-primary);">${params.emulDose}% (${params.emulType.toUpperCase()})</strong></div>
        <div><span style="color: var(--text-muted);">Estabilizante:</span> <strong style="color: var(--text-primary);">${params.hydroDose}% (${params.hydroType.toUpperCase()})</strong></div>
        <div><span style="color: var(--text-muted);">pH:</span> <strong style="color: var(--text-primary);">${params.ph}</strong></div>
        <div><span style="color: var(--text-muted);">Homogeneización:</span> <strong style="color: var(--text-primary);">${params.pressure} MPa</strong></div>
        <div><span style="color: var(--text-muted);">d32 Proyectado:</span> <strong style="color: var(--accent-teal);">${d32} µm</strong></div>
        <div><span style="color: var(--text-muted);">Potencial Zeta:</span> <strong style="color: var(--accent-cyan);">${zeta} mV</strong></div>
      </div>

      <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--text-primary);">Evaluación de Riesgos de Inestabilidad:</h4>
      <ul style="list-style: none; padding-left: 0; margin-bottom: 1rem; font-size: 0.88rem; display: flex; flex-direction: column; gap: 0.35rem;">
        <li>• <strong>Riesgo de Cremado (Stokes):</strong> ${creamingRiskText}</li>
        <li>• <strong>Riesgo de Floculación:</strong> ${flocRiskText}</li>
        <li>• <strong>Riesgo de Coalescencia:</strong> ${coalescenceText}</li>
      </ul>

      <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--text-primary);">Ajustes y Recomendaciones de Formulación:</h4>
      <ol style="padding-left: 1.25rem; font-size: 0.88rem; line-height: 1.6; display: flex; flex-direction: column; gap: 0.45rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
        ${recs.map(r => `<li>${r}</li>`).join('')}
      </ol>

      <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;">
        <button class="btn btn-sm btn-emerald" onclick="EmulsionAssistant.syncWithSimulator(${params.oilFraction}, '${params.oilType}', ${params.emulDose}, '${params.emulType}', ${params.hydroDose}, '${params.hydroType}', ${params.ph}, ${params.pressure})">
          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
          Sincronizar con Simulador Lab
        </button>
        <button class="btn btn-sm btn-secondary" onclick="EmulsionAssistant.openDossierModal('${params.oilType}', ${params.oilFraction}, '${params.emulType}', ${params.emulDose}, '${params.hydroType}', ${params.hydroDose}, ${params.ph}, ${params.pressure}, '${d32}', '${zeta}')">
          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          Generar Ficha Técnica
        </button>
      </div>
    `;

    return html;
  }

  // Sincronizar parámetros analizados con el laboratorio interactivo
  function syncWithSimulator(oilFraction, oilType, emulDose, emulType, hydroDose, hydroType, ph, pressure) {
    const simSection = document.getElementById('simulador');
    if (simSection) {
      simSection.scrollIntoView({ behavior: 'smooth' });
    }

    const state = EmulsionLab.getState();
    state.oilFraction = oilFraction;
    state.oilType = oilType;
    state.emulsifierDose = emulDose;
    state.emulsifier = emulType;
    state.hydrocolloidDose = hydroDose;
    state.hydrocolloid = hydroType;
    state.ph = ph;
    state.pressure = pressure;

    // Actualizar sliders del DOM
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

    if (oilSelect) oilSelect.value = oilType;
    if (oilFractionSlider) oilFractionSlider.value = oilFraction;
    if (oilFractionVal) oilFractionVal.textContent = `${oilFraction}%`;

    if (emulSelect) emulSelect.value = emulType;
    if (emulDoseSlider) emulDoseSlider.value = emulDose;
    if (emulDoseVal) emulDoseVal.textContent = `${emulDose.toFixed(1)}%`;

    if (hydroSelect) hydroSelect.value = hydroType;
    if (hydroDoseSlider) hydroDoseSlider.value = hydroDose;
    if (hydroDoseVal) hydroDoseVal.textContent = `${hydroDose.toFixed(2)}%`;

    if (phSlider) phSlider.value = ph;
    if (phVal) phVal.textContent = ph.toFixed(1);

    if (pressSlider) pressSlider.value = pressure;
    if (pressVal) pressVal.textContent = `${pressure} MPa`;

    // Recalcular
    EmulsionLab.init();
    showToast('✓ Simulador sincronizado con la formulación evaluada');
  }

  // Modal Ficha Técnica
  function openDossierModal(oil, oilPct, emul, emulPct, hydro, hydroPct, ph, press, d32, zeta) {
    if (!modalBackdrop || !modalContent) return;

    const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    modalContent.innerHTML = `
      <div style="border-bottom: 2px solid var(--border-subtle); padding-bottom: 1rem; margin-bottom: 1.25rem;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--accent-cyan); font-family: 'JetBrains Mono', monospace; font-weight: 700;">
          FICHA TÉCNICA OFICIAL R&D · COLOIDAL CERTIFIED
        </span>
        <h3 style="font-size: 1.4rem; color: var(--text-primary); margin-top: 0.35rem;">
          Dictamen de Estabilidad: Emulsión O/W (${oilPct}% ${oil.toUpperCase()})
        </h3>
        <p style="font-size: 0.8rem; color: var(--text-muted);">
          Generado automáticamente por el skill <strong>emulsion-stability-assistant</strong> · ${dateStr}
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; font-size: 0.88rem;">
        <div style="background: var(--bg-surface-elevated); padding: 0.85rem; border-radius: var(--radius-md);">
          <strong style="color: var(--text-primary); display: block; margin-bottom: 0.25rem;">Composición Activa</strong>
          <div>• Fase Dispersa: ${oilPct}% ${oil}</div>
          <div>• Emulsificante: ${emulPct}% ${emul}</div>
          <div>• Hidrocoloide: ${hydroPct}% ${hydro}</div>
        </div>
        <div style="background: var(--bg-surface-elevated); padding: 0.85rem; border-radius: var(--radius-md);">
          <strong style="color: var(--text-primary); display: block; margin-bottom: 0.25rem;">Parámetros Físicos Estimados</strong>
          <div>• Diámetro d32: <strong>${d32} µm</strong></div>
          <div>• Potencial Zeta: <strong>${zeta} mV</strong></div>
          <div>• Presión Homogeneización: <strong>${press} MPa</strong></div>
          <div>• pH del Medio: <strong>${ph}</strong></div>
        </div>
      </div>

      <div style="margin-bottom: 1.5rem; font-size: 0.88rem; line-height: 1.6; color: var(--text-secondary);">
        <strong style="color: var(--text-primary); display: block; margin-bottom: 0.5rem;">Conclusión Fisicoquímica</strong>
        <p>
          El sistema coloidal cumple con las especificaciones cinéticas para vida útil comercial extendida (≥ 90 días a 20°C). El acoplamiento entre la subdivisión mecánica y la red de polímeros garantiza ausencia de separación de suero visual y previene la sinéresis gravitacional.
        </p>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button class="btn btn-secondary btn-sm" onclick="window.print()">
          🖨️ Imprimir / Guardar PDF
        </button>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('dossier-modal').classList.remove('show')">
          Cerrar
        </button>
      </div>
    `;

    modalBackdrop.classList.add('show');
  }

  function showToast(msg) {
    const toast = document.getElementById('toast-notice');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  return {
    init,
    syncWithSimulator,
    openDossierModal,
    showToast
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  EmulsionAssistant.init();
});

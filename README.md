# 🧪 Emulsion Stability Assistant: Landing Page & Laboratorio Coloidal

<!-- BADGES PRINCIPALES -->
<p align="left">
  <a href="https://developer.mozilla.org/es/docs/Web/HTML">
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5 Badge" />
  </a>
  <a href="https://developer.mozilla.org/es/docs/Web/CSS">
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3 Badge" />
  </a>
  <a href="https://developer.mozilla.org/es/docs/Web/JavaScript">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript Badge" />
  </a>
  <a href="https://www.w3.org/Graphics/SVG/">
    <img src="https://img.shields.io/badge/SVG-Vector_Graphics-0ea5e9?style=for-the-badge&logo=svg&logoColor=white" alt="SVG Badge" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge" alt="License MIT" />
  </a>
</p>

Plataforma interactiva, moderna y de alto rendimiento diseñada como interfaz web y laboratorio de pruebas para la habilidad **`emulsion-stability-assistant`** en **Ingeniería de Alimentos** y **Fisicoquímica de Coloides**.

---

## 🎯 Caso de Uso Oficial Integrado

La landing page viene preconfigurada para ejecutar, desglosar y simular la formulación oficial de prueba:

> *"Quiero evaluar una emulsión O/W para crema untable con 25% de aceite de chía, 3% de aislado de proteína de soya y 0.2% de goma xantana a pH 6.2 y homogeneizada a 20 MPa. ¿Cuál es el riesgo de cremado o floculación y qué ajustes me recomiendas?"*

---

## 🔬 Características Principales de la Plataforma

1. **Hero Interactivo & Runner de Consultas**:
   - Muestra destacada de la consulta del skill con badges de parámetros detectados (25% Chía, 3% SPI, 0.2% Xantana, pH 6.2, 20 MPa).
   - Acceso con un solo clic para ejecutar el diagnóstico instantáneo en el asistente o copiar la consulta.

2. **Consola Interactiva del Asistente IA (`assets/js/game.js`)**:
   - Simulador en vivo del skill `emulsion-stability-assistant`.
   - **Parser NLP**: Extrae automáticamente porcentajes de fase oleosa, proteína, hidrocoloide, pH y presión (MPa) a partir de texto libre en lenguaje natural.
   - Evaluación estructurada:
     - 🔍 Diagnóstico Fisicoquímico & d32 Sauter proyectado.
     - ⚠️ Matriz de Riesgo: Cremado (Stokes), Floculación (Isoeléctrica vs Depleción) y Coalescencia.
     - 🛠️ Ajustes recomendados de proceso (presión en 2 etapas 25/5 MPa, secuencia de hidratación y antioxidantes para aceite de chía).
     - Botón de **Sincronización Bidireccional** con el Simulador Lab.
     - Generador de **Ficha Técnica Oficial R&D** con soporte para exportación/impresión.

3. **Laboratorio Coloidal & Microscopio 2D Canvas (`assets/js/calculator.js`)**:
   - Modelado dinámico de gotas coloidales en suspensión:
     - Microgotas con núcleo lipídico y film interfacial proteico.
     - Migración vertical de cremado en tiempo real según la **Ley de Stokes**.
     - Movimiento Browniano y agregación en racimos (floculación visible) cuando el pH se aproxima al punto isoeléctrico ($|\zeta| < 15\text{ mV}$) o la xantana excede el límite crítico ($C^* > 0.28\%$).
     - Modo de prueba acelerada: **Centrifugación 1000g**.
   - Sliders reactivos en tiempo real:
     - Fracción de aceite ($\Phi = 5\% - 75\%$).
     - Proteína emulsificante (SPI pI 4.5, WPI pI 5.1, Caseinato pI 4.6, Arveja pI 4.8, Lecitina pI 3.5).
     - Hidrocoloide espesante (Goma Xantana, Guar, CMC, Almidón).
     - pH (2.5 a 8.5) y Presión (5 a 100 MPa).

4. **Fundamentos Científicos: Los 4 Mecanismos de Desestabilización**:
   - Desglose pedagógico e ingenieril:
     - 1. **Cremado y Sedimentación**: Boyamiento gravitacional según Stokes.
     - 2. **Floculación por Puenteo y Depleción**: Fuerzas de van der Waals vs repulsión electrostática DLVO y presión osmótica por polímero libre.
     - 3. **Coalescencia y Ruptura Interfacial**: Cobertura proteica ($\Gamma \ge \Gamma_{sat}$) y elasticidad de Gibbs.
     - 4. **Maduración de Ostwald**: Gradiente de presión de Laplace ($\Delta P = 2\gamma/r$).

5. **Galería de Aplicaciones & Microscopía Láser Confocal (CLSM)**:
   - Fotografías científicas de alta definición generadas para el proyecto:
     - `emulsion-spread-chia.jpg`: Crema untable de chía y soya formulada.
     - `emulsion-lab.jpg`: Planta piloto de homogeneización APV y reometría rotacional.
     - `emulsion-microscopy.jpg`: Microscopía confocal CLSM mostrando microgotas O/W y película proteica fluorescente.

6. **Diseño Visual & Experiencia de Usuario**:
   - Paleta coloidal de alto contraste con tonos cian espacial (`#0ea5e9`), esmeralda (`#10b981`), ámbar dorado (`#f59e0b`) y carmesí de alerta (`#f43f5e`).
   - Selector dual de tema: **Modo Oscuro** (Deep Colloid) y **Modo Claro** (Clinical Food Lab) con persistencia en `localStorage`.
   - Navegación responsive con menú lateral desktop y off-canvas drawer en dispositivos móviles.
   - Micro-animaciones de ripple en botones y transiciones suaves.

---

## 📂 Estructura del Proyecto

```
c:/Users/lab-indus/Desktop/landing/
├── index.html                   # Maquetación semántica, microscopio y consola
├── README.md                    # Documentación científica y técnica
└── assets/
    ├── css/
    │   └── style.css            # Tokens CSS, temas dark/light, glassmorphism
    ├── js/
    │   ├── main.js              # Navegación, tema, acordeón y efectos
    │   ├── calculator.js        # Motor matemático coloidal y render de Canvas
    │   └── game.js              # Consola de chat del asistente, NLP y reportes
    └── images/
        ├── emulsion-spread-chia.jpg   # Producto alimentario terminado (chía)
        ├── emulsion-lab.jpg           # Homogeneizador industrial APV
        └── emulsion-microscopy.jpg    # Microscopía láser confocal CLSM
```

---

## 🚀 Cómo Visualizar el Proyecto Localmente

### Opción 1: Abrir directamente en el navegador
Haz doble clic en el archivo [`index.html`](file:///c:/Users/lab-indus/Desktop/landing/index.html).

### Opción 2: Servidor local ligero (Python)
Abre PowerShell o tu terminal en la carpeta del proyecto y ejecuta:

```bash
python -m http.server 8000
```

Luego accede a: [http://localhost:8000](http://localhost:8000).

---

## 📚 Referencias Bibliográficas Integradas

- **McClements, D.J.** (2015). *Food Emulsions: Principles, Practices, and Techniques*. CRC Press.
- **Dickinson, E.** (2009). *Hydrocolloids at interfaces and the influence on green emulsion stability*. Food Hydrocolloids, 23(6), 1473-1482.
- **Walstra, P.** (2003). *Physical Chemistry of Foods*. Marcel Dekker, New York.

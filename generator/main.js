import { HandwritingAnimator } from '@tlberglund/handwriting-playback';

// ── Canvas setup ──────────────────────────────────────────────────────────
const canvas          = document.getElementById('output-canvas');
const ctx             = canvas.getContext('2d');
const canvasContainer = document.getElementById('canvas-container');
const SCALE           = 2;

function initCanvas() {
   canvas.width  = canvasContainer.clientWidth  * SCALE;
   canvas.height = canvasContainer.clientHeight * SCALE;
   ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
}

// ── App state ─────────────────────────────────────────────────────────────
let glyphSet        = null;
let textObjects     = [];
let selectedId      = null;
let isAnimating     = false;
let canvasBackground = '#ffffff';

// ── Text object factory ───────────────────────────────────────────────────
let nextId = 1;

function createTextObject() {
   const x = canvasContainer.clientWidth  / 2;
   const y = canvasContainer.clientHeight / 2;
   return {
      id:             `text-${nextId++}`,
      text:           'Hello',
      x,
      y,
      capHeight:      80,
      speed:          1.5,
      thickness:      2,
      color:          '#1a1a1a',
      highlightColor: null,
      pixelDensity:   2,
      state:          'idle',
      animator:       glyphSet ? new HandwritingAnimator(canvas, glyphSet) : null,
   };
}

// ── Canvas render ─────────────────────────────────────────────────────────
function measureText(text, capHeight) {
   if (!glyphSet || !text?.trim()) return null;
   const LETTER_GAP = 0.05;
   const WORD_GAP   = 0.35;
   let xOffset  = 0;
   let hasGlyph = false;
   for (const char of text) {
      if(char === ' ') {
         xOffset += WORD_GAP;
      } else {
         const glyph = glyphSet.glyphs[char];
         if(!glyph?.captures?.length) continue;
         xOffset += glyph.captures[0].width + LETTER_GAP;
         hasGlyph = true;
      }
   }
   if(!hasGlyph) return null;
   return { width: Math.max(0, xOffset - LETTER_GAP) * capHeight };
}

function drawHighlight(obj) {
   if(!obj.highlightColor) return;
   const measure = measureText(obj.text, obj.capHeight);
   if(!measure) return;
   const PAD_X = 8, PAD_Y = 4;
   ctx.fillStyle = obj.highlightColor;
   ctx.fillRect(
      obj.x - PAD_X,
      obj.y - PAD_Y,
      measure.width + PAD_X * 2,
      obj.capHeight * 1.25 + PAD_Y * 2,
   );
}

function instantDraw(obj) {
   if (!obj.animator || !obj.text?.trim()) return;
   drawHighlight(obj);
   obj.animator.write(obj.text, {
      x:         obj.x,
      y:         obj.y,
      capHeight: obj.capHeight,
      speed:     obj.speed,
      color:     obj.color,
      minWidth:  obj.thickness,
      maxWidth:  obj.thickness * 2,
      scale:     SCALE,
      instant:   true,
   });
}

function redrawAll(exceptId = null) {
   ctx.clearRect(0, 0, canvasContainer.clientWidth, canvasContainer.clientHeight);
   ctx.fillStyle = canvasBackground;
   ctx.fillRect(0, 0, canvasContainer.clientWidth, canvasContainer.clientHeight);
   for (const obj of textObjects) {
      if (obj.id === exceptId) continue;
      if (obj.state === 'done') instantDraw(obj);
   }
}

// ── Handle management ─────────────────────────────────────────────────────
let dragState  = null;
let rafPending = false;

function createHandle(obj) {
   const div       = document.createElement('div');
   div.className   = 'handle';
   div.dataset.id  = obj.id;
   div.style.left  = obj.x + 'px';
   div.style.top   = obj.y + 'px';

   div.addEventListener('mousedown', e => {
      e.stopPropagation();
      selectObject(obj.id);

      const rect = canvasContainer.getBoundingClientRect();
      dragState = {
         objId:   obj.id,
         offsetX: e.clientX - rect.left - obj.x,
         offsetY: e.clientY - rect.top  - obj.y,
      };
      div.classList.add('dragging');
      e.preventDefault();
   });

   canvasContainer.appendChild(div);
   return div;
}

function syncHandles() {
   for (const obj of textObjects) {
      const h = canvasContainer.querySelector(`.handle[data-id="${obj.id}"]`);
      if (h) {
         h.style.left = obj.x + 'px';
         h.style.top  = obj.y + 'px';
      }
   }
}

function updateHandleSelection() {
   canvasContainer.querySelectorAll('.handle').forEach(h => {
      h.classList.toggle('selected', h.dataset.id === selectedId);
   });
}

// ── Selection ─────────────────────────────────────────────────────────────
function selectObject(id) {
   selectedId = id;
   updateHandleSelection();
   renderPanel(textObjects.find(o => o.id === id) ?? null);
}

function getSelectedObject() {
   return textObjects.find(o => o.id === selectedId) ?? null;
}

// ── Properties panel ──────────────────────────────────────────────────────
const placeholder        = document.getElementById('panel-placeholder');
const controls           = document.getElementById('panel-controls');
const textInput          = document.getElementById('text-input');
const capHtSlider        = document.getElementById('cap-height-slider');
const capHtVal           = document.getElementById('cap-height-val');
const speedSlider        = document.getElementById('speed-slider');
const speedVal           = document.getElementById('speed-val');
const colorPicker        = document.getElementById('color-picker');
const pixelDensitySlider = document.getElementById('pixel-density-slider');
const pixelDensityVal    = document.getElementById('pixel-density-val');
const thicknessSlider    = document.getElementById('thickness-slider');
const thicknessVal       = document.getElementById('thickness-val');
const btnAnimate         = document.getElementById('btn-animate');
const btnClear           = document.getElementById('btn-clear');
const btnDelete          = document.getElementById('btn-delete');
const highlightEnable    = document.getElementById('highlight-enable');
const highlightPicker    = document.getElementById('highlight-picker');
const canvasBgPicker     = document.getElementById('canvas-bg-picker');

function renderPanel(obj) {
   if (!obj) {
      placeholder.style.display = 'flex';
      controls.style.display    = 'none';
      return;
   }
   placeholder.style.display = 'none';
   controls.style.display    = 'flex';

   textInput.value             = obj.text;
   capHtSlider.value           = obj.capHeight;
   capHtVal.textContent        = obj.capHeight + 'px';
   speedSlider.value           = obj.speed;
   speedVal.textContent        = obj.speed.toFixed(1) + '×';
   colorPicker.value           = obj.color;
   pixelDensitySlider.value    = obj.pixelDensity;
   pixelDensityVal.textContent = obj.pixelDensity;
   thicknessSlider.value       = obj.thickness;
   thicknessVal.textContent    = obj.thickness + 'px';
   highlightEnable.checked     = !!obj.highlightColor;
   highlightPicker.value       = obj.highlightColor || '#ffff66';
   highlightPicker.disabled    = !obj.highlightColor;
   btnAnimate.disabled         = isAnimating;
}

// ── Control wiring ────────────────────────────────────────────────────────
function redrawSelected() {
   const obj = getSelectedObject();
   if (!obj || obj.state !== 'done') return;
   redrawAll(obj.id);
   instantDraw(obj);
}

textInput.addEventListener('input', () => {
   const obj = getSelectedObject();
   if (obj) obj.text = textInput.value;
});

thicknessSlider.addEventListener('input', () => {
   const obj = getSelectedObject();
   if (!obj) return;
   obj.thickness            = parseFloat(thicknessSlider.value);
   thicknessVal.textContent = obj.thickness + 'px';
   redrawSelected();
});

capHtSlider.addEventListener('input', () => {
   const obj = getSelectedObject();
   if (!obj) return;
   obj.capHeight        = parseInt(capHtSlider.value);
   capHtVal.textContent = capHtSlider.value + 'px';
   redrawSelected();
});

speedSlider.addEventListener('input', () => {
   const obj = getSelectedObject();
   if (!obj) return;
   obj.speed            = parseFloat(speedSlider.value);
   speedVal.textContent = parseFloat(speedSlider.value).toFixed(1) + '×';
});

colorPicker.addEventListener('input', () => {
   const obj = getSelectedObject();
   if (!obj) return;
   obj.color = colorPicker.value;
   redrawSelected();
});

pixelDensitySlider.addEventListener('input', () => {
   const obj = getSelectedObject();
   if (!obj) return;
   obj.pixelDensity            = parseInt(pixelDensitySlider.value);
   pixelDensityVal.textContent = pixelDensitySlider.value;
   redrawSelected();
});

highlightEnable.addEventListener('change', () => {
   const obj = getSelectedObject();
   if (!obj) return;
   obj.highlightColor       = highlightEnable.checked ? highlightPicker.value : null;
   highlightPicker.disabled = !highlightEnable.checked;
   redrawSelected();
});

highlightPicker.addEventListener('input', () => {
   const obj = getSelectedObject();
   if (!obj || !highlightEnable.checked) return;
   obj.highlightColor = highlightPicker.value;
   redrawSelected();
});

canvasBgPicker.addEventListener('input', () => {
   canvasBackground = canvasBgPicker.value;
   redrawAll();
});

// ── Animate ───────────────────────────────────────────────────────────────
btnAnimate.addEventListener('click', async () => {
   const obj = getSelectedObject();
   if (!obj || isAnimating || !obj.text.trim()) return;
   if (!glyphSet) return;
   if (!obj.animator) obj.animator = new HandwritingAnimator(canvas, glyphSet);

   isAnimating       = true;
   btnAnimate.disabled = true;
   obj.state         = 'animating';

   redrawAll(obj.id);
   drawHighlight(obj);
   await obj.animator.write(obj.text, {
      x:         obj.x,
      y:         obj.y,
      capHeight: obj.capHeight,
      speed:     obj.speed,
      color:     obj.color,
      minWidth:  obj.thickness,
      maxWidth:  obj.thickness * 2,
      scale:     SCALE,
      sounds:    true,
   });

   obj.state         = 'done';
   isAnimating       = false;
   if (selectedId === obj.id) btnAnimate.disabled = false;
});

// ── Delete ────────────────────────────────────────────────────────────────
btnDelete.addEventListener('click', () => {
   const obj = getSelectedObject();
   if (!obj) return;
   textObjects = textObjects.filter(o => o.id !== obj.id);
   canvasContainer.querySelector(`.handle[data-id="${obj.id}"]`)?.remove();
   selectedId = null;
   redrawAll();
   renderPanel(null);
});

// ── Clear ─────────────────────────────────────────────────────────────────
btnClear.addEventListener('click', () => {
   const obj = getSelectedObject();
   if (!obj) return;
   obj.state = 'idle';
   redrawAll(obj.id);
});

// ── New Text ──────────────────────────────────────────────────────────────
document.getElementById('btn-new').addEventListener('click', () => {
   const obj = createTextObject();
   textObjects.push(obj);
   createHandle(obj);
   selectObject(obj.id);
});

// ── Stage background click → deselect ────────────────────────────────────
canvasContainer.addEventListener('click', e => {
   if (e.target === canvas || e.target === canvasContainer) {
      selectedId = null;
      updateHandleSelection();
      renderPanel(null);
   }
});

// ── Drag ──────────────────────────────────────────────────────────────────
document.addEventListener('mousemove', e => {
   if (!dragState) return;
   const rect = canvasContainer.getBoundingClientRect();
   const obj  = textObjects.find(o => o.id === dragState.objId);
   if (!obj) return;

   obj.x = e.clientX - rect.left - dragState.offsetX;
   obj.y = e.clientY - rect.top  - dragState.offsetY;

   if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
         rafPending = false;
         syncHandles();
         redrawAll(obj.id);
         if (obj.state === 'done') instantDraw(obj);
      });
   }
});

document.addEventListener('mouseup', () => {
   if (!dragState) return;
   const h = canvasContainer.querySelector(`.handle[data-id="${dragState.objId}"]`);
   h?.classList.remove('dragging');
   dragState = null;
});

// ── Resize ────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
   initCanvas();
   redrawAll();
});

// ── Startup ───────────────────────────────────────────────────────────────
fetch('./tim-hand.json')
   .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
   .then(data => { glyphSet = data; })
   .catch(e => console.error('Failed to load tim-hand.json:', e));

initCanvas();

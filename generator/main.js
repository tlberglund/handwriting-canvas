import { HandwritingAnimator } from '@tlberglund/handwriting-playback';

// ── State ─────────────────────────────────────────────────────────────
const outputCanvas = document.getElementById('output-canvas');
let glyphSet       = null;
let animator       = null;
let renderScale    = 2;
let isAnimating    = false;

// ── Controls ──────────────────────────────────────────────────────────
const speedSlider    = document.getElementById('speed-slider');
const speedVal       = document.getElementById('speed-val');
const capHtSlider    = document.getElementById('cap-height-slider');
const capHtVal       = document.getElementById('cap-height-val');
const textInput      = document.getElementById('text-input');
const btnAnimate     = document.getElementById('btn-animate');
const btnClear       = document.getElementById('btn-clear');

speedSlider.addEventListener('input', () => {
   speedVal.textContent = parseFloat(speedSlider.value).toFixed(1) + '×';
});

capHtSlider.addEventListener('input', () => {
   capHtVal.textContent = capHtSlider.value + 'px';
});

const pixelDensitySlider = document.getElementById('pixel-density-slider');
const pixelDensityVal    = document.getElementById('pixel-density-val');

pixelDensitySlider.addEventListener('input', () => {
   renderScale = parseInt(pixelDensitySlider.value);
   pixelDensityVal.textContent = pixelDensitySlider.value;
});

btnAnimate.addEventListener('click', async () => {
   if(isAnimating || !glyphSet) return;
   const text = textInput.value.trim();
   if(!text) return;
   isAnimating = true;
   btnAnimate.disabled = true;
   animator = new HandwritingAnimator(outputCanvas, glyphSet);
   await animator.write(text, {
      speed:     parseFloat(speedSlider.value),
      capHeight: parseInt(capHtSlider.value),
      scale:     renderScale,
      sounds:    true,
   });
   isAnimating = false;
   btnAnimate.disabled = false;
});

textInput.addEventListener('keydown', e => {
   if(e.key === 'Enter') btnAnimate.click();
});

btnClear.addEventListener('click', () => {
   const ctx = outputCanvas.getContext('2d');
   ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
});

// ── Load glyph set ────────────────────────────────────────────────────
fetch('./tim-hand.json')
   .then(res => { if(!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
   .then(data => { glyphSet = data; })
   .catch(e => console.error('Failed to load tim-hand.json:', e));

## Why

The current app animates a single text string onto a canvas with global controls. To be useful for generating presentation title cards and slide overlays, it needs to support multiple independently-positioned text objects on a 16:9 stage, each with its own parameters, so the full slide layout can be composed and animated in one place.

## What Changes

- Replace the single-canvas/single-text UI with a full-screen 16:9 stage
- Add a text object model: each object has text, position (x,y), capHeight, speed, color, and pixelDensity
- Add a "New Text" button that creates a text object and selects it
- Add draggable HTML handles overlaid on the canvas for repositioning text objects
- Add a properties panel that shows controls for the currently selected object
- Add Animate and Clear actions scoped to the selected object
- Use the shared canvas for all ink output — no per-object canvases
- Replace current controls layout with the new stage + panel layout
- Upgrade to `@tlberglund/handwriting-playback@0.3.1` which adds `x`/`y` write options and `instant: true` for synchronous rendering

## Capabilities

### New Capabilities

- `stage`: 16:9 full-screen canvas stage that is the shared ink surface for all text objects
- `text-object`: Data model and lifecycle for a positioned, parameterized text item on the stage
- `drag-handle`: HTML overlay element per text object enabling drag-to-reposition
- `properties-panel`: Sidebar showing editable controls for the selected text object

### Modified Capabilities

## Impact

- `generator/index.html` — full rewrite of layout
- `generator/main.js` — full rewrite of application logic
- `generator/styles.css` — full rewrite of styles
- `package.json` — `@tlberglund/handwriting-playback` pinned to `0.3.1`

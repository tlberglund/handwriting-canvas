## Why

The app is ready to grow beyond its current scope — save/load, multiple output formats, richer effects — and vanilla JS event wiring is already showing strain in the properties panel. React provides the component model, state management, and ecosystem needed to build that roadmap cleanly.

## What Changes

- **BREAKING**: Replace the vanilla JS + hand-rolled DOM with a React + Vite application
- Add Zustand (or React Context) for centralized app state (`textObjects`, `selectedId`, `canvasBackground`, animation flags)
- Replace manual panel wiring (20+ individual `addEventListener` calls) with declarative React components
- Replace DOM-manipulated bounding-box handles with React-rendered overlay components
- Preserve the existing canvas rendering engine (`HandwritingAnimator`, `measureText`, `drawHighlight`, `instantDraw`) — these are not changing
- Preserve all existing features: multi-object layout, drag, selection, animate, effects sliders, highlight, bounding-box overlay
- Set up infrastructure for save/load and export (addressed in future changes)

## Capabilities

### New Capabilities
- `app-shell`: Top-level React app entry point, Vite config, and project structure
- `state-store`: Centralized state management for text objects, selection, canvas background, and animation flags
- `canvas-engine`: Encapsulated canvas rendering module (adapter around existing `HandwritingAnimator` logic)
- `object-handles`: React-rendered bounding-box handle overlays, replacing DOM-manipulated divs
- `properties-panel`: React component tree for the right-hand properties panel and all its controls

### Modified Capabilities
- `stage`: Layout shell changes (React root replaces raw HTML); canvas container behavior unchanged
- `drag-handle`: Handle interaction model moves from imperative DOM listeners to React pointer event handlers
- `text-object`: Text object data model formalized as a typed interface for use with state store
- `properties-panel`: Full reimplementation as React components (was vanilla DOM)

## Impact

- `generator/main.js` — replaced entirely by React component tree
- `generator/index.html` — becomes Vite entry point with `<div id="root">`
- `generator/styles.css` — migrated to component-scoped CSS modules or kept as global stylesheet
- `package.json` — add React, ReactDOM, Vite React plugin, Zustand (or similar)
- `node_modules/@tlberglund/handwriting-playback` — unchanged; imported by canvas engine module

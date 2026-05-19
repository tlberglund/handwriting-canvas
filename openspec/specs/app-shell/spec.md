## ADDED Requirements

### Requirement: React application entry point
The app SHALL be a Vite + React + TypeScript single-page application. The HTML entry point SHALL contain a `<div id="root">` and a single `<script type="module">` pointing to `src/main.tsx`. `main.tsx` SHALL mount the `<App>` component into `#root`.

#### Scenario: App mounts on load
- **WHEN** the page loads
- **THEN** the React tree is mounted into `#root` with no console errors

### Requirement: Two-column layout
The `<App>` component SHALL render a full-viewport three-column layout: an `<ObjectsPanel>` on the left (fixed 200px width), a `<Stage>` in the center (flex: 1), and a `<PropertiesPanel>` on the right (fixed 280px width).

#### Scenario: Stage fills remaining width
- **WHEN** the app is rendered
- **THEN** the stage occupies all horizontal space not taken by the objects panel or the properties panel

### Requirement: GlyphSet loaded at startup
The `<App>` component SHALL fetch `./tim-hand.json` on mount and dispatch the result to the state store. Until the fetch completes, the glyphSet in the store is `null` and Animate is disabled.

#### Scenario: GlyphSet available after load
- **WHEN** the fetch completes successfully
- **THEN** the store's glyphSet is non-null and the Animate button becomes enabled for any selected object with text

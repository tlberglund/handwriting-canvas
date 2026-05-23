## Why

The app currently has a single implicit canvas with no concept of a named, saveable project. Users need to work on multiple titled sequences independently, switching between them and persisting each one, without any of them interfering with another.

## What Changes

- Introduce a **Project** entity: a named container that holds a set of text objects, a canvas background color, and metadata (name, id, createdAt).
- Add a **tab bar** to the app shell so multiple projects can be open simultaneously; the active tab drives which project is rendered.
- Projects are created with a name, can be renamed in-place, closed (removes from open tabs), and permanently deleted (removes from storage).
- All mutations auto-save the project to localStorage under a project-keyed namespace, replacing the current single-canvas persistence scheme.
- Add **export** (download all projects as a single JSON file) and **import** (upload a JSON file, merging or replacing projects in the store).

## Capabilities

### New Capabilities
- `project-model`: Core project entity — schema, CRUD operations, and lifecycle (create/rename/close/delete)
- `project-tabs`: Tab bar UI — open projects as tabs, active-tab switching, close button per tab
- `project-storage`: localStorage persistence keyed by project id; export-to-JSON and import-from-JSON

### Modified Capabilities
- `app-shell`: Tab bar is added above the stage; layout must accommodate the new chrome
- `canvas-persistence`: Current single-canvas localStorage key replaced by per-project storage; existing `handwritten-title-canvas` key is superseded — **BREAKING** for any existing saved state
- `state-store`: Zustand store gains a projects map, activeProjectId, and project-level actions alongside the existing canvas state

## Impact

- `src/store.ts`: Major refactor — store gains project collection, active project concept; existing `textObjects` and `canvasBackground` become per-project state
- `src/App.tsx`: Gains tab bar rendering, project creation/selection logic
- `src/components/`: New `TabBar` component; `ObjectsPanel`/`PanelControls`/`Stage` read from active project rather than flat store
- `package.json`: No new dependencies (localStorage only, no backend)
- Existing localStorage key `handwritten-title-canvas` is abandoned and ignored; the app starts with no open projects on first load

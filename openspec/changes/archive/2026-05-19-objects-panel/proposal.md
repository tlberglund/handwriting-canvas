## Why

There's currently no way to see all the objects on the canvas at a glance or select one without clicking directly on its handle. An objects panel on the left gives users a persistent inventory of the canvas, makes selection discoverable, and lays the structural foundation for a tree view when hierarchy is introduced.

## What Changes

- A new left sidebar component (`ObjectsPanel`) renders a tree view of all text objects in the canvas
- Each tree node shows the object's text content (or a placeholder when blank) and highlights when selected
- Clicking a node selects the corresponding object on the canvas
- A small "New" button at the top of the panel creates a new text object (replacing the "New Text" button currently in the right panel)
- The "New Text" button is removed from the properties panel footer
- The app layout expands from two columns to three: objects panel | stage | properties panel

## Capabilities

### New Capabilities
- `objects-panel`: Left sidebar with a tree view of canvas objects and a "New" button for creating text objects

### Modified Capabilities
- `app-shell`: Layout changes from two-column to three-column to accommodate the new left panel
- `properties-panel`: "New Text" button is removed from the panel footer (responsibility moves to `objects-panel`)

## Impact

- New `src/components/ObjectsPanel.tsx` component
- `src/components/PanelFooter.tsx` removed or gutted (New Text button moves)
- `src/App.tsx` updated to render `<ObjectsPanel />` in a three-column layout
- `src/styles.css` updated for three-column layout and object tree node styles
- No store changes required — `textObjects`, `selectedId`, `addObject`, and `selectObject` are sufficient

## Context

`App.tsx` renders a two-column flex layout: `<Stage>` (flex: 1) and `<PropertiesPanel>` (fixed 280px). The "New Text" button lives in `PanelFooter.tsx`, a child of `PropertiesPanel`. The Zustand store already has everything needed (`textObjects`, `selectedId`, `addObject`, `selectObject`) — no store changes are required.

The change adds a third column on the left. The tree view is flat today but the component structure should be designed to accommodate hierarchy without a rewrite when it arrives.

## Goals / Non-Goals

**Goals:**
- `<ObjectsPanel>` left sidebar listing all canvas objects as a tree view
- "New" button at the top of the panel, replacing the one in the right panel
- Selection sync between panel and canvas (click-to-select in both directions)
- Visual foundation for future tree hierarchy (indentation, nesting-ready structure)

**Non-Goals:**
- Expand/collapse tree nodes (no hierarchy yet)
- Drag-to-reorder objects
- Renaming objects from the panel
- Icons or type badges per node

## Decisions

### Flat list rendered as a tree — no new data structure

The store holds `textObjects: TextObject[]` — a flat array. No hierarchy exists yet. Rather than introducing a separate tree model prematurely, the panel renders each `TextObject` directly as a tree leaf using `<ul>/<li>` with tree-style CSS. When hierarchy is introduced, the store shape and this component will both change together.

**Alternative considered:** A `TreeNode` wrapper type now — rejected as premature; it would add indirection with no current payoff.

---

### PanelFooter.tsx is deleted

`PanelFooter` exists solely to render the "New Text" button. With that button moving to `ObjectsPanel`, `PanelFooter` has no remaining purpose. It is removed entirely rather than left empty.

**Alternative considered:** Keep `PanelFooter` as a slot for future right-panel footer content — rejected; nothing needs it now and an empty component adds noise.

---

### Left panel width: 200px fixed

The objects panel needs enough width to show a label without wrapping but should not crowd the stage. 200px matches the kind of narrow inspector sidebar common in design tools.

---

### Node label: object's `text` property, with placeholder for empty

Each node displays `obj.text` if non-empty, or `"(empty)"` in a muted style if blank. This avoids blank/unlabeled rows when an object hasn't been given text yet.

## Risks / Trade-offs

- **Stage loses 200px of horizontal space** → Acceptable at typical desktop widths; the stage is fluid and the canvas re-initializes on resize.
- **Tree structure diverges when hierarchy arrives** → The flat-list-as-tree approach will need a real recursive render at that point. Acceptable because the component boundary is already established.

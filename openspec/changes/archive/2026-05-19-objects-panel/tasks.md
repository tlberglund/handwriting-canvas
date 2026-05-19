## 1. Layout

- [x] 1.1 Update `src/App.tsx` to render `<ObjectsPanel />` as the first child, before `<Stage />`
- [x] 1.2 Update the root layout CSS in `src/styles.css` to a three-column flex row: objects panel (200px) | stage (flex: 1) | properties panel (280px)

## 2. ObjectsPanel Component

- [x] 2.1 Create `src/components/ObjectsPanel.tsx` with a panel header containing a "New" button and an empty `<ul>` body
- [x] 2.2 Subscribe to `textObjects` and `selectedId` from the store
- [x] 2.3 Render one `<li>` per text object, displaying `obj.text` or `"(empty)"` (muted) when blank
- [x] 2.4 Apply a selected style to the `<li>` whose `id === selectedId`
- [x] 2.5 Add `onClick` on each `<li>` that calls `selectObject(obj.id)`
- [x] 2.6 Wire the "New" button to call `addObject` using the container's dimensions (same pattern as the old `PanelFooter`)

## 3. Remove PanelFooter

- [x] 3.1 Delete `src/components/PanelFooter.tsx`
- [x] 3.2 Remove the `<PanelFooter />` render and its import from `src/components/PropertiesPanel.tsx`

## 4. Styles

- [x] 4.1 Add CSS for `#objects-panel`: fixed width, full height, border-right, overflow-y scroll
- [x] 4.2 Add CSS for the panel header row (label + "New" button aligned right)
- [x] 4.3 Add CSS for tree node `<li>` items: padding, cursor pointer, hover state
- [x] 4.4 Add CSS for the selected node state (background highlight)
- [x] 4.5 Add CSS for the muted `"(empty)"` placeholder style

## 5. Verification

- [x] 5.1 Three columns are visible: objects panel on left, stage in center, properties panel on right
- [x] 5.2 All canvas objects appear in the tree; names update when text is edited
- [x] 5.3 Clicking a tree node selects the object (handle shows selected state, properties panel populates)
- [x] 5.4 Selecting an object on canvas highlights the corresponding tree node
- [x] 5.5 Clicking "New" in the objects panel creates and selects a new object
- [x] 5.6 No "New Text" button remains in the properties panel

## ADDED Requirements

### Requirement: Objects panel is a left sidebar
The app SHALL render an `<ObjectsPanel>` component as a fixed-width (200px) left sidebar, visible at all times regardless of selection state. It SHALL appear to the left of the stage.

#### Scenario: Panel is always visible
- **WHEN** the app is loaded with no objects on the canvas
- **THEN** the objects panel is visible on the left with an empty list and a "New" button

### Requirement: Tree view lists all canvas objects
The objects panel SHALL render all `TextObject` entries from the store as a flat tree view using `<ul>/<li>` elements. Each node SHALL display the object's `text` property if non-empty, or the string `"(empty)"` in a muted style if blank. The list SHALL update reactively when objects are added or deleted.

#### Scenario: Node shows object text
- **WHEN** a text object has `text = "Hello"`
- **THEN** its tree node displays "Hello"

#### Scenario: Node shows placeholder for blank text
- **WHEN** a text object has `text = ""`
- **THEN** its tree node displays "(empty)" in a visually muted style

#### Scenario: List updates on add
- **WHEN** a new text object is added to the store
- **THEN** a new node appears in the tree immediately

#### Scenario: List updates on delete
- **WHEN** a text object is deleted from the store
- **THEN** its node is removed from the tree immediately

### Requirement: Clicking a node selects the object
Clicking a tree node SHALL call `selectObject(id)` in the store, making that object the selected object. The canvas handle for the object SHALL become selected.

#### Scenario: Click selects object
- **WHEN** the user clicks a tree node for object with id X
- **THEN** `selectedId` in the store becomes X and the object's handle shows its selected state

### Requirement: Selected object is highlighted in the tree
The tree node corresponding to the currently selected object (`selectedId`) SHALL have a visually distinct selected style (e.g., background highlight). When selection changes, the highlight moves to the new selection.

#### Scenario: Selected node is highlighted
- **WHEN** object X is selected
- **THEN** the tree node for X has the selected style and no other node does

#### Scenario: Highlight follows selection from canvas
- **WHEN** the user clicks directly on an object handle on the canvas to select it
- **THEN** the corresponding tree node in the objects panel updates to show the selected style

### Requirement: New button creates a text object
The objects panel SHALL include a "New" button at the top of the panel. Clicking it SHALL create a new text object (via `addObject`) and select it, identical in behavior to the former "New Text" button in the properties panel footer.

#### Scenario: New button adds an object
- **WHEN** the user clicks "New" in the objects panel
- **THEN** a new text object is created with default values, added to the canvas, and selected

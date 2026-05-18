## MODIFIED Requirements

### Requirement: Each text object has an HTML drag handle
Each text object SHALL have an absolutely-positioned `<div>` (rendered as a React `<ObjectHandle>` component) overlaid on the stage. The handle SHALL be sized as a bounding box matching the rendered text extents, computed from `measureText`. The handle is the drag target; the canvas is not a hit target for drag events.

#### Scenario: Handle appears at object position
- **WHEN** a text object exists
- **THEN** its handle div is positioned so its top-left is at `(obj.x - BOUND_PAD_X, obj.y - BOUND_PAD_Y)` relative to the stage container

#### Scenario: Handle size matches text extents
- **WHEN** a text object has text "Hello" and capHeight 80
- **THEN** the handle div width equals `measureText("Hello", 80).width + BOUND_PAD_X * 2` and height equals `80 * 1.25 + BOUND_PAD_Y * 2`

#### Scenario: Handle position stays in sync with object state
- **WHEN** a text object's x, y, text, or capHeight changes in the store
- **THEN** the handle div's CSS position and size update on the next render

### Requirement: Handle is invisible by default and visible on hover
The handle SHALL have `opacity: 0` by default. It SHALL become visible (`opacity: 1`) when the cursor is over it (CSS `:hover`). Selection state SHALL NOT force visibility — handles are only revealed by hover.

#### Scenario: Handle is not visible when not hovered
- **WHEN** a text object exists and is not being hovered
- **THEN** the handle div is present in the DOM but has opacity 0 and is not visually apparent

#### Scenario: Handle appears on hover
- **WHEN** the user moves the cursor over a text object's handle area
- **THEN** the handle becomes visible as a dashed blue bounding box

### Requirement: Clicking a handle selects the object
Clicking a drag handle SHALL call `selectObject(id)` in the store and deselect any previously selected object.

#### Scenario: Click selects object
- **WHEN** the user clicks a text object's handle
- **THEN** that object becomes selected and the properties panel shows its parameters

#### Scenario: Clicking stage background deselects
- **WHEN** the user clicks the canvas or stage area outside any handle
- **THEN** `selectObject(null)` is called and the properties panel shows the placeholder

### Requirement: Dragging a handle repositions the text object
Dragging a handle SHALL call `updateObject` with new x/y on each animation frame and trigger a canvas redraw.

#### Scenario: Drag updates position in real time
- **WHEN** the user drags a handle
- **THEN** the handle moves with the cursor and the canvas re-renders each frame

#### Scenario: Drag release commits position
- **WHEN** the user releases the drag
- **THEN** the text object's x/y in the store reflects the final cursor position

### Requirement: Canvas re-renders during drag use instant mode
During a drag, all canvas re-renders SHALL use `instant: true`. Animated re-rendering during drag is not permitted.

#### Scenario: Instant render during drag
- **WHEN** a handle is being dragged
- **THEN** all objects are drawn synchronously on each rAF frame

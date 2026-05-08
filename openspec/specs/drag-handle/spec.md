## ADDED Requirements

### Requirement: Each text object has an HTML drag handle
Each text object SHALL have an absolutely-positioned `<div>` overlaid on the stage at the object's (x, y) position. The handle is the drag target; the canvas is not a hit target for drag events.

#### Scenario: Handle appears at object position
- **WHEN** a text object exists
- **THEN** its handle div is positioned at the object's x,y relative to the stage container

#### Scenario: Handle position stays in sync with object state
- **WHEN** a text object's x or y changes
- **THEN** the handle div's CSS left and top update to match

### Requirement: Clicking a handle selects the object
Clicking a drag handle SHALL select the corresponding text object and deselect any previously selected object. The selected handle SHALL display a visible selection indicator (e.g., outline or ring).

#### Scenario: Click selects object
- **WHEN** the user clicks a text object's handle
- **THEN** that object becomes selected and the properties panel shows its parameters

#### Scenario: Clicking stage background deselects
- **WHEN** the user clicks the canvas or stage area outside any handle
- **THEN** no object is selected and the properties panel is empty or hidden

### Requirement: Dragging a handle repositions the text object
Dragging a handle SHALL update the text object's x,y in real time and re-render the canvas on each animation frame during the drag.

#### Scenario: Drag updates position in real time
- **WHEN** the user drags a handle
- **THEN** the handle moves with the cursor and the canvas re-renders each frame with all done objects (including the dragged object at its new position) drawn instantly

#### Scenario: Drag release commits position
- **WHEN** the user releases the drag
- **THEN** the text object's x,y is updated to the final cursor position and the canvas reflects the final state

### Requirement: Canvas re-renders during drag use instant mode
During a drag, all canvas re-renders SHALL use `instant: true` on the library's `write()` call. Animated re-rendering during drag is not permitted.

#### Scenario: Instant render during drag
- **WHEN** a handle is being dragged
- **THEN** all objects are drawn synchronously (no animation timing) on each rAF frame

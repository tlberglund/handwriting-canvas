## ADDED Requirements

### Requirement: Properties panel shows selected object's parameters
The properties panel SHALL display editable controls for the currently selected text object: text input, capHeight slider, speed slider, thickness slider, color picker, highlight checkbox + color picker, and pixelDensity slider. A canvas background color picker SHALL always be visible regardless of selection. When no object is selected, the per-object controls SHALL be hidden and a placeholder message shown.

#### Scenario: Panel populates on selection
- **WHEN** the user selects a text object
- **THEN** all per-object controls update to reflect that object's current values, including thickness and highlight state

#### Scenario: Panel shows placeholder when nothing is selected
- **WHEN** no text object is selected
- **THEN** the per-object controls are hidden and a placeholder message is displayed; the canvas background picker remains visible

### Requirement: Editing controls updates the selected object's state
Changes to any control in the properties panel SHALL immediately update the corresponding property on the selected text object in app state. The change does not trigger re-animation automatically.

#### Scenario: Slider change updates state
- **WHEN** the user moves the capHeight slider
- **THEN** the selected text object's capHeight updates in state and the slider's value display reflects the new value

#### Scenario: Text input change updates state
- **WHEN** the user edits the text input
- **THEN** the selected text object's text property updates in state

### Requirement: Thickness slider
The properties panel SHALL include a Thickness slider controlling the selected object's `thickness` property (range 1–10, step 0.5, default 2). Changes SHALL immediately redraw the canvas if the object is in `done` state.

#### Scenario: Thickness slider updates stroke weight
- **WHEN** the user moves the Thickness slider to 5
- **THEN** the selected object's `thickness` becomes 5 and the canvas redraws showing thicker strokes

### Requirement: Highlight color control
The properties panel SHALL include a checkbox labeled "Highlight" and a color picker. When the checkbox is unchecked, `highlightColor` is `null`. When checked, `highlightColor` is set to the picker's value and the color picker is enabled. Changes SHALL immediately redraw the canvas if the object is in `done` state.

#### Scenario: Enabling highlight shows background rect
- **WHEN** the user checks the Highlight checkbox
- **THEN** `highlightColor` is set and a filled rectangle appears behind the text on the next redraw

#### Scenario: Disabling highlight removes background rect
- **WHEN** the user unchecks the Highlight checkbox
- **THEN** `highlightColor` becomes null and the background rectangle disappears on the next redraw

### Requirement: Delete button
The properties panel SHALL include a "Delete Object" button visible when an object is selected. Clicking it SHALL call `deleteObject(id)` in the store, remove the object's handle from the DOM, redraw the canvas, and return the panel to the placeholder state.

#### Scenario: Delete removes object
- **WHEN** the user clicks "Delete Object" with an object selected
- **THEN** the object is removed from the store, its handle disappears, and the canvas redraws without it

### Requirement: Canvas background picker
The properties panel SHALL include a color picker for `canvasBackground` that is always visible (not tied to object selection). Changes SHALL call `setCanvasBackground` in the store and trigger an immediate full redraw.

#### Scenario: Canvas background picker changes fill color
- **WHEN** the user changes the canvas background picker to a dark color
- **THEN** the canvas is redrawn with the new background color immediately

### Requirement: Animate and Clear buttons are in the properties panel
The properties panel SHALL contain Animate and Clear buttons that operate on the selected text object.

#### Scenario: Animate button triggers animation
- **WHEN** the user clicks Animate with an object selected and glyphSet loaded
- **THEN** the selected object is animated per the text-object animate requirement

#### Scenario: Clear button clears selected object
- **WHEN** the user clicks Clear with an object selected
- **THEN** the selected object's ink is cleared per the text-object clear requirement

### Requirement: New Text button is in the properties panel
The properties panel SHALL contain a "New Text" button that creates and selects a new text object.

#### Scenario: New Text button creates object
- **WHEN** the user clicks "New Text"
- **THEN** a new text object is created with defaults, added to the stage, selected, and the properties panel populates with its default values

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Properties panel shows selected object's parameters
The properties panel SHALL display editable controls for the currently selected text object: text input, capHeight slider, speed slider, thickness slider, color picker, highlight checkbox + color picker, and pixelDensity slider. A canvas background color picker SHALL always be visible regardless of selection. When no object is selected, the per-object controls SHALL be hidden and a placeholder message shown.

#### Scenario: Panel populates on selection
- **WHEN** the user selects a text object
- **THEN** all per-object controls update to reflect that object's current values, including thickness and highlight state

#### Scenario: Panel shows placeholder when nothing is selected
- **WHEN** no text object is selected
- **THEN** the per-object controls are hidden and a placeholder message is displayed; the canvas background picker remains visible

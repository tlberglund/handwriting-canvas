## ADDED Requirements

### Requirement: Text object data model
Each text object SHALL have the following properties: `id` (unique string), `text` (string), `x` (number, CSS px from stage left), `y` (number, CSS px from stage top), `capHeight` (number, px), `speed` (number, multiplier), `color` (string, CSS color), `pixelDensity` (number, integer), and `state` (one of: `idle`, `animating`, `done`).

#### Scenario: New text object has default values
- **WHEN** a new text object is created
- **THEN** it has default values: capHeight=80, speed=1.5, color=#1a1a1a, pixelDensity=2, state=idle, and is positioned at the center of the stage

### Requirement: Text objects are created via New button
The app SHALL provide a "New Text" button. Clicking it SHALL create a new text object, add it to the object list, and select it.

#### Scenario: New button adds an object
- **WHEN** the user clicks "New Text"
- **THEN** a new text object appears in the object list and is selected

#### Scenario: New object is positioned at stage center
- **WHEN** a new text object is created
- **THEN** its initial x,y is the center of the stage

### Requirement: Each text object owns a HandwritingAnimator instance
Each text object SHALL have a dedicated `HandwritingAnimator` instance that is created once and reused for all animate and instant-draw operations on that object. This stabilizes glyph variant selection across re-renders.

#### Scenario: Animator instance is stable per object
- **WHEN** a text object is animated and then dragged
- **THEN** the instant re-draw during drag uses the same glyph variants as the original animation

### Requirement: Animate action renders the selected object
When Animate is triggered for a text object, the app SHALL: clear the canvas, instant-draw all other `done` objects at their positions, then animate the selected object with `write()`. The object's state SHALL transition to `animating` and then `done`.

#### Scenario: Animate clears and redraws
- **WHEN** the user clicks Animate on a selected object
- **THEN** the canvas is cleared, all other done objects are redrawn instantly, and the selected object animates

#### Scenario: Animate is disabled while any object is animating
- **WHEN** any text object has state `animating`
- **THEN** the Animate button is disabled for all objects

### Requirement: Clear action removes selected object's contribution
Clicking Clear on a selected object SHALL clear the entire canvas and instant-redraw all other `done` objects, effectively removing the selected object's ink. The selected object's state SHALL return to `idle`.

#### Scenario: Clear removes selected ink
- **WHEN** the user clicks Clear on a selected done object
- **THEN** the canvas is cleared and all other done objects are redrawn; the cleared object returns to idle state

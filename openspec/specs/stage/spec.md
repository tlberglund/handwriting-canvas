## ADDED Requirements

### Requirement: 16:9 full-screen canvas stage
The stage SHALL occupy the full viewport with a 16:9 aspect ratio canvas centered within it. The canvas SHALL be the sole ink surface for all text objects.

#### Scenario: Stage fills viewport
- **WHEN** the page loads
- **THEN** the stage container fills the full viewport width and height with a dark background

#### Scenario: Canvas maintains 16:9 aspect ratio
- **WHEN** the viewport is resized
- **THEN** the canvas maintains a 16:9 aspect ratio, letterboxed within the stage if necessary

#### Scenario: Canvas is white
- **WHEN** the page loads
- **THEN** the canvas background is white, representing the output surface

### Requirement: Stage is the shared ink surface
The canvas SHALL be shared by all text objects. Text objects SHALL NOT each own a separate canvas element.

#### Scenario: Multiple objects render to same canvas
- **WHEN** two or more text objects have been animated
- **THEN** all their ink appears on the single shared canvas simultaneously

### Requirement: Canvas coordinate system matches stage layout coordinates
Text object positions (x, y) stored in app state SHALL be in CSS pixels relative to the stage container's top-left corner, and SHALL map directly to canvas pixel offsets passed to the library's `write()` call.

#### Scenario: Position corresponds to ink location
- **WHEN** a text object has position x=200, y=100
- **THEN** the animated ink begins at approximately (200, 100) on the canvas

## MODIFIED Requirements

### Requirement: Canvas is white
The canvas background color SHALL be configurable via the store's `canvasBackground` value. The default SHALL be `#ffffff` (white). The background is rendered as a filled rectangle in `redrawAll`, not as a CSS property on the canvas container.

#### Scenario: Canvas background reflects store value
- **WHEN** `canvasBackground` in the store is changed to `#000000`
- **THEN** the next `redrawAll` call fills the canvas with black before drawing text objects

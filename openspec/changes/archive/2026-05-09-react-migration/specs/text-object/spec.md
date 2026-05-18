## MODIFIED Requirements

### Requirement: Text object data model
Each text object SHALL have the following properties: `id` (unique string), `text` (string), `x` (number, CSS px from stage left), `y` (number, CSS px from stage top), `capHeight` (number, px), `speed` (number, multiplier), `thickness` (number, px — controls minWidth; maxWidth is derived as thickness * 2), `color` (string, CSS color), `highlightColor` (string | null — CSS color, or null for no highlight), `pixelDensity` (number, integer), and `state` (one of: `idle`, `animating`, `done`).

#### Scenario: New text object has default values
- **WHEN** a new text object is created
- **THEN** it has default values: capHeight=80, speed=1.5, thickness=2, color=#1a1a1a, highlightColor=null, pixelDensity=2, state=idle, and is positioned at the center of the stage

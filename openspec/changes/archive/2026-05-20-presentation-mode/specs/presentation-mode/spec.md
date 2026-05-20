## ADDED Requirements

### Requirement: Present button is available in the objects panel
The objects panel SHALL render a "Present" button in its header area. The button SHALL be disabled when: there are no text objects with non-empty text, an individual animation is in progress (`isAnimating` is true), or a presentation is already running (`isPresentationMode` is true).

#### Scenario: Button is enabled with animatable objects
- **WHEN** at least one text object has non-empty text and no animation is in progress
- **THEN** the Present button is enabled and clickable

#### Scenario: Button is disabled during individual animation
- **WHEN** `isAnimating` is true (a per-object animation is running)
- **THEN** the Present button is visually disabled and non-interactive

#### Scenario: Button is disabled with no animatable objects
- **WHEN** all text objects have empty text or the canvas has no objects
- **THEN** the Present button is disabled

### Requirement: Clicking Present enters full-screen mode
Clicking the Present button SHALL call `requestFullscreen()` on the `#stage` element. The stage SHALL fill the viewport and the 16:9 canvas inside it SHALL scale to the largest fitting size using the existing container-query layout.

#### Scenario: Stage fills viewport on Present
- **WHEN** the user clicks Present
- **THEN** the stage element enters full-screen and the canvas fills the screen at 16:9 aspect ratio with no UI panels visible

### Requirement: All objects animate sequentially on presentation start
After entering full-screen, the app SHALL clear all text objects to idle state and then animate them one by one in `textObjects[]` order, awaiting each animation to completion before starting the next. Objects with empty text SHALL be skipped.

#### Scenario: Objects animate in scene graph order
- **WHEN** presentation mode begins with objects A, B, C in that order
- **THEN** A animates fully, then B, then C; at no point do two objects animate simultaneously

#### Scenario: Empty-text objects are skipped
- **WHEN** a text object has empty text
- **THEN** it is skipped in the playback sequence and the next object with text animates immediately

#### Scenario: Canvas is cleared before playback
- **WHEN** presentation mode begins and some objects are in `done` state
- **THEN** all objects are set to idle and the canvas is cleared before the first animation starts

### Requirement: Canvas persists in final drawn state after playback
After the last animation completes, the canvas SHALL remain full-screen with all animated objects visible in their drawn state. No automatic exit from full-screen occurs.

#### Scenario: Canvas stays visible after last animation
- **WHEN** the final object finishes animating
- **THEN** the canvas remains full-screen showing all drawn objects; the user must press Escape to exit

### Requirement: Canvas redraws correctly on full-screen exit
When the browser exits full-screen (via Escape or any other mechanism), the canvas SHALL be re-initialized to the restored stage dimensions and all drawn objects SHALL be redrawn at the correct resolution.

#### Scenario: Canvas redraws after Escape
- **WHEN** the user presses Escape to exit full-screen after a presentation
- **THEN** the stage returns to its normal size and all drawn objects are visible at the correct scale

### Requirement: isPresentationMode flag guards concurrent interactions
The store SHALL expose an `isPresentationMode` boolean and a `setPresentationMode` action. While `isPresentationMode` is true, individual per-object Animate buttons SHALL be disabled.

#### Scenario: Animate button disabled during presentation
- **WHEN** `isPresentationMode` is true
- **THEN** all per-object Animate buttons are disabled and cannot trigger individual animations

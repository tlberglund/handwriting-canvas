## ADDED Requirements

### Requirement: Animator map is bootstrapped for restored objects on glyph set load
When the glyph set finishes loading, the app SHALL create a `HandwritingAnimator` instance for every `TextObject` in the store with `state === 'done'` that does not already have an entry in `animatorMapRef`. After populating the map, `redrawAll` SHALL be called to render all restored objects.

#### Scenario: Restored objects are drawn after glyph set loads
- **WHEN** the page loads with persisted `done` objects and the glyph set fetch completes
- **THEN** `animatorMapRef` contains an entry for each restored `done` object and all are visible on the canvas

#### Scenario: Existing animators are not replaced
- **WHEN** the glyph set loads and an animator already exists in the map for an object ID
- **THEN** the existing animator is left unchanged (no double-initialization)

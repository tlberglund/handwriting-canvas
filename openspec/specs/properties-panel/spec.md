## ADDED Requirements

### Requirement: Properties panel shows selected object's parameters
The properties panel SHALL display editable controls for the currently selected text object: text input, capHeight slider, speed slider, color picker, and pixelDensity slider. When no object is selected, the panel SHALL show a placeholder message.

#### Scenario: Panel populates on selection
- **WHEN** the user selects a text object
- **THEN** all controls in the properties panel update to reflect that object's current values

#### Scenario: Panel shows placeholder when nothing is selected
- **WHEN** no text object is selected
- **THEN** the properties panel displays a message such as "Select a text object or create a new one"

### Requirement: Editing controls updates the selected object's state
Changes to any control in the properties panel SHALL immediately update the corresponding property on the selected text object in app state. The change does not trigger re-animation automatically.

#### Scenario: Slider change updates state
- **WHEN** the user moves the capHeight slider
- **THEN** the selected text object's capHeight updates in state and the slider's value display reflects the new value

#### Scenario: Text input change updates state
- **WHEN** the user edits the text input
- **THEN** the selected text object's text property updates in state

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

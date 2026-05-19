## MODIFIED Requirements

### Requirement: Two-column layout
The `<App>` component SHALL render a full-viewport three-column layout: an `<ObjectsPanel>` on the left (fixed 200px width), a `<Stage>` in the center (flex: 1), and a `<PropertiesPanel>` on the right (fixed 280px width).

#### Scenario: Stage fills remaining width
- **WHEN** the app is rendered
- **THEN** the stage occupies all horizontal space not taken by the objects panel or the properties panel

## MODIFIED Requirements

### Requirement: Two-column layout
The `<App>` component SHALL render a full-viewport layout consisting of two rows: a `<TabBar>` at the top (fixed height), and below it a three-column row containing an `<ObjectsPanel>` on the left (fixed 200px width), a `<Stage>` in the center (flex: 1), and a `<PropertiesPanel>` on the right (fixed 280px width). When no projects are open, the three-column row SHALL be replaced by a welcome/empty state.

#### Scenario: Tab bar is always visible
- **WHEN** the app is rendered regardless of how many projects are open
- **THEN** the tab bar strip is present at the top of the viewport

#### Scenario: Stage fills remaining width when a project is open
- **WHEN** at least one project is open and active
- **THEN** the stage occupies all horizontal space not taken by the objects panel or the properties panel

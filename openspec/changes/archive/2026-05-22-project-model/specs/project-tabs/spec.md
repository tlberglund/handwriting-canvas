## ADDED Requirements

### Requirement: Tab bar renders open projects
The app SHALL render a `TabBar` component as a horizontal strip above the three-column layout. It SHALL display one tab per entry in `openProjectIds`, in order. Each tab SHALL show the project name and a close button (×). The active project's tab SHALL be visually distinguished.

#### Scenario: Tab bar reflects open projects
- **WHEN** two projects are open
- **THEN** the tab bar shows exactly two tabs in the same order as `openProjectIds`

#### Scenario: Active tab is highlighted
- **WHEN** a project is active
- **THEN** its tab has a distinct visual treatment compared to inactive tabs

### Requirement: Clicking a tab activates the project
Clicking a tab SHALL call `setActiveProject(id)` for the corresponding project, making it the active project and redrawing the canvas.

#### Scenario: Tab click switches the active project
- **WHEN** the user clicks an inactive tab
- **THEN** `activeProjectId` changes to that project's id and the canvas shows that project's objects

### Requirement: The close button removes a tab
Clicking the × on a tab SHALL call `closeProject(id)`. The project data is preserved; only the tab is removed.

#### Scenario: Close button removes the tab without deleting data
- **WHEN** the user clicks × on a tab
- **THEN** the tab disappears and the project remains in `projects`

### Requirement: A "+" button creates a new project
The tab bar SHALL include a "+" button. Clicking it SHALL call `createProject("Untitled Project")` and immediately put the new tab's label into inline edit mode so the user can type the name.

#### Scenario: New project tab enters edit mode immediately
- **WHEN** the user clicks "+"
- **THEN** a new tab appears and its label is in an editable text input focused for typing

### Requirement: Tab labels are renameable via double-click
Double-clicking a tab label SHALL switch that label to an inline `<input>` pre-filled with the current name. Pressing Enter or blurring the input SHALL commit the new name via `renameProject`. Pressing Escape SHALL revert to the old name without saving. An empty name SHALL be rejected and the old name SHALL be restored.

#### Scenario: Double-click enters edit mode
- **WHEN** the user double-clicks a tab label
- **THEN** the label becomes an editable input containing the current project name

#### Scenario: Enter commits the rename
- **WHEN** the user types a new name and presses Enter
- **THEN** `renameProject` is called and the tab label shows the new name

#### Scenario: Escape cancels the rename
- **WHEN** the user presses Escape while editing a tab label
- **THEN** the label reverts to the original name and no rename is performed

#### Scenario: Empty name is rejected on commit
- **WHEN** the user clears the input and presses Enter or blurs
- **THEN** the project name is unchanged and the label reverts to the original

### Requirement: No projects open shows a welcome state
When `openProjectIds` is empty, the canvas area SHALL display a prompt or welcome message encouraging the user to create a project via the "+" button.

#### Scenario: Empty state is shown with no open projects
- **WHEN** `openProjectIds` is empty
- **THEN** the stage and properties panel are replaced by a centered message and no canvas is rendered

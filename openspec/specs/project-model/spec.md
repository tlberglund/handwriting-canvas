## ADDED Requirements

### Requirement: Project interface
The app SHALL define and export a `Project` TypeScript interface with the following fields: `id` (string), `name` (string), `createdAt` (number), `textObjects` (TextObject[]), `canvasBackground` (string).

#### Scenario: New project conforms to interface
- **WHEN** `createProject` is called
- **THEN** the returned project satisfies the `Project` interface with all fields present and correctly typed

### Requirement: Projects are created with a name
The `createProject(name: string)` store action SHALL create a new `Project` with a UUID id, the given name, `Date.now()` as `createdAt`, an empty `textObjects` array, and `canvasBackground` set to `'#ffffff'`. The new project SHALL be added to the `projects` map, appended to `openProjectIds`, and set as `activeProjectId`.

#### Scenario: New project is immediately active
- **WHEN** `createProject("My Show")` is called
- **THEN** `activeProjectId` equals the new project's id and the new project appears as the rightmost tab

#### Scenario: New project starts empty
- **WHEN** a project is first created
- **THEN** its `textObjects` array is empty and `canvasBackground` is `'#ffffff'`

### Requirement: Projects can be renamed
The `renameProject(id: string, name: string)` store action SHALL update the `name` field of the project with the given id. Renaming SHALL be rejected if `name` is an empty string.

#### Scenario: Name update is reflected in the tab bar
- **WHEN** `renameProject` is called with a non-empty name
- **THEN** the corresponding tab label updates immediately

#### Scenario: Empty name is rejected
- **WHEN** `renameProject` is called with an empty string
- **THEN** the project's name is unchanged

### Requirement: Projects can be closed
The `closeProject(id: string)` store action SHALL remove the project id from `openProjectIds` without deleting the project from the `projects` map. If the closed project was `activeProjectId`, the store SHALL set `activeProjectId` to the adjacent open project, or `null` if no projects remain open.

#### Scenario: Closed project is no longer in the tab bar
- **WHEN** a project is closed
- **THEN** its tab disappears and the project data remains in `projects`

#### Scenario: Closing the active project activates an adjacent tab
- **WHEN** the active project is closed and other tabs are open
- **THEN** the previously adjacent tab becomes active

### Requirement: Projects can be deleted
The `deleteProject(id: string)` store action SHALL remove the project from both `projects` and `openProjectIds`. If the deleted project was active, `activeProjectId` SHALL shift as in close. Deleted projects cannot be recovered.

#### Scenario: Deleted project is removed from storage on next save
- **WHEN** a project is deleted
- **THEN** it is absent from `projects` in the store and will not appear in the next localStorage write

### Requirement: Active project drives canvas state
The store SHALL maintain `textObjects`, `canvasBackground`, and `selectedId` as flat fields reflecting the currently active project. All existing canvas mutations (`addObject`, `updateObject`, `deleteObject`, `setCanvasBackground`) SHALL operate on the active project's data and write through to `projects[activeProjectId]` atomically.

#### Scenario: Mutations update both flat fields and project map
- **WHEN** `updateObject` is called while a project is active
- **THEN** both `textObjects` (flat) and `projects[activeProjectId].textObjects` reflect the change

#### Scenario: Switching projects loads the new project's canvas state
- **WHEN** `setActiveProject(id)` is called
- **THEN** the flat `textObjects` and `canvasBackground` fields are replaced with the new project's values and the canvas is redrawn

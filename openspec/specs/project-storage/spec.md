## ADDED Requirements

### Requirement: All projects are persisted to a single localStorage key
The Zustand store SHALL use the `persist` middleware with key `handwritten-title-projects`. The persisted payload SHALL include `projects`, `openProjectIds`, and `activeProjectId`. It SHALL NOT include `selectedId`, `isAnimating`, `isPresentationMode`, or `glyphSet`.

#### Scenario: Projects survive a page reload
- **WHEN** the user has created and modified projects and reloads the page
- **THEN** all projects, the open tab list, and the active project are restored from localStorage

#### Scenario: Transient state is not persisted
- **WHEN** the store is serialized to localStorage
- **THEN** `selectedId`, `isAnimating`, `isPresentationMode`, and `glyphSet` are absent from the stored JSON

### Requirement: Every project mutation auto-saves
Any change to a project's data (adding/updating/deleting text objects, changing background, renaming, creating, deleting) SHALL be written to localStorage immediately via the Zustand persist middleware, without requiring an explicit save action from the user.

#### Scenario: Text change is reflected in localStorage
- **WHEN** the user edits text in a text object
- **THEN** `localStorage.getItem('handwritten-title-projects')` contains the updated text before the user's next interaction

### Requirement: Export all projects as a JSON file
The app SHALL provide an export action that serializes the full `projects` map to JSON and triggers a browser file download. The filename SHALL be `handwritten-projects-<timestamp>.json`. The exported JSON SHALL be a valid object with a `version` field and a `projects` field.

#### Scenario: Export downloads a file
- **WHEN** the user triggers export
- **THEN** the browser downloads a `.json` file containing all projects

#### Scenario: Exported JSON is valid and complete
- **WHEN** the exported file is opened
- **THEN** it contains every project present in the store at the time of export

### Requirement: Import projects from a JSON file
The app SHALL provide an import action that accepts a JSON file upload. The file SHALL be validated against the expected shape (object with `projects` map). Valid projects from the file SHALL be merged into the current store: projects with matching IDs are overwritten, new IDs are inserted. `openProjectIds` and `activeProjectId` are not changed by the import unless the user's active project was overwritten, in which case the canvas is redrawn with the imported version.

#### Scenario: Imported projects appear in the store
- **WHEN** the user imports a valid JSON file containing a project not currently in the store
- **THEN** the new project appears in `projects` and can be opened via "+"

#### Scenario: Import with matching ID overwrites existing project
- **WHEN** the imported file contains a project whose id already exists in the store
- **THEN** the existing project's data is replaced with the imported version

#### Scenario: Malformed import file is rejected
- **WHEN** the uploaded file is not valid JSON or does not match the expected schema
- **THEN** the import is aborted with a user-visible error message and the store is unchanged

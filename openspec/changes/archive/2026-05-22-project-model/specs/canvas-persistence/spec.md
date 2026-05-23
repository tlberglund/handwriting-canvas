## MODIFIED Requirements

### Requirement: Canvas state is persisted to localStorage
The app SHALL persist all project state to localStorage under the key `handwritten-title-projects` (replacing the old `handwritten-title-canvas` key). The persisted payload SHALL be the Zustand store's `projects` map, `openProjectIds`, and `activeProjectId`. Each project entry contains `textObjects` and `canvasBackground` for that project. The key `handwritten-title-canvas` is no longer written. **BREAKING**: Any data stored under the old key is migrated once on first load (see project-storage spec) and then discarded.

#### Scenario: All projects survive a page reload
- **WHEN** the user has multiple projects with text objects and reloads the page
- **THEN** all projects, their objects, and their background colors are restored from localStorage

#### Scenario: Old key is not written
- **WHEN** the store is serialized to localStorage after the project-model update
- **THEN** `localStorage.getItem('handwritten-title-canvas')` is null (or absent after migration cleanup)

## REMOVED Requirements

### Requirement: Store persists a subset of state to localStorage
**Reason**: Replaced by per-project persistence under `handwritten-title-projects`. The `partialize` configuration now covers `projects`, `openProjectIds`, and `activeProjectId` rather than the flat `textObjects` and `canvasBackground`.
**Migration**: None. The old key is abandoned; existing canvas data is not carried forward. The app starts with an empty project list on first load.

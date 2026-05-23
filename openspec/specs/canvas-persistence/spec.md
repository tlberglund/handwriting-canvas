### Requirement: Canvas state is persisted to localStorage
The app SHALL persist all project state to localStorage under the key `handwritten-title-projects` (replacing the old `handwritten-title-canvas` key). The persisted payload SHALL be the Zustand store's `projects` map, `openProjectIds`, and `activeProjectId`. Each project entry contains `textObjects` and `canvasBackground` for that project. The key `handwritten-title-canvas` is no longer written. **BREAKING**: Any data stored under the old key is migrated once on first load (see project-storage spec) and then discarded.

#### Scenario: All projects survive a page reload
- **WHEN** the user has multiple projects with text objects and reloads the page
- **THEN** all projects, their objects, and their background colors are restored from localStorage

#### Scenario: Old key is not written
- **WHEN** the store is serialized to localStorage after the project-model update
- **THEN** `localStorage.getItem('handwritten-title-canvas')` is null (or absent after migration cleanup)

### Requirement: Restored objects render immediately on load
On page load, all restored objects with `state === 'done'` SHALL be rendered to the canvas without requiring user interaction. They SHALL appear fully drawn, not blank.

#### Scenario: Canvas shows content after reload
- **WHEN** the page is loaded after a session with drawn text objects
- **THEN** all previously drawn objects are visible on the canvas within the same render cycle as the glyph set finishing loading

#### Scenario: Objects with no prior animation appear blank
- **WHEN** a text object had `state === 'idle'` at the time of the last save
- **THEN** it is not drawn to the canvas on restore (the handle is visible but the canvas is blank for that object)

### Requirement: All restored objects are coerced to a non-animating state
The `onRehydrateStorage` callback SHALL set every restored object's `state` to `'done'` if it was `'done'`, or `'idle'` otherwise. No restored object SHALL have `state === 'animating'`.

#### Scenario: Mid-animation state is not restored
- **WHEN** the browser is closed while an object is animating (`state === 'animating'`)
- **THEN** on next load the object has `state === 'idle'` and is not drawn

## REMOVED Requirements

### Requirement: Store persists a subset of state to localStorage
**Reason**: Replaced by per-project persistence under `handwritten-title-projects`. The `partialize` configuration now covers `projects`, `openProjectIds`, and `activeProjectId` rather than the flat `textObjects` and `canvasBackground`.
**Migration**: None. The old key is abandoned; existing canvas data is not carried forward. The app starts with an empty project list on first load.

## ADDED Requirements

### Requirement: Project interface is defined in the store module
The store module (`src/store.ts`) SHALL define and export a `Project` TypeScript interface alongside `TextObject`. See the `project-model` capability spec for the full field list.

#### Scenario: Project type is importable
- **WHEN** a component imports `{ type Project }` from `../store`
- **THEN** TypeScript resolves the type without error

### Requirement: Store holds a projects map and open/active state
The Zustand store SHALL add three new top-level fields: `projects: Record<string, Project>`, `openProjectIds: string[]`, and `activeProjectId: string | null`. These are persisted to localStorage as part of the new persistence key.

#### Scenario: Projects map is accessible from any component
- **WHEN** any component calls `useStore(s => s.projects)`
- **THEN** it receives the full map of all stored projects

## MODIFIED Requirements

### Requirement: Store actions
The store SHALL expose the following actions (additions in **bold**): `addObject()`, `selectObject(id: string | null)`, `updateObject(id: string, patch: Partial<TextObject>)`, `deleteObject(id: string)`, `setGlyphSet(gs: GlyphSet)`, `setAnimating(flag: boolean)`, `setCanvasBackground(color: string)`, **`createProject(name: string): string`**, **`renameProject(id: string, name: string): void`**, **`closeProject(id: string): void`**, **`deleteProject(id: string): void`**, **`setActiveProject(id: string): void`**, **`importProjects(data: unknown): void`**. All existing canvas mutations (`addObject`, `updateObject`, `deleteObject`, `setCanvasBackground`) SHALL also write through to `projects[activeProjectId]` so the project map stays in sync with the flat canvas fields.

#### Scenario: updateObject patches both flat state and project map
- **WHEN** `updateObject` is called while a project is active
- **THEN** both `textObjects` (flat) and `projects[activeProjectId].textObjects` reflect the updated object

#### Scenario: setActiveProject replaces flat canvas fields
- **WHEN** `setActiveProject(id)` is called
- **THEN** the flat `textObjects`, `canvasBackground`, and `selectedId` fields are replaced with the values from `projects[id]`

### Requirement: Store persists a subset of state to localStorage
The store SHALL be wrapped with Zustand's `persist` middleware with key `handwritten-title-projects` (replacing `handwritten-title-canvas`). The `partialize` option SHALL restrict the persisted payload to `projects`, `openProjectIds`, and `activeProjectId`. The `onRehydrateStorage` callback SHALL coerce any restored object's `state` to `'done'` or `'idle'` (never `'animating'`). The old key `handwritten-title-canvas` is neither read nor written.

#### Scenario: New persistence key is written
- **WHEN** the store updates for any reason
- **THEN** `localStorage.getItem('handwritten-title-projects')` contains `projects`, `openProjectIds`, and `activeProjectId`

#### Scenario: Old persistence key is not written
- **WHEN** the store is serialized
- **THEN** `localStorage.getItem('handwritten-title-canvas')` is null (after migration cleanup)

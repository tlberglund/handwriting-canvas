## 1. Store: Project Interface and Data Model

- [x] 1.1 Add `Project` interface to `src/store.ts` (id, name, createdAt, textObjects, canvasBackground)
- [x] 1.2 Add `projects: Record<string, Project>`, `openProjectIds: string[]`, and `activeProjectId: string | null` to the `AppState` interface
- [x] 1.3 Add project actions to `AppState`: `createProject`, `renameProject`, `closeProject`, `deleteProject`, `setActiveProject`, `importProjects`
- [x] 1.4 Implement `createProject(name)`: generate UUID, build Project, insert into `projects`, push to `openProjectIds`, set `activeProjectId`, sync flat `textObjects`/`canvasBackground`/`selectedId`
- [x] 1.5 Implement `renameProject(id, name)`: reject empty string, update `projects[id].name`
- [x] 1.6 Implement `closeProject(id)`: remove from `openProjectIds`, if active shift to adjacent or null, sync flat fields
- [x] 1.7 Implement `deleteProject(id)`: remove from `projects` and `openProjectIds`, same active-shift logic as close
- [x] 1.8 Implement `setActiveProject(id)`: replace flat `textObjects`, `canvasBackground`, `selectedId` with values from `projects[id]`
- [x] 1.9 Implement `importProjects(data)`: validate shape, merge incoming projects into `projects` map, redraw if active project was overwritten

## 2. Store: Write-Through and Persistence

- [x] 2.1 Add a `patchActiveProject` internal helper that writes flat-field changes back into `projects[activeProjectId]` atomically
- [x] 2.2 Update `addObject`, `updateObject`, `deleteObject`, `setCanvasBackground` to call `patchActiveProject` after applying changes
- [x] 2.3 Update `persist` middleware: change key to `'handwritten-title-projects'`, update `partialize` to include `projects`, `openProjectIds`, `activeProjectId`
- [x] 2.4 Update `onRehydrateStorage`: coerce restored object states to `'done'`/`'idle'` (no legacy migration needed)

## 3. TabBar Component

- [x] 3.1 Create `src/components/TabBar.tsx` — renders one tab per `openProjectIds` entry plus a "+" button
- [x] 3.2 Each tab renders the project name and an × button; active tab has `selected` class
- [x] 3.3 Clicking a tab calls `setActiveProject(id)` and triggers the canvas switch sequence (see task 4)
- [x] 3.4 Clicking × calls `closeProject(id)`
- [x] 3.5 Clicking "+" calls `createProject("Untitled Project")` and puts the new tab label into edit mode
- [x] 3.6 Implement inline rename: double-click switches label to `<input>`; Enter/blur commits via `renameProject`; Escape reverts; empty input reverts
- [x] 3.7 Add CSS for `#tab-bar`, `.tab`, `.tab.active`, `.tab-label`, `.tab-close`, `#btn-new-project` in `src/styles.css`

## 4. Canvas Switch on Project Change

- [x] 4.1 In `App.tsx`, subscribe to `activeProjectId` changes; on change: clear `animatorMapRef`, call `initCanvas`, re-bootstrap animators for `done` objects, call `redrawAll`
- [x] 4.2 Ensure `setActiveProject` in the store correctly replaces flat fields before `App.tsx`'s effect runs

## 5. App Shell Integration

- [x] 5.1 Update `App.tsx` layout: render `<TabBar>` above the three-column row
- [x] 5.2 Add empty-state rendering when `openProjectIds` is empty (centered prompt, no Stage/panels)
- [x] 5.3 Guard `Stage`, `ObjectsPanel`, and `PropertiesPanel` so they are only rendered when `activeProjectId` is non-null

## 6. Export / Import UI

- [x] 6.1 Add an export button (in the tab bar or a toolbar area); on click, serialize `projects` to JSON and trigger `<a download>` with filename `handwritten-projects-<timestamp>.json`
- [x] 6.2 Add an import button that triggers a hidden `<input type="file" accept=".json">`; on file selected, call `importProjects`
- [x] 6.3 Show a user-visible error (e.g., brief inline message) if the import file fails validation

## 7. Verification

- [x] 7.1 Create two projects, edit each independently — switching tabs shows the correct canvas state for each
- [x] 7.2 Rename a project via double-click; name persists after page reload
- [x] 7.3 Close a project — its tab disappears; reopen app and it is gone from open tabs but present if exported
- [ ] 7.4 Delete a project — it is absent from localStorage on next read
- [x] 7.5 Edit text in a project, reload — text is restored under the correct project
- [x] 7.6 Export — download contains all projects; import the file into a fresh session — all projects appear
- [x] 7.7 Empty state is shown when all tabs are closed; clicking "+" creates a new project and shows the canvas

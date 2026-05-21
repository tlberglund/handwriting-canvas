## Context

The app currently has a single implicit canvas with `textObjects` and `canvasBackground` as flat top-level Zustand state, persisted to `localStorage` under the key `handwritten-title-canvas`. There is no concept of a named or saveable project. To support multiple independent sequences, each with its own objects, layout, and name, we need a project layer that wraps the existing canvas state.

## Goals / Non-Goals

**Goals:**
- Define a `Project` entity and store a keyed map of all projects in the Zustand store
- Add a tab bar showing open projects; support create, rename (inline), close, delete
- Auto-save every project mutation to localStorage under a new unified key
- Provide import (upload JSON) and export (download JSON) for the full projects store
- Ignore the existing `handwritten-title-canvas` key; app starts with no open projects on first load

**Non-Goals:**
- Cloud or backend persistence (localStorage only for now)
- Project version history or undo across projects
- Sharing projects between users
- A project browser / gallery view (the tab bar is the only navigation surface for now)

## Decisions

### 1. Project data shape

```typescript
interface Project {
  id: string           // crypto.randomUUID()
  name: string
  createdAt: number    // Date.now() at creation
  textObjects: TextObject[]
  canvasBackground: string
}
```

`selectedId` is NOT part of the persisted `Project` — it is ephemeral UI state that resets on project switch.

**Alternatives considered:** Nesting `selectedId` inside `Project` (rejected: storing cursor state in the document model is wrong).

---

### 2. Store structure

The Zustand store gains three new top-level fields alongside the existing ones:

```typescript
projects: Record<string, Project>   // all projects ever loaded; keyed by id
openProjectIds: string[]            // ordered; drives tab bar rendering
activeProjectId: string | null      // which tab is in focus
```

Existing flat fields `textObjects`, `canvasBackground`, and `selectedId` remain in the store but now represent the **active project's state**. Components continue to read them via existing selectors; mutations write through to `projects[activeProjectId]` via `updateObject`, `setCanvasBackground`, etc.

**Implementation detail:** Every mutating action that currently patches `textObjects` or `canvasBackground` also writes the updated values back into `projects[activeProjectId]` atomically, keeping the flat fields and the project map in sync.

**Alternatives considered:**
- Removing flat fields entirely and requiring `projects[activeProjectId].textObjects` everywhere: correct but requires touching every selector/component — deferred to a future cleanup.
- Using React Context for per-project state: more idiomatic but adds ceremony; Zustand is already the established pattern here.

---

### 3. localStorage layout

Single key `handwritten-title-projects` replaces `handwritten-title-canvas`. The persisted payload is:

```json
{
  "projects": { "<id>": { ... }, ... },
  "openProjectIds": ["id1", "id2"],
  "activeProjectId": "id1"
}
```

Zustand `persist` middleware is retained; `partialize` is updated to include these three fields only.

---

### 4. No migration

The existing `handwritten-title-canvas` key is ignored entirely. On first load after this change, the app starts with `projects: {}`, `openProjectIds: []`, and `activeProjectId: null` — showing the empty-state welcome screen. The old key can be left in localStorage or cleared manually; the app never reads it.

---

### 5. Tab bar UI

`TabBar` is a new component rendered as a horizontal strip above the three-column layout. Structure per tab:

```
[ label (dbl-click to edit) ][ × ]
```

A "+" button at the far right of the strip creates a new project.

New project creation:
1. Call `createProject("Untitled Project")`
2. Immediately put the new tab's label into inline edit mode so the user can type the name
3. Enter/blur → commit; Escape → keep "Untitled Project" if unchanged

---

### 6. Inline rename

A tab label switches to an `<input>` on double-click. On Enter or blur the input value is committed via `renameProject(id, newName)`. Empty string is rejected (reverts to old name). Escape cancels without saving.

---

### 7. Animator map on project switch

The `animatorMapRef` holds `HandwritingAnimator` instances bound to the current canvas element. On `setActiveProject(id)`:

1. Clear `animatorMapRef.current` (Map.clear())
2. Resize and re-initialize the canvas for the new project (`initCanvas`)
3. Re-bootstrap animators for all `done` objects (same pattern as the restore flow in `App.tsx`)
4. Call `redrawAll` to paint the restored state

---

### 8. Export / Import

**Export:** Serialize `useStore.getState().projects` to JSON and trigger a browser download (`<a download>`). Filename: `handwritten-projects-<timestamp>.json`.

**Import:** `<input type="file" accept=".json">` reads the file, parses it, validates the shape, and merges into the current projects map (projects with matching IDs are overwritten; new IDs are added). `openProjectIds` and `activeProjectId` are unchanged unless the import contained the active project.

## Risks / Trade-offs

- [Flat field sync complexity] Keeping `textObjects`/`canvasBackground` both as flat store fields AND inside `projects[activeProjectId]` requires disciplined write-through in every mutation. → Mitigation: centralize write-through in a single `patchActiveProject` helper inside the store; all existing mutations delegate to it.
- [Animator cleanup on switch] Failing to clear animators before switching projects will bind old animators to the wrong canvas context. → Mitigation: centralize project-switching logic in a single `setActiveProject` action that always clears the map before setting state.
- [Lost existing canvas] The old `handwritten-title-canvas` data is simply abandoned. This is an accepted trade-off — no mitigation.
- [Tab overflow] Many open tabs will overflow the strip horizontally. → No mitigation planned for this phase; rely on CSS `overflow-x: auto` scroll on the tab bar.

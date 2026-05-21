import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GlyphSet } from '@tlberglund/handwriting-playback'

export interface TextObject {
  id: string
  text: string
  x: number
  y: number
  capHeight: number
  speed: number
  thickness: number
  color: string
  highlightColor: string | null
  pixelDensity: number
  state: 'idle' | 'animating' | 'done'
}

export interface Project {
  id: string
  name: string
  createdAt: number
  textObjects: TextObject[]
  canvasBackground: string
}

interface AppState {
  // Project model
  projects: Record<string, Project>
  openProjectIds: string[]
  activeProjectId: string | null

  // Flat canvas state — mirrors the active project for component compatibility
  textObjects: TextObject[]
  selectedId: string | null
  canvasBackground: string

  // Global UI state
  isAnimating: boolean
  isPresentationMode: boolean
  glyphSet: GlyphSet | null

  // Project actions
  createProject: (name: string) => string
  renameProject: (id: string, name: string) => void
  closeProject: (id: string) => void
  deleteProject: (id: string) => void
  setActiveProject: (id: string) => void
  openProject: (id: string) => void
  importProjects: (data: unknown) => boolean

  // Canvas actions (write-through to active project)
  addObject: (stageWidth: number, stageHeight: number) => string
  selectObject: (id: string | null) => void
  updateObject: (id: string, patch: Partial<TextObject>) => void
  deleteObject: (id: string) => void
  setGlyphSet: (gs: GlyphSet) => void
  setAnimating: (flag: boolean) => void
  setPresentationMode: (flag: boolean) => void
  setCanvasBackground: (color: string) => void
}

function isValidProject(p: unknown): p is Project {
  return (
    typeof p === 'object' && p !== null &&
    typeof (p as Project).id === 'string' &&
    typeof (p as Project).name === 'string' &&
    typeof (p as Project).createdAt === 'number' &&
    Array.isArray((p as Project).textObjects) &&
    typeof (p as Project).canvasBackground === 'string'
  )
}

// After removing `id` from `ids`, return the best remaining id (left neighbor, right neighbor, or null)
function adjacentId(ids: string[], id: string): string | null {
  const idx = ids.indexOf(id)
  if (idx === -1) return ids[0] ?? null
  return ids[idx - 1] ?? ids[idx + 1] ?? null
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      projects: {},
      openProjectIds: [],
      activeProjectId: null,
      textObjects: [],
      selectedId: null,
      canvasBackground: '#ffffff',
      isAnimating: false,
      isPresentationMode: false,
      glyphSet: null,

      createProject: (name) => {
        const id = crypto.randomUUID()
        const project: Project = {
          id,
          name,
          createdAt: Date.now(),
          textObjects: [],
          canvasBackground: '#ffffff',
        }
        set(s => ({
          projects: { ...s.projects, [id]: project },
          openProjectIds: [...s.openProjectIds, id],
          activeProjectId: id,
          textObjects: [],
          canvasBackground: '#ffffff',
          selectedId: null,
        }))
        return id
      },

      renameProject: (id, name) => {
        const trimmed = name.trim()
        if (!trimmed) return
        set(s => {
          const p = s.projects[id]
          if (!p) return {}
          return { projects: { ...s.projects, [id]: { ...p, name: trimmed } } }
        })
      },

      closeProject: (id) => set(s => {
        const newOpenIds = s.openProjectIds.filter(i => i !== id)
        if (s.activeProjectId !== id) return { openProjectIds: newOpenIds }
        const nextId = adjacentId(s.openProjectIds, id)
        const next = nextId ? s.projects[nextId] : null
        return {
          openProjectIds: newOpenIds,
          activeProjectId: nextId,
          textObjects: next?.textObjects ?? [],
          canvasBackground: next?.canvasBackground ?? '#ffffff',
          selectedId: null,
        }
      }),

      deleteProject: (id) => set(s => {
        const rest = Object.fromEntries(Object.entries(s.projects).filter(([k]) => k !== id)) as Record<string, Project>
        const newOpenIds = s.openProjectIds.filter(i => i !== id)
        if (s.activeProjectId !== id) return { projects: rest, openProjectIds: newOpenIds }
        const nextId = adjacentId(s.openProjectIds, id)
        const next = nextId ? rest[nextId] : null
        return {
          projects: rest,
          openProjectIds: newOpenIds,
          activeProjectId: nextId,
          textObjects: next?.textObjects ?? [],
          canvasBackground: next?.canvasBackground ?? '#ffffff',
          selectedId: null,
        }
      }),

      setActiveProject: (id) => set(s => {
        const p = s.projects[id]
        if (!p) return {}
        return {
          activeProjectId: id,
          textObjects: p.textObjects,
          canvasBackground: p.canvasBackground,
          selectedId: null,
        }
      }),

      openProject: (id) => set(s => {
        const p = s.projects[id]
        if (!p) return {}
        const openProjectIds = s.openProjectIds.includes(id)
          ? s.openProjectIds
          : [...s.openProjectIds, id]
        return {
          activeProjectId: id,
          openProjectIds,
          textObjects: p.textObjects,
          canvasBackground: p.canvasBackground,
          selectedId: null,
        }
      }),

      importProjects: (data) => {
        if (!data || typeof data !== 'object' || Array.isArray(data)) return false
        const d = data as Record<string, unknown>
        if (!d.projects || typeof d.projects !== 'object' || Array.isArray(d.projects)) return false
        const incoming = Object.values(d.projects as Record<string, unknown>).filter(isValidProject)
        if (incoming.length === 0) return false
        set(s => {
          const merged = { ...s.projects }
          for (const p of incoming) merged[p.id] = p
          const newIds = incoming.map(p => p.id).filter(id => !s.openProjectIds.includes(id))
          const openProjectIds = [...s.openProjectIds, ...newIds]
          const activeOverwritten = s.activeProjectId && merged[s.activeProjectId] !== s.projects[s.activeProjectId]
          if (activeOverwritten) {
            const p = merged[s.activeProjectId!]
            return { projects: merged, openProjectIds, textObjects: p.textObjects, canvasBackground: p.canvasBackground }
          }
          if (!s.activeProjectId && openProjectIds.length > 0) {
            const firstId = openProjectIds[0]
            const p = merged[firstId]
            return { projects: merged, openProjectIds, activeProjectId: firstId, textObjects: p.textObjects, canvasBackground: p.canvasBackground }
          }
          return { projects: merged, openProjectIds }
        })
        return true
      },

      addObject: (stageWidth, stageHeight) => {
        const id = crypto.randomUUID()
        set(s => {
          const newObj: TextObject = {
            id,
            text: 'Hello',
            x: stageWidth / 2,
            y: stageHeight / 2,
            capHeight: 80,
            speed: 1.5,
            thickness: 2,
            color: '#1a1a1a',
            highlightColor: null,
            pixelDensity: 2,
            state: 'idle',
          }
          const newTextObjects = [...s.textObjects, newObj]
          if (!s.activeProjectId) return { textObjects: newTextObjects, selectedId: id }
          return {
            textObjects: newTextObjects,
            selectedId: id,
            projects: {
              ...s.projects,
              [s.activeProjectId]: { ...s.projects[s.activeProjectId], textObjects: newTextObjects },
            },
          }
        })
        return id
      },

      selectObject: (id) => set({ selectedId: id }),

      updateObject: (id, patch) => set(s => {
        const newTextObjects = s.textObjects.map(o => o.id === id ? { ...o, ...patch } : o)
        if (!s.activeProjectId) return { textObjects: newTextObjects }
        return {
          textObjects: newTextObjects,
          projects: {
            ...s.projects,
            [s.activeProjectId]: { ...s.projects[s.activeProjectId], textObjects: newTextObjects },
          },
        }
      }),

      deleteObject: (id) => set(s => {
        const newTextObjects = s.textObjects.filter(o => o.id !== id)
        const newSelectedId = s.selectedId === id ? null : s.selectedId
        if (!s.activeProjectId) return { textObjects: newTextObjects, selectedId: newSelectedId }
        return {
          textObjects: newTextObjects,
          selectedId: newSelectedId,
          projects: {
            ...s.projects,
            [s.activeProjectId]: { ...s.projects[s.activeProjectId], textObjects: newTextObjects },
          },
        }
      }),

      setCanvasBackground: (color) => set(s => {
        if (!s.activeProjectId) return { canvasBackground: color }
        return {
          canvasBackground: color,
          projects: {
            ...s.projects,
            [s.activeProjectId]: { ...s.projects[s.activeProjectId], canvasBackground: color },
          },
        }
      }),

      setGlyphSet: (gs) => set({ glyphSet: gs }),
      setAnimating: (flag) => set({ isAnimating: flag }),
      setPresentationMode: (flag) => set({ isPresentationMode: flag }),
    }),
    {
      name: 'handwritten-title-projects',
      partialize: (state) => ({
        projects: state.projects,
        openProjectIds: state.openProjectIds,
        activeProjectId: state.activeProjectId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        for (const project of Object.values(state.projects)) {
          project.textObjects = project.textObjects.map(o => ({
            ...o,
            state: o.state === 'done' ? 'done' as const : 'idle' as const,
          }))
        }
        if (state.activeProjectId && state.projects[state.activeProjectId]) {
          const p = state.projects[state.activeProjectId]
          state.textObjects = p.textObjects
          state.canvasBackground = p.canvasBackground
        }
      },
    }
  )
)

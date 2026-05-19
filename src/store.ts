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

interface AppState {
  textObjects: TextObject[]
  selectedId: string | null
  canvasBackground: string
  isAnimating: boolean
  glyphSet: GlyphSet | null
  addObject: (stageWidth: number, stageHeight: number) => string
  selectObject: (id: string | null) => void
  updateObject: (id: string, patch: Partial<TextObject>) => void
  deleteObject: (id: string) => void
  setGlyphSet: (gs: GlyphSet) => void
  setAnimating: (flag: boolean) => void
  setCanvasBackground: (color: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      textObjects: [],
      selectedId: null,
      canvasBackground: '#ffffff',
      isAnimating: false,
      glyphSet: null,

      addObject: (stageWidth, stageHeight) => {
        const id = crypto.randomUUID()
        set(s => ({
          textObjects: [...s.textObjects, {
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
          }],
          selectedId: id,
        }))
        return id
      },

      selectObject: (id) => set({ selectedId: id }),

      updateObject: (id, patch) => set(s => ({
        textObjects: s.textObjects.map(o => o.id === id ? { ...o, ...patch } : o),
      })),

      deleteObject: (id) => set(s => ({
        textObjects: s.textObjects.filter(o => o.id !== id),
        selectedId: s.selectedId === id ? null : s.selectedId,
      })),

      setGlyphSet: (gs) => set({ glyphSet: gs }),
      setAnimating: (flag) => set({ isAnimating: flag }),
      setCanvasBackground: (color) => set({ canvasBackground: color }),
    }),
    {
      name: 'handwritten-title-canvas',
      partialize: (state) => ({
        textObjects: state.textObjects,
        canvasBackground: state.canvasBackground,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.textObjects = state.textObjects.map(o => ({
          ...o,
          state: o.state === 'done' ? 'done' : 'idle',
        }))
      },
    }
  )
)

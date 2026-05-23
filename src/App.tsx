import { useRef, useEffect } from 'react'
import { HandwritingAnimator } from '@tlberglund/handwriting-playback'
import type { GlyphSet } from '@tlberglund/handwriting-playback'
import { useStore } from './store'
import EngineContext from './context'
import Stage from './components/Stage'
import PropertiesPanel from './components/PropertiesPanel'
import ObjectsPanel from './components/ObjectsPanel'
import MenuBar from './components/MenuBar'
import TabBar from './components/TabBar'
import { redrawAll, initCanvas } from './engine'
import type { AnimatorEntry } from './engine'

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const animatorMapRef = useRef<Map<string, AnimatorEntry>>(new Map())
  const setGlyphSet = useStore(s => s.setGlyphSet)
  const openProjectIds = useStore(s => s.openProjectIds)
  const activeProjectId = useStore(s => s.activeProjectId)
  const createProject = useStore(s => s.createProject)

  useEffect(() => {
    fetch('./tim-hand.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<GlyphSet>
      })
      .then(data => {
        setGlyphSet(data)
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return
        const { textObjects, canvasBackground } = useStore.getState()
        for (const obj of textObjects) {
          if (obj.state === 'done' && !animatorMapRef.current.has(obj.id)) {
            animatorMapRef.current.set(obj.id, {
              animator: new HandwritingAnimator(canvas, data),
              layout: null,
              layoutText: null,
            })
          }
        }
        redrawAll(canvas, textObjects, canvasBackground, animatorMapRef.current, data)
      })
      .catch(e => console.error('Failed to load tim-hand.json:', e))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-bootstrap canvas when active project changes
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const { textObjects, canvasBackground, glyphSet } = useStore.getState()
    animatorMapRef.current.clear()
    initCanvas(canvas, container)
    if (glyphSet) {
      for (const obj of textObjects) {
        if (obj.state === 'done') {
          animatorMapRef.current.set(obj.id, {
            animator: new HandwritingAnimator(canvas, glyphSet),
            layout: null,
            layoutText: null,
          })
        }
      }
      redrawAll(canvas, textObjects, canvasBackground, animatorMapRef.current, glyphSet)
    }
  }, [activeProjectId])

  const hasActiveProject = activeProjectId !== null && openProjectIds.length > 0

  return (
    <EngineContext.Provider value={{ canvasRef, animatorMapRef, containerRef, stageRef }}>
      <MenuBar />
      <TabBar />
      {hasActiveProject ? (
        <div id="main-row">
          <ObjectsPanel />
          <Stage />
          <PropertiesPanel />
        </div>
      ) : (
        <div id="empty-state">
          <span>No projects open.</span>
          <button onClick={() => createProject('Untitled Project')}>+ New Project</button>
        </div>
      )}
    </EngineContext.Provider>
  )
}

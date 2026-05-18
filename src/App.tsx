import { useRef, useEffect } from 'react'
import { HandwritingAnimator } from '@tlberglund/handwriting-playback'
import type { GlyphSet } from '@tlberglund/handwriting-playback'
import { useStore } from './store'
import EngineContext from './context'
import Stage from './components/Stage'
import PropertiesPanel from './components/PropertiesPanel'

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const animatorMapRef = useRef<Map<string, HandwritingAnimator>>(new Map())
  const setGlyphSet = useStore(s => s.setGlyphSet)

  useEffect(() => {
    fetch('./tim-hand.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<GlyphSet>
      })
      .then(data => setGlyphSet(data))
      .catch(e => console.error('Failed to load tim-hand.json:', e))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <EngineContext.Provider value={{ canvasRef, animatorMapRef, containerRef }}>
      <Stage />
      <PropertiesPanel />
    </EngineContext.Provider>
  )
}

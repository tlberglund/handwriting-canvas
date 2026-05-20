import { useEffect } from 'react'
import { HandwritingAnimator } from '@tlberglund/handwriting-playback'
import { useStore } from '../store'
import { useEngine } from '../context'
import { initCanvas, redrawAll, drawHighlight, SCALE } from '../engine'
import type { AnimatorEntry, AnimatorV2 } from '../engine'

export default function PresentButton() {
  const { canvasRef, containerRef, stageRef, animatorMapRef } = useEngine()
  const textObjects = useStore(s => s.textObjects)
  const isAnimating = useStore(s => s.isAnimating)
  const isPresentationMode = useStore(s => s.isPresentationMode)
  const setPresentationMode = useStore(s => s.setPresentationMode)
  const updateObject = useStore(s => s.updateObject)

  const hasAnimatable = textObjects.some(o => o.text.trim())
  const disabled = !hasAnimatable || isAnimating || isPresentationMode

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) return
      // Exiting full-screen — stop presentation and repaint at restored size
      setPresentationMode(false)
      requestAnimationFrame(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return
        initCanvas(canvas, container)
        const { textObjects: objs, canvasBackground, glyphSet } = useStore.getState()
        redrawAll(canvas, objs, canvasBackground, animatorMapRef.current, glyphSet)
      })
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePresent = async () => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!stage || !canvas || !container) return

    // Capture the normal-mode coordinate space before the container resizes
    const normalW = container.clientWidth
    const normalH = container.clientHeight

    await stage.requestFullscreen()
    setPresentationMode(true)

    // Let the browser apply full-screen layout before measuring
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    // Use pre-fullscreen dims as the design space so object positions are stable
    initCanvas(canvas, container, normalW, normalH)
    // Scale matching the transform: physicalWidth / logicalWidth
    const presentScale = (container.clientWidth * SCALE) / normalW

    // Blank the canvas and reset all objects to idle before the keypress
    const { textObjects: objs, canvasBackground, glyphSet } = useStore.getState()
    for (const obj of objs) {
      updateObject(obj.id, { state: 'idle' })
    }
    redrawAll(canvas, objs.map(o => ({ ...o, state: 'idle' as const })), canvasBackground, animatorMapRef.current, glyphSet)

    // Wait for keypress before starting animations
    await new Promise<void>(resolve => {
      const handler = () => { document.removeEventListener('keydown', handler); resolve() }
      document.addEventListener('keydown', handler, { once: true })
    })

    // Animate sequentially in scene graph order
    for (const obj of objs) {
      if (!obj.text.trim()) continue
      if (!document.fullscreenElement) break

      let entry = animatorMapRef.current.get(obj.id)
      if (!entry) {
        if (!glyphSet) continue
        entry = {
          animator: new HandwritingAnimator(canvas, glyphSet),
          layout: null,
          layoutText: null,
        } satisfies AnimatorEntry
        animatorMapRef.current.set(obj.id, entry)
      }

      updateObject(obj.id, { state: 'animating' })

      const { textObjects: current, canvasBackground: bg, glyphSet: gs } = useStore.getState()
      redrawAll(canvas, current, bg, animatorMapRef.current, gs, obj.id)
      drawHighlight(canvas, obj, gs)

      const v2 = entry.animator as unknown as AnimatorV2
      if (typeof v2.prepare === 'function') {
        if (!entry.layout || entry.layoutText !== obj.text) {
          entry.layout = v2.prepare(obj.text)
          entry.layoutText = obj.text
        }
        await v2.write(entry.layout, {
          x: obj.x,
          y: obj.y,
          capHeight: obj.capHeight,
          speed: obj.speed,
          color: obj.color,
          minWidth: obj.thickness,
          maxWidth: obj.thickness * 2,
          scale: presentScale,
          sounds: true,
        })
      } else {
        await entry.animator.write(obj.text, {
          x: obj.x,
          y: obj.y,
          capHeight: obj.capHeight,
          speed: obj.speed,
          color: obj.color,
          minWidth: obj.thickness,
          maxWidth: obj.thickness * 2,
          scale: presentScale,
          sounds: true,
        })
      }

      updateObject(obj.id, { state: 'done' })
    }

    setPresentationMode(false)
  }

  return (
    <button
      id="btn-present"
      onClick={handlePresent}
      disabled={disabled}
      title="Present: full-screen and play all animations"
    >
      ▶
    </button>
  )
}

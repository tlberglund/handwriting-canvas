import { useStore } from '../store'
import { useEngine } from '../context'
import { redrawAll } from '../engine'

export default function CanvasSettings() {
  const { canvasRef, animatorMapRef } = useEngine()
  const canvasBackground = useStore(s => s.canvasBackground)
  const setCanvasBackground = useStore(s => s.setCanvasBackground)

  return (
    <div className="panel-canvas">
      <div className="control-item">
        <label htmlFor="canvas-bg-picker">Canvas Background</label>
        <input
          type="color"
          id="canvas-bg-picker"
          value={canvasBackground}
          onChange={e => {
            const color = e.target.value
            setCanvasBackground(color)
            const canvas = canvasRef.current
            if (!canvas) return
            const { textObjects, glyphSet } = useStore.getState()
            redrawAll(canvas, textObjects, color, animatorMapRef.current, glyphSet)
          }}
        />
      </div>
    </div>
  )
}

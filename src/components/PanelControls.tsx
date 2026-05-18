import { HandwritingAnimator } from '@tlberglund/handwriting-playback'
import { useStore, type TextObject } from '../store'
import { useEngine } from '../context'
import { redrawAll, instantDraw, drawHighlight, SCALE } from '../engine'

interface Props {
  obj: TextObject
}

export default function PanelControls({ obj }: Props) {
  const { canvasRef, animatorMapRef } = useEngine()
  const updateObject = useStore(s => s.updateObject)
  const deleteObject = useStore(s => s.deleteObject)
  const isAnimating = useStore(s => s.isAnimating)
  const setAnimating = useStore(s => s.setAnimating)

  // Reads state in callbacks — uses getState() per rerender-defer-reads
  const redrawSelected = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { textObjects, canvasBackground, glyphSet } = useStore.getState()
    const storeObj = textObjects.find(o => o.id === obj.id)
    if (!storeObj || storeObj.state !== 'done') return
    redrawAll(canvas, textObjects, canvasBackground, animatorMapRef.current, glyphSet, obj.id)
    instantDraw(canvas, storeObj, animatorMapRef.current, glyphSet)
  }

  const handleAnimate = async () => {
    const canvas = canvasRef.current
    if (!canvas || isAnimating || !obj.text.trim()) return
    const { glyphSet } = useStore.getState()
    if (!glyphSet) return

    let animator = animatorMapRef.current.get(obj.id)
    if (!animator) {
      animator = new HandwritingAnimator(canvas, glyphSet)
      animatorMapRef.current.set(obj.id, animator)
    }

    setAnimating(true)
    updateObject(obj.id, { state: 'animating' })

    const { textObjects, canvasBackground } = useStore.getState()
    redrawAll(canvas, textObjects, canvasBackground, animatorMapRef.current, glyphSet, obj.id)
    drawHighlight(canvas, obj, glyphSet)

    await animator.write(obj.text, {
      x: obj.x,
      y: obj.y,
      capHeight: obj.capHeight,
      speed: obj.speed,
      color: obj.color,
      minWidth: obj.thickness,
      maxWidth: obj.thickness * 2,
      scale: SCALE,
      sounds: true,
    })

    updateObject(obj.id, { state: 'done' })
    setAnimating(false)
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    updateObject(obj.id, { state: 'idle' })
    const { textObjects, canvasBackground, glyphSet } = useStore.getState()
    redrawAll(canvas, textObjects, canvasBackground, animatorMapRef.current, glyphSet, obj.id)
  }

  const handleDelete = () => {
    deleteObject(obj.id)
    animatorMapRef.current.delete(obj.id)
    const canvas = canvasRef.current
    if (!canvas) return
    const { textObjects, canvasBackground, glyphSet } = useStore.getState()
    redrawAll(canvas, textObjects, canvasBackground, animatorMapRef.current, glyphSet)
  }

  return (
    <div id="panel-controls">
      <div className="control-item">
        <label>Text</label>
        <input
          type="text"
          value={obj.text}
          placeholder="Enter text…"
          onChange={e => updateObject(obj.id, { text: e.target.value })}
        />
      </div>

      <div className="control-item">
        <label>Cap Height</label>
        <div className="value-row">
          <input
            type="range" min="20" max="200" step="4"
            value={obj.capHeight}
            onChange={e => {
              updateObject(obj.id, { capHeight: parseInt(e.target.value) })
              redrawSelected()
            }}
          />
          <span className="val-display">{obj.capHeight}px</span>
        </div>
      </div>

      <div className="control-item">
        <label>Speed</label>
        <div className="value-row">
          <input
            type="range" min="0.5" max="5" step="0.1"
            value={obj.speed}
            onChange={e => updateObject(obj.id, { speed: parseFloat(e.target.value) })}
          />
          <span className="val-display">{obj.speed.toFixed(1)}×</span>
        </div>
      </div>

      <div className="control-item">
        <label>Thickness</label>
        <div className="value-row">
          <input
            type="range" min="1" max="10" step="0.5"
            value={obj.thickness}
            onChange={e => {
              updateObject(obj.id, { thickness: parseFloat(e.target.value) })
              redrawSelected()
            }}
          />
          <span className="val-display">{obj.thickness}px</span>
        </div>
      </div>

      <div className="control-item">
        <label>Ink Color</label>
        <input
          type="color"
          value={obj.color}
          onChange={e => {
            updateObject(obj.id, { color: e.target.value })
            redrawSelected()
          }}
        />
      </div>

      <div className="control-item">
        <label>Highlight</label>
        <div className="value-row">
          <input
            type="checkbox"
            checked={!!obj.highlightColor}
            onChange={e => {
              updateObject(obj.id, {
                highlightColor: e.target.checked ? (obj.highlightColor ?? '#ffff66') : null,
              })
              redrawSelected()
            }}
          />
          <input
            type="color"
            value={obj.highlightColor ?? '#ffff66'}
            disabled={!obj.highlightColor}
            onChange={e => {
              updateObject(obj.id, { highlightColor: e.target.value })
              redrawSelected()
            }}
          />
        </div>
      </div>

      <div className="control-item">
        <label>Pixel Density</label>
        <div className="value-row">
          <input
            type="range" min="1" max="4" step="1"
            value={obj.pixelDensity}
            onChange={e => {
              updateObject(obj.id, { pixelDensity: parseInt(e.target.value) })
              redrawSelected()
            }}
          />
          <span className="val-display">{obj.pixelDensity}</span>
        </div>
      </div>

      <div className="action-row">
        <button id="btn-animate" onClick={handleAnimate} disabled={isAnimating}>
          Animate
        </button>
        <button id="btn-clear" onClick={handleClear}>Clear</button>
      </div>

      <button id="btn-delete" onClick={handleDelete}>Delete Object</button>
    </div>
  )
}

import { HandwritingAnimator } from '@tlberglund/handwriting-playback'
import { useStore, type TextObject } from '../store'
import { useEngine } from '../context'
import { redrawAll, instantDraw, drawHighlight, SCALE } from '../engine'
import type { AnimatorEntry, AnimatorV2 } from '../engine'

interface Props {
  obj: TextObject
}

export default function PanelControls({ obj }: Props) {
  const { canvasRef, animatorMapRef } = useEngine()
  const updateObject = useStore(s => s.updateObject)
  const isAnimating = useStore(s => s.isAnimating)
  const isPresentationMode = useStore(s => s.isPresentationMode)
  const setAnimating = useStore(s => s.setAnimating)

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

    let entry = animatorMapRef.current.get(obj.id)
    if (!entry) {
      entry = {
        animator: new HandwritingAnimator(canvas, glyphSet),
        layout: null,
        layoutText: null,
      } satisfies AnimatorEntry
      animatorMapRef.current.set(obj.id, entry)
    }

    setAnimating(true)
    updateObject(obj.id, { state: 'animating' })

    const { textObjects, canvasBackground } = useStore.getState()
    redrawAll(canvas, textObjects, canvasBackground, animatorMapRef.current, glyphSet, obj.id)
    drawHighlight(canvas, obj, glyphSet)

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
        scale: SCALE,
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
        scale: SCALE,
        sounds: true,
      })
      entry.layout = null
      entry.layoutText = null
    }

    updateObject(obj.id, { state: 'done' })
    setAnimating(false)
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    updateObject(obj.id, { state: 'idle' })
    // Invalidate cached layout so next animation gets fresh captures
    const entry = animatorMapRef.current.get(obj.id)
    if (entry) { entry.layout = null; entry.layoutText = null }
    const { textObjects, canvasBackground, glyphSet } = useStore.getState()
    redrawAll(canvas, textObjects, canvasBackground, animatorMapRef.current, glyphSet, obj.id)
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
        <button id="btn-animate" onClick={handleAnimate} disabled={isAnimating || isPresentationMode}>
          Animate
        </button>
        <button id="btn-clear" onClick={handleClear}>Clear</button>
      </div>

    </div>
  )
}

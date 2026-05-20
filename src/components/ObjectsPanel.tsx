import { HandwritingAnimator } from '@tlberglund/handwriting-playback'
import { useStore } from '../store'
import { useEngine } from '../context'
import { redrawAll } from '../engine'
import PresentButton from './PresentButton'

export default function ObjectsPanel() {
  const { containerRef, canvasRef, animatorMapRef } = useEngine()
  const textObjects = useStore(s => s.textObjects)
  const selectedId = useStore(s => s.selectedId)
  const addObject = useStore(s => s.addObject)
  const selectObject = useStore(s => s.selectObject)
  const deleteObject = useStore(s => s.deleteObject)

  const handleNew = () => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container) return
    const id = addObject(container.clientWidth, container.clientHeight)
    const { glyphSet } = useStore.getState()
    if (canvas && glyphSet) {
      animatorMapRef.current.set(id, {
        animator: new HandwritingAnimator(canvas, glyphSet),
        layout: null,
        layoutText: null,
      })
    }
  }

  const handleDelete = (id: string) => {
    deleteObject(id)
    animatorMapRef.current.delete(id)
    const canvas = canvasRef.current
    if (!canvas) return
    const { textObjects: objs, canvasBackground, glyphSet } = useStore.getState()
    redrawAll(canvas, objs, canvasBackground, animatorMapRef.current, glyphSet)
  }

  return (
    <aside id="objects-panel">
      <div id="objects-panel-header">
        <span>Objects</span>
        <div id="objects-panel-actions">
          <PresentButton />
          <button id="btn-new-obj" onClick={handleNew}>New</button>
        </div>
      </div>
      <ul id="objects-tree">
        {textObjects.map(obj => (
          <li
            key={obj.id}
            className={`tree-node${obj.id === selectedId ? ' selected' : ''}`}
            onClick={() => selectObject(obj.id)}
          >
            <span className="tree-node-label">
              {obj.text.trim()
                ? obj.text
                : <span className="tree-node-empty">(empty)</span>
              }
            </span>
            <button
              className="tree-node-delete"
              onClick={e => { e.stopPropagation(); handleDelete(obj.id) }}
              title="Delete"
            >✕</button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

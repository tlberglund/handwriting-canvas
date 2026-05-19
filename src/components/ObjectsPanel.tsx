import { HandwritingAnimator } from '@tlberglund/handwriting-playback'
import { useStore } from '../store'
import { useEngine } from '../context'

export default function ObjectsPanel() {
  const { containerRef, canvasRef, animatorMapRef } = useEngine()
  const textObjects = useStore(s => s.textObjects)
  const selectedId = useStore(s => s.selectedId)
  const addObject = useStore(s => s.addObject)
  const selectObject = useStore(s => s.selectObject)

  const handleNew = () => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container) return
    const id = addObject(container.clientWidth, container.clientHeight)
    const { glyphSet } = useStore.getState()
    if (canvas && glyphSet) {
      animatorMapRef.current.set(id, new HandwritingAnimator(canvas, glyphSet))
    }
  }

  return (
    <aside id="objects-panel">
      <div id="objects-panel-header">
        <span>Objects</span>
        <button id="btn-new-obj" onClick={handleNew}>New</button>
      </div>
      <ul id="objects-tree">
        {textObjects.map(obj => (
          <li
            key={obj.id}
            className={`tree-node${obj.id === selectedId ? ' selected' : ''}`}
            onClick={() => selectObject(obj.id)}
          >
            {obj.text.trim()
              ? obj.text
              : <span className="tree-node-empty">(empty)</span>
            }
          </li>
        ))}
      </ul>
    </aside>
  )
}

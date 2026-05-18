import { HandwritingAnimator } from '@tlberglund/handwriting-playback'
import { useStore } from '../store'
import { useEngine } from '../context'

export default function PanelFooter() {
  const { canvasRef, containerRef, animatorMapRef } = useEngine()
  const addObject = useStore(s => s.addObject)

  const handleNewText = () => {
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
    <div className="panel-footer">
      <button id="btn-new" onClick={handleNewText}>+ New Text</button>
    </div>
  )
}

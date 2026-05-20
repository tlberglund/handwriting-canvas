import { useEffect } from 'react'
import { useStore } from '../store'
import { useEngine } from '../context'
import { initCanvas, redrawAll } from '../engine'
import ObjectHandle from './ObjectHandle'

export default function Stage() {
  const { canvasRef, containerRef, animatorMapRef, stageRef } = useEngine()
  const textObjects = useStore(s => s.textObjects)
  const selectObject = useStore(s => s.selectObject)

  useEffect(() => {
    const handleResize = () => {
      if (useStore.getState().isPresentationMode) return
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return
      initCanvas(canvas, container)
      const { textObjects: objs, canvasBackground, glyphSet } = useStore.getState()
      redrawAll(canvas, objs, canvasBackground, animatorMapRef.current, glyphSet)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || e.target === containerRef.current) {
      selectObject(null)
    }
  }

  return (
    <div id="stage" ref={stageRef}>
      <div id="canvas-container" ref={containerRef} onClick={handleClick}>
        <canvas ref={canvasRef} id="output-canvas" />
        {textObjects.map(obj => (
          <ObjectHandle key={obj.id} obj={obj} />
        ))}
      </div>
    </div>
  )
}

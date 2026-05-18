import { useRef } from 'react'
import { useStore, type TextObject } from '../store'
import { useEngine } from '../context'
import { measureText, BOUND_PAD_X, BOUND_PAD_Y, redrawAll, instantDraw } from '../engine'

interface Props {
  obj: TextObject
}

export default function ObjectHandle({ obj }: Props) {
  const { canvasRef, animatorMapRef } = useEngine()
  const selectedId = useStore(s => s.selectedId)
  const glyphSet = useStore(s => s.glyphSet)
  const updateObject = useStore(s => s.updateObject)
  const selectObject = useStore(s => s.selectObject)

  // Transient drag state lives in a ref — no re-renders during drag
  const dragRef = useRef<{
    startClientX: number
    startClientY: number
    startObjX: number
    startObjY: number
    moved: boolean
  } | null>(null)
  const rafRef = useRef<number | null>(null)

  const measure = measureText(obj.text, obj.capHeight, glyphSet)
  const boxW = (measure ? measure.width : 40) + BOUND_PAD_X * 2
  const boxH = obj.capHeight * 1.25 + BOUND_PAD_Y * 2
  const isSelected = obj.id === selectedId

  const style: React.CSSProperties = {
    left: obj.x - BOUND_PAD_X,
    top: obj.y - BOUND_PAD_Y,
    width: boxW,
    height: boxH,
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    selectObject(obj.id)
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startObjX: obj.x,
      startObjY: obj.y,
      moved: false,
    }
    e.preventDefault()
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const dx = e.clientX - drag.startClientX
    const dy = e.clientY - drag.startClientY
    if (!drag.moved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return
    drag.moved = true

    const newX = drag.startObjX + dx
    const newY = drag.startObjY + dy
    updateObject(obj.id, { x: newX, y: newY })

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const canvas = canvasRef.current
        if (!canvas) return
        const { textObjects, canvasBackground, glyphSet: gs } = useStore.getState()
        const live = textObjects.find(o => o.id === obj.id)
        redrawAll(canvas, textObjects, canvasBackground, animatorMapRef.current, gs, obj.id)
        if (live?.state === 'done') instantDraw(canvas, live, animatorMapRef.current, gs)
      })
    }
  }

  const handlePointerUp = () => {
    dragRef.current = null
  }

  return (
    <div
      className={`handle${isSelected ? ' selected' : ''}`}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  )
}

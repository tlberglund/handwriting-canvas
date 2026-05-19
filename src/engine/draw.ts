import type { HandwritingAnimator, GlyphSet } from '@tlberglund/handwriting-playback'
import type { TextObject } from '../store'
import { measureText, BOUND_PAD_X, BOUND_PAD_Y } from './measure'

export const SCALE = 2

// New in 0.3.2 — declared locally so code compiles against 0.3.1.
// Remove this block once the package is updated.
interface HandwritingLayout {
  readonly sequence: unknown[]
  readonly width: number
}
interface AnimatorV2 {
  prepare(text: string): HandwritingLayout
  write(layout: HandwritingLayout, opts: Record<string, unknown>): Promise<void>
}

export interface AnimatorEntry {
  animator: HandwritingAnimator
  layout: HandwritingLayout | null
  layoutText: string | null
}

export function initCanvas(canvas: HTMLCanvasElement, container: HTMLDivElement): void {
  canvas.width = container.clientWidth * SCALE
  canvas.height = container.clientHeight * SCALE
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0)
}

export function drawHighlight(
  canvas: HTMLCanvasElement,
  obj: TextObject,
  glyphSet: GlyphSet | null,
): void {
  if (!obj.highlightColor) return
  const measure = measureText(obj.text, obj.capHeight, glyphSet)
  if (!measure) return
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = obj.highlightColor
  ctx.fillRect(
    obj.x - BOUND_PAD_X,
    obj.y - BOUND_PAD_Y,
    measure.width + BOUND_PAD_X * 2,
    obj.capHeight * 1.25 + BOUND_PAD_Y * 2,
  )
}

export function instantDraw(
  canvas: HTMLCanvasElement,
  obj: TextObject,
  animatorMap: Map<string, AnimatorEntry>,
  glyphSet: GlyphSet | null,
): void {
  if (!obj.text?.trim()) return
  const entry = animatorMap.get(obj.id)
  if (!entry) return
  const v2 = entry.animator as unknown as AnimatorV2
  if (typeof v2.prepare === 'function') {
    if (entry.layoutText !== obj.text) {
      entry.layout = v2.prepare(obj.text)
      entry.layoutText = obj.text
    }
    if (!entry.layout) return
    drawHighlight(canvas, obj, glyphSet)
    v2.write(entry.layout, {
      x: obj.x,
      y: obj.y,
      capHeight: obj.capHeight,
      color: obj.color,
      minWidth: obj.thickness,
      maxWidth: obj.thickness * 2,
      scale: SCALE,
      instant: true,
    })
  } else {
    // fallback for 0.3.1 — remove once 0.3.2 is installed
    drawHighlight(canvas, obj, glyphSet)
    entry.animator.write(obj.text, {
      x: obj.x,
      y: obj.y,
      capHeight: obj.capHeight,
      speed: obj.speed,
      color: obj.color,
      minWidth: obj.thickness,
      maxWidth: obj.thickness * 2,
      scale: SCALE,
      instant: true,
    })
  }
}

export function redrawAll(
  canvas: HTMLCanvasElement,
  textObjects: TextObject[],
  canvasBackground: string,
  animatorMap: Map<string, AnimatorEntry>,
  glyphSet: GlyphSet | null,
  exceptId?: string,
): void {
  const ctx = canvas.getContext('2d')!
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = canvasBackground
  ctx.fillRect(0, 0, w, h)
  for (const obj of textObjects) {
    if (obj.id === exceptId) continue
    if (obj.state === 'done') instantDraw(canvas, obj, animatorMap, glyphSet)
  }
}

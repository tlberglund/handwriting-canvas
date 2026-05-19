import { createContext, useContext } from 'react'
import type { RefObject, MutableRefObject } from 'react'
import type { AnimatorEntry } from './engine'

export interface EngineContextValue {
  canvasRef: RefObject<HTMLCanvasElement | null>
  animatorMapRef: MutableRefObject<Map<string, AnimatorEntry>>
  containerRef: RefObject<HTMLDivElement | null>
}

const EngineContext = createContext<EngineContextValue | null>(null)

export default EngineContext

export function useEngine(): EngineContextValue {
  const ctx = useContext(EngineContext)
  if (!ctx) throw new Error('useEngine must be used inside EngineContext.Provider')
  return ctx
}

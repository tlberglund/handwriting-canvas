import type { GlyphSet } from '@tlberglund/handwriting-playback'

export const BOUND_PAD_X = 8
export const BOUND_PAD_Y = 4

export function measureText(
  text: string,
  capHeight: number,
  glyphSet: GlyphSet | null,
): { width: number } | null {
  if (!glyphSet || !text?.trim()) return null
  const LETTER_GAP = 0.05
  const WORD_GAP = 0.35
  let xOffset = 0
  let hasGlyph = false
  for (const char of text) {
    if (char === ' ') {
      xOffset += WORD_GAP
    } else {
      const glyph = glyphSet.glyphs[char]
      if (!glyph?.captures?.length) continue
      xOffset += glyph.captures[0].width + LETTER_GAP
      hasGlyph = true
    }
  }
  if (!hasGlyph) return null
  return { width: Math.max(0, xOffset - LETTER_GAP) * capHeight }
}

import { COLORS, CELL_STYLE, PATTERN_COLORS, PATTERN_SYMBOL_STYLE } from '../../lib/game/constants'
import type { PatternId } from '../../lib/game/Domain/Core/Id'
import { getPatternDefinition } from '../../lib/game/Domain/Effect/Pattern'

/**
 * パターン用のカラーセットを取得
 */
function getPatternColors(
  pattern: PatternId | null
): { base: string; highlight: string; shadow: string } {
  if (pattern && PATTERN_COLORS[pattern]) {
    return PATTERN_COLORS[pattern]
  }
  return {
    base: COLORS.piece,
    highlight: COLORS.pieceHighlight,
    shadow: COLORS.pieceShadow,
  }
}

/**
 * パターン記号を描画
 */
function drawPatternSymbol(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  symbol: string,
  fontSize?: number
): void {
  const { fontFamily, color, shadowColor, shadowBlur } = PATTERN_SYMBOL_STYLE
  const actualFontSize = fontSize ?? PATTERN_SYMBOL_STYLE.fontSize

  ctx.save()
  ctx.font = `bold ${actualFontSize}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = shadowColor
  ctx.shadowBlur = shadowBlur
  ctx.fillStyle = color
  ctx.fillText(symbol, x + size / 2, y + size / 2)
  ctx.restore()
}

/**
 * 木目調のセルを描画する共通関数（パターン対応版）
 */
export function drawWoodenCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  pattern: PatternId | null = null
): void {
  const { padding, highlightWidth, shadowWidth } = CELL_STYLE
  const colors = getPatternColors(pattern)

  // ベース色
  ctx.fillStyle = colors.base
  ctx.fillRect(x + padding, y + padding, size - padding * 2, size - padding * 2)

  // ハイライト（上端と左端）
  ctx.fillStyle = colors.highlight
  ctx.fillRect(x + padding, y + padding, size - padding * 2, highlightWidth)
  ctx.fillRect(x + padding, y + padding, highlightWidth, size - padding * 2)

  // シャドウ（下端と右端）
  ctx.fillStyle = colors.shadow
  ctx.fillRect(
    x + padding,
    y + size - padding - shadowWidth,
    size - padding * 2,
    shadowWidth
  )
  ctx.fillRect(
    x + size - padding - shadowWidth,
    y + padding,
    shadowWidth,
    size - padding * 2
  )

  // パターン記号を描画
  if (pattern) {
    const patternDef = getPatternDefinition(pattern)
    if (patternDef) {
      drawPatternSymbol(ctx, x, y, size, patternDef.symbol)
    }
  }
}

/**
 * 木目調のセルを描画（枠線付き）
 */
export function drawWoodenCellWithBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  pattern: PatternId | null = null
): void {
  const { padding } = CELL_STYLE

  drawWoodenCell(ctx, x, y, size, pattern)

  // 枠線
  ctx.strokeStyle = COLORS.cellBorder
  ctx.lineWidth = 1
  ctx.strokeRect(
    x + padding,
    y + padding,
    size - padding * 2,
    size - padding * 2
  )
}

/**
 * 小さいセル用のパターン付き描画（shopRenderer等で使用）
 */
export function drawWoodenCellSmall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  pattern: PatternId | null = null
): void {
  const { padding, highlightWidth, shadowWidth } = CELL_STYLE
  const colors = getPatternColors(pattern)

  // ベース色
  ctx.fillStyle = colors.base
  ctx.fillRect(x + padding, y + padding, size - padding * 2, size - padding * 2)

  // ハイライト（上端と左端）
  ctx.fillStyle = colors.highlight
  ctx.fillRect(x + padding, y + padding, size - padding * 2, highlightWidth)
  ctx.fillRect(x + padding, y + padding, highlightWidth, size - padding * 2)

  // シャドウ（下端と右端）
  ctx.fillStyle = colors.shadow
  ctx.fillRect(
    x + padding,
    y + size - padding - shadowWidth,
    size - padding * 2,
    shadowWidth
  )
  ctx.fillRect(
    x + size - padding - shadowWidth,
    y + padding,
    shadowWidth,
    size - padding * 2
  )

  // パターン記号を描画（小さいフォント）
  if (pattern) {
    const patternDef = getPatternDefinition(pattern)
    if (patternDef) {
      const smallFontSize = Math.max(8, Math.floor(size * 0.4))
      drawPatternSymbol(ctx, x, y, size, patternDef.symbol, smallFontSize)
    }
  }
}

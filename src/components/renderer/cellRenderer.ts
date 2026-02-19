import { COLORS, CELL_STYLE, PATTERN_COLORS, PATTERN_SYMBOL_STYLE, SEAL_COLORS, SEAL_SYMBOL_STYLE } from '../../lib/game/Data/Constants'
import type { PatternId, SealId } from '../../lib/game/Domain/Core/Id'
import { getPatternDefinition } from '../../lib/game/Domain/Effect/Pattern'
import { getSealDefinition } from '../../lib/game/Domain/Effect/Seal'

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
 * パターン記号を描画（セル中央）
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
 * シール記号を描画（セル右下）
 */
function drawSealSymbol(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  seal: SealId,
  fontSize?: number
): void {
  const sealDef = getSealDefinition(seal)
  if (!sealDef) return

  const { fontFamily, backgroundColor, borderRadius, padding } = SEAL_SYMBOL_STYLE
  const actualFontSize = fontSize ?? SEAL_SYMBOL_STYLE.fontSize
  const sealColor = SEAL_COLORS[seal] ?? '#FFFFFF'

  ctx.save()

  // テキストサイズを計算
  ctx.font = `bold ${actualFontSize}px ${fontFamily}`
  const metrics = ctx.measureText(sealDef.symbol)
  const textWidth = metrics.width
  const textHeight = actualFontSize

  // 右下に配置
  const bgWidth = textWidth + padding * 4
  const bgHeight = textHeight + padding * 2
  const bgX = x + size - bgWidth - 2
  const bgY = y + size - bgHeight - 2

  // 背景
  ctx.fillStyle = backgroundColor
  ctx.beginPath()
  ctx.roundRect(bgX, bgY, bgWidth, bgHeight, borderRadius)
  ctx.fill()

  // 記号
  ctx.fillStyle = sealColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(sealDef.symbol, bgX + bgWidth / 2, bgY + bgHeight / 2)

  ctx.restore()
}

/**
 * 木目調のセルを描画する共通関数（パターン・シール対応版）
 */
export function drawWoodenCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  pattern: PatternId | null = null,
  seal: SealId | null = null,
  chargeValue: number = 0
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

  // パターン記号を描画（中央）
  if (pattern) {
    const patternDef = getPatternDefinition(pattern)
    if (patternDef) {
      drawPatternSymbol(ctx, x, y, size, patternDef.symbol)

      // チャージパターンの場合、記号の下に値を表示
      if (pattern === 'charge') {
        const { fontFamily, color } = PATTERN_SYMBOL_STYLE
        const chargeFontSize = Math.max(8, Math.floor(size * 0.28))
        ctx.save()
        ctx.font = `bold ${chargeFontSize}px ${fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = color
        ctx.fillText(`+${chargeValue}`, x + size / 2, y + size / 2 + chargeFontSize * 0.3)
        ctx.restore()
      }
    }
  }

  // シール記号を描画（右下）
  if (seal) {
    drawSealSymbol(ctx, x, y, size, seal)
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
  pattern: PatternId | null = null,
  seal: SealId | null = null,
  chargeValue: number = 0
): void {
  const { padding } = CELL_STYLE

  drawWoodenCell(ctx, x, y, size, pattern, seal, chargeValue)

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


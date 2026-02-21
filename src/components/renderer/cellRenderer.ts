import { COLORS, CELL_STYLE, PATTERN_COLORS, PATTERN_SYMBOL_STYLE, SEAL_COLORS, SEAL_SYMBOL_STYLE, BLESSING_COLORS, BLESSING_OUTLINE_STYLE, BUFF_COLORS, BUFF_OVERLAY_STYLE } from '../../lib/game/Data/Constants'
import type { PatternId, SealId, BlessingId } from '../../lib/game/Domain/Core/Id'
import type { BuffType } from '../../lib/game/Domain/Effect/Buff'
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
  chargeValue: number = 0,
  blessing: BlessingId | null = null
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

  // 加護マークを描画（左上）
  if (blessing) {
    drawBlessingOnBlock(ctx, x, y, size, blessing)
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
  chargeValue: number = 0,
  blessing: BlessingId | null = null
): void {
  const { padding } = CELL_STYLE

  drawWoodenCell(ctx, x, y, size, pattern, seal, chargeValue, blessing)

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
 * ブロック上の加護マークを描画（カラーアウトライン）
 */
export function drawBlessingOnBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  blessing: BlessingId
): void {
  const blessingColor = BLESSING_COLORS[blessing as string] ?? '#FFFFFF'
  const { lineWidth, inset } = BLESSING_OUTLINE_STYLE
  const { padding } = CELL_STYLE

  // padding + inset の位置にアウトライン描画
  const offset = padding + inset
  ctx.save()
  ctx.strokeStyle = blessingColor
  ctx.lineWidth = lineWidth
  ctx.strokeRect(
    x + offset,
    y + offset,
    size - offset * 2,
    size - offset * 2
  )
  ctx.restore()
}

/**
 * 空セルのバフインジケーターを描画
 * セル全体にカラーオーバーレイ＋アウトライン（レベルで濃さが変化）
 */
export function drawBuffIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  buff: BuffType,
  level: number,
  isObstacle: boolean = false
): void {
  const buffColor = BUFF_COLORS[buff] ?? '#FFFFFF'
  const { outlineWidth, fillAlphaBase, fillAlphaPerLevel, outlineAlphaBase, outlineAlphaPerLevel, levelFontSizeRatio } = BUFF_OVERLAY_STYLE
  const { padding } = CELL_STYLE

  const obstacleScale = isObstacle ? 0.5 : 1.0
  const fillAlpha = (fillAlphaBase + fillAlphaPerLevel * level) * obstacleScale
  const outlineAlpha = (outlineAlphaBase + outlineAlphaPerLevel * level) * obstacleScale

  const innerX = x + padding
  const innerY = y + padding
  const innerSize = size - padding * 2

  ctx.save()

  // 半透明オーバーレイ塗り
  ctx.globalAlpha = fillAlpha
  ctx.fillStyle = buffColor
  ctx.fillRect(innerX, innerY, innerSize, innerSize)

  // カラーアウトライン
  ctx.globalAlpha = outlineAlpha
  ctx.strokeStyle = buffColor
  ctx.lineWidth = outlineWidth
  ctx.strokeRect(innerX, innerY, innerSize, innerSize)

  // Lv2以上: 右下にレベル数字
  if (level > 1) {
    const lvFontSize = Math.max(8, Math.floor(size * levelFontSizeRatio))
    ctx.globalAlpha = isObstacle ? 0.3 : 0.7
    ctx.font = `bold ${lvFontSize}px Arial, sans-serif`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillStyle = buffColor
    ctx.fillText(`${level}`, x + size - 3, y + size - 2)
  }

  ctx.restore()
}

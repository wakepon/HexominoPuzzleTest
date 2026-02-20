import { COLORS, CELL_STYLE, PATTERN_COLORS, PATTERN_SYMBOL_STYLE, SEAL_COLORS, SEAL_SYMBOL_STYLE, BLESSING_COLORS, BLESSING_SYMBOL_STYLE } from '../../lib/game/Data/Constants'
import type { PatternId, SealId, BlessingId } from '../../lib/game/Domain/Core/Id'
import { getPatternDefinition } from '../../lib/game/Domain/Effect/Pattern'
import { getSealDefinition } from '../../lib/game/Domain/Effect/Seal'
import { getBlessingDefinition } from '../../lib/game/Domain/Effect/Blessing'

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
  chargeValue: number = 0,
  blessing: BlessingId | null = null
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

  // ブロック上の加護マーク（左上）
  if (blessing) {
    drawBlessingOnBlock(ctx, x, y, size, blessing)
  }
}

/**
 * ブロック上の加護マークを描画（左上のバッジ）
 */
export function drawBlessingOnBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  _size: number,
  blessing: BlessingId
): void {
  const blessingDef = getBlessingDefinition(blessing)
  if (!blessingDef) return

  const { fontSize, fontFamily } = BLESSING_SYMBOL_STYLE
  const blessingColor = BLESSING_COLORS[blessing as string] ?? '#FFFFFF'

  ctx.save()

  ctx.font = `bold ${fontSize}px ${fontFamily}`
  const metrics = ctx.measureText(blessingDef.symbol)
  const textWidth = metrics.width
  const textHeight = fontSize

  // 左上に配置
  const padding = 1
  const bgWidth = textWidth + padding * 4
  const bgHeight = textHeight + padding * 2
  const bgX = x + 2
  const bgY = y + 2

  // 背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.beginPath()
  ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 2)
  ctx.fill()

  // 記号
  ctx.fillStyle = blessingColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(blessingDef.symbol, bgX + bgWidth / 2, bgY + bgHeight / 2)

  ctx.restore()
}

/**
 * 空セルの加護インジケーターを描画
 * セルに淡いシンボルを表示（レベルで明るさが変化）
 */
export function drawBlessingIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  blessing: BlessingId,
  level: number,
  isObstacle: boolean = false
): void {
  const blessingDef = getBlessingDefinition(blessing)
  if (!blessingDef) return

  const blessingColor = BLESSING_COLORS[blessing as string] ?? '#FFFFFF'
  // レベルで明るさ変化: Lv1=0.2, Lv2=0.35, Lv3=0.5
  const baseAlpha = isObstacle ? 0.1 : 0.15 + level * 0.1
  const fontSize = Math.max(10, Math.floor(size * 0.3))

  ctx.save()

  // 背景に淡い色の丸
  ctx.fillStyle = blessingColor
  ctx.globalAlpha = baseAlpha * 0.5
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size * 0.3, 0, Math.PI * 2)
  ctx.fill()

  // シンボル
  ctx.globalAlpha = isObstacle ? 0.2 : baseAlpha + 0.1
  ctx.font = `bold ${fontSize}px ${BLESSING_SYMBOL_STYLE.fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = blessingColor
  ctx.fillText(blessingDef.symbol, x + size / 2, y + size / 2)

  // レベル表示（右下に小さく）
  if (level > 1) {
    const lvFontSize = Math.max(8, Math.floor(size * 0.18))
    ctx.globalAlpha = isObstacle ? 0.3 : 0.7
    ctx.font = `bold ${lvFontSize}px Arial, sans-serif`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillStyle = blessingColor
    ctx.fillText(`${level}`, x + size - 3, y + size - 2)
  }

  ctx.restore()
}


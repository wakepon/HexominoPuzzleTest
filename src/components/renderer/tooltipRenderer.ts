/**
 * ツールチップ描画
 */

import type { TooltipState } from '../../lib/game/Domain/Tooltip'
import { TOOLTIP_STYLE, MULTIPLIER_HIGHLIGHT_COLOR } from '../../lib/game/Data/Constants'
import { drawTextWithMultiplierHighlight } from './TextHighlightUtils'

/**
 * テキストを最大幅で折り返す
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = []
  const words = text.split('')
  let currentLine = ''

  for (const char of words) {
    const testLine = currentLine + char
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = testLine
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine)
  }

  return lines
}

/**
 * 角丸四角形を描画
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * ツールチップを描画
 */
export function renderTooltip(
  ctx: CanvasRenderingContext2D,
  tooltip: TooltipState,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (!tooltip.visible || tooltip.effects.length === 0) {
    return
  }

  const {
    backgroundColor,
    borderColor,
    borderWidth,
    borderRadius,
    padding,
    maxWidth,
    nameFontSize,
    descFontSize,
    fontFamily,
    nameColor,
    descColor,
    lineHeight,
    offsetX,
    offsetY,
    effectGap,
  } = TOOLTIP_STYLE

  ctx.save()

  // 各エフェクトのテキスト行を計算
  const effectBlocks: Array<{
    nameLines: string[]
    descLines: string[]
    nameHeight: number
    descHeight: number
  }> = []

  const contentMaxWidth = maxWidth - padding * 2

  for (const effect of tooltip.effects) {
    ctx.font = `bold ${nameFontSize}px ${fontFamily}`
    const nameLines = wrapText(ctx, effect.name, contentMaxWidth)
    const nameHeight = nameLines.length * nameFontSize * lineHeight

    ctx.font = `${descFontSize}px ${fontFamily}`
    const descLines = wrapText(ctx, effect.description, contentMaxWidth)
    const descHeight = descLines.length * descFontSize * lineHeight

    effectBlocks.push({ nameLines, descLines, nameHeight, descHeight })
  }

  // ツールチップ全体の高さを計算
  let contentHeight = 0
  for (let i = 0; i < effectBlocks.length; i++) {
    const block = effectBlocks[i]
    contentHeight += block.nameHeight + block.descHeight
    if (i < effectBlocks.length - 1) {
      contentHeight += effectGap
    }
  }

  const tooltipWidth = maxWidth
  const tooltipHeight = contentHeight + padding * 2

  // 表示位置を計算（画面端での見切れ防止）
  let x = tooltip.x + offsetX
  let y = tooltip.y + offsetY

  // 右端チェック
  if (x + tooltipWidth > canvasWidth) {
    x = tooltip.x - offsetX - tooltipWidth
  }

  // 下端チェック
  if (y + tooltipHeight > canvasHeight) {
    y = tooltip.y - offsetY - tooltipHeight
  }

  // 左端チェック
  if (x < 0) {
    x = 0
  }

  // 上端チェック
  if (y < 0) {
    y = 0
  }

  // 背景描画
  drawRoundedRect(ctx, x, y, tooltipWidth, tooltipHeight, borderRadius)
  ctx.fillStyle = backgroundColor
  ctx.fill()

  // 枠線描画
  ctx.strokeStyle = borderColor
  ctx.lineWidth = borderWidth
  ctx.stroke()

  // テキスト描画
  let textY = y + padding

  for (let i = 0; i < effectBlocks.length; i++) {
    const block = effectBlocks[i]

    // エフェクト名
    ctx.font = `bold ${nameFontSize}px ${fontFamily}`
    ctx.fillStyle = nameColor
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    for (const line of block.nameLines) {
      ctx.fillText(line, x + padding, textY)
      textY += nameFontSize * lineHeight
    }

    // 説明文
    ctx.font = `${descFontSize}px ${fontFamily}`

    for (const line of block.descLines) {
      drawTextWithMultiplierHighlight(
        ctx,
        line,
        x + padding,
        textY,
        descColor,
        MULTIPLIER_HIGHLIGHT_COLOR
      )
      textY += descFontSize * lineHeight
    }

    // エフェクト間のギャップ
    if (i < effectBlocks.length - 1) {
      textY += effectGap
    }
  }

  ctx.restore()
}

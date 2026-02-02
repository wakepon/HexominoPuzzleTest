/**
 * UI要素の描画（残りハンド表示など）
 */

import { CanvasLayout } from '../../lib/game/types'
import { HANDS_STYLE } from '../../lib/game/constants'

/**
 * 残りハンド数をCanvas内に描画
 */
export function renderRemainingHands(
  ctx: CanvasRenderingContext2D,
  remainingHands: number,
  layout: CanvasLayout
): void {
  const { fontSize, fontFamily, fontWeight, color, shadowColor, shadowBlur, paddingRight, paddingTop } = HANDS_STYLE

  ctx.save()

  // フォント設定
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'

  // シャドウ
  ctx.shadowColor = shadowColor
  ctx.shadowBlur = shadowBlur

  // テキスト描画
  ctx.fillStyle = color
  ctx.fillText(`残りハンド: ${remainingHands}`, layout.canvasWidth - paddingRight, paddingTop)

  ctx.restore()
}

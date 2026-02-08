/**
 * UI要素の描画（残りハンド表示、ゴールド表示など）
 */

import { CanvasLayout } from '../../lib/game/types'
import { HANDS_STYLE, GOLD_STYLE } from '../../lib/game/Data/Constants'

/**
 * 残りハンド数をCanvas内に描画
 */
export function renderRemainingHands(
  ctx: CanvasRenderingContext2D,
  remainingHands: number,
  targetScore: number,
  layout: CanvasLayout
): void {
  const { fontSize, fontFamily, fontWeight, color, shadowColor, shadowBlur } = HANDS_STYLE

  ctx.save()

  // フォント設定
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  // シャドウ
  ctx.shadowColor = shadowColor
  ctx.shadowBlur = shadowBlur

  // テキスト描画（中央、スコアの下）
  ctx.fillStyle = color
  ctx.fillText(`残りハンド: ${remainingHands}  |  目標: ${targetScore}点`, layout.canvasWidth / 2, 45)

  ctx.restore()
}

/**
 * ゴールドをCanvas内に描画
 */
export function renderGold(
  ctx: CanvasRenderingContext2D,
  gold: number
): void {
  const { fontSize, fontFamily, fontWeight, color, shadowColor, shadowBlur, paddingLeft, paddingTop } = GOLD_STYLE

  ctx.save()

  // フォント設定
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  // シャドウ
  ctx.shadowColor = shadowColor
  ctx.shadowBlur = shadowBlur

  // テキスト描画
  ctx.fillStyle = color
  ctx.fillText(`💰 ${gold}G`, paddingLeft, paddingTop)

  ctx.restore()
}

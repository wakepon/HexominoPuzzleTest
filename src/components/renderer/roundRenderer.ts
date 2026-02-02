/**
 * ラウンド情報の描画（ラウンド数、目標スコア）
 */

import { CanvasLayout } from '../../lib/game/types'
import { ROUND_STYLE, ROUND_CONFIG } from '../../lib/game/constants'

/**
 * ラウンド情報をCanvas内に描画
 * 画面上部中央（スコアの下）に表示
 */
export function renderRoundInfo(
  ctx: CanvasRenderingContext2D,
  round: number,
  layout: CanvasLayout
): void {
  const { fontSize, fontFamily, fontWeight, color, shadowColor, shadowBlur } = ROUND_STYLE

  ctx.save()

  // フォント設定
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'

  // シャドウ
  ctx.shadowColor = shadowColor
  ctx.shadowBlur = shadowBlur

  // テキスト描画（右上）
  const paddingRight = 20
  const paddingTop = 15
  ctx.fillStyle = color
  ctx.fillText(`Round ${round}/${ROUND_CONFIG.maxRound}`, layout.canvasWidth - paddingRight, paddingTop)

  ctx.restore()
}

/**
 * スコア表示の描画
 */

import { CanvasLayout } from '../../lib/game/types'
import { SCORE_STYLE } from '../../lib/game/constants'

/**
 * スコアをCanvas内に描画
 */
export function renderScore(
  ctx: CanvasRenderingContext2D,
  score: number,
  layout: CanvasLayout
): void {
  const { fontSize, fontFamily, fontWeight, color, shadowColor, shadowBlur, paddingTop } = SCORE_STYLE

  ctx.save()

  // フォント設定
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  // シャドウ
  ctx.shadowColor = shadowColor
  ctx.shadowBlur = shadowBlur

  // テキスト描画
  ctx.fillStyle = color
  ctx.fillText(`Score: ${score}`, layout.canvasWidth / 2, paddingTop)

  ctx.restore()
}

/**
 * 消去アニメーションの描画
 */

import { ClearingAnimationState, CanvasLayout } from '../../lib/game/types'
import { CLEAR_ANIMATION, COLORS, CELL_STYLE } from '../../lib/game/Data/Constants'

/**
 * 消去アニメーションを描画
 * @returns アニメーションが完了したかどうか
 */
export function renderClearAnimation(
  ctx: CanvasRenderingContext2D,
  animation: ClearingAnimationState,
  layout: CanvasLayout
): boolean {
  const elapsed = Date.now() - animation.startTime
  const progress = Math.min(elapsed / animation.duration, 1)

  // イージング（ease-out cubic）
  const eased = 1 - Math.pow(1 - progress, 3)

  const { maxRotation, maxRise, initialScale, finalScale } = CLEAR_ANIMATION
  const { boardOffsetX, boardOffsetY, cellSize } = layout
  const { padding, highlightWidth, shadowWidth } = CELL_STYLE

  const currentRotation = maxRotation * eased
  const currentRise = maxRise * eased
  const currentScale = initialScale - (initialScale - finalScale) * eased

  for (const cell of animation.cells) {
    const cellX = boardOffsetX + cell.x * cellSize
    const cellY = boardOffsetY + cell.y * cellSize

    // セル中心を計算
    const centerX = cellX + cellSize / 2
    const centerY = cellY + cellSize / 2 - currentRise

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(currentRotation)
    ctx.scale(currentScale, currentScale)

    // セルを描画（中心原点）
    const innerSize = cellSize - padding * 2
    const halfSize = innerSize / 2

    // ベース色
    ctx.fillStyle = COLORS.piece
    ctx.fillRect(-halfSize, -halfSize, innerSize, innerSize)

    // ハイライト（上端と左端）
    ctx.fillStyle = COLORS.pieceHighlight
    ctx.fillRect(-halfSize, -halfSize, innerSize, highlightWidth)
    ctx.fillRect(-halfSize, -halfSize, highlightWidth, innerSize)

    // シャドウ（下端と右端）
    ctx.fillStyle = COLORS.pieceShadow
    ctx.fillRect(-halfSize, halfSize - shadowWidth, innerSize, shadowWidth)
    ctx.fillRect(halfSize - shadowWidth, -halfSize, shadowWidth, innerSize)

    ctx.restore()
  }

  return progress >= 1
}

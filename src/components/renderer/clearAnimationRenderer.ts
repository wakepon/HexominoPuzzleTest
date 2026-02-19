/**
 * 消去アニメーションの描画（順次消去対応）
 */

import { ClearingAnimationState, ClearingCell, CanvasLayout } from '../../lib/game/types'
import {
  CLEAR_ANIMATION,
  COLORS,
  CELL_STYLE,
  PATTERN_COLORS,
  SEAL_COLORS,
} from '../../lib/game/Data/Constants'
import { getPatternDefinition } from '../../lib/game/Domain/Effect/Pattern'
import { getSealDefinition } from '../../lib/game/Domain/Effect/Seal'

/**
 * セルごとのパターン用カラーセットを取得
 */
function getCellColors(
  cell: ClearingCell
): { base: string; highlight: string; shadow: string } {
  if (cell.pattern && PATTERN_COLORS[cell.pattern]) {
    return PATTERN_COLORS[cell.pattern]
  }
  return {
    base: COLORS.piece,
    highlight: COLORS.pieceHighlight,
    shadow: COLORS.pieceShadow,
  }
}

/**
 * 効果ラベルのテキストと色を取得
 */
function getEffectLabel(
  cell: ClearingCell
): { text: string; color: string } | null {
  // パターン効果を優先表示
  if (cell.pattern) {
    const patternDef = getPatternDefinition(cell.pattern)
    if (patternDef) {
      let text = patternDef.symbol
      // チャージパターンの場合は値も表示
      if (cell.pattern === 'charge' && cell.chargeValue !== undefined) {
        text = `${patternDef.symbol}+${cell.chargeValue}`
      }
      const patternColor = PATTERN_COLORS[cell.pattern]
      return {
        text,
        color: patternColor ? patternColor.highlight : '#FFFFFF',
      }
    }
  }

  // シール効果
  if (cell.seal) {
    const sealDef = getSealDefinition(cell.seal)
    if (sealDef) {
      return {
        text: sealDef.symbol,
        color: SEAL_COLORS[cell.seal] ?? '#FFFFFF',
      }
    }
  }

  return null
}

/**
 * 消去アニメーションを描画（順次消去対応）
 * @returns アニメーションが完了したかどうか
 */
export function renderClearAnimation(
  ctx: CanvasRenderingContext2D,
  animation: ClearingAnimationState,
  layout: CanvasLayout
): boolean {
  const now = Date.now()
  const elapsed = now - animation.startTime
  const overallProgress = Math.min(elapsed / animation.duration, 1)

  const { maxRotation, maxRise, initialScale, finalScale, effectLabelRise } = CLEAR_ANIMATION
  const { boardOffsetX, boardOffsetY, cellSize } = layout
  const { padding, highlightWidth, shadowWidth } = CELL_STYLE
  const perCellDuration = animation.perCellDuration

  for (const cell of animation.cells) {
    const cellDelay = cell.delay ?? 0
    const cellElapsed = elapsed - cellDelay

    // 未開始セルはスキップ
    if (cellElapsed < 0) continue

    const cellProgress = Math.min(cellElapsed / perCellDuration, 1)

    // イージング（ease-out cubic）
    const eased = 1 - Math.pow(1 - cellProgress, 3)

    const currentRotation = maxRotation * eased
    const currentRise = maxRise * eased
    const currentScale = initialScale - (initialScale - finalScale) * eased

    const cellX = boardOffsetX + cell.col * cellSize
    const cellY = boardOffsetY + cell.row * cellSize

    // セル中心を計算
    const centerX = cellX + cellSize / 2
    const centerY = cellY + cellSize / 2 - currentRise

    // パターン色を使用
    const colors = getCellColors(cell)

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(currentRotation)
    ctx.scale(currentScale, currentScale)

    // セルを描画（中心原点）
    const innerSize = cellSize - padding * 2
    const halfSize = innerSize / 2

    // ベース色
    ctx.fillStyle = colors.base
    ctx.fillRect(-halfSize, -halfSize, innerSize, innerSize)

    // ハイライト（上端と左端）
    ctx.fillStyle = colors.highlight
    ctx.fillRect(-halfSize, -halfSize, innerSize, highlightWidth)
    ctx.fillRect(-halfSize, -halfSize, highlightWidth, innerSize)

    // シャドウ（下端と右端）
    ctx.fillStyle = colors.shadow
    ctx.fillRect(-halfSize, halfSize - shadowWidth, innerSize, shadowWidth)
    ctx.fillRect(halfSize - shadowWidth, -halfSize, shadowWidth, innerSize)

    ctx.restore()

    // 効果ラベル表示（パターンまたはシールがある場合）
    const label = getEffectLabel(cell)
    if (label && cellProgress > 0 && cellProgress < 1) {
      const labelAlpha = cellProgress < 0.7
        ? 1.0
        : 1.0 - (cellProgress - 0.7) / 0.3
      const labelRise = effectLabelRise * eased

      ctx.save()
      ctx.globalAlpha = labelAlpha
      ctx.font = 'bold 14px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // 影
      ctx.shadowColor = '#000000'
      ctx.shadowBlur = 4

      ctx.fillStyle = label.color
      ctx.fillText(
        label.text,
        cellX + cellSize / 2,
        cellY + cellSize / 2 - labelRise
      )
      ctx.restore()
    }
  }

  return overallProgress >= 1
}

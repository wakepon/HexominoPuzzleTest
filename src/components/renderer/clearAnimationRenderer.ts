/**
 * 消去アニメーションの描画（順次消去対応）
 */

import { ClearingAnimationState, ClearingCell, CanvasLayout } from '../../lib/game/types'
import { GRID_SIZE } from '../../lib/game/Data/Constants'
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

    // ブロック点ポップ表示（全ブロック）
    const bpDuration = CLEAR_ANIMATION.blockPointPopDuration
    if (cell.blockPoint !== undefined && cell.blockPoint > 0 && cellElapsed > 0 && cellElapsed < bpDuration) {
      const bpProgress = cellElapsed / bpDuration

      // ポップイン(最初60ms) → 表示維持 → フェードアウト(最後30%)
      const popInMs = 60
      const popInProgress = Math.min(1, cellElapsed / popInMs)
      const popScale = popInProgress < 1
        ? 1 + (1 - popInProgress) * 0.3  // 1.3→1.0
        : 1.0
      const pointAlpha = bpProgress < 0.7
        ? 1.0
        : 1.0 - (bpProgress - 0.7) / 0.3

      ctx.save()
      ctx.globalAlpha = pointAlpha
      ctx.font = 'bold 16px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = '#000000'
      ctx.shadowBlur = 4
      ctx.fillStyle = '#88CCFF'

      // 上昇は最初のperCellDuration中のみ（セル消去アニメに連動）
      const riseProgress = Math.min(cellElapsed / perCellDuration, 1)
      const riseEased = 1 - Math.pow(1 - riseProgress, 3)
      const pointY = cellY + cellSize / 2 - effectLabelRise * riseEased * 0.6
      ctx.translate(cellX + cellSize / 2, pointY)
      ctx.scale(popScale, popScale)
      const pointText = Number.isInteger(cell.blockPoint)
        ? `+${cell.blockPoint}`
        : `+${cell.blockPoint.toFixed(1)}`
      ctx.fillText(pointText, 0, 0)
      ctx.restore()
    }
  }

  // ライン列点ポップ表示
  if (animation.linePoints) {
    const LINE_POINT_POP_DURATION = CLEAR_ANIMATION.linePointPopDuration
    for (const lp of animation.linePoints) {
      const lpElapsed = elapsed - lp.completionTime
      if (lpElapsed < 0 || lpElapsed > LINE_POINT_POP_DURATION) continue

      const lpProgress = lpElapsed / LINE_POINT_POP_DURATION

      // ポップイン(0〜0.15) → 表示維持 → フェードアウト(0.7〜1.0)
      const popInRatio = 0.15
      const popScale = lpProgress < popInRatio
        ? 1 + (1 - lpProgress / popInRatio) * 0.3  // 1.3→1.0
        : 1.0
      const lpAlpha = lpProgress < 0.7
        ? 1.0
        : 1.0 - (lpProgress - 0.7) / 0.3

      // 表示位置
      let lpX: number
      let lpY: number
      if (lp.type === 'col') {
        // 列: ボード下端のすぐ下
        lpX = boardOffsetX + lp.index * cellSize + cellSize / 2
        lpY = boardOffsetY + GRID_SIZE * cellSize + 8
      } else {
        // 行: ボード右端のすぐ右
        lpX = boardOffsetX + GRID_SIZE * cellSize + 8
        lpY = boardOffsetY + lp.index * cellSize + cellSize / 2
      }

      ctx.save()
      ctx.globalAlpha = lpAlpha
      ctx.font = 'bold 16px Arial, sans-serif'
      ctx.textAlign = lp.type === 'col' ? 'center' : 'left'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = '#000000'
      ctx.shadowBlur = 4
      ctx.fillStyle = '#FF6666'
      ctx.translate(lpX, lpY)
      ctx.scale(popScale, popScale)
      ctx.fillText(`+${lp.point}`, 0, 0)
      ctx.restore()
    }
  }

  // ブロック点・ラインポイントポップの完了まで待つ
  const lastCellDelay = animation.cells.length > 0
    ? Math.max(...animation.cells.map(c => c.delay ?? 0))
    : 0
  const blockPointEnd = lastCellDelay + CLEAR_ANIMATION.blockPointPopDuration

  let linePointEnd = 0
  if (animation.linePoints && animation.linePoints.length > 0) {
    const lastCompletionTime = Math.max(...animation.linePoints.map(lp => lp.completionTime))
    linePointEnd = lastCompletionTime + CLEAR_ANIMATION.linePointPopDuration
  }

  const totalRequired = Math.max(animation.duration, blockPointEnd, linePointEnd)
  return elapsed >= totalRequired
}

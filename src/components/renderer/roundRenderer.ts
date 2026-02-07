/**
 * ラウンド情報の描画（ラウンド数、目標スコア、ラウンドタイプ、ボス条件）
 */

import type { CanvasLayout, RoundInfo, RoundType } from '../../lib/game/types'
import { ROUND_STYLE, ROUND_CONFIG } from '../../lib/game/constants'

/**
 * ラウンドタイプのラベル
 */
const ROUND_TYPE_LABELS: Record<RoundType, string> = {
  normal: '',
  elite: 'Elite',
  boss: 'BOSS',
}

/**
 * ラウンドタイプの色
 */
const ROUND_TYPE_COLORS: Record<RoundType, string> = {
  normal: '#FFFFFF',
  elite: '#FFD700',
  boss: '#FF4444',
}

/**
 * ラウンド情報をCanvas内に描画
 * 画面上部中央（スコアの下）に表示
 */
export function renderRoundInfo(
  ctx: CanvasRenderingContext2D,
  roundInfo: RoundInfo,
  layout: CanvasLayout
): void {
  const { fontSize, fontFamily, fontWeight, color, shadowColor, shadowBlur } =
    ROUND_STYLE

  ctx.save()

  // シャドウ
  ctx.shadowColor = shadowColor
  ctx.shadowBlur = shadowBlur

  const paddingRight = 20
  const paddingTop = 15
  const lineHeight = fontSize + 4

  // ラウンド番号（右上）
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.fillStyle = color
  ctx.fillText(
    `Round ${roundInfo.round}/${ROUND_CONFIG.maxRound}`,
    layout.canvasWidth - paddingRight,
    paddingTop
  )

  // ラウンドタイプ表示（elite/boss の場合）
  const typeLabel = ROUND_TYPE_LABELS[roundInfo.roundType]
  if (typeLabel) {
    ctx.font = `${fontWeight} ${fontSize - 2}px ${fontFamily}`
    ctx.fillStyle = ROUND_TYPE_COLORS[roundInfo.roundType]
    ctx.fillText(
      typeLabel,
      layout.canvasWidth - paddingRight,
      paddingTop + lineHeight
    )
  }

  // ボス条件表示（bossラウンドでボス条件がある場合）
  if (roundInfo.bossCondition) {
    const conditionY = typeLabel
      ? paddingTop + lineHeight * 2
      : paddingTop + lineHeight
    ctx.font = `${fontWeight} ${fontSize - 4}px ${fontFamily}`
    ctx.fillStyle = '#FF6666'
    ctx.fillText(
      `[${roundInfo.bossCondition.name}]`,
      layout.canvasWidth - paddingRight,
      conditionY
    )
  }

  ctx.restore()
}


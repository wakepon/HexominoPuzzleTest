/**
 * スコアアニメーション（Balatro風）のCanvas描画
 *
 * カウンター上部に効果ラベルをフェードイン表示し、
 * 最終結果をゴールド文字で大きく表示する。
 */

import type { ScoreAnimationState } from '../../lib/game/Domain/Animation/ScoreAnimationState'
import { SCORE_ANIMATION } from '../../lib/game/Domain/Animation/ScoreAnimationState'
import { SCORE_COUNTER_STYLE } from '../../lib/game/Data/Constants'
import type { CounterArea } from './statusPanelRenderer'

/** 早送りボタンの領域 */
export interface FastForwardButtonArea {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/** 描画結果 */
export interface ScoreAnimationRenderResult {
  readonly fastForwardButton: FastForwardButtonArea | null
}

/**
 * スコアアニメーションを描画
 */
export function renderScoreAnimation(
  ctx: CanvasRenderingContext2D,
  scoreAnimation: ScoreAnimationState,
  counterArea: CounterArea
): ScoreAnimationRenderResult {
  ctx.save()

  const cs = SCORE_COUNTER_STYLE
  const now = Date.now()
  const step = scoreAnimation.steps[scoreAnimation.currentStepIndex]

  if (!step) {
    ctx.restore()
    return { fastForwardButton: null }
  }

  // フェードイン計算
  const elapsed = now - scoreAnimation.stepStartTime
  const fadeProgress = Math.min(1, elapsed / SCORE_ANIMATION.fadeInDuration)

  // === 効果ラベルの描画（カウンター上部） ===
  if (step.effectCategory !== 'base' && step.effectCategory !== 'countA' && step.effectCategory !== 'countB') {
    ctx.globalAlpha = fadeProgress

    // スライドアップ計算
    const slideProgress = Math.min(1, elapsed / SCORE_ANIMATION.fadeInDuration)
    const slideOffset = (1 - slideProgress) * cs.effectLabelSlideDistance

    const labelColor = cs.effectLabelColors[step.effectCategory] ?? '#FFFFFF'
    const labelY = counterArea.y + cs.effectLabelOffsetY + slideOffset

    if (step.effectCategory === 'result') {
      // 結果ステップ: 大きなゴールド文字で「+N」
      ctx.font = `bold 26px Arial, sans-serif`
      ctx.fillStyle = '#FFD700'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.shadowColor = '#000000'
      ctx.shadowBlur = 6
      ctx.fillText(step.formula, counterArea.x + counterArea.width / 2, labelY + 4)
    } else {
      // 効果名ラベル
      ctx.font = `bold ${cs.effectLabelFontSize}px Arial, sans-serif`
      ctx.fillStyle = labelColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.shadowColor = '#000000'
      ctx.shadowBlur = 3
      ctx.fillText(step.label, counterArea.x + counterArea.width / 2, labelY)
    }

    ctx.globalAlpha = 1.0
  }

  // === 乗算時のグローエフェクト ===
  if (step.effectCategory === 'multB') {
    const glowProgress = Math.min(1, elapsed / SCORE_ANIMATION.popDuration)
    const glowAlpha = glowProgress < 0.5
      ? glowProgress * 2 * 0.4
      : (1 - glowProgress) * 2 * 0.4

    // B側のボックス位置を計算
    const operatorSpace = 40
    const boxWidth = (counterArea.width - operatorSpace) / 2
    const boxBX = counterArea.x + boxWidth + operatorSpace
    const boxBCenterX = boxBX + boxWidth / 2
    const boxBCenterY = counterArea.y + cs.counterHeight / 2

    ctx.save()
    ctx.globalAlpha = glowAlpha
    const gradient = ctx.createRadialGradient(
      boxBCenterX, boxBCenterY, 0,
      boxBCenterX, boxBCenterY, boxWidth * 0.8
    )
    gradient.addColorStop(0, 'rgba(255, 68, 68, 0.6)')
    gradient.addColorStop(1, 'rgba(255, 68, 68, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(boxBCenterX, boxBCenterY, boxWidth * 0.8, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // 早送りボタン描画
  const btnW = 36
  const btnH = 26
  const btnX = counterArea.x + counterArea.width - btnW
  const btnY = counterArea.y + counterArea.height + 4

  ctx.fillStyle = scoreAnimation.isFastForward
    ? 'rgba(255, 215, 0, 0.6)'
    : 'rgba(255, 255, 255, 0.2)'
  ctx.beginPath()
  ctx.roundRect(btnX, btnY, btnW, btnH, 4)
  ctx.fill()

  ctx.font = '14px Arial, sans-serif'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('⏩', btnX + btnW / 2, btnY + btnH / 2)

  ctx.restore()

  return {
    fastForwardButton: { x: btnX, y: btnY, width: btnW, height: btnH },
  }
}

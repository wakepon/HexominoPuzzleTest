/**
 * スコアアニメーション（式ステップ）のCanvas描画
 *
 * ステータスパネルのラウンドスコアとゴールドの間に式を描画する。
 * 各ステップをフェードインで表示し、最終結果を大きく表示。
 */

import type { ScoreAnimationState } from '../../lib/game/Domain/Animation/ScoreAnimationState'
import { SCORE_ANIMATION } from '../../lib/game/Domain/Animation/ScoreAnimationState'

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
  formulaY: number
): ScoreAnimationRenderResult {
  ctx.save()

  const panelX = 30
  const now = Date.now()
  const step = scoreAnimation.steps[scoreAnimation.currentStepIndex]

  if (!step) {
    ctx.restore()
    return { fastForwardButton: null }
  }

  // フェードイン計算
  const elapsed = now - scoreAnimation.stepStartTime
  const fadeProgress = Math.min(1, elapsed / SCORE_ANIMATION.fadeInDuration)

  // カウントアップ中の表示
  if (scoreAnimation.isCountingUp) {
    const countElapsed = now - scoreAnimation.countStartTime
    const countProgress = Math.min(1, countElapsed / SCORE_ANIMATION.countUpDuration)
    // ease-out cubic
    const eased = 1 - Math.pow(1 - countProgress, 3)
    const displayScore = Math.floor(scoreAnimation.startingScore + scoreAnimation.scoreGain * eased)

    ctx.font = 'bold 24px Arial, sans-serif'
    ctx.fillStyle = '#FFD700'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.shadowColor = '#000000'
    ctx.shadowBlur = 4
    ctx.fillText(`+${scoreAnimation.scoreGain} → ${displayScore}点`, panelX, formulaY)

    ctx.restore()
    return { fastForwardButton: null }
  }

  // 式ステップの描画
  ctx.globalAlpha = fadeProgress

  if (step.type === 'result') {
    // 最終結果: 大きく金色で表示
    ctx.font = 'bold 28px Arial, sans-serif'
    ctx.fillStyle = '#FFD700'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.shadowColor = '#000000'
    ctx.shadowBlur = 6
    ctx.fillText(step.formula, panelX, formulaY)
  } else {
    // ラベル
    ctx.font = 'bold 13px Arial, sans-serif'
    ctx.fillStyle = '#AAAAAA'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.shadowColor = '#000000'
    ctx.shadowBlur = 2
    ctx.fillText(step.label, panelX, formulaY)

    // 式文字列
    const formulaWidth = ctx.measureText(step.formula).width
    const maxWidth = 300
    const fontSize = formulaWidth > maxWidth ? Math.floor(16 * maxWidth / formulaWidth) : 16
    ctx.font = `${fontSize}px Arial, sans-serif`
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(step.formula, panelX, formulaY + 18)
  }

  ctx.globalAlpha = 1.0

  // 早送りボタン描画
  const btnX = panelX + 250
  const btnY = formulaY
  const btnW = 40
  const btnH = 28

  ctx.fillStyle = scoreAnimation.isFastForward
    ? 'rgba(255, 215, 0, 0.6)'
    : 'rgba(255, 255, 255, 0.2)'
  ctx.beginPath()
  ctx.roundRect(btnX, btnY, btnW, btnH, 4)
  ctx.fill()

  ctx.font = '16px Arial, sans-serif'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('⏩', btnX + btnW / 2, btnY + btnH / 2)

  ctx.restore()

  return {
    fastForwardButton: { x: btnX, y: btnY, width: btnW, height: btnH },
  }
}

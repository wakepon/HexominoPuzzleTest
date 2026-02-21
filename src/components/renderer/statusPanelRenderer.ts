/**
 * HD画面用ステータスパネルの描画（左側パネル）
 * 参考画像に基づき、以下の情報をグループ化して表示:
 * - 目標点数
 * - ラウンドスコア
 * - ゴールド
 * - ラウンド / ハンド
 */

import type { CanvasLayout, RoundInfo } from '../../lib/game/types'
import { HD_LAYOUT, HD_STATUS_PANEL_STYLE, ROUND_CONFIG, DECK_BUTTON_STYLE, SCORE_COUNTER_STYLE } from '../../lib/game/Data/Constants'
import { getBaseReward } from '../../lib/game/Services/RoundService'
import { SCORE_ANIMATION } from '../../lib/game/Domain/Animation/ScoreAnimationState'
import type { ScoreAnimationState } from '../../lib/game/Domain/Animation/ScoreAnimationState'
import type { GamePhase } from '../../lib/game/Domain/Round/GamePhase'
import type { ButtonArea } from './overlayRenderer'
import type { Amulet } from '../../lib/game/Domain/Effect/Amulet'
import { MAX_AMULET_STOCK } from '../../lib/game/Domain/Effect/Amulet'

/**
 * ease-out cubic イージング
 */
function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3)
}

/**
 * 転送アニメーション中の表示スコアを計算
 */
function calculateTransferDisplayScore(anim: ScoreAnimationState): number {
  const holdDuration = anim.isFastForward
    ? SCORE_ANIMATION.transferFastForwardHoldDuration
    : SCORE_ANIMATION.transferHoldDuration
  const animDuration = anim.isFastForward
    ? SCORE_ANIMATION.transferFastForwardDuration
    : SCORE_ANIMATION.transferDuration
  const elapsed = Date.now() - anim.transferStartTime
  const animElapsed = Math.max(0, elapsed - holdDuration)
  const progress = Math.min(1, animElapsed / animDuration)
  const eased = easeOutCubic(progress)
  return Math.floor(anim.startingScore + anim.scoreGain * eased)
}

interface StatusPanelData {
  targetScore: number
  roundScore: number
  gold: number
  roundInfo: RoundInfo
  remainingHands: number
  bandaidCountdown: number | null
  timingBonusActive: boolean
  pendingPhase: GamePhase | null
  scoreAnimation: ScoreAnimationState | null
  copyBandaidCountdown: number | null
  amuletStock: readonly Amulet[]
}

/**
 * 護符スロット領域情報
 */
export interface AmuletSlotArea extends ButtonArea {
  amuletIndex: number
}

/**
 * カウンター領域情報
 */
export interface CounterArea {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/**
 * ステータスパネルの描画結果
 */
export interface StatusPanelRenderResult {
  deckButtonArea: ButtonArea
  formulaY: number
  counterArea: CounterArea
  amuletSlotAreas: AmuletSlotArea[]
}

/**
 * カウンター値を描画するヘルパー
 */
function drawCounterValue(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  bgColor: string,
  textColor: string,
  scale: number,
  alpha: number
): void {
  const cs = SCORE_COUNTER_STYLE
  ctx.save()
  ctx.globalAlpha = alpha

  // スケールをかける（中心基準）
  const cx = x + width / 2
  const cy = y + height / 2
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  ctx.translate(-cx, -cy)

  // 背景描画
  ctx.fillStyle = bgColor
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, cs.counterRadius)
  ctx.fill()

  // テキスト描画
  ctx.font = `bold ${cs.valueFontSize}px Arial, sans-serif`
  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = '#000000'
  ctx.shadowBlur = 4
  ctx.fillText(value, cx, cy)

  ctx.restore()
}

/**
 * カウンター表示状態
 */
interface CounterDisplayState {
  readonly blockPts: number
  readonly linePts: number
  readonly scaleA: number
  readonly scaleB: number
  readonly alpha: number
}

/**
 * ポップスケール値を計算（前半で拡大、後半で縮小）
 */
function calculatePopScale(progress: number, maxScale: number): number {
  return progress < 0.5
    ? 1 + (progress * 2) * (maxScale - 1)
    : 1 + ((1 - progress) * 2) * (maxScale - 1)
}

/**
 * アニメーション状態からカウンター表示値を算出
 */
function calculateCounterDisplayState(
  anim: ScoreAnimationState | null
): CounterDisplayState {
  const cs = SCORE_COUNTER_STYLE
  if (!anim || !anim.isAnimating) {
    return { blockPts: 0, linePts: 0, scaleA: 1, scaleB: 1, alpha: cs.dimmedAlpha }
  }

  const step = anim.steps[anim.currentStepIndex]
  if (!step) {
    return { blockPts: 0, linePts: 0, scaleA: 1, scaleB: 1, alpha: cs.dimmedAlpha }
  }

  const elapsed = Date.now() - anim.stepStartTime
  const popProgress = Math.min(1, elapsed / SCORE_ANIMATION.popDuration)
  const popValue = calculatePopScale(popProgress, cs.popScale)
  const popValueMult = calculatePopScale(popProgress, cs.popScaleMult)

  let scaleA = 1.0
  let scaleB = 1.0

  if (step.effectCategory === 'addA' || step.effectCategory === 'base') scaleA = popValue
  if (step.effectCategory === 'countA') scaleA = popValue
  if (step.effectCategory === 'addB') scaleB = popValue
  if (step.effectCategory === 'countB') scaleB = popValue
  if (step.effectCategory === 'multB') scaleB = popValueMult
  if (step.effectCategory === 'result') { scaleA = popValue; scaleB = popValue }

  return { blockPts: step.blockPoints, linePts: step.linePoints, scaleA, scaleB, alpha: 1 }
}

/**
 * A × B カウンターを描画
 */
function drawScoreCounter(
  ctx: CanvasRenderingContext2D,
  data: StatusPanelData,
  counterArea: CounterArea
): void {
  const cs = SCORE_COUNTER_STYLE
  const ds = calculateCounterDisplayState(data.scoreAnimation)

  const blockStr = formatCounterValue(ds.blockPts)
  const lineStr = formatCounterValue(ds.linePts)

  const operatorSpace = 40
  const boxWidth = (counterArea.width - operatorSpace) / 2
  const boxHeight = cs.counterHeight
  const boxY = counterArea.y
  const boxAX = counterArea.x

  drawCounterValue(ctx, blockStr, boxAX, boxY, boxWidth, boxHeight,
    cs.blockPointBg, cs.blockPointColor, ds.scaleA, ds.alpha)

  // 演算子 ×
  ctx.save()
  ctx.globalAlpha = ds.alpha
  ctx.font = `bold ${cs.operatorFontSize}px Arial, sans-serif`
  ctx.fillStyle = cs.operatorColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = '#000000'
  ctx.shadowBlur = 3
  ctx.fillText('×', boxAX + boxWidth + operatorSpace / 2, boxY + boxHeight / 2)
  ctx.restore()

  const boxBX = boxAX + boxWidth + operatorSpace
  drawCounterValue(ctx, lineStr, boxBX, boxY, boxWidth, boxHeight,
    cs.linePointBg, cs.linePointColor, ds.scaleB, ds.alpha)
}

/**
 * 数値を表示用にフォーマット
 */
function formatCounterValue(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

/**
 * ラウンドスコアの表示色を決定
 * - ゲームオーバー時（アニメーション完了後の遅延中）: 青色
 * - ラウンドクリア時（カウントアップで目標超過 or 遅延中）: 赤色
 * - それ以外: 白色
 */
function determineRoundScoreColor(
  data: StatusPanelData,
  style: typeof HD_STATUS_PANEL_STYLE
): string {
  const { pendingPhase, scoreAnimation, targetScore } = data

  if (pendingPhase === 'game_over' && scoreAnimation === null) {
    return style.roundScoreFailColor
  }

  if (pendingPhase === 'round_clear') {
    if (scoreAnimation === null) {
      // アニメーション完了後の遅延中
      return style.roundScoreClearColor
    }

    if (scoreAnimation.isTransferring) {
      // 転送中: 表示値が目標以上ならクリア色
      const displayScore = calculateTransferDisplayScore(scoreAnimation)
      return displayScore >= targetScore ? style.roundScoreClearColor : style.roundScoreColor
    }

    // 式ステップ表示中
    return style.roundScoreColor
  }

  return style.roundScoreColor
}

/**
 * 左側ステータスパネルを描画
 */
export function renderStatusPanel(
  ctx: CanvasRenderingContext2D,
  data: StatusPanelData,
  _layout: CanvasLayout
): StatusPanelRenderResult {
  const style = HD_STATUS_PANEL_STYLE
  const padding = HD_LAYOUT.statusPadding
  const groupGap = HD_LAYOUT.statusGroupGap
  const itemGap = HD_LAYOUT.statusItemGap

  ctx.save()

  // シャドウ設定
  ctx.shadowColor = style.shadowColor
  ctx.shadowBlur = style.shadowBlur

  let y = padding

  // === 目標セクション ===
  ctx.font = `${style.fontWeight} ${style.targetFontSize}px ${style.fontFamily}`
  ctx.fillStyle = style.targetColor
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(`目標:${data.targetScore}点`, padding, y)
  y += style.targetFontSize + itemGap

  // === 報酬セクション ===
  const baseReward = getBaseReward(data.roundInfo.roundType)
  ctx.font = `${style.fontWeight} ${style.roundScoreLabelFontSize}px ${style.fontFamily}`
  ctx.fillStyle = '#FFD700'
  ctx.fillText(`Reward ${baseReward}G`, padding, y)
  y += style.roundScoreLabelFontSize + groupGap

  // === ラウンドスコアセクション ===
  ctx.font = `${style.fontWeight} ${style.roundScoreLabelFontSize}px ${style.fontFamily}`
  ctx.fillStyle = style.roundScoreLabelColor
  ctx.fillText('ラウンドスコア', padding, y)
  y += style.roundScoreLabelFontSize + itemGap

  // 転送アニメーション中はスコアを補間表示
  let displayScore = data.roundScore
  if (data.scoreAnimation?.isTransferring) {
    displayScore = calculateTransferDisplayScore(data.scoreAnimation)
  }

  ctx.font = `${style.fontWeight} ${style.roundScoreFontSize}px ${style.fontFamily}`
  ctx.fillStyle = determineRoundScoreColor(data, style)
  ctx.fillText(`${displayScore}点`, padding, y)
  y += style.roundScoreFontSize
  const formulaY = y

  // カウンター領域（C表示用のスペースを上部に確保）
  const counterArea: CounterArea = {
    x: padding,
    y: formulaY + 36,
    width: HD_LAYOUT.leftPanelWidth - padding * 2,
    height: SCORE_COUNTER_STYLE.counterHeight,
  }

  // A × B カウンター描画
  drawScoreCounter(ctx, data, counterArea)

  y += groupGap + 92

  // === ゴールドセクション ===
  ctx.font = `${style.fontWeight} ${style.goldFontSize}px ${style.fontFamily}`
  ctx.fillStyle = style.goldColor
  ctx.fillText(`ゴールド ${data.gold}G`, padding, y)
  y += style.goldFontSize + groupGap + 30

  // === ラウンド＆ハンドセクション（横並び） ===
  const bottomY = y

  // ラウンド（左側）
  ctx.font = `${style.fontWeight} ${style.handLabelFontSize}px ${style.fontFamily}`
  ctx.fillStyle = style.roundColor
  ctx.fillText('ラウンド', padding + 20, bottomY)

  ctx.font = `${style.fontWeight} ${style.roundFontSize + 8}px ${style.fontFamily}`
  ctx.fillText(`${data.roundInfo.round}/${ROUND_CONFIG.maxRound}`, padding + 15, bottomY + 25)

  // ハンド（右側）
  ctx.font = `${style.fontWeight} ${style.handLabelFontSize}px ${style.fontFamily}`
  ctx.fillStyle = style.handLabelColor
  ctx.fillText('ハンド', padding + 170, bottomY)

  ctx.font = `${style.fontWeight} ${style.handFontSize + 12}px ${style.fontFamily}`
  ctx.fillStyle = style.handColor
  ctx.fillText(`${data.remainingHands}`, padding + 175, bottomY + 25)

  // 絆創膏カウントダウン表示
  if (data.bandaidCountdown !== null) {
    ctx.font = `${style.fontWeight} ${style.handFontSize}px ${style.fontFamily}`
    ctx.fillStyle = '#87CEEB'
    ctx.fillText(`🩹${data.bandaidCountdown}`, padding + 240, bottomY + 25)
  }

  // タイミングボーナス表示（残りハンド数が3の倍数のとき）
  if (data.timingBonusActive) {
    ctx.font = `${style.fontWeight} ${style.handFontSize}px ${style.fontFamily}`
    ctx.fillStyle = '#FFD700'
    const timingX = data.bandaidCountdown !== null ? padding + 310 : padding + 240
    ctx.fillText('⌛×3', timingX, bottomY + 25)
  }

  // コピーレリック用カウントダウン表示
  let copyCounterX = padding + 240
  if (data.bandaidCountdown !== null) copyCounterX += 70
  if (data.timingBonusActive) copyCounterX += 70

  if (data.copyBandaidCountdown !== null) {
    ctx.font = `${style.fontWeight} ${style.handFontSize}px ${style.fontFamily}`
    ctx.fillStyle = '#9370DB'
    ctx.fillText(`🪞🩹${data.copyBandaidCountdown}`, copyCounterX, bottomY + 25)
  }

  // === 護符ストックセクション ===
  const amuletSlotAreas: AmuletSlotArea[] = []
  const amuletY = bottomY + 60
  const amuletSlotSize = 36
  const amuletSlotGap = 8

  ctx.font = `bold 12px ${style.fontFamily}`
  ctx.fillStyle = '#DDA0DD'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(`護符 (${data.amuletStock.length}/${MAX_AMULET_STOCK})`, padding, amuletY)

  const amuletIconY = amuletY + 18
  for (let i = 0; i < MAX_AMULET_STOCK; i++) {
    const slotX = padding + i * (amuletSlotSize + amuletSlotGap)
    const amulet = data.amuletStock[i]

    // スロット背景
    ctx.fillStyle = amulet ? 'rgba(75, 0, 130, 0.5)' : 'rgba(60, 60, 80, 0.4)'
    ctx.beginPath()
    ctx.roundRect(slotX, amuletIconY, amuletSlotSize, amuletSlotSize, 4)
    ctx.fill()

    // スロット枠線
    ctx.strokeStyle = amulet ? '#9370DB' : '#555555'
    ctx.lineWidth = 1
    ctx.stroke()

    if (amulet) {
      // アイコン
      ctx.font = `${amuletSlotSize - 10}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(amulet.icon, slotX + amuletSlotSize / 2, amuletIconY + amuletSlotSize / 2)

      amuletSlotAreas.push({
        amuletIndex: i,
        x: slotX,
        y: amuletIconY,
        width: amuletSlotSize,
        height: amuletSlotSize,
      })
    }
  }

  // === デッキボタン ===
  const btnStyle = DECK_BUTTON_STYLE
  const buttonX = padding
  const buttonY = amuletIconY + amuletSlotSize + 12

  ctx.fillStyle = btnStyle.backgroundColor
  ctx.beginPath()
  ctx.roundRect(buttonX, buttonY, btnStyle.width, btnStyle.height, btnStyle.borderRadius)
  ctx.fill()

  ctx.font = `bold ${btnStyle.fontSize}px Arial, sans-serif`
  ctx.fillStyle = btnStyle.textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('デッキ', buttonX + btnStyle.width / 2, buttonY + btnStyle.height / 2)

  ctx.restore()

  return {
    deckButtonArea: {
      x: buttonX,
      y: buttonY,
      width: btnStyle.width,
      height: btnStyle.height,
    },
    formulaY,
    counterArea,
    amuletSlotAreas,
  }
}

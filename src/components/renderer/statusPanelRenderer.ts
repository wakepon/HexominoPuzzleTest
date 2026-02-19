/**
 * HD画面用ステータスパネルの描画（左側パネル）
 * 参考画像に基づき、以下の情報をグループ化して表示:
 * - 目標点数
 * - ラウンドスコア
 * - ゴールド
 * - ラウンド / ハンド
 */

import type { CanvasLayout, RoundInfo } from '../../lib/game/types'
import { HD_LAYOUT, HD_STATUS_PANEL_STYLE, ROUND_CONFIG, DECK_BUTTON_STYLE } from '../../lib/game/Data/Constants'
import { getBaseReward } from '../../lib/game/Services/RoundService'
import { SCORE_ANIMATION } from '../../lib/game/Domain/Animation/ScoreAnimationState'
import type { ScoreAnimationState } from '../../lib/game/Domain/Animation/ScoreAnimationState'
import type { GamePhase } from '../../lib/game/Domain/Round/GamePhase'
import type { ButtonArea } from './overlayRenderer'
import type { Amulet } from '../../lib/game/Domain/Effect/Amulet'
import { MAX_AMULET_STOCK } from '../../lib/game/Domain/Effect/Amulet'

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
 * ステータスパネルの描画結果
 */
export interface StatusPanelRenderResult {
  deckButtonArea: ButtonArea
  formulaY: number
  amuletSlotAreas: AmuletSlotArea[]
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
    if (scoreAnimation?.isCountingUp) {
      // カウントアップ中: 表示スコアが目標を超えたら赤色
      const now = Date.now()
      const countElapsed = now - scoreAnimation.countStartTime
      const countProgress = Math.min(1, countElapsed / SCORE_ANIMATION.countUpDuration)
      const eased = 1 - Math.pow(1 - countProgress, 3)
      const displayScore = Math.floor(
        scoreAnimation.startingScore + scoreAnimation.scoreGain * eased
      )
      return displayScore >= targetScore ? style.roundScoreClearColor : style.roundScoreColor
    }

    if (scoreAnimation === null) {
      // アニメーション完了後の遅延中
      return style.roundScoreClearColor
    }

    // 式ステップ表示中（まだカウントアップに到達していない）
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

  ctx.font = `${style.fontWeight} ${style.roundScoreFontSize}px ${style.fontFamily}`
  ctx.fillStyle = determineRoundScoreColor(data, style)
  ctx.fillText(`${data.roundScore}点`, padding, y)
  y += style.roundScoreFontSize
  const formulaY = y
  y += groupGap + 40

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
    amuletSlotAreas,
  }
}

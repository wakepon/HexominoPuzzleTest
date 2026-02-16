/**
 * ラウンド進行画面の描画
 */

import type { CanvasLayout, RoundInfo, RoundType } from '../../lib/game/types'
import { ROUND_PROGRESS_STYLE, ROUND_CONFIG } from '../../lib/game/Data/Constants'
import { getBaseReward } from '../../lib/game/Services/RoundService'
import type { ButtonArea } from './overlayRenderer'

/**
 * カードの状態
 */
type CardState = 'current' | 'cleared' | 'locked'

/**
 * ラウンド進行画面の描画結果
 */
export interface RoundProgressRenderResult {
  startButtonArea: ButtonArea
}

/**
 * セット内のラウンドカード情報
 */
interface RoundCardInfo {
  roundNumber: number
  roundType: RoundType
  state: CardState
  bossConditionName: string | null
}

/**
 * セット内の3ラウンド情報を生成
 */
function generateSetCards(
  currentRound: number,
  currentRoundInfo: RoundInfo
): RoundCardInfo[] {
  const setStartRound = (currentRoundInfo.setNumber - 1) * 3 + 1
  const types: RoundType[] = ['normal', 'elite', 'boss']

  return types.map((type, index) => {
    const roundNumber = setStartRound + index
    let state: CardState

    if (roundNumber < currentRound) {
      state = 'cleared'
    } else if (roundNumber === currentRound) {
      state = 'current'
    } else {
      state = 'locked'
    }

    return {
      roundNumber,
      roundType: type,
      state,
      bossConditionName:
        type === 'boss' && roundNumber === currentRound
          ? currentRoundInfo.bossCondition?.name ?? null
          : null,
    }
  })
}

/**
 * ラウンドカードを描画
 */
function renderRoundCard(
  ctx: CanvasRenderingContext2D,
  card: RoundCardInfo,
  x: number,
  y: number
): void {
  const style = ROUND_PROGRESS_STYLE
  const { cardWidth, cardHeight, cardBorderRadius, cardBorderWidth } = style
  const cardColor = style.cardColors[card.state]
  const typeColor = style.typeColors[card.roundType]

  // カード背景
  ctx.fillStyle = cardColor.background
  ctx.beginPath()
  ctx.roundRect(x, y, cardWidth, cardHeight, cardBorderRadius)
  ctx.fill()

  // カード枠
  ctx.strokeStyle = cardColor.border
  ctx.lineWidth = cardBorderWidth
  ctx.stroke()

  const centerX = x + cardWidth / 2

  if (card.state === 'cleared') {
    // クリア済みマーク
    ctx.font = `bold ${style.clearedMarkFontSize}px Arial, sans-serif`
    ctx.fillStyle = style.clearedMarkColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✓', centerX, y + cardHeight / 2)
  } else if (card.state === 'locked') {
    // ロックマーク
    ctx.font = `${style.lockedMarkFontSize}px Arial, sans-serif`
    ctx.fillStyle = style.lockedMarkColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🔒', centerX, y + cardHeight / 2)
  } else {
    // 現在のラウンド: タイプ名、ラウンド番号、ボス条件を表示
    const typeLabels: Record<RoundType, string> = {
      normal: '雑魚',
      elite: 'エリート',
      boss: 'ボス',
    }

    // タイプ名
    ctx.font = `bold ${style.typeFontSize}px Arial, sans-serif`
    ctx.fillStyle = typeColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(typeLabels[card.roundType], centerX, y + style.typeOffsetY)

    // ラウンド番号
    ctx.font = `${style.roundFontSize}px Arial, sans-serif`
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(
      `Round ${card.roundNumber}`,
      centerX,
      y + style.roundOffsetY
    )

    // ボス条件（ボスラウンドの場合）
    if (card.bossConditionName) {
      ctx.font = `${style.conditionFontSize}px Arial, sans-serif`
      ctx.fillStyle = style.conditionColor
      ctx.fillText(
        `[${card.bossConditionName}]`,
        centerX,
        y + style.conditionOffsetY
      )
    }
  }
}

/**
 * ラウンド進行画面を描画
 */
export function renderRoundProgress(
  ctx: CanvasRenderingContext2D,
  currentRound: number,
  roundInfo: RoundInfo,
  targetScore: number,
  layout: CanvasLayout
): RoundProgressRenderResult {
  const style = ROUND_PROGRESS_STYLE

  ctx.save()

  // 背景オーバーレイ
  ctx.fillStyle = style.backgroundColor
  ctx.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight)

  const centerX = layout.canvasWidth / 2
  const centerY = layout.canvasHeight / 2

  // セット番号表示
  ctx.font = `bold ${style.setFontSize}px Arial, sans-serif`
  ctx.fillStyle = style.setColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(
    `セット ${roundInfo.setNumber} / ${Math.ceil(ROUND_CONFIG.maxRound / 3)}`,
    centerX,
    centerY + style.setOffsetY
  )

  // 3枚のカードを描画
  const cards = generateSetCards(currentRound, roundInfo)
  const totalWidth = style.cardWidth * 3 + style.cardGap * 2
  const startX = centerX - totalWidth / 2

  cards.forEach((card, index) => {
    const cardX = startX + index * (style.cardWidth + style.cardGap)
    const cardY = centerY - style.cardHeight / 2 - 30
    renderRoundCard(ctx, card, cardX, cardY)
  })

  // 目標スコア表示
  ctx.font = `bold 20px Arial, sans-serif`
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(`目標: ${targetScore}点`, centerX, centerY + 90)

  // 報酬額表示
  const baseReward = getBaseReward(roundInfo.roundType)
  ctx.font = `bold 18px Arial, sans-serif`
  ctx.fillStyle = '#FFD700'
  ctx.fillText(`Reward ${baseReward}G`, centerX, centerY + 115)

  // 「ラウンド開始」ボタン
  const buttonX = centerX - style.buttonWidth / 2
  const buttonY = centerY + style.buttonOffsetY

  ctx.fillStyle = style.buttonColor
  ctx.beginPath()
  ctx.roundRect(buttonX, buttonY, style.buttonWidth, style.buttonHeight, 8)
  ctx.fill()

  ctx.font = `bold ${style.buttonFontSize}px Arial, sans-serif`
  ctx.fillStyle = style.buttonTextColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('ラウンド開始', centerX, buttonY + style.buttonHeight / 2)

  ctx.restore()

  return {
    startButtonArea: {
      x: buttonX,
      y: buttonY,
      width: style.buttonWidth,
      height: style.buttonHeight,
    },
  }
}

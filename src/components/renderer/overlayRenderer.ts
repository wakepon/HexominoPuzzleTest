/**
 * オーバーレイの描画（ラウンドクリア演出、ゲームオーバー画面）
 */

import { CanvasLayout } from '../../lib/game/types'
import { ROUND_CLEAR_STYLE, GAME_OVER_STYLE, GAME_CLEAR_STYLE, ROUND_CONFIG } from '../../lib/game/Data/Constants'

/**
 * ボタン領域の型
 */
export interface ButtonArea {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 報酬内訳データ
 */
export interface RewardBreakdown {
  readonly baseReward: number
  readonly handBonus: number
  readonly interest: number
}

/**
 * ラウンドクリア演出を描画
 */
export function renderRoundClear(
  ctx: CanvasRenderingContext2D,
  round: number,
  reward: RewardBreakdown,
  layout: CanvasLayout
): ButtonArea {
  const {
    fontSize, subFontSize, color, goldColor, labelColor, backgroundColor,
    titleOffsetY, tableStartY, tableLineHeight, tableWidth,
    separatorOffsetY, totalOffsetY,
    buttonWidth, buttonHeight, buttonColor, buttonTextColor, buttonFontSize, buttonOffsetY
  } = ROUND_CLEAR_STYLE

  ctx.save()

  // 背景オーバーレイ
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight)

  const centerX = layout.canvasWidth / 2
  const centerY = layout.canvasHeight / 2

  // メインテキスト
  ctx.font = `bold ${fontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText(`Round ${round} Clear!`, centerX, centerY + titleOffsetY)

  // 報酬内訳テーブル
  const tableLeft = centerX - tableWidth / 2
  const tableRight = centerX + tableWidth / 2
  ctx.font = `${subFontSize}px Arial, sans-serif`

  const rows = [
    { label: '基本報酬', value: reward.baseReward },
    { label: 'ハンド（残りハンドにつき1G）', value: reward.handBonus },
    { label: '利息（5Gにつき1G）', value: reward.interest },
  ]

  rows.forEach((row, i) => {
    const y = centerY + tableStartY + i * tableLineHeight
    // ラベル（左寄せ）
    ctx.textAlign = 'left'
    ctx.fillStyle = labelColor
    ctx.fillText(row.label, tableLeft, y)
    // 値（右寄せ）
    ctx.textAlign = 'right'
    ctx.fillStyle = goldColor
    ctx.fillText(`${row.value} G`, tableRight, y)
  })

  // 区切り線
  const sepY = centerY + separatorOffsetY
  ctx.strokeStyle = labelColor
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(tableLeft, sepY)
  ctx.lineTo(tableRight, sepY)
  ctx.stroke()

  // 合計
  const totalY = centerY + totalOffsetY
  ctx.font = `bold ${subFontSize + 2}px Arial, sans-serif`
  ctx.textAlign = 'left'
  ctx.fillStyle = color
  ctx.fillText('合計', tableLeft, totalY)
  ctx.textAlign = 'right'
  ctx.fillStyle = goldColor
  const total = reward.baseReward + reward.handBonus + reward.interest
  ctx.fillText(`${total} G`, tableRight, totalY)

  // 「次へ」ボタン
  const buttonX = centerX - buttonWidth / 2
  const buttonY = centerY + buttonOffsetY

  ctx.fillStyle = buttonColor
  ctx.beginPath()
  ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 8)
  ctx.fill()

  ctx.font = `bold ${buttonFontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillStyle = buttonTextColor
  ctx.fillText('次へ', centerX, buttonY + buttonHeight / 2)

  ctx.restore()

  return { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight }
}

/**
 * ゲームオーバー画面を描画
 * @returns リトライボタンの領域（クリック判定用）
 */
export function renderGameOver(
  ctx: CanvasRenderingContext2D,
  round: number,
  score: number,
  gold: number,
  layout: CanvasLayout
): ButtonArea {
  const {
    titleFontSize, subtextFontSize, color, backgroundColor,
    buttonWidth, buttonHeight, buttonColor, buttonTextColor, buttonFontSize,
    titleOffsetY, line1OffsetY, line2OffsetY, line3OffsetY, buttonOffsetY
  } = GAME_OVER_STYLE

  ctx.save()

  // 背景オーバーレイ
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight)

  const centerX = layout.canvasWidth / 2
  const centerY = layout.canvasHeight / 2

  // タイトル
  ctx.font = `bold ${titleFontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText('Game Over', centerX, centerY + titleOffsetY)

  // 詳細情報
  ctx.font = `${subtextFontSize}px Arial, sans-serif`
  ctx.fillText(`到達ラウンド: ${round}/${ROUND_CONFIG.maxRound}`, centerX, centerY + line1OffsetY)
  ctx.fillText(`最終スコア: ${score}`, centerX, centerY + line2OffsetY)
  ctx.fillStyle = '#FFD700'
  ctx.fillText(`総獲得ゴールド: ${gold}G`, centerX, centerY + line3OffsetY)

  // リトライボタン
  const buttonX = centerX - buttonWidth / 2
  const buttonY = centerY + buttonOffsetY

  ctx.fillStyle = buttonColor
  ctx.beginPath()
  ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 8)
  ctx.fill()

  ctx.font = `bold ${buttonFontSize}px Arial, sans-serif`
  ctx.fillStyle = buttonTextColor
  ctx.fillText('リトライ', centerX, buttonY + buttonHeight / 2)

  ctx.restore()

  return { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight }
}

/**
 * ゲームクリア画面を描画
 * @returns リトライボタンの領域（クリック判定用）
 */
export function renderGameClear(
  ctx: CanvasRenderingContext2D,
  gold: number,
  layout: CanvasLayout
): ButtonArea {
  const {
    titleFontSize, subtextFontSize, color, backgroundColor,
    buttonWidth, buttonHeight, buttonColor, buttonTextColor, buttonFontSize,
    titleOffsetY, line1OffsetY, line2OffsetY, buttonOffsetY
  } = GAME_CLEAR_STYLE

  ctx.save()

  // 背景オーバーレイ
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight)

  const centerX = layout.canvasWidth / 2
  const centerY = layout.canvasHeight / 2

  // タイトル
  ctx.font = `bold ${titleFontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText('Game Clear!', centerX, centerY + titleOffsetY)

  // 詳細情報
  ctx.font = `${subtextFontSize}px Arial, sans-serif`
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(`全${ROUND_CONFIG.maxRound}ラウンド クリア！`, centerX, centerY + line1OffsetY)
  ctx.fillStyle = color
  ctx.fillText(`総獲得ゴールド: ${gold}G`, centerX, centerY + line2OffsetY)

  // もう一度遊ぶボタン
  const buttonX = centerX - buttonWidth / 2
  const buttonY = centerY + buttonOffsetY

  ctx.fillStyle = buttonColor
  ctx.beginPath()
  ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 8)
  ctx.fill()

  ctx.font = `bold ${buttonFontSize}px Arial, sans-serif`
  ctx.fillStyle = buttonTextColor
  ctx.fillText('もう一度', centerX, buttonY + buttonHeight / 2)

  ctx.restore()

  return { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight }
}

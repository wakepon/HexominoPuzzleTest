/**
 * オーバーレイの描画（ラウンドクリア演出、ゲームオーバー画面）
 */

import { CanvasLayout } from '../../lib/game/types'
import { ROUND_CLEAR_STYLE, GAME_OVER_STYLE, GAME_CLEAR_STYLE, ROUND_CONFIG } from '../../lib/game/constants'

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
 * ラウンドクリア演出を描画
 */
export function renderRoundClear(
  ctx: CanvasRenderingContext2D,
  round: number,
  goldReward: number,
  layout: CanvasLayout
): void {
  const { fontSize, subFontSize, color, goldColor, backgroundColor, titleOffsetY, goldTextOffsetY } = ROUND_CLEAR_STYLE

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

  // ゴールド獲得表示
  ctx.font = `bold ${subFontSize}px Arial, sans-serif`
  ctx.fillStyle = goldColor
  ctx.fillText(`+${goldReward}G 獲得！`, centerX, centerY + goldTextOffsetY)

  ctx.restore()
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

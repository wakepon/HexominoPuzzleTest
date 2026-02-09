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
import type { ButtonArea } from './overlayRenderer'

interface StatusPanelData {
  targetScore: number
  roundScore: number
  gold: number
  roundInfo: RoundInfo
  remainingHands: number
}

/**
 * ステータスパネルの描画結果
 */
export interface StatusPanelRenderResult {
  deckButtonArea: ButtonArea
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
  y += style.targetFontSize + groupGap

  // === ラウンドスコアセクション ===
  ctx.font = `${style.fontWeight} ${style.roundScoreLabelFontSize}px ${style.fontFamily}`
  ctx.fillStyle = style.roundScoreLabelColor
  ctx.fillText('ラウンドスコア', padding, y)
  y += style.roundScoreLabelFontSize + itemGap

  ctx.font = `${style.fontWeight} ${style.roundScoreFontSize}px ${style.fontFamily}`
  ctx.fillStyle = style.roundScoreColor
  ctx.fillText(`${data.roundScore}点`, padding, y)
  y += style.roundScoreFontSize + groupGap + 40

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

  // === デッキボタン ===
  const btnStyle = DECK_BUTTON_STYLE
  const buttonX = padding
  const buttonY = btnStyle.offsetY

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
  }
}

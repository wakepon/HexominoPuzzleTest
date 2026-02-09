/**
 * デッキ一覧画面の描画
 */

import type { CanvasLayout, DeckState, PieceSlot } from '../../lib/game/types'
import { DECK_VIEW_STYLE, COLORS, CELL_STYLE } from '../../lib/game/Data/Constants'
import { getMinoById } from '../../lib/game/Data/MinoDefinitions'
import type { ButtonArea } from './overlayRenderer'

/**
 * デッキ一覧画面の描画結果
 */
export interface DeckViewRenderResult {
  closeButtonArea: ButtonArea
}

/**
 * ミノの形状を描画（小型版）
 */
function renderMiniMino(
  ctx: CanvasRenderingContext2D,
  shape: readonly (readonly boolean[])[],
  x: number,
  y: number,
  cellSize: number,
  isUsed: boolean
): { width: number; height: number } {
  const { padding } = CELL_STYLE

  ctx.save()
  if (isUsed) {
    ctx.globalAlpha = DECK_VIEW_STYLE.usedOpacity
  }

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (!shape[row][col]) continue

      const cellX = x + col * cellSize
      const cellY = y + row * cellSize

      // ベース色
      ctx.fillStyle = COLORS.piece
      ctx.fillRect(
        cellX + padding / 2,
        cellY + padding / 2,
        cellSize - padding,
        cellSize - padding
      )
    }
  }

  ctx.restore()

  return {
    width: shape[0].length * cellSize,
    height: shape.length * cellSize,
  }
}

/**
 * デッキ一覧画面を描画
 */
export function renderDeckView(
  ctx: CanvasRenderingContext2D,
  deck: DeckState,
  pieceSlots: readonly PieceSlot[],
  layout: CanvasLayout
): DeckViewRenderResult {
  const style = DECK_VIEW_STYLE

  ctx.save()

  // 背景オーバーレイ
  ctx.fillStyle = style.backgroundColor
  ctx.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight)

  const centerX = layout.canvasWidth / 2
  const areaStartX = centerX - style.areaWidth / 2

  // タイトル
  ctx.font = `bold ${style.titleFontSize}px Arial, sans-serif`
  ctx.fillStyle = style.titleColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('デッキ一覧', centerX, style.titleOffsetY)

  // 山札セクション
  ctx.font = `${style.sectionFontSize}px Arial, sans-serif`
  ctx.fillStyle = style.sectionColor
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(`山札（${deck.cards.length}枚）`, areaStartX, style.deckSectionY)

  // 山札のミノを描画
  let cardX = areaStartX
  let cardY = style.deckSectionY + 25
  const cellSize = style.cardCellSize
  const maxCardWidth = style.maxCardWidth

  deck.cards.forEach((minoId) => {
    const mino = getMinoById(minoId)
    if (!mino) return

    // 行の折り返し
    if (cardX + maxCardWidth > areaStartX + style.areaWidth) {
      cardX = areaStartX
      cardY += maxCardWidth + style.cardGap
    }

    renderMiniMino(ctx, mino.shape, cardX, cardY, cellSize, false)
    cardX += maxCardWidth + style.cardGap
  })

  // 使用中セクション（手札にあるピース）
  const usedMinoIds = pieceSlots
    .filter((slot) => slot.piece !== null)
    .map((slot) => {
      // PieceのIDからminoIdを抽出
      // ID形式: "minoId-timestamp-random"
      return slot.piece!.id.replace(/-\d+-[a-z0-9]+$/, '')
    })

  ctx.font = `${style.sectionFontSize}px Arial, sans-serif`
  ctx.fillStyle = style.sectionColor
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(
    `使用中（${usedMinoIds.length}枚）`,
    areaStartX,
    style.usedSectionY
  )

  // 使用中のミノを描画（グレーアウト）
  cardX = areaStartX
  cardY = style.usedSectionY + 25

  usedMinoIds.forEach((minoId) => {
    const mino = getMinoById(minoId)
    if (!mino) return

    if (cardX + maxCardWidth > areaStartX + style.areaWidth) {
      cardX = areaStartX
      cardY += maxCardWidth + style.cardGap
    }

    const { width, height } = renderMiniMino(ctx, mino.shape, cardX, cardY, cellSize, true)

    // グレーオーバーレイ
    ctx.fillStyle = style.usedOverlayColor
    ctx.fillRect(cardX, cardY, width, height)

    cardX += maxCardWidth + style.cardGap
  })

  // 閉じるボタン
  const buttonX = centerX - style.closeButtonWidth / 2
  const buttonY = layout.canvasHeight + style.closeButtonOffsetY - style.closeButtonHeight

  ctx.fillStyle = style.closeButtonColor
  ctx.beginPath()
  ctx.roundRect(buttonX, buttonY, style.closeButtonWidth, style.closeButtonHeight, 6)
  ctx.fill()

  ctx.font = `bold ${style.closeButtonFontSize}px Arial, sans-serif`
  ctx.fillStyle = style.closeButtonTextColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('閉じる', centerX, buttonY + style.closeButtonHeight / 2)

  ctx.restore()

  return {
    closeButtonArea: {
      x: buttonX,
      y: buttonY,
      width: style.closeButtonWidth,
      height: style.closeButtonHeight,
    },
  }
}

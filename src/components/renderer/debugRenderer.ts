/**
 * デバッグウィンドウの描画
 */

import { DeckState, PieceShape } from '../../lib/game/types'
import { DEBUG_WINDOW_STYLE, COLORS } from '../../lib/game/constants'
import { getMinoById } from '../../lib/game/minoDefinitions'

/**
 * ミノ形状を小さいセルで描画
 */
function drawMiniMino(
  ctx: CanvasRenderingContext2D,
  shape: PieceShape,
  x: number,
  y: number,
  cellSize: number
): { width: number; height: number } {
  const rows = shape.length
  const cols = shape[0]?.length ?? 0

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (shape[row][col]) {
        const cellX = x + col * cellSize
        const cellY = y + row * cellSize

        // ベース色
        ctx.fillStyle = COLORS.piece
        ctx.fillRect(cellX, cellY, cellSize - 1, cellSize - 1)

        // ハイライト（上端と左端）- セルが小さいので1pxのみ
        ctx.fillStyle = COLORS.pieceHighlight
        ctx.fillRect(cellX, cellY, cellSize - 1, 1)
        ctx.fillRect(cellX, cellY, 1, cellSize - 1)

        // シャドウ（下端と右端）
        ctx.fillStyle = COLORS.pieceShadow
        ctx.fillRect(cellX, cellY + cellSize - 2, cellSize - 1, 1)
        ctx.fillRect(cellX + cellSize - 2, cellY, 1, cellSize - 1)
      }
    }
  }

  return {
    width: cols * cellSize,
    height: rows * cellSize,
  }
}

/**
 * ミノ形状のサイズを取得
 */
function getMinoSize(shape: PieceShape, cellSize: number): { width: number; height: number } {
  const rows = shape.length
  const cols = shape[0]?.length ?? 0
  return {
    width: cols * cellSize,
    height: rows * cellSize,
  }
}

/**
 * デバッグウィンドウを描画
 * デッキの中身をストックに登場する順（先頭から）にブロック形状で表示する
 */
export function renderDebugWindow(
  ctx: CanvasRenderingContext2D,
  deck: DeckState
): void {
  const {
    backgroundColor,
    titleFontSize,
    titleColor,
    infoFontSize,
    infoColor,
    highlightBgColor,
    fontFamily,
    padding,
    itemPadding,
    cellSize,
    maxItems,
    numberColumnWidth,
    minWindowWidth,
    offsetX,
    offsetY,
  } = DEBUG_WINDOW_STYLE

  const cards = deck.cards
  const displayCount = Math.min(cards.length, maxItems)

  // ミノ形状を取得
  const minoShapes: { id: string; shape: PieceShape }[] = []
  let maxMinoWidth = 0

  for (let i = 0; i < displayCount; i++) {
    const mino = getMinoById(cards[i])
    if (mino) {
      minoShapes.push({ id: cards[i], shape: mino.shape })
      const size = getMinoSize(mino.shape, cellSize)
      maxMinoWidth = Math.max(maxMinoWidth, size.width)
    }
  }

  // ウィンドウサイズを計算
  const titleHeight = titleFontSize + 4
  const infoHeight = infoFontSize + 4
  const headerHeight = titleHeight + infoHeight + padding

  // 各ミノの高さを計算して合計
  let totalMinoHeight = 0
  for (const { shape } of minoShapes) {
    const size = getMinoSize(shape, cellSize)
    totalMinoHeight += size.height + itemPadding
  }

  // 省略テキスト用の高さ
  const ellipsisHeight = cards.length > maxItems ? infoFontSize + 4 : 0

  const windowWidth = Math.max(maxMinoWidth + padding * 2 + numberColumnWidth + 5, minWindowWidth)
  const windowHeight = headerHeight + totalMinoHeight + ellipsisHeight + padding

  ctx.save()

  // 背景描画
  ctx.fillStyle = backgroundColor
  ctx.fillRect(offsetX, offsetY, windowWidth, windowHeight)

  // 枠線
  ctx.strokeStyle = titleColor
  ctx.lineWidth = 1
  ctx.strokeRect(offsetX, offsetY, windowWidth, windowHeight)

  // タイトル描画
  ctx.font = `bold ${titleFontSize}px ${fontFamily}`
  ctx.fillStyle = titleColor
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  let y = offsetY + padding
  ctx.fillText('DECK', offsetX + padding, y)
  y += titleHeight

  // 残りカード数とハンド数
  ctx.font = `${infoFontSize}px ${fontFamily}`
  ctx.fillStyle = infoColor
  ctx.fillText(`${cards.length}枚 / ${deck.remainingHands}手`, offsetX + padding, y)
  y += infoHeight + padding / 2

  // デッキの中身をミノ形状で表示（先頭から順に）
  for (let i = 0; i < minoShapes.length; i++) {
    const { shape } = minoShapes[i]
    const size = getMinoSize(shape, cellSize)

    // 先頭（次に出るミノ）の背景ハイライト
    if (i === 0) {
      ctx.fillStyle = highlightBgColor
      ctx.fillRect(
        offsetX + padding - 2,
        y - 2,
        windowWidth - padding * 2 + 4,
        size.height + itemPadding
      )
    }

    // 番号表示
    ctx.font = `${infoFontSize}px ${fontFamily}`
    ctx.fillStyle = i === 0 ? titleColor : infoColor
    ctx.textAlign = 'right'
    ctx.textBaseline = 'top'
    ctx.fillText(`${i + 1}.`, offsetX + padding + numberColumnWidth - 5, y + (size.height - infoFontSize) / 2)

    // ミノ形状を描画
    drawMiniMino(ctx, shape, offsetX + padding + numberColumnWidth, y, cellSize)

    y += size.height + itemPadding
  }

  // 省略表示
  if (cards.length > maxItems) {
    ctx.font = `${infoFontSize}px ${fontFamily}`
    ctx.fillStyle = infoColor
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(`+${cards.length - maxItems}枚`, offsetX + padding, y)
  }

  ctx.restore()
}

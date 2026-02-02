/**
 * ショップ画面の描画
 */

import { CanvasLayout, ShopState, PieceShape } from '../../lib/game/types'
import { SHOP_STYLE, COLORS, CELL_STYLE } from '../../lib/game/constants'
import { getMinoById } from '../../lib/game/minoDefinitions'
import { canAfford } from '../../lib/game/shopLogic'
import { ButtonArea } from './overlayRenderer'

/**
 * ショップアイテムの領域情報
 */
export interface ShopItemArea extends ButtonArea {
  itemIndex: number
}

/**
 * ショップ描画結果（クリック判定用）
 */
export interface ShopRenderResult {
  itemAreas: ShopItemArea[]
  leaveButtonArea: ButtonArea
}

/**
 * ミノの形状を描画
 */
function renderMinoShape(
  ctx: CanvasRenderingContext2D,
  shape: PieceShape,
  centerX: number,
  centerY: number,
  cellSize: number
): void {
  const rows = shape.length
  const cols = shape[0].length
  const totalWidth = cols * cellSize
  const totalHeight = rows * cellSize
  const startX = centerX - totalWidth / 2
  const startY = centerY - totalHeight / 2

  const { padding, highlightWidth, shadowWidth } = CELL_STYLE

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!shape[row][col]) continue

      const x = startX + col * cellSize
      const y = startY + row * cellSize
      const size = cellSize

      // ベース色
      ctx.fillStyle = COLORS.piece
      ctx.fillRect(x + padding, y + padding, size - padding * 2, size - padding * 2)

      // ハイライト（上端と左端）
      ctx.fillStyle = COLORS.pieceHighlight
      ctx.fillRect(x + padding, y + padding, size - padding * 2, highlightWidth)
      ctx.fillRect(x + padding, y + padding, highlightWidth, size - padding * 2)

      // シャドウ（下端と右端）
      ctx.fillStyle = COLORS.pieceShadow
      ctx.fillRect(x + padding, y + size - padding - shadowWidth, size - padding * 2, shadowWidth)
      ctx.fillRect(x + size - padding - shadowWidth, y + padding, shadowWidth, size - padding * 2)
    }
  }
}

/**
 * ショップアイテムボックスを描画
 */
function renderShopItem(
  ctx: CanvasRenderingContext2D,
  minoId: string,
  price: number,
  purchased: boolean,
  gold: number,
  boxX: number,
  boxY: number,
  boxWidth: number,
  boxHeight: number,
  cellSize: number
): void {
  const mino = getMinoById(minoId)
  if (!mino) return

  const affordable = canAfford(gold, price)

  // ボックス背景
  ctx.fillStyle = purchased
    ? SHOP_STYLE.itemPurchasedColor
    : SHOP_STYLE.itemBackgroundColor
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight)

  // ボックス枠線
  ctx.strokeStyle = SHOP_STYLE.itemBorderColor
  ctx.lineWidth = SHOP_STYLE.itemBorderWidth
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

  // ミノの形状を描画
  const shapeCenterX = boxX + boxWidth / 2
  const shapeCenterY = boxY + boxHeight / 2 - SHOP_STYLE.shapeVerticalOffset
  renderMinoShape(ctx, mino.shape, shapeCenterX, shapeCenterY, cellSize)

  // 価格表示
  ctx.font = `bold ${SHOP_STYLE.priceFontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const priceY = boxY + boxHeight - SHOP_STYLE.priceVerticalOffset

  if (purchased) {
    ctx.fillStyle = SHOP_STYLE.priceDisabledColor
    ctx.fillText('購入済み', boxX + boxWidth / 2, priceY)
  } else if (!affordable) {
    ctx.fillStyle = SHOP_STYLE.priceDisabledColor
    ctx.fillText(`${price}G`, boxX + boxWidth / 2, priceY)
  } else {
    ctx.fillStyle = SHOP_STYLE.priceColor
    ctx.fillText(`${price}G`, boxX + boxWidth / 2, priceY)
  }
}

/**
 * ショップ画面を描画
 */
export function renderShop(
  ctx: CanvasRenderingContext2D,
  shopState: ShopState,
  gold: number,
  layout: CanvasLayout
): ShopRenderResult {
  const {
    backgroundColor, titleFontSize, titleColor,
    itemBoxPadding, itemBoxGap,
    leaveButtonWidth, leaveButtonHeight, leaveButtonColor, leaveButtonTextColor, leaveButtonFontSize,
    titleOffsetY, itemsOffsetY, leaveButtonOffsetY, goldDisplayOffsetY, cellSizeRatio,
  } = SHOP_STYLE

  ctx.save()

  // 背景オーバーレイ
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight)

  const centerX = layout.canvasWidth / 2
  const centerY = layout.canvasHeight / 2

  // ゴールド表示
  ctx.font = `bold ${titleFontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#FFD700'
  ctx.fillText(`所持金: ${gold}G`, centerX, centerY + goldDisplayOffsetY)

  // タイトル
  ctx.fillStyle = titleColor
  ctx.fillText('ブロックを購入しますか？', centerX, centerY + titleOffsetY)

  // アイテムボックスのサイズ計算
  const cellSize = layout.cellSize * cellSizeRatio
  const boxWidth = 7 * cellSize + itemBoxPadding * 2  // ヘキソミノ(最大6x6)が収まるサイズ
  const boxHeight = 7 * cellSize + itemBoxPadding * 2 + 30  // 価格表示分の余裕

  // 3つのアイテムの配置（小さい順 = 左から）
  const totalWidth = boxWidth * 3 + itemBoxGap * 2
  const startX = centerX - totalWidth / 2
  const boxY = centerY + itemsOffsetY - boxHeight / 2

  const itemAreas: ShopItemArea[] = []

  shopState.items.forEach((item, index) => {
    const boxX = startX + index * (boxWidth + itemBoxGap)

    renderShopItem(
      ctx,
      item.minoId,
      item.price,
      item.purchased,
      gold,
      boxX,
      boxY,
      boxWidth,
      boxHeight,
      cellSize
    )

    itemAreas.push({
      itemIndex: index,
      x: boxX,
      y: boxY,
      width: boxWidth,
      height: boxHeight,
    })
  })

  // 「店を出る」ボタン
  const buttonX = centerX - leaveButtonWidth / 2
  const buttonY = centerY + leaveButtonOffsetY

  ctx.fillStyle = leaveButtonColor
  ctx.beginPath()
  ctx.roundRect(buttonX, buttonY, leaveButtonWidth, leaveButtonHeight, 8)
  ctx.fill()

  ctx.font = `bold ${leaveButtonFontSize}px Arial, sans-serif`
  ctx.fillStyle = leaveButtonTextColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('店を出る', centerX, buttonY + leaveButtonHeight / 2)

  ctx.restore()

  return {
    itemAreas,
    leaveButtonArea: { x: buttonX, y: buttonY, width: leaveButtonWidth, height: leaveButtonHeight },
  }
}

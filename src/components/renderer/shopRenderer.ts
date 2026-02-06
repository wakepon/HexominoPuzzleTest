/**
 * ショップ画面の描画
 */

import type { CanvasLayout, Piece } from '../../lib/game/types'
import type { ShopState, BlockShopItem } from '../../lib/game/Domain/Shop/ShopTypes'
import { SHOP_STYLE, COLORS, CELL_STYLE, PATTERN_COLORS, PATTERN_SYMBOL_STYLE, SEAL_COLORS, SEAL_SYMBOL_STYLE } from '../../lib/game/constants'
import { canAfford } from '../../lib/game/Services/ShopService'
import { isBlockShopItem } from '../../lib/game/Domain/Shop/ShopTypes'
import { getPatternDefinition } from '../../lib/game/Domain/Effect/Pattern'
import { getSealDefinition } from '../../lib/game/Domain/Effect/Seal'
import { BlockDataMapUtils } from '../../lib/game/Domain/Piece/BlockData'
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
 * Pieceの形状を描画（パターン・シール対応版）
 */
function renderPieceShape(
  ctx: CanvasRenderingContext2D,
  piece: Piece,
  centerX: number,
  centerY: number,
  cellSize: number
): void {
  const { shape, blocks } = piece
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

      // BlockDataからパターンとシールを取得
      const blockData = BlockDataMapUtils.get(blocks, row, col)
      const pattern = blockData?.pattern ?? null
      const seal = blockData?.seal ?? null

      // パターン別の色を取得
      const colors =
        pattern && PATTERN_COLORS[pattern]
          ? PATTERN_COLORS[pattern]
          : {
              base: COLORS.piece,
              highlight: COLORS.pieceHighlight,
              shadow: COLORS.pieceShadow,
            }

      // ベース色
      ctx.fillStyle = colors.base
      ctx.fillRect(
        x + padding,
        y + padding,
        size - padding * 2,
        size - padding * 2
      )

      // ハイライト（上端と左端）
      ctx.fillStyle = colors.highlight
      ctx.fillRect(x + padding, y + padding, size - padding * 2, highlightWidth)
      ctx.fillRect(x + padding, y + padding, highlightWidth, size - padding * 2)

      // シャドウ（下端と右端）
      ctx.fillStyle = colors.shadow
      ctx.fillRect(
        x + padding,
        y + size - padding - shadowWidth,
        size - padding * 2,
        shadowWidth
      )
      ctx.fillRect(
        x + size - padding - shadowWidth,
        y + padding,
        shadowWidth,
        size - padding * 2
      )

      // パターン記号を描画（中央）
      if (pattern) {
        const patternDef = getPatternDefinition(pattern)
        if (patternDef) {
          const smallFontSize = Math.max(8, Math.floor(size * 0.4))
          ctx.save()
          ctx.font = `bold ${smallFontSize}px ${PATTERN_SYMBOL_STYLE.fontFamily}`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.shadowColor = PATTERN_SYMBOL_STYLE.shadowColor
          ctx.shadowBlur = PATTERN_SYMBOL_STYLE.shadowBlur
          ctx.fillStyle = PATTERN_SYMBOL_STYLE.color
          ctx.fillText(patternDef.symbol, x + size / 2, y + size / 2)
          ctx.restore()
        }
      }

      // シール記号を描画（右下）
      if (seal) {
        const sealDef = getSealDefinition(seal)
        if (sealDef) {
          const smallFontSize = Math.max(6, Math.floor(size * 0.3))
          const sealColor = SEAL_COLORS[seal] ?? '#FFFFFF'
          const { backgroundColor, borderRadius } = SEAL_SYMBOL_STYLE

          ctx.save()
          ctx.font = `bold ${smallFontSize}px Arial, sans-serif`
          const metrics = ctx.measureText(sealDef.symbol)
          const textWidth = metrics.width
          const textHeight = smallFontSize
          const bgPadding = 1

          const bgWidth = textWidth + bgPadding * 4
          const bgHeight = textHeight + bgPadding * 2
          const bgX = x + size - bgWidth - 2
          const bgY = y + size - bgHeight - 2

          // 背景
          ctx.fillStyle = backgroundColor
          ctx.beginPath()
          ctx.roundRect(bgX, bgY, bgWidth, bgHeight, borderRadius)
          ctx.fill()

          // 記号
          ctx.fillStyle = sealColor
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(sealDef.symbol, bgX + bgWidth / 2, bgY + bgHeight / 2)
          ctx.restore()
        }
      }
    }
  }
}

/**
 * ショップアイテムボックスを描画（BlockShopItem対応版）
 */
function renderBlockShopItem(
  ctx: CanvasRenderingContext2D,
  item: BlockShopItem,
  gold: number,
  boxX: number,
  boxY: number,
  boxWidth: number,
  boxHeight: number,
  cellSize: number
): void {
  const { piece, price, purchased } = item
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

  // ピースの形状を描画
  const shapeCenterX = boxX + boxWidth / 2
  const shapeCenterY = boxY + boxHeight / 2 - SHOP_STYLE.shapeVerticalOffset
  renderPieceShape(ctx, piece, shapeCenterX, shapeCenterY, cellSize)

  // パターン名・シール名を表示
  const effectLabels: string[] = []

  // パターン名を収集
  for (const blockData of piece.blocks.values()) {
    if (blockData.pattern) {
      const patternDef = getPatternDefinition(blockData.pattern)
      if (patternDef) {
        effectLabels.push(patternDef.name)
      }
      break // パターンは全ブロック共通なので1つ見つければOK
    }
  }

  // シール名を収集
  for (const blockData of piece.blocks.values()) {
    if (blockData.seal) {
      const sealDef = getSealDefinition(blockData.seal)
      if (sealDef) {
        effectLabels.push(sealDef.name)
      }
      break // シールは1つだけなので1つ見つければOK
    }
  }

  // 効果名を表示（パターン名 / シール名）
  if (effectLabels.length > 0) {
    ctx.font = `bold 11px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillStyle = '#FFD700'
    ctx.fillText(effectLabels.join(' / '), boxX + boxWidth / 2, boxY + 20)
  }

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
    backgroundColor,
    titleFontSize,
    titleColor,
    itemBoxPadding,
    itemBoxGap,
    leaveButtonWidth,
    leaveButtonHeight,
    leaveButtonColor,
    leaveButtonTextColor,
    leaveButtonFontSize,
    titleOffsetY,
    itemsOffsetY,
    leaveButtonOffsetY,
    goldDisplayOffsetY,
    cellSizeRatio,
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
  const boxWidth = 7 * cellSize + itemBoxPadding * 2 // ヘキソミノ(最大6x6)が収まるサイズ
  const boxHeight = 7 * cellSize + itemBoxPadding * 2 + 30 // 価格表示分の余裕

  // 3つのアイテムの配置（小さい順 = 左から）
  const totalWidth = boxWidth * 3 + itemBoxGap * 2
  const startX = centerX - totalWidth / 2
  const boxY = centerY + itemsOffsetY - boxHeight / 2

  const itemAreas: ShopItemArea[] = []

  shopState.items.forEach((item, index) => {
    const boxX = startX + index * (boxWidth + itemBoxGap)

    if (isBlockShopItem(item)) {
      renderBlockShopItem(
        ctx,
        item,
        gold,
        boxX,
        boxY,
        boxWidth,
        boxHeight,
        cellSize
      )
    }
    // RelicShopItem の描画はスライス5で追加

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
    leaveButtonArea: {
      x: buttonX,
      y: buttonY,
      width: leaveButtonWidth,
      height: leaveButtonHeight,
    },
  }
}

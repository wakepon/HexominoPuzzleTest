/**
 * ショップ画面の描画
 */

import type { CanvasLayout, Piece } from '../../lib/game/types'
import type { ShopState, BlockShopItem, RelicShopItem } from '../../lib/game/Domain/Shop/ShopTypes'
import {
  SHOP_STYLE,
  COLORS,
  CELL_STYLE,
  PATTERN_COLORS,
  PATTERN_SYMBOL_STYLE,
  SEAL_COLORS,
  SEAL_SYMBOL_STYLE,
  RARITY_COLORS,
} from '../../lib/game/constants'
import { canAfford } from '../../lib/game/Services/ShopService'
import { isBlockShopItem, isRelicShopItem } from '../../lib/game/Domain/Shop/ShopTypes'
import { getPatternDefinition } from '../../lib/game/Domain/Effect/Pattern'
import { getSealDefinition } from '../../lib/game/Domain/Effect/Seal'
import { getRelicDefinition } from '../../lib/game/Domain/Effect/Relic'
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
 * 打ち消し線付きテキストを描画
 */
function renderStrikethroughText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  fontSize: number
): number {
  ctx.save()
  ctx.font = `bold ${fontSize}px Arial, sans-serif`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const metrics = ctx.measureText(text)
  ctx.fillText(text, x, y)

  // 打ち消し線を描画
  ctx.strokeStyle = SHOP_STYLE.strikethroughColor
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x - metrics.width / 2 - 2, y)
  ctx.lineTo(x + metrics.width / 2 + 2, y)
  ctx.stroke()

  ctx.restore()
  return metrics.width
}

/**
 * SALEバッジを描画
 */
function renderSaleBadge(
  ctx: CanvasRenderingContext2D,
  boxX: number,
  boxY: number
): void {
  const {
    saleBadgeColor,
    saleBadgeTextColor,
    saleBadgeFontSize,
    saleBadgeWidth,
    saleBadgeHeight,
    saleBadgeOffsetX,
    saleBadgeOffsetY,
  } = SHOP_STYLE

  const badgeX = boxX + saleBadgeOffsetX
  const badgeY = boxY + saleBadgeOffsetY

  ctx.save()

  // バッジ背景
  ctx.fillStyle = saleBadgeColor
  ctx.beginPath()
  ctx.roundRect(badgeX, badgeY, saleBadgeWidth, saleBadgeHeight, 3)
  ctx.fill()

  // バッジテキスト
  ctx.font = `bold ${saleBadgeFontSize}px Arial, sans-serif`
  ctx.fillStyle = saleBadgeTextColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('SALE', badgeX + saleBadgeWidth / 2, badgeY + saleBadgeHeight / 2)

  ctx.restore()
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
  const { piece, price, originalPrice, purchased, onSale } = item
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

  // セールバッジを描画
  if (onSale && !purchased) {
    renderSaleBadge(ctx, boxX, boxY)
  }

  // ピースの形状を描画
  ctx.save()
  // 購入不可時はグレーアウト
  if (!purchased && !affordable) {
    ctx.globalAlpha = SHOP_STYLE.unavailableOpacity
  }
  const shapeCenterX = boxX + boxWidth / 2
  const shapeCenterY = boxY + boxHeight / 2 - SHOP_STYLE.shapeVerticalOffset
  renderPieceShape(ctx, piece, shapeCenterX, shapeCenterY, cellSize)
  ctx.restore()

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
  const priceY = boxY + boxHeight - SHOP_STYLE.priceVerticalOffset

  if (purchased) {
    ctx.font = `bold ${SHOP_STYLE.priceFontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = SHOP_STYLE.priceDisabledColor
    ctx.fillText('購入済み', boxX + boxWidth / 2, priceY)
  } else if (onSale) {
    // セール時: 元価格（打ち消し線）+ セール価格（赤字）
    const originalPriceY = priceY - 10
    const salePriceY = priceY + 8

    // 元価格（打ち消し線付き）
    renderStrikethroughText(
      ctx,
      `${originalPrice}G`,
      boxX + boxWidth / 2,
      originalPriceY,
      SHOP_STYLE.originalPriceColor,
      SHOP_STYLE.priceFontSize - 2
    )

    // セール価格
    ctx.font = `bold ${SHOP_STYLE.priceFontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = affordable ? SHOP_STYLE.saleColor : SHOP_STYLE.priceDisabledColor
    ctx.fillText(`${price}G`, boxX + boxWidth / 2, salePriceY)
  } else if (!affordable) {
    // 購入不可時: 打ち消し線
    renderStrikethroughText(
      ctx,
      `${price}G`,
      boxX + boxWidth / 2,
      priceY,
      SHOP_STYLE.priceDisabledColor,
      SHOP_STYLE.priceFontSize
    )
  } else {
    // 通常価格
    ctx.font = `bold ${SHOP_STYLE.priceFontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = SHOP_STYLE.priceColor
    ctx.fillText(`${price}G`, boxX + boxWidth / 2, priceY)
  }
}

/**
 * レリック商品ボックスを描画
 */
function renderRelicShopItem(
  ctx: CanvasRenderingContext2D,
  item: RelicShopItem,
  gold: number,
  boxX: number,
  boxY: number,
  boxWidth: number,
  boxHeight: number
): void {
  const def = getRelicDefinition(item.relicId)
  if (!def) return

  const { price, originalPrice, purchased, onSale } = item
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

  // セールバッジを描画
  if (onSale && !purchased) {
    renderSaleBadge(ctx, boxX, boxY)
  }

  // レリックアイコン（絵文字）
  ctx.save()
  // 購入不可時はグレーアウト
  if (!purchased && !affordable) {
    ctx.globalAlpha = SHOP_STYLE.unavailableOpacity
  }
  ctx.font = `${SHOP_STYLE.relicIconSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(def.icon, boxX + boxWidth / 2, boxY + 30)
  ctx.restore()

  // レリック名
  ctx.font = `bold 12px Arial, sans-serif`
  ctx.fillStyle = '#FFD700'
  ctx.fillText(def.name, boxX + boxWidth / 2, boxY + 55)

  // レアリティ表示
  ctx.font = `10px Arial, sans-serif`
  ctx.fillStyle = RARITY_COLORS[def.rarity] ?? '#FFFFFF'
  ctx.fillText(def.rarity, boxX + boxWidth / 2, boxY + 70)

  // 価格表示
  const priceY = boxY + boxHeight - 15

  if (purchased) {
    ctx.font = `bold ${SHOP_STYLE.priceFontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = SHOP_STYLE.priceDisabledColor
    ctx.fillText('購入済み', boxX + boxWidth / 2, priceY)
  } else if (onSale) {
    // セール時: 元価格（打ち消し線）+ セール価格（赤字）
    const originalPriceY = priceY - 8
    const salePriceY = priceY + 6

    // 元価格（打ち消し線付き）
    renderStrikethroughText(
      ctx,
      `${originalPrice}G`,
      boxX + boxWidth / 2,
      originalPriceY,
      SHOP_STYLE.originalPriceColor,
      SHOP_STYLE.priceFontSize - 4
    )

    // セール価格
    ctx.font = `bold ${SHOP_STYLE.priceFontSize - 2}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = affordable ? SHOP_STYLE.saleColor : SHOP_STYLE.priceDisabledColor
    ctx.fillText(`${price}G`, boxX + boxWidth / 2, salePriceY)
  } else if (!affordable) {
    // 購入不可時: 打ち消し線
    renderStrikethroughText(
      ctx,
      `${price}G`,
      boxX + boxWidth / 2,
      priceY,
      SHOP_STYLE.priceDisabledColor,
      SHOP_STYLE.priceFontSize
    )
  } else {
    // 通常価格
    ctx.font = `bold ${SHOP_STYLE.priceFontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
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

  // ブロック商品とレリック商品を分離
  const blockItems = shopState.items.filter(isBlockShopItem)
  const relicItems = shopState.items.filter(isRelicShopItem)

  // アイテムボックスのサイズ計算
  const cellSize = layout.cellSize * cellSizeRatio
  const boxWidth = 7 * cellSize + itemBoxPadding * 2 // ヘキソミノ(最大6x6)が収まるサイズ
  const boxHeight = 7 * cellSize + itemBoxPadding * 2 + 30 // 価格表示分の余裕

  // ブロック行の配置
  const blockTotalWidth = boxWidth * blockItems.length + itemBoxGap * (blockItems.length - 1)
  const blockStartX = centerX - blockTotalWidth / 2
  const blockBoxY = centerY + itemsOffsetY - boxHeight / 2

  const itemAreas: ShopItemArea[] = []

  // ブロック商品を描画
  blockItems.forEach((item, blockIndex) => {
    const boxX = blockStartX + blockIndex * (boxWidth + itemBoxGap)
    const originalIndex = shopState.items.indexOf(item)

    renderBlockShopItem(
      ctx,
      item,
      gold,
      boxX,
      blockBoxY,
      boxWidth,
      boxHeight,
      cellSize
    )

    itemAreas.push({
      itemIndex: originalIndex,
      x: boxX,
      y: blockBoxY,
      width: boxWidth,
      height: boxHeight,
    })
  })

  // レリック行の配置（ブロック行の下）
  if (relicItems.length > 0) {
    const { relicBoxWidth, relicBoxHeight, relicRowOffsetY } = SHOP_STYLE
    const relicTotalWidth = relicBoxWidth * relicItems.length + itemBoxGap * (relicItems.length - 1)
    const relicStartX = centerX - relicTotalWidth / 2
    const relicBoxY = blockBoxY + boxHeight + relicRowOffsetY

    relicItems.forEach((item, relicIndex) => {
      const boxX = relicStartX + relicIndex * (relicBoxWidth + itemBoxGap)
      const originalIndex = shopState.items.indexOf(item)

      renderRelicShopItem(
        ctx,
        item,
        gold,
        boxX,
        relicBoxY,
        relicBoxWidth,
        relicBoxHeight
      )

      itemAreas.push({
        itemIndex: originalIndex,
        x: boxX,
        y: relicBoxY,
        width: relicBoxWidth,
        height: relicBoxHeight,
      })
    })
  }

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

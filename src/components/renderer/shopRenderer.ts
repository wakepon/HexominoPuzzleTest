/**
 * ショップ画面の描画
 */

import type { CanvasLayout, Piece } from '../../lib/game/types'
import type { ShopState, BlockShopItem, RelicShopItem, AmuletShopItem } from '../../lib/game/Domain/Shop/ShopTypes'
import {
  SHOP_STYLE,
  COLORS,
  CELL_STYLE,
  PATTERN_COLORS,
  PATTERN_SYMBOL_STYLE,
  SEAL_COLORS,
  SEAL_SYMBOL_STYLE,
  RARITY_COLORS,
} from '../../lib/game/Data/Constants'
import type { RelicId } from '../../lib/game/Domain/Core/Id'
import { canAfford, getRerollCost } from '../../lib/game/Services/ShopService'
import { calculateRelicSellPrice } from '../../lib/game/Services/ShopPriceCalculator'
import { isBlockShopItem, isRelicShopItem, isAmuletShopItem } from '../../lib/game/Domain/Shop/ShopTypes'
import { MAX_AMULET_STOCK } from '../../lib/game/Domain/Effect/Amulet'
import { getPatternDefinition } from '../../lib/game/Domain/Effect/Pattern'
import { getSealDefinition } from '../../lib/game/Domain/Effect/Seal'
import { getRelicDefinition, RELIC_DEFINITIONS } from '../../lib/game/Domain/Effect/Relic'
import { BlockDataMapUtils } from '../../lib/game/Domain/Piece/BlockData'
import { drawBlessingOnBlock } from './cellRenderer'
import { ButtonArea } from './overlayRenderer'

/**
 * ショップアイテムの領域情報
 */
export interface ShopItemArea extends ButtonArea {
  itemIndex: number
}

/**
 * 所持レリック領域情報（売却モード時のクリック判定用）
 */
export interface OwnedRelicArea extends ButtonArea {
  relicIndex: number
}

/**
 * ショップ描画結果（クリック判定用）
 */
export interface ShopRenderResult {
  itemAreas: ShopItemArea[]
  leaveButtonArea: ButtonArea
  rerollButtonArea: ButtonArea
  sellButtonArea: ButtonArea | null
  ownedRelicAreas: OwnedRelicArea[]
  cancelSellButtonArea: ButtonArea | null
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
 * テキストを指定幅で折り返し、最大行数に制限する
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const lines: string[] = []
  let remaining = text

  while (remaining.length > 0 && lines.length < maxLines) {
    // 1行に収まるならそのまま追加
    if (ctx.measureText(remaining).width <= maxWidth) {
      lines.push(remaining)
      break
    }

    // 1文字ずつ切って収まる位置を探す
    let breakIdx = remaining.length
    for (let i = 1; i <= remaining.length; i++) {
      if (ctx.measureText(remaining.slice(0, i)).width > maxWidth) {
        breakIdx = i - 1
        break
      }
    }

    // 最低1文字は進める（1文字でもはみ出す場合への対応）
    if (breakIdx <= 0) breakIdx = 1

    // 最終行で残りが入りきらない場合は省略記号
    if (lines.length === maxLines - 1 && ctx.measureText(remaining).width > maxWidth) {
      let truncIdx = breakIdx
      while (truncIdx > 1 && ctx.measureText(remaining.slice(0, truncIdx) + '…').width > maxWidth) {
        truncIdx--
      }
      lines.push(remaining.slice(0, truncIdx) + '…')
      break
    }

    lines.push(remaining.slice(0, breakIdx))
    remaining = remaining.slice(breakIdx)
  }

  return lines
}


/**
 * 価格表示を描画（購入済み/セール/購入不可/通常の4パターン）
 */
function renderPriceDisplay(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  priceY: number,
  price: number,
  originalPrice: number,
  purchased: boolean,
  onSale: boolean,
  affordable: boolean,
  fontSize: number = SHOP_STYLE.priceFontSize,
  saleOffset: { original: number; sale: number } = { original: -10, sale: 8 }
): void {
  if (purchased) {
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = SHOP_STYLE.priceDisabledColor
    ctx.fillText('購入済み', centerX, priceY)
  } else if (onSale) {
    // セール時: 元価格（打ち消し線）+ セール価格（赤字）
    const originalPriceY = priceY + saleOffset.original
    const salePriceY = priceY + saleOffset.sale

    // 元価格（打ち消し線付き）
    renderStrikethroughText(
      ctx,
      `${originalPrice}G`,
      centerX,
      originalPriceY,
      SHOP_STYLE.originalPriceColor,
      fontSize - 2
    )

    // セール価格
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = affordable ? SHOP_STYLE.saleColor : SHOP_STYLE.priceDisabledColor
    ctx.fillText(`${price}G`, centerX, salePriceY)
  } else if (!affordable) {
    // 購入不可時: グレー表示のみ（打ち消し線なし）
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = SHOP_STYLE.priceDisabledColor
    ctx.fillText(`${price}G`, centerX, priceY)
  } else {
    // 通常価格
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = SHOP_STYLE.priceColor
    ctx.fillText(`${price}G`, centerX, priceY)
  }
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

      // 加護アウトラインを描画
      const blessing = blockData?.blessing ?? null
      if (blessing) {
        drawBlessingOnBlock(ctx, x, y, size, blessing)
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

  // 価格表示
  const priceY = boxY + boxHeight - SHOP_STYLE.priceVerticalOffset
  renderPriceDisplay(
    ctx,
    boxX + boxWidth / 2,
    priceY,
    price,
    originalPrice,
    purchased,
    onSale,
    affordable
  )
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
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(def.icon, boxX + boxWidth / 2, boxY + 40)
  ctx.restore()

  // レリック名
  ctx.font = `bold 14px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#FFD700'
  ctx.fillText(def.name, boxX + boxWidth / 2, boxY + 75)

  // レアリティ表示
  ctx.font = `10px Arial, sans-serif`
  ctx.fillStyle = RARITY_COLORS[def.rarity] ?? '#FFFFFF'
  ctx.fillText(def.rarity, boxX + boxWidth / 2, boxY + 92)

  // 説明文（最大2行、ボックス幅に収まるよう折り返し）
  if (def.description) {
    ctx.font = `${SHOP_STYLE.relicDescFontSize}px Arial, sans-serif`
    ctx.fillStyle = '#CCCCCC'
    const maxLineWidth = boxWidth - 16
    const descLines = wrapText(ctx, def.description, maxLineWidth, 2)
    descLines.forEach((line, lineIdx) => {
      ctx.fillText(line, boxX + boxWidth / 2, boxY + 110 + lineIdx * 15)
    })
  }

  // 価格表示
  const priceY = boxY + boxHeight - 18
  renderPriceDisplay(
    ctx,
    boxX + boxWidth / 2,
    priceY,
    price,
    originalPrice,
    purchased,
    onSale,
    affordable,
    SHOP_STYLE.priceFontSize,
    { original: -8, sale: 6 }
  )
}

/**
 * 護符商品ボックスを描画
 */
function renderAmuletShopItem(
  ctx: CanvasRenderingContext2D,
  item: AmuletShopItem,
  gold: number,
  amuletStockCount: number,
  boxX: number,
  boxY: number,
  boxWidth: number,
  boxHeight: number
): void {
  const { price, originalPrice, purchased, onSale } = item
  const affordable = canAfford(gold, price)
  const stockFull = amuletStockCount >= MAX_AMULET_STOCK

  // ボックス背景
  ctx.fillStyle = purchased
    ? SHOP_STYLE.itemPurchasedColor
    : SHOP_STYLE.itemBackgroundColor
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight)

  // ボックス枠線（紫系）
  ctx.strokeStyle = purchased ? SHOP_STYLE.itemBorderColor : '#9370DB'
  ctx.lineWidth = SHOP_STYLE.itemBorderWidth
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

  // セールバッジ
  if (onSale && !purchased) {
    renderSaleBadge(ctx, boxX, boxY)
  }

  // 紫バッジ「護符」
  if (!purchased) {
    ctx.save()
    ctx.fillStyle = '#7B2FBE'
    ctx.beginPath()
    ctx.roundRect(boxX + boxWidth - 45, boxY + 5, 40, 18, 3)
    ctx.fill()
    ctx.font = 'bold 11px Arial, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('護符', boxX + boxWidth - 25, boxY + 14)
    ctx.restore()
  }

  // アイコン
  ctx.save()
  if (!purchased && (!affordable || stockFull)) {
    ctx.globalAlpha = SHOP_STYLE.unavailableOpacity
  }
  ctx.font = `${SHOP_STYLE.relicIconSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(item.icon, boxX + boxWidth / 2, boxY + 40)
  ctx.restore()

  // 名前
  ctx.font = 'bold 14px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#DDA0DD'
  ctx.fillText(item.name, boxX + boxWidth / 2, boxY + 75)

  // 説明文（護符の説明）
  if (item.description) {
    ctx.font = `${SHOP_STYLE.relicDescFontSize}px Arial, sans-serif`
    ctx.fillStyle = '#CCCCCC'
    const maxLineWidth = boxWidth - 16
    const descLines = wrapText(ctx, item.description, maxLineWidth, 2)
    descLines.forEach((line, lineIdx) => {
      ctx.fillText(line, boxX + boxWidth / 2, boxY + 100 + lineIdx * 15)
    })
  }

  // ストック満杯表示
  if (stockFull && !purchased) {
    ctx.font = 'bold 10px Arial, sans-serif'
    ctx.fillStyle = '#FF6666'
    ctx.fillText('ストック満杯', boxX + boxWidth / 2, boxY + 92)
  }

  // 価格
  const priceY = boxY + boxHeight - 18
  renderPriceDisplay(
    ctx,
    boxX + boxWidth / 2,
    priceY,
    price,
    originalPrice,
    purchased,
    onSale,
    affordable && !stockFull,
    SHOP_STYLE.priceFontSize,
    { original: -8, sale: 6 }
  )
}

/**
 * セクション枠を描画（角丸の半透明背景 + 枠線）
 */
function renderSectionFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  borderColor: string,
  bgColor: string
): void {
  const { sectionBorderRadius, sectionBorderWidth } = SHOP_STYLE

  // 背景
  ctx.fillStyle = bgColor
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, sectionBorderRadius)
  ctx.fill()

  // 枠線
  ctx.strokeStyle = borderColor
  ctx.lineWidth = sectionBorderWidth
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, sectionBorderRadius)
  ctx.stroke()
}

/**
 * ショップ画面を描画
 */
/**
 * 売却モードの描画
 */
function renderSellMode(
  ctx: CanvasRenderingContext2D,
  ownedRelics: readonly RelicId[],
  _gold: number,
  layout: CanvasLayout,
  pendingPurchaseIndex: number | null,
  shopState: ShopState
): { ownedRelicAreas: OwnedRelicArea[]; cancelButtonArea: ButtonArea } {
  const {
    sellModeRelicBoxWidth,
    sellModeRelicBoxHeight,
    sellModeRelicBoxGap,
    sellModeIconSize,
    sellModeNameFontSize,
    sellModePriceFontSize,
    sellModePriceColor,
    sellModeInfoFontSize,
    sellModeInfoColor,
    cancelButtonWidth,
    cancelButtonHeight,
    cancelButtonColor,
    cancelButtonTextColor,
    cancelButtonFontSize,
    itemBorderColor,
    itemBorderWidth,
    itemBackgroundColor,
  } = SHOP_STYLE

  const centerX = layout.canvasWidth / 2
  const centerY = layout.canvasHeight / 2

  // 案内テキスト
  ctx.font = `bold ${sellModeInfoFontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = sellModeInfoColor

  if (pendingPurchaseIndex !== null) {
    const pendingItem = shopState.items[pendingPurchaseIndex]
    if (pendingItem && isRelicShopItem(pendingItem)) {
      const pendingDef = getRelicDefinition(pendingItem.relicId)
      const pendingName = pendingDef?.name ?? ''
      ctx.fillText(`${pendingName} を購入するために、売却するレリックを選んでください`, centerX, centerY - 200)
    }
  } else {
    ctx.fillText('売却するレリックを選んでください', centerX, centerY - 200)
  }

  // 所持レリック一覧を描画
  const totalWidth = sellModeRelicBoxWidth * ownedRelics.length + sellModeRelicBoxGap * (ownedRelics.length - 1)
  const startX = centerX - totalWidth / 2
  const boxY = centerY - sellModeRelicBoxHeight / 2 - 30

  const ownedRelicAreas: OwnedRelicArea[] = []

  ownedRelics.forEach((relicId, index) => {
    const def = getRelicDefinition(relicId)
    if (!def) return

    const relicType = relicId as string
    const relicDef = RELIC_DEFINITIONS[relicType as keyof typeof RELIC_DEFINITIONS]
    const sellPrice = relicDef ? calculateRelicSellPrice(relicDef.price) : 0

    const boxX = startX + index * (sellModeRelicBoxWidth + sellModeRelicBoxGap)

    // ボックス背景
    ctx.fillStyle = itemBackgroundColor
    ctx.fillRect(boxX, boxY, sellModeRelicBoxWidth, sellModeRelicBoxHeight)

    // ボックス枠線
    ctx.strokeStyle = itemBorderColor
    ctx.lineWidth = itemBorderWidth
    ctx.strokeRect(boxX, boxY, sellModeRelicBoxWidth, sellModeRelicBoxHeight)

    // アイコン
    ctx.font = `${sellModeIconSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(def.icon, boxX + sellModeRelicBoxWidth / 2, boxY + 35)

    // 名前
    ctx.font = `bold ${sellModeNameFontSize}px Arial, sans-serif`
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(def.name, boxX + sellModeRelicBoxWidth / 2, boxY + 70)

    // 売却額
    ctx.font = `bold ${sellModePriceFontSize}px Arial, sans-serif`
    ctx.fillStyle = sellModePriceColor
    ctx.fillText(`売却: ${sellPrice}G`, boxX + sellModeRelicBoxWidth / 2, boxY + 95)

    ownedRelicAreas.push({
      relicIndex: index,
      x: boxX,
      y: boxY,
      width: sellModeRelicBoxWidth,
      height: sellModeRelicBoxHeight,
    })
  })

  // キャンセルボタン
  const cancelButtonX = centerX - cancelButtonWidth / 2
  const cancelButtonY = boxY + sellModeRelicBoxHeight + 40

  ctx.fillStyle = cancelButtonColor
  ctx.beginPath()
  ctx.roundRect(cancelButtonX, cancelButtonY, cancelButtonWidth, cancelButtonHeight, 8)
  ctx.fill()

  ctx.font = `bold ${cancelButtonFontSize}px Arial, sans-serif`
  ctx.fillStyle = cancelButtonTextColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('キャンセル', cancelButtonX + cancelButtonWidth / 2, cancelButtonY + cancelButtonHeight / 2)

  return {
    ownedRelicAreas,
    cancelButtonArea: {
      x: cancelButtonX,
      y: cancelButtonY,
      width: cancelButtonWidth,
      height: cancelButtonHeight,
    },
  }
}

/**
 * 所持レリック一覧をショップ上部に描画
 */
function renderOwnedRelicIcons(
  ctx: CanvasRenderingContext2D,
  ownedRelics: readonly RelicId[],
  layout: CanvasLayout
): void {
  if (ownedRelics.length === 0) return

  const {
    ownedRelicIconSize,
    ownedRelicGap,
    ownedRelicOffsetY,
    ownedRelicCountFontSize,
    ownedRelicCountColor,
  } = SHOP_STYLE

  const centerX = layout.canvasWidth / 2
  const centerY = layout.canvasHeight / 2
  const y = centerY + ownedRelicOffsetY

  // 「所持レリック (n/5)」ラベル
  ctx.font = `bold ${ownedRelicCountFontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = ownedRelicCountColor
  ctx.fillText(`所持レリック (${ownedRelics.length}/5)`, centerX, y)

  // アイコン一覧
  const totalWidth = ownedRelics.length * ownedRelicIconSize + (ownedRelics.length - 1) * ownedRelicGap
  const startX = centerX - totalWidth / 2

  ownedRelics.forEach((relicId, index) => {
    const def = getRelicDefinition(relicId)
    if (!def) return

    const iconX = startX + index * (ownedRelicIconSize + ownedRelicGap) + ownedRelicIconSize / 2
    const iconY = y + 42

    ctx.font = `${ownedRelicIconSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(def.icon, iconX, iconY)
  })
}

/**
 * ショップ画面を描画
 */
export function renderShop(
  ctx: CanvasRenderingContext2D,
  shopState: ShopState,
  gold: number,
  layout: CanvasLayout,
  rerollCount: number,
  ownedRelics: readonly RelicId[] = [],
  amuletStockCount: number = 0
): ShopRenderResult {
  const {
    backgroundColor,
    titleFontSize,
    titleColor,
    itemBoxGap,
    leaveButtonWidth,
    leaveButtonHeight,
    leaveButtonColor,
    leaveButtonTextColor,
    leaveButtonFontSize,
    leaveButtonGap,
    titleOffsetY,
    itemsOffsetY,
    goldDisplayOffsetY,
    shopLabelOffsetX,
  } = SHOP_STYLE

  ctx.save()

  // 背景オーバーレイ
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight)

  const centerX = layout.canvasWidth / 2
  const centerY = layout.canvasHeight / 2

  // ラベル用のX座標（左に寄せる）
  const labelX = centerX + shopLabelOffsetX

  // タイトル（ショップ）- 上
  ctx.fillStyle = titleColor
  ctx.font = `bold ${titleFontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('ショップ', labelX, centerY + titleOffsetY)

  // ゴールド表示 - 下
  ctx.font = `bold ${titleFontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#FFD700'
  ctx.fillText(`所持金: ${gold}G`, labelX, centerY + goldDisplayOffsetY)

  // 売却モード/入れ替えモードの場合は専用UIを描画
  if (shopState.sellMode) {
    const sellResult = renderSellMode(ctx, ownedRelics, gold, layout, shopState.pendingPurchaseIndex, shopState)
    ctx.restore()
    return {
      itemAreas: [],
      rerollButtonArea: { x: -1, y: -1, width: 0, height: 0 },
      leaveButtonArea: { x: -1, y: -1, width: 0, height: 0 },
      sellButtonArea: null,
      ownedRelicAreas: sellResult.ownedRelicAreas,
      cancelSellButtonArea: sellResult.cancelButtonArea,
    }
  }

  // 所持レリック一覧を描画（通常モード）
  renderOwnedRelicIcons(ctx, ownedRelics, layout)

  // ブロック商品とレリック/護符商品を分離
  const blockItems = shopState.items.filter(isBlockShopItem)
  const relicItems = shopState.items.filter(isRelicShopItem)
  const amuletItems = shopState.items.filter(isAmuletShopItem)
  const topRowItems = [...relicItems, ...amuletItems]

  const itemAreas: ShopItemArea[] = []

  // レリック/護符行の配置（上段 - メイン）
  const { relicBoxWidth, relicBoxHeight: relicBoxH, relicRowOffsetY } = SHOP_STYLE
  const relicRowY = centerY + itemsOffsetY - relicBoxH / 2

  if (topRowItems.length > 0) {
    const topTotalWidth = relicBoxWidth * topRowItems.length + itemBoxGap * (topRowItems.length - 1)
    const topStartX = centerX - topTotalWidth / 2

    // レリック/護符セクション枠
    const { sectionPadding } = SHOP_STYLE
    renderSectionFrame(
      ctx,
      topStartX - sectionPadding,
      relicRowY - sectionPadding,
      topTotalWidth + sectionPadding * 2,
      relicBoxH + sectionPadding * 2,
      SHOP_STYLE.relicSectionBorderColor,
      SHOP_STYLE.relicSectionBgColor
    )

    topRowItems.forEach((item, idx) => {
      const boxX = topStartX + idx * (relicBoxWidth + itemBoxGap)
      const originalIndex = shopState.items.indexOf(item)

      if (isRelicShopItem(item)) {
        renderRelicShopItem(
          ctx,
          item,
          gold,
          boxX,
          relicRowY,
          relicBoxWidth,
          relicBoxH
        )
      } else if (isAmuletShopItem(item)) {
        renderAmuletShopItem(
          ctx,
          item,
          gold,
          amuletStockCount,
          boxX,
          relicRowY,
          relicBoxWidth,
          relicBoxH
        )
      }

      itemAreas.push({
        itemIndex: originalIndex,
        x: boxX,
        y: relicRowY,
        width: relicBoxWidth,
        height: relicBoxH,
      })
    })
  }

  // ブロック行の配置（下段 - レリックと同じボックスサイズ）
  const boxWidth = relicBoxWidth
  const boxHeight = relicBoxH
  // ボックス内にピース形状が収まるようcellSizeを算出（最大6セル幅/高さ）
  // 形状は中央配置されるため、マージンは最小限でよい
  const maxCellW = boxWidth / 7
  const maxCellH = (boxHeight - 40) / 6 // ラベル+価格分の余白
  const cellSize = Math.min(maxCellW, maxCellH)

  // ブロック行は常にレリック行の下に配置（レリック行がなくても位置を維持）
  const blockRowY = relicRowY + relicBoxH + relicRowOffsetY

  const blockTotalWidth = boxWidth * blockItems.length + itemBoxGap * (blockItems.length - 1)
  const blockStartX = centerX - blockTotalWidth / 2

  // ブロックセクション枠
  if (blockItems.length > 0) {
    const { sectionPadding } = SHOP_STYLE
    renderSectionFrame(
      ctx,
      blockStartX - sectionPadding,
      blockRowY - sectionPadding,
      blockTotalWidth + sectionPadding * 2,
      boxHeight + sectionPadding * 2,
      SHOP_STYLE.pieceSectionBorderColor,
      SHOP_STYLE.pieceSectionBgColor
    )
  }

  blockItems.forEach((item, blockIndex) => {
    const boxX = blockStartX + blockIndex * (boxWidth + itemBoxGap)
    const originalIndex = shopState.items.indexOf(item)

    renderBlockShopItem(
      ctx,
      item,
      gold,
      boxX,
      blockRowY,
      boxWidth,
      boxHeight,
      cellSize
    )

    itemAreas.push({
      itemIndex: originalIndex,
      x: boxX,
      y: blockRowY,
      width: boxWidth,
      height: boxHeight,
    })
  })

  // ボタンエリア - 商品の下に動的に配置（リロール + 店を出る を横並び）
  const {
    rerollButtonWidth,
    rerollButtonHeight,
    rerollButtonColor,
    rerollButtonDisabledColor,
    rerollButtonTextColor,
    rerollButtonFontSize,
    rerollButtonGap,
  } = SHOP_STYLE

  // ブロック行の下端を基準にする
  const contentBottomY = blockRowY + boxHeight
  const buttonY = contentBottomY + leaveButtonGap

  // 売却ボタンの表示判定（レリックを所持している場合のみ）
  const showSellButton = ownedRelics.length > 0
  const {
    sellButtonWidth,
    sellButtonHeight,
    sellButtonColor,
    sellButtonTextColor,
    sellButtonFontSize,
  } = SHOP_STYLE

  // ボタンの合計幅を計算して中央寄せ
  const totalButtonWidth = rerollButtonWidth + rerollButtonGap + leaveButtonWidth
    + (showSellButton ? rerollButtonGap + sellButtonWidth : 0)
  const buttonsStartX = centerX - totalButtonWidth / 2

  // リロールボタン
  const rerollCost = getRerollCost(rerollCount, ownedRelics)
  const canReroll = canAfford(gold, rerollCost)
  const rerollButtonX = buttonsStartX

  ctx.fillStyle = canReroll ? rerollButtonColor : rerollButtonDisabledColor
  ctx.beginPath()
  ctx.roundRect(rerollButtonX, buttonY, rerollButtonWidth, rerollButtonHeight, 8)
  ctx.fill()

  ctx.font = `bold ${rerollButtonFontSize}px Arial, sans-serif`
  ctx.fillStyle = rerollButtonTextColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(
    `ショップリロール ${rerollCost}G`,
    rerollButtonX + rerollButtonWidth / 2,
    buttonY + rerollButtonHeight / 2
  )

  // 「店を出る」ボタン
  const leaveButtonX = buttonsStartX + rerollButtonWidth + rerollButtonGap

  ctx.fillStyle = leaveButtonColor
  ctx.beginPath()
  ctx.roundRect(leaveButtonX, buttonY, leaveButtonWidth, leaveButtonHeight, 8)
  ctx.fill()

  ctx.font = `bold ${leaveButtonFontSize}px Arial, sans-serif`
  ctx.fillStyle = leaveButtonTextColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('店を出る', leaveButtonX + leaveButtonWidth / 2, buttonY + leaveButtonHeight / 2)

  // 売却ボタン
  let sellButtonArea: ButtonArea | null = null
  if (showSellButton) {
    const sellButtonX = leaveButtonX + leaveButtonWidth + rerollButtonGap

    ctx.fillStyle = sellButtonColor
    ctx.beginPath()
    ctx.roundRect(sellButtonX, buttonY, sellButtonWidth, sellButtonHeight, 8)
    ctx.fill()

    ctx.font = `bold ${sellButtonFontSize}px Arial, sans-serif`
    ctx.fillStyle = sellButtonTextColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('レリック売却', sellButtonX + sellButtonWidth / 2, buttonY + sellButtonHeight / 2)

    sellButtonArea = {
      x: sellButtonX,
      y: buttonY,
      width: sellButtonWidth,
      height: sellButtonHeight,
    }
  }

  ctx.restore()

  return {
    itemAreas,
    rerollButtonArea: {
      x: rerollButtonX,
      y: buttonY,
      width: rerollButtonWidth,
      height: rerollButtonHeight,
    },
    leaveButtonArea: {
      x: leaveButtonX,
      y: buttonY,
      width: leaveButtonWidth,
      height: leaveButtonHeight,
    },
    sellButtonArea,
    ownedRelicAreas: [],
    cancelSellButtonArea: null,
  }
}

/**
 * ストック枠の描画
 * hand_stockレリック所持時にのみ表示される
 * コピーレリックでhand_stockをコピー中は2枠表示
 */

import type { Piece, CanvasLayout, DragState } from '../../lib/game/types'
import { STOCK_SLOT_STYLE, HD_LAYOUT } from '../../lib/game/Data/Constants'
import { renderPiece } from './pieceRenderer'

/**
 * ストック枠の描画結果
 */
export interface StockSlotRenderResult {
  readonly bounds: { x: number; y: number; width: number; height: number }
}

/**
 * ストック枠2の描画結果
 */
export interface StockSlot2RenderResult {
  readonly bounds: { x: number; y: number; width: number; height: number }
}

/**
 * ストック枠を描画
 * @returns ストック枠の境界情報（クリック判定用）。レリック未所持の場合はnull
 */
export function renderStockSlot(
  ctx: CanvasRenderingContext2D,
  stockPiece: Piece | null,
  layout: CanvasLayout,
  dragState: DragState
): StockSlotRenderResult | null {
  const stockPos = layout.stockSlotPosition
  if (!stockPos) return null  // レリック未所持

  const { width, height, borderWidth, borderColor, backgroundColor, labelFontSize, labelColor } = STOCK_SLOT_STYLE
  const x = stockPos.x
  const y = stockPos.y

  ctx.save()

  // ラベル描画
  ctx.font = `${labelFontSize}px Arial, sans-serif`
  ctx.fillStyle = labelColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText('ストック', x + width / 2, y - 5)

  // 背景描画
  ctx.fillStyle = backgroundColor
  ctx.fillRect(x, y, width, height)

  // 枠線描画
  ctx.strokeStyle = borderColor
  ctx.lineWidth = borderWidth
  ctx.strokeRect(x, y, width, height)

  // ストックにピースがあり、ドラッグ中でなければ描画
  if (stockPiece && !(dragState.isDragging && dragState.dragSource === 'stock')) {
    const cellSize = layout.cellSize * HD_LAYOUT.slotCellSizeRatio
    const pieceWidth = stockPiece.shape[0].length * cellSize
    const pieceHeight = stockPiece.shape.length * cellSize
    const pieceX = x + (width - pieceWidth) / 2
    const pieceY = y + (height - pieceHeight) / 2

    renderPiece(ctx, stockPiece, pieceX, pieceY, cellSize, 1.0)
  }

  ctx.restore()

  return {
    bounds: { x, y, width, height }
  }
}

/**
 * ストック枠2を描画（コピーレリックでhand_stockをコピー中のみ）
 * ストック1の下に配置
 */
export function renderStockSlot2(
  ctx: CanvasRenderingContext2D,
  stockPiece2: Piece | null,
  layout: CanvasLayout,
  dragState: DragState
): StockSlot2RenderResult | null {
  const stockPos = layout.stockSlotPosition
  if (!stockPos) return null

  const { width, height, borderWidth, backgroundColor, labelFontSize, labelColor } = STOCK_SLOT_STYLE
  const x = stockPos.x
  const y = stockPos.y + height + 10 // ストック1の下

  ctx.save()

  // ラベル描画
  ctx.font = `${labelFontSize}px Arial, sans-serif`
  ctx.fillStyle = labelColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText('ストック2', x + width / 2, y - 5)

  // 背景描画
  ctx.fillStyle = backgroundColor
  ctx.fillRect(x, y, width, height)

  // 枠線描画（紫系のボーダーで区別）
  ctx.strokeStyle = '#9370DB'
  ctx.lineWidth = borderWidth
  ctx.strokeRect(x, y, width, height)

  // ストック2にピースがあり、ドラッグ中でなければ描画
  if (stockPiece2 && !(dragState.isDragging && dragState.dragSource === 'stock2')) {
    const cellSize = layout.cellSize * HD_LAYOUT.slotCellSizeRatio
    const pieceWidth = stockPiece2.shape[0].length * cellSize
    const pieceHeight = stockPiece2.shape.length * cellSize
    const pieceX = x + (width - pieceWidth) / 2
    const pieceY = y + (height - pieceHeight) / 2

    renderPiece(ctx, stockPiece2, pieceX, pieceY, cellSize, 1.0)
  }

  ctx.restore()

  return {
    bounds: { x, y, width, height }
  }
}

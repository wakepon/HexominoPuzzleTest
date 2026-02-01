import { PieceSlot, DragState, CanvasLayout, PieceShape } from '../../lib/game/types'
import { ANIMATION, LAYOUT } from '../../lib/game/constants'
import { drawWoodenCellWithBorder } from './cellRenderer'

/**
 * スロットエリアのブロックを描画
 */
export function renderPieceSlots(
  ctx: CanvasRenderingContext2D,
  pieceSlots: PieceSlot[],
  layout: CanvasLayout,
  dragState: DragState
): void {
  pieceSlots.forEach((slot, index) => {
    if (!slot.piece) return  // 配置済みでスロットが空
    if (dragState.isDragging && dragState.slotIndex === index) return  // ドラッグ中のブロックは別で描画

    const slotPos = layout.slotPositions[index]
    renderPieceShape(
      ctx,
      slot.piece.shape,
      slotPos.x,
      slotPos.y,
      layout.cellSize * LAYOUT.slotCellSizeRatio,
      1.0
    )
  })
}

/**
 * ドラッグ中のブロックを描画
 */
export function renderDraggingPiece(
  ctx: CanvasRenderingContext2D,
  pieceSlots: PieceSlot[],
  dragState: DragState,
  layout: CanvasLayout
): void {
  if (!dragState.isDragging || dragState.slotIndex === null || !dragState.currentPos) {
    return
  }

  const slot = pieceSlots[dragState.slotIndex]
  if (!slot?.piece) return

  const shape = slot.piece.shape

  // ブロックの中心をドラッグ位置に合わせる
  const pieceWidth = shape[0].length * layout.cellSize
  const pieceHeight = shape.length * layout.cellSize
  const drawX = dragState.currentPos.x - pieceWidth / 2
  const drawY = dragState.currentPos.y - pieceHeight / 2

  renderPieceShape(
    ctx,
    shape,
    drawX,
    drawY,
    layout.cellSize,
    ANIMATION.dragOpacity
  )
}

/**
 * ブロック形状を描画
 */
export function renderPieceShape(
  ctx: CanvasRenderingContext2D,
  shape: PieceShape,
  startX: number,
  startY: number,
  cellSize: number,
  opacity: number
): void {
  const originalAlpha = ctx.globalAlpha

  try {
    ctx.globalAlpha = opacity

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue

        const cellX = startX + x * cellSize
        const cellY = startY + y * cellSize

        drawWoodenCellWithBorder(ctx, cellX, cellY, cellSize)
      }
    }
  } finally {
    ctx.globalAlpha = originalAlpha
  }
}

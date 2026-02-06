import type { PieceSlot, DragState, CanvasLayout, PieceShape, Piece } from '../../lib/game/types'
import { ANIMATION, LAYOUT } from '../../lib/game/constants'
import { drawWoodenCellWithBorder } from './cellRenderer'
import { BlockDataMapUtils } from '../../lib/game/Domain/Piece/BlockData'

/**
 * スロットエリアのブロックを描画
 */
export function renderPieceSlots(
  ctx: CanvasRenderingContext2D,
  pieceSlots: readonly PieceSlot[],
  layout: CanvasLayout,
  dragState: DragState
): void {
  pieceSlots.forEach((slot, index) => {
    if (!slot.piece) return // 配置済みでスロットが空
    if (dragState.isDragging && dragState.slotIndex === index) return // ドラッグ中のブロックは別で描画

    const slotPos = layout.slotPositions[index]
    renderPiece(
      ctx,
      slot.piece,
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
  pieceSlots: readonly PieceSlot[],
  dragState: DragState,
  layout: CanvasLayout
): void {
  if (
    !dragState.isDragging ||
    dragState.slotIndex === null ||
    !dragState.currentPos
  ) {
    return
  }

  const slot = pieceSlots[dragState.slotIndex]
  if (!slot?.piece) return

  const piece = slot.piece
  const shape = piece.shape

  // ブロックの中心をドラッグ位置に合わせる
  const pieceWidth = shape[0].length * layout.cellSize
  const pieceHeight = shape.length * layout.cellSize
  const drawX = dragState.currentPos.x - pieceWidth / 2
  const drawY = dragState.currentPos.y - pieceHeight / 2

  renderPiece(ctx, piece, drawX, drawY, layout.cellSize, ANIMATION.dragOpacity)
}

/**
 * Pieceを描画（パターン対応版）
 */
export function renderPiece(
  ctx: CanvasRenderingContext2D,
  piece: Piece,
  startX: number,
  startY: number,
  cellSize: number,
  opacity: number
): void {
  const originalAlpha = ctx.globalAlpha
  const { shape, blocks } = piece

  try {
    ctx.globalAlpha = opacity

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue

        const cellX = startX + x * cellSize
        const cellY = startY + y * cellSize

        // BlockDataからパターンを取得
        const blockData = BlockDataMapUtils.get(blocks, y, x)
        const pattern = blockData?.pattern ?? null

        drawWoodenCellWithBorder(ctx, cellX, cellY, cellSize, pattern)
      }
    }
  } finally {
    ctx.globalAlpha = originalAlpha
  }
}

/**
 * ブロック形状を描画（後方互換用、パターンなし）
 * @deprecated renderPiece を使用してください
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

        drawWoodenCellWithBorder(ctx, cellX, cellY, cellSize, null)
      }
    }
  } finally {
    ctx.globalAlpha = originalAlpha
  }
}

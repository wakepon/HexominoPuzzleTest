import { Board, DragState, PieceSlot, CanvasLayout } from '../../lib/game/types'
import { COLORS } from '../../lib/game/constants'
import { canPlacePiece } from '../../lib/game/collisionDetection'

/**
 * 配置プレビューを描画
 */
export function renderPlacementPreview(
  ctx: CanvasRenderingContext2D,
  board: Board,
  pieceSlots: readonly PieceSlot[],
  dragState: DragState,
  layout: CanvasLayout
): void {
  if (!dragState.isDragging || dragState.slotIndex === null || !dragState.boardPos) {
    return
  }

  const slot = pieceSlots[dragState.slotIndex]
  if (!slot?.piece) return

  const shape = slot.piece.shape
  const boardPos = dragState.boardPos
  const { boardOffsetX, boardOffsetY, cellSize } = layout

  // 配置可能かチェック
  const isValid = canPlacePiece(board, shape, boardPos)
  const previewColor = isValid ? COLORS.previewValid : COLORS.previewInvalid

  // プレビュー描画
  ctx.fillStyle = previewColor

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue

      const cellX = boardOffsetX + (boardPos.x + x) * cellSize
      const cellY = boardOffsetY + (boardPos.y + y) * cellSize

      // ボード範囲内のみ描画
      ctx.fillRect(cellX, cellY, cellSize, cellSize)
    }
  }
}

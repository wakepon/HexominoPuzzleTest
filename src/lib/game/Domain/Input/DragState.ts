import type { PieceId } from '../Core/Id'
import type { Position } from '../Core/Position'

/**
 * ドラッグ状態
 */
export interface DragState {
  readonly isDragging: boolean
  readonly pieceId: PieceId | null
  readonly slotIndex: number | null
  readonly currentPos: Position | null    // 現在のドラッグ位置（スクリーン座標）
  readonly startPos: Position | null      // ドラッグ開始位置
  readonly boardPos: Position | null      // ボード上の位置（グリッド座標）
}

/**
 * 初期ドラッグ状態
 */
export const createInitialDragState = (): DragState => ({
  isDragging: false,
  pieceId: null,
  slotIndex: null,
  currentPos: null,
  startPos: null,
  boardPos: null,
})

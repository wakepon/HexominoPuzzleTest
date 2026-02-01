import { Piece, PieceShape } from './types'

/**
 * ブロック形状の定義
 * true = ブロックがある位置
 */

// 1x1 ブロック
const SHAPE_SINGLE: PieceShape = [
  [true],
]

// 2x2 ブロック
const SHAPE_SQUARE: PieceShape = [
  [true, true],
  [true, true],
]

// 3x1 ブロック（横長）
const SHAPE_LINE_3: PieceShape = [
  [true, true, true],
]

/**
 * 初期ブロックセットを取得
 */
export function getInitialPieces(): Piece[] {
  return [
    { id: 'piece-1', shape: SHAPE_SINGLE },
    { id: 'piece-2', shape: SHAPE_SQUARE },
    { id: 'piece-3', shape: SHAPE_LINE_3 },
  ]
}

/**
 * ブロック形状のサイズを取得
 */
export function getPieceSize(shape: PieceShape): { width: number; height: number } {
  const height = shape.length
  const width = shape[0]?.length ?? 0
  return { width, height }
}

/**
 * ブロック形状内の有効なセル数を取得
 */
export function getPieceCellCount(shape: PieceShape): number {
  let count = 0
  for (const row of shape) {
    for (const cell of row) {
      if (cell) count++
    }
  }
  return count
}

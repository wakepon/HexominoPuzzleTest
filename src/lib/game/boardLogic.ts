import { Board, Cell, Position, PieceShape } from './types'
import { GRID_SIZE } from './constants'

/**
 * 空のボードを作成
 */
export function createEmptyBoard(): Board {
  const board: Board = []
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: Cell[] = []
    for (let x = 0; x < GRID_SIZE; x++) {
      row.push({ filled: false })
    }
    board.push(row)
  }
  return board
}

/**
 * ブロックをボードに配置する（新しいボードを返す）
 * @precondition canPlacePiece(board, shape, position) === true
 *               この関数を呼ぶ前に必ずcanPlacePieceで配置可能かを確認すること
 * @param board 現在のボード
 * @param shape ブロック形状
 * @param position 配置位置（左上基準）
 * @returns 新しいボード
 */
export function placePieceOnBoard(
  board: Board,
  shape: PieceShape,
  position: Position
): Board {
  // 新しいボードを作成（immutable）
  const newBoard: Board = board.map(row =>
    row.map(cell => ({ ...cell }))
  )

  // ブロックを配置
  for (let shapeY = 0; shapeY < shape.length; shapeY++) {
    for (let shapeX = 0; shapeX < shape[shapeY].length; shapeX++) {
      if (shape[shapeY][shapeX]) {
        const boardX = position.x + shapeX
        const boardY = position.y + shapeY
        newBoard[boardY][boardX] = { filled: true }
      }
    }
  }

  return newBoard
}

/**
 * ボードの特定位置のセルを取得
 */
export function getCell(board: Board, position: Position): Cell | null {
  if (position.x < 0 || position.x >= GRID_SIZE ||
      position.y < 0 || position.y >= GRID_SIZE) {
    return null
  }
  return board[position.y][position.x]
}

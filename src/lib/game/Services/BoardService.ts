/**
 * ボード操作サービス
 */

import type { Board, Cell, Position, Piece, PieceShape } from '../Domain'
import { BlockDataMapUtils } from '../Domain/Piece/BlockData'
import { GRID_SIZE } from '../Data/Constants'

/**
 * 空のボードを作成
 */
export function createEmptyBoard(): Board {
  const board: Cell[][] = []
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: Cell[] = []
    for (let x = 0; x < GRID_SIZE; x++) {
      row.push({ filled: false, blockSetId: null, pattern: null, seal: null })
    }
    board.push(row)
  }
  return board
}

/**
 * ピースをボードに配置する（新しいボードを返す）
 * BlockData（パターン・シール）をCellに反映
 *
 * @precondition canPlacePiece(board, piece.shape, position) === true
 * @param board 現在のボード
 * @param piece 配置するピース（blockSetId, blocks を持つ）
 * @param position 配置位置（左上基準）
 * @returns 新しいボード
 */
export function placePieceOnBoard(
  board: Board,
  piece: Piece,
  position: Position
): Board {
  const { shape, blockSetId, blocks } = piece

  // 新しいボードを作成（immutable）
  const newBoard: Cell[][] = board.map((row) => row.map((cell) => ({ ...cell })))

  // ブロックを配置（BlockDataを反映）
  for (let shapeY = 0; shapeY < shape.length; shapeY++) {
    for (let shapeX = 0; shapeX < shape[shapeY].length; shapeX++) {
      if (shape[shapeY][shapeX]) {
        const boardX = position.x + shapeX
        const boardY = position.y + shapeY

        // BlockDataを取得
        const blockData = BlockDataMapUtils.get(blocks, shapeY, shapeX)

        newBoard[boardY][boardX] = {
          filled: true,
          blockSetId: blockSetId,
          pattern: blockData?.pattern ?? null,
          seal: blockData?.seal ?? null,
        }
      }
    }
  }

  return newBoard
}

/**
 * 形状のみでボードに配置する（後方互換用、blockSetId/pattern/sealはnull）
 *
 * @deprecated Piece版のplacePieceOnBoardを使用してください
 */
export function placePieceShapeOnBoard(
  board: Board,
  shape: PieceShape,
  position: Position
): Board {
  const newBoard: Cell[][] = board.map((row) => row.map((cell) => ({ ...cell })))

  for (let shapeY = 0; shapeY < shape.length; shapeY++) {
    for (let shapeX = 0; shapeX < shape[shapeY].length; shapeX++) {
      if (shape[shapeY][shapeX]) {
        const boardX = position.x + shapeX
        const boardY = position.y + shapeY
        newBoard[boardY][boardX] = {
          filled: true,
          blockSetId: null,
          pattern: null,
          seal: null,
        }
      }
    }
  }

  return newBoard
}

/**
 * ボードの特定位置のセルを取得
 */
export function getCell(board: Board, position: Position): Cell | null {
  if (
    position.x < 0 ||
    position.x >= GRID_SIZE ||
    position.y < 0 ||
    position.y >= GRID_SIZE
  ) {
    return null
  }
  return board[position.y][position.x]
}

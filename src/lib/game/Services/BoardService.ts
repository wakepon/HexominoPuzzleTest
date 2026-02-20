/**
 * ボード操作サービス
 */

import type { Board, Cell, Position, Piece } from '../Domain'
import type { PatternId, BlockSetId } from '../Domain/Core/Id'
import type { RandomGenerator } from '../Utils/Random'
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
      row.push({ filled: false, blockSetId: null, pattern: null, seal: null, chargeValue: 0 })
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
          chargeValue: 0,
        }
      }
    }
  }

  return newBoard
}

/**
 * おじゃまブロックをランダムな位置に配置
 */
export function placeObstacleOnBoard(
  board: Board,
  rng: RandomGenerator
): Board {
  const row = Math.floor(rng.next() * GRID_SIZE)
  const col = Math.floor(rng.next() * GRID_SIZE)

  // 新しいボードを作成（immutable）
  const newBoard: Cell[][] = board.map((r) => r.map((cell) => ({ ...cell })))

  // おじゃまブロックを配置（pattern: 'obstacle'、消去不可）
  newBoard[row][col] = {
    filled: true,
    blockSetId: null,
    pattern: 'obstacle' as PatternId,
    seal: null,
    chargeValue: 0,
  }

  return newBoard
}

/**
 * ボード上の全chargeパターンブロックのchargeValueを加算する
 * 得点計算後に呼び出すことで「別のブロックが置かれるたび」の仕様を実現
 * デフォルトは+1、magnet所持時は+2
 */
export function incrementChargeValues(board: Board, excludeBlockSetId?: BlockSetId | null, increment: number = 1): Board {
  return board.map((row) =>
    row.map((cell) => {
      if (cell.filled && cell.pattern === ('charge' as PatternId) && cell.blockSetId !== excludeBlockSetId) {
        return { ...cell, chargeValue: cell.chargeValue + increment }
      }
      return cell
    })
  )
}

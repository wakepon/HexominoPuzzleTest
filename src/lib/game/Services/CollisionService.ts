/**
 * 衝突検出サービス
 */

import type { Board, Position, PieceShape } from '../Domain'
import { GRID_SIZE } from '../Data/Constants'

/**
 * ブロックが指定位置に配置可能かチェック
 * @param board 現在のボード
 * @param shape ブロック形状
 * @param position 配置位置（左上基準）
 * @returns 配置可能ならtrue
 */
export function canPlacePiece(
  board: Board,
  shape: PieceShape,
  position: Position
): boolean {
  // 各セルをチェック
  for (let shapeY = 0; shapeY < shape.length; shapeY++) {
    for (let shapeX = 0; shapeX < shape[shapeY].length; shapeX++) {
      if (!shape[shapeY][shapeX]) continue  // 空のセルはスキップ

      const boardX = position.x + shapeX
      const boardY = position.y + shapeY

      // 範囲外チェック
      if (boardX < 0 || boardX >= GRID_SIZE ||
          boardY < 0 || boardY >= GRID_SIZE) {
        return false
      }

      // 既に埋まっているセルとの重複チェック
      if (board[boardY][boardX].filled) {
        return false
      }
    }
  }

  return true
}

/**
 * スクリーン座標からボード座標に変換
 * @param screenPos スクリーン座標
 * @param boardOffsetX ボードのX方向オフセット
 * @param boardOffsetY ボードのY方向オフセット
 * @param cellSize セルサイズ
 * @returns ボード座標（範囲外の場合もそのまま返す）
 */
export function screenToBoardPosition(
  screenPos: Position,
  boardOffsetX: number,
  boardOffsetY: number,
  cellSize: number
): Position {
  return {
    x: Math.floor((screenPos.x - boardOffsetX) / cellSize),
    y: Math.floor((screenPos.y - boardOffsetY) / cellSize),
  }
}

/**
 * ピースがボード上のいずれかの位置に配置可能かチェック
 */
export function canPieceBePlacedAnywhere(board: Board, shape: PieceShape): boolean {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (canPlacePiece(board, shape, { x, y })) return true
    }
  }
  return false
}

/**
 * ボード座標がボード範囲内かチェック
 */
export function isPositionInBoard(position: Position): boolean {
  return (
    position.x >= 0 &&
    position.x < GRID_SIZE &&
    position.y >= 0 &&
    position.y < GRID_SIZE
  )
}

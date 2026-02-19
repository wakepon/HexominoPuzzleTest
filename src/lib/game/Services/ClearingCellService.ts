/**
 * 消去セルの順次処理ユーティリティ
 * セルを左上→右下にソートし、スタガードディレイを割り当てる
 */

import type { ClearingCell } from '../Domain/Animation/AnimationState'
import type { Board } from '../Domain/Board/Board'
import { CLEAR_ANIMATION } from '../Data/Constants'

/**
 * セルを左上→右下にソートし、ディレイとボード情報を付与する
 * @returns ソート済みセル配列と全体の所要時間
 */
export function createSequentialClearingCells(
  cells: readonly ClearingCell[],
  board: Board
): { sortedCells: ClearingCell[]; totalDuration: number } {
  if (cells.length === 0) {
    return { sortedCells: [], totalDuration: 0 }
  }

  // (row, col) 昇順でソート
  const sorted = [...cells].sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row
    return a.col - b.col
  })

  const { perCellDuration, maxTotalDuration, minStaggerDelay, maxStaggerDelay } = CLEAR_ANIMATION
  const count = sorted.length

  // スタガードディレイを計算
  // セルが1つの場合はディレイ不要
  const staggerDelay = count <= 1
    ? 0
    : Math.min(
        maxStaggerDelay,
        Math.max(
          minStaggerDelay,
          (maxTotalDuration - perCellDuration) / (count - 1)
        )
      )

  // 各セルにディレイとボード情報を付与
  const sortedCells = sorted.map((cell, index) => {
    const boardCell = board[cell.row][cell.col]
    return {
      ...cell,
      delay: index * staggerDelay,
      pattern: boardCell.pattern,
      seal: boardCell.seal,
      chargeValue: boardCell.chargeValue,
    }
  })

  // 全体の所要時間 = 最後のセルのディレイ + 1セル分の時間
  const lastDelay = sortedCells.length > 0 ? (sortedCells[sortedCells.length - 1].delay ?? 0) : 0
  const totalDuration = lastDelay + perCellDuration

  return { sortedCells, totalDuration }
}

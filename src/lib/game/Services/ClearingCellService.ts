/**
 * 消去セルの順次処理ユーティリティ
 * セルをソートし、スタガードディレイを割り当てる
 */

import type { ClearingCell } from '../Domain/Animation/AnimationState'
import type { Board } from '../Domain/Board/Board'
import type { CompletedLines } from './LineService'
import { CLEAR_ANIMATION } from '../Data/Constants'

/**
 * 従来の (row, col) 昇順ソート
 */
function sortByRowCol(cells: readonly ClearingCell[]): ClearingCell[] {
  return [...cells].sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row
    return a.col - b.col
  })
}

/**
 * 列グループ（上→下）→ 行グループ（左→右）の順にソート
 * 交差セル（行と列の両方に属する）は列グループ優先
 */
function sortByColumnThenRow(
  cells: readonly ClearingCell[],
  completedLines: CompletedLines
): ClearingCell[] {
  const colSet = new Set(completedLines.columns)

  const colGroup: ClearingCell[] = []
  const rowGroup: ClearingCell[] = []

  for (const cell of cells) {
    if (colSet.has(cell.col)) {
      // 列に属するセル（交差セルも列グループ優先）
      colGroup.push(cell)
    } else {
      rowGroup.push(cell)
    }
  }

  // 列グループ: col昇順 → 同一列内はrow昇順（左の列→右の列、上→下）
  colGroup.sort((a, b) => {
    if (a.col !== b.col) return a.col - b.col
    return a.row - b.row
  })

  // 行グループ: row昇順 → 同一行内はcol昇順（上の行→下の行、左→右）
  rowGroup.sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row
    return a.col - b.col
  })

  return [...colGroup, ...rowGroup]
}

/**
 * セルをソートし、ディレイとボード情報を付与する
 * completedLines が指定された場合: 列グループ（上→下）→ 行グループ（左→右）の順
 * completedLines が省略された場合: 従来通り (row, col) 昇順
 * @returns ソート済みセル配列と全体の所要時間
 */
export function createSequentialClearingCells(
  cells: readonly ClearingCell[],
  board: Board,
  completedLines?: CompletedLines
): { sortedCells: ClearingCell[]; totalDuration: number } {
  if (cells.length === 0) {
    return { sortedCells: [], totalDuration: 0 }
  }

  const sorted = completedLines
    ? sortByColumnThenRow(cells, completedLines)
    : sortByRowCol(cells)

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
      blockBlessing: boardCell.blockBlessing,
    }
  })

  // 全体の所要時間 = 最後のセルのディレイ + 1セル分の時間
  const lastDelay = sortedCells.length > 0 ? (sortedCells[sortedCells.length - 1].delay ?? 0) : 0
  const totalDuration = lastDelay + perCellDuration

  return { sortedCells, totalDuration }
}

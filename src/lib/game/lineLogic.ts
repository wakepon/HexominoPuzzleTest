/**
 * ライン消去ロジック
 */

import { Board, CompletedLines, ClearingCell } from './types'
import { GRID_SIZE } from './constants'

/**
 * 完成した行と列を検出する
 */
export function findCompletedLines(board: Board): CompletedLines {
  const rows: number[] = []
  const columns: number[] = []

  // 行をチェック
  for (let y = 0; y < GRID_SIZE; y++) {
    const isRowComplete = board[y].every(cell => cell.filled)
    if (isRowComplete) {
      rows.push(y)
    }
  }

  // 列をチェック
  for (let x = 0; x < GRID_SIZE; x++) {
    const isColumnComplete = board.every(row => row[x].filled)
    if (isColumnComplete) {
      columns.push(x)
    }
  }

  return { rows, columns }
}

/**
 * 消去対象のセルを取得（重複なし）
 */
export function getCellsToRemove(completedLines: CompletedLines): ClearingCell[] {
  const cellSet = new Set<string>()
  const cells: ClearingCell[] = []

  // 行のセルを追加
  for (const y of completedLines.rows) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const key = `${x},${y}`
      if (!cellSet.has(key)) {
        cellSet.add(key)
        cells.push({ x, y })
      }
    }
  }

  // 列のセルを追加
  for (const x of completedLines.columns) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const key = `${x},${y}`
      if (!cellSet.has(key)) {
        cellSet.add(key)
        cells.push({ x, y })
      }
    }
  }

  return cells
}

/**
 * スコアを計算する
 * スコア = 消えたブロック数 x 消えたライン数
 */
export function calculateScore(completedLines: CompletedLines): number {
  const totalLines = completedLines.rows.length + completedLines.columns.length
  if (totalLines === 0) return 0

  const cells = getCellsToRemove(completedLines)
  const blockCount = cells.length

  return blockCount * totalLines
}

/**
 * 指定したセルをクリアする（immutable）
 */
export function clearLines(board: Board, cellsToClear: ClearingCell[]): Board {
  // 新しいボードを作成
  const newBoard: Board = board.map(row =>
    row.map(cell => ({ ...cell }))
  )

  // セルをクリア
  for (const { x, y } of cellsToClear) {
    newBoard[y][x] = { filled: false }
  }

  return newBoard
}

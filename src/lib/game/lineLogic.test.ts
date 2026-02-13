import { describe, it, expect } from 'vitest'
import {
  findCompletedLines,
  calculateScore,
  getCellsToRemove,
  clearLines
} from './lineLogic'
import { createEmptyBoard } from './Services/BoardService'
import { Board, CompletedLines, Cell } from './types'

// テスト用ヘルパー関数: 埋まったセルを作成
function createFilledCell(): Cell {
  return { filled: true, blockSetId: null, pattern: null, seal: null, chargeValue: 0 }
}

// テスト用ヘルパー関数: 指定した行を埋めたボードを作成（immutable）
function createBoardWithFilledRows(rowIndices: number[]): Board {
  return createEmptyBoard().map((row, y) =>
    rowIndices.includes(y)
      ? row.map(() => createFilledCell())
      : row
  )
}

// テスト用ヘルパー関数: 指定した列を埋めたボードを作成（immutable）
function createBoardWithFilledColumns(columnIndices: number[]): Board {
  return createEmptyBoard().map(row =>
    row.map((cell, x) =>
      columnIndices.includes(x) ? createFilledCell() : cell
    )
  )
}

// テスト用ヘルパー関数: 指定した行と列を埋めたボードを作成（immutable）
function createBoardWithFilledRowsAndColumns(rowIndices: number[], columnIndices: number[]): Board {
  return createEmptyBoard().map((row, y) =>
    row.map((cell, x) =>
      rowIndices.includes(y) || columnIndices.includes(x)
        ? createFilledCell()
        : cell
    )
  )
}

// テスト用ヘルパー関数: 指定した行を部分的に埋めたボードを作成（immutable）
function createBoardWithPartialRow(rowIndex: number, filledCount: number): Board {
  return createEmptyBoard().map((row, y) =>
    y === rowIndex
      ? row.map((cell, x) => (x < filledCount ? createFilledCell() : cell))
      : row
  )
}

describe('findCompletedLines', () => {
  it('空のボードでは完成ラインがない', () => {
    const board = createEmptyBoard()
    const result = findCompletedLines(board)

    expect(result.rows).toEqual([])
    expect(result.columns).toEqual([])
  })

  it('1行が完成している場合', () => {
    const board = createBoardWithFilledRows([0])

    const result = findCompletedLines(board)

    expect(result.rows).toEqual([0])
    expect(result.columns).toEqual([])
  })

  it('1列が完成している場合', () => {
    const board = createBoardWithFilledColumns([0])

    const result = findCompletedLines(board)

    expect(result.rows).toEqual([])
    expect(result.columns).toEqual([0])
  })

  it('複数の行と列が同時に完成している場合', () => {
    const board = createBoardWithFilledRowsAndColumns([0, 2], [3])

    const result = findCompletedLines(board)

    expect(result.rows).toEqual([0, 2])
    expect(result.columns).toEqual([3])
  })

  it('部分的に埋まった行は完成扱いにならない', () => {
    const board = createBoardWithPartialRow(0, 5)

    const result = findCompletedLines(board)

    expect(result.rows).toEqual([])
    expect(result.columns).toEqual([])
  })
})

describe('calculateScore', () => {
  it('ライン消去なしの場合は0点', () => {
    const completedLines: CompletedLines = { rows: [], columns: [] }
    const score = calculateScore(completedLines)

    expect(score).toBe(0)
  })

  it('1行消去: 6ブロック x 1ライン = 6点', () => {
    const completedLines: CompletedLines = { rows: [0], columns: [] }
    const score = calculateScore(completedLines)

    expect(score).toBe(6)
  })

  it('1列消去: 6ブロック x 1ライン = 6点', () => {
    const completedLines: CompletedLines = { rows: [], columns: [0] }
    const score = calculateScore(completedLines)

    expect(score).toBe(6)
  })

  it('2行消去: 12ブロック x 2ライン = 24点', () => {
    const completedLines: CompletedLines = { rows: [0, 1], columns: [] }
    const score = calculateScore(completedLines)

    expect(score).toBe(24)
  })

  it('1行1列消去（交差あり）: 11ブロック x 2ライン = 22点', () => {
    // 行6 + 列6 - 交差1 = 11ブロック
    const completedLines: CompletedLines = { rows: [0], columns: [0] }
    const score = calculateScore(completedLines)

    expect(score).toBe(22)
  })

  it('2行2列消去: (12 + 12 - 4) x 4 = 80点', () => {
    // 2行 x 6 = 12, 2列 x 6 = 12, 交差4つ
    // (12 + 12 - 4) x 4 = 80
    const completedLines: CompletedLines = { rows: [0, 1], columns: [0, 1] }
    const score = calculateScore(completedLines)

    expect(score).toBe(80)
  })
})

describe('getCellsToRemove', () => {
  it('1行消去時の対象セル', () => {
    const completedLines: CompletedLines = { rows: [0], columns: [] }
    const cells = getCellsToRemove(completedLines)

    expect(cells).toHaveLength(6)
    expect(cells).toContainEqual({ x: 0, y: 0, row: 0, col: 0 })
    expect(cells).toContainEqual({ x: 5, y: 0, row: 0, col: 5 })
  })

  it('1列消去時の対象セル', () => {
    const completedLines: CompletedLines = { rows: [], columns: [0] }
    const cells = getCellsToRemove(completedLines)

    expect(cells).toHaveLength(6)
    expect(cells).toContainEqual({ x: 0, y: 0, row: 0, col: 0 })
    expect(cells).toContainEqual({ x: 0, y: 5, row: 5, col: 0 })
  })

  it('行と列の交差で重複しないこと', () => {
    const completedLines: CompletedLines = { rows: [0], columns: [0] }
    const cells = getCellsToRemove(completedLines)

    // 行6 + 列6 - 交差1 = 11ブロック
    expect(cells).toHaveLength(11)
  })
})

describe('clearLines', () => {
  it('指定したセルをクリアする（immutable）', () => {
    const board = createBoardWithFilledRows([0])

    const cellsToClear = [
      { x: 0, y: 0, row: 0, col: 0 }, { x: 1, y: 0, row: 0, col: 1 }, { x: 2, y: 0, row: 0, col: 2 },
      { x: 3, y: 0, row: 0, col: 3 }, { x: 4, y: 0, row: 0, col: 4 }, { x: 5, y: 0, row: 0, col: 5 }
    ]

    const newBoard = clearLines(board, cellsToClear)

    // 元のボードは変更されない
    expect(board[0][0].filled).toBe(true)

    // 新しいボードはクリアされている
    for (let x = 0; x < 6; x++) {
      expect(newBoard[0][x].filled).toBe(false)
    }
  })

  it('他のセルに影響しない', () => {
    const board = createBoardWithFilledRows([0, 1])

    // row 0 のみクリア
    const cellsToClear = [
      { x: 0, y: 0, row: 0, col: 0 }, { x: 1, y: 0, row: 0, col: 1 }, { x: 2, y: 0, row: 0, col: 2 },
      { x: 3, y: 0, row: 0, col: 3 }, { x: 4, y: 0, row: 0, col: 4 }, { x: 5, y: 0, row: 0, col: 5 }
    ]

    const newBoard = clearLines(board, cellsToClear)

    // row 0 はクリアされている
    for (let x = 0; x < 6; x++) {
      expect(newBoard[0][x].filled).toBe(false)
    }

    // row 1 はそのまま
    for (let x = 0; x < 6; x++) {
      expect(newBoard[1][x].filled).toBe(true)
    }
  })
})

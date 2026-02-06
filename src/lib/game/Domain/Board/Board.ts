import type { GridPosition } from '../Core/Position'
import type { Cell } from './Cell'
import { createEmptyCell } from './Cell'

/**
 * ボード（不変の2次元配列）
 */
export type Board = readonly (readonly Cell[])[]

/**
 * ボードサイズ
 */
export const GRID_SIZE = 6

/**
 * 空のボードを作成
 */
export const createEmptyBoard = (): Board =>
  Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => createEmptyCell())
  )

/**
 * セルを取得（範囲外はnull）
 */
export const getCell = (board: Board, pos: GridPosition): Cell | null => {
  if (pos.row < 0 || pos.row >= GRID_SIZE || pos.col < 0 || pos.col >= GRID_SIZE) {
    return null
  }
  return board[pos.row][pos.col]
}

/**
 * セルを更新（新しいボードを返す）
 */
export const setCell = (board: Board, pos: GridPosition, cell: Cell): Board =>
  board.map((row, r) =>
    r === pos.row
      ? row.map((c, col) => (col === pos.col ? cell : c))
      : row
  )

/**
 * 複数セルを一括更新
 */
export const setCells = (
  board: Board,
  updates: ReadonlyArray<{ pos: GridPosition; cell: Cell }>
): Board => {
  const updateMap = new Map(
    updates.map(u => [`${u.pos.row},${u.pos.col}`, u.cell])
  )

  return board.map((row, r) =>
    row.map((cell, c) => {
      const key = `${r},${c}`
      return updateMap.get(key) ?? cell
    })
  )
}

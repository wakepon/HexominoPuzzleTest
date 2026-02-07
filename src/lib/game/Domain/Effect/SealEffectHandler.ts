/**
 * シール効果計算ハンドラー（純粋関数）
 */

import type { Board, ClearingCell } from '..'
import type { SealId } from '../Core/Id'
import type { SealEffectResult } from './SealEffectTypes'
import { getSealDefinition } from './Seal'

/**
 * 消去対象からstoneシール付きセルを除外
 * ライン完成判定は変更せず、消去対象のみをフィルタリング
 */
export function filterClearableCells(
  board: Board,
  cells: readonly ClearingCell[]
): ClearingCell[] {
  return cells.filter((cell) => {
    const boardCell = board[cell.row][cell.col]
    if (!boardCell.seal) return true

    const sealDef = getSealDefinition(boardCell.seal)
    // preventsClearing が true のシール（stone）は除外
    return !sealDef?.preventsClearing
  })
}

/**
 * goldシールの数をカウント
 * 消去対象のセルにあるgoldシールの数を返す
 */
export function calculateGoldCount(
  board: Board,
  cellsToRemove: readonly ClearingCell[]
): number {
  let count = 0
  for (const cell of cellsToRemove) {
    const boardCell = board[cell.row][cell.col]
    if (boardCell.seal === ('gold' as SealId)) {
      count += 1
    }
  }
  return count
}

/**
 * scoreシールによるスコアボーナスを計算
 * scoreシール1個につき+5点
 */
export function calculateScoreBonus(
  board: Board,
  cellsToRemove: readonly ClearingCell[]
): number {
  let count = 0
  for (const cell of cellsToRemove) {
    const boardCell = board[cell.row][cell.col]
    if (boardCell.seal === ('score' as SealId)) {
      count += 1
    }
  }
  return count * 5
}

/**
 * multiシールによる追加ブロック数を計算
 * multiシール付きブロックは2回カウントされるため、+1/個
 */
export function calculateMultiBonus(
  board: Board,
  cellsToRemove: readonly ClearingCell[]
): number {
  let count = 0
  for (const cell of cellsToRemove) {
    const boardCell = board[cell.row][cell.col]
    if (boardCell.seal === ('multi' as SealId)) {
      count += 1
    }
  }
  return count
}

/**
 * 全シール効果を統合計算（1回のループで全て計算）
 */
export function calculateSealEffects(
  board: Board,
  cellsToRemove: readonly ClearingCell[]
): SealEffectResult {
  let goldCount = 0
  let scoreCount = 0
  let multiCount = 0

  for (const cell of cellsToRemove) {
    const boardCell = board[cell.row][cell.col]
    const seal = boardCell.seal
    if (seal === ('gold' as SealId)) {
      goldCount++
    } else if (seal === ('score' as SealId)) {
      scoreCount++
    } else if (seal === ('multi' as SealId)) {
      multiCount++
    }
  }

  return {
    goldCount,
    scoreBonus: scoreCount * 5,
    multiBonus: multiCount,
  }
}

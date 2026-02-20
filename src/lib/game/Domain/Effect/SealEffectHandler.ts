/**
 * シール効果計算ハンドラー（純粋関数）
 */

import type { Board, ClearingCell } from '..'
import type { SealId } from '../Core/Id'
import type { SealEffectResult } from './SealEffectTypes'
import { getSealDefinition } from './Seal'
import { getPatternDefinition } from './Pattern'

/**
 * 消去対象からstoneシール付きセル・ネガティブパターンセルを除外
 * ライン完成判定は変更せず、消去対象のみをフィルタリング
 */
export function filterClearableCells(
  board: Board,
  cells: readonly ClearingCell[]
): ClearingCell[] {
  return cells.filter((cell) => {
    const boardCell = board[cell.row][cell.col]

    // ネガティブパターン（obstacleなど）は消去不可
    if (boardCell.pattern) {
      const patternDef = getPatternDefinition(boardCell.pattern)
      if (patternDef?.isNegative) return false
    }

    // preventsClearing が true のシール（stone）は除外
    if (boardCell.seal) {
      const sealDef = getSealDefinition(boardCell.seal)
      if (sealDef?.preventsClearing) return false
    }

    return true
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
  cellsToRemove: readonly ClearingCell[],
  multiSealMultiplier: number = 2
): SealEffectResult {
  let goldCount = 0
  let multiCount = 0

  for (const cell of cellsToRemove) {
    const boardCell = board[cell.row][cell.col]
    const seal = boardCell.seal
    if (seal === ('gold' as SealId)) {
      goldCount++
    } else if (seal === ('multi' as SealId)) {
      multiCount++
    }
  }

  return {
    goldCount,
    multiBonus: multiCount * (multiSealMultiplier - 1),
  }
}

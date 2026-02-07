/**
 * パターン効果計算ハンドラー（純粋関数）
 */

import type { Board, ClearingCell, Piece } from '..'
import type { PatternId } from '../Core/Id'
import type { PatternEffectResult, ScoreBreakdown } from './PatternEffectTypes'
import { GRID_SIZE } from '../../Data/Constants'

/**
 * 隣接セルの位置（上下左右）
 */
interface Position {
  readonly row: number
  readonly col: number
}

/**
 * セルの隣接セルを取得（上下左右）
 */
function getAdjacentCells(row: number, col: number): Position[] {
  return [
    { row: row - 1, col }, // 上
    { row: row + 1, col }, // 下
    { row, col: col - 1 }, // 左
    { row, col: col + 1 }, // 右
  ]
}

/**
 * セルが盤面内かチェック
 */
function isInBoard(row: number, col: number): boolean {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE
}

/**
 * セルが盤面端と接している辺の数を計算
 */
function countEdgeContacts(row: number, col: number): number {
  let count = 0
  if (row === 0) count++ // 上端
  if (row === GRID_SIZE - 1) count++ // 下端
  if (col === 0) count++ // 左端
  if (col === GRID_SIZE - 1) count++ // 右端
  return count
}

// === enhanced効果 ===
/**
 * enhanced効果を計算
 * enhanced付きセルの数 × 2 を返す（乗算対象に加算）
 */
export function calculateEnhancedBonus(
  board: Board,
  cellsToRemove: readonly ClearingCell[]
): number {
  let bonus = 0
  for (const cell of cellsToRemove) {
    const boardCell = board[cell.row][cell.col]
    if (boardCell.pattern === ('enhanced' as PatternId)) {
      bonus += 2
    }
  }
  return bonus
}

// === aura効果 ===
/**
 * aura効果を計算
 * 各消去セルについて、隣接に別セットのauraブロックがあれば+1
 */
export function calculateAuraBonus(
  board: Board,
  cellsToRemove: readonly ClearingCell[]
): number {
  let bonus = 0

  for (const cell of cellsToRemove) {
    const currentCell = board[cell.row][cell.col]
    if (!currentCell.filled) continue

    const adjacentCells = getAdjacentCells(cell.row, cell.col)
    for (const adj of adjacentCells) {
      if (!isInBoard(adj.row, adj.col)) continue

      const adjCell = board[adj.row][adj.col]
      if (
        adjCell.filled &&
        adjCell.pattern === ('aura' as PatternId) &&
        adjCell.blockSetId !== currentCell.blockSetId
      ) {
        bonus += 1
        break // 1セルあたり最大+1
      }
    }
  }

  return bonus
}

// === moss効果 ===
/**
 * moss効果を計算
 * 各消去セルについて、盤面端と接している辺の数を加算
 */
export function calculateMossBonus(
  board: Board,
  cellsToRemove: readonly ClearingCell[]
): number {
  let bonus = 0

  for (const cell of cellsToRemove) {
    const boardCell = board[cell.row][cell.col]
    if (boardCell.pattern === ('moss' as PatternId)) {
      bonus += countEdgeContacts(cell.row, cell.col)
    }
  }

  return bonus
}

// === lucky効果 ===
/**
 * lucky効果を判定（10%の確率）
 * 消去対象にluckyパターンを持つセルがあれば判定を行う
 * @returns 2（当たり）または 1（外れ）
 */
export function rollLuckyMultiplier(
  board: Board,
  cellsToRemove: readonly ClearingCell[],
  random: () => number = Math.random
): number {
  // 消去対象にluckyパターンがあるかチェック
  const hasLucky = cellsToRemove.some((cell) => {
    const boardCell = board[cell.row][cell.col]
    return boardCell.pattern === ('lucky' as PatternId)
  })

  if (!hasLucky) return 1

  // 10%の確率で2倍
  return random() < 0.1 ? 2 : 1
}

// === combo効果 ===
/**
 * comboボーナスを計算
 * @param comboCount 現在のコンボ回数（1から始まる）
 * @returns ボーナス値（1回目=0, 2回目=2, 3回目=4, ...）
 */
export function calculateComboBonus(comboCount: number): number {
  if (comboCount <= 1) return 0
  return (comboCount - 1) * 2
}

/**
 * 配置したピースがcomboパターンを持つか判定
 */
export function hasComboPattern(piece: Piece): boolean {
  for (const blockData of piece.blocks.values()) {
    if (blockData.pattern === ('combo' as PatternId)) {
      return true
    }
  }
  return false
}

// === 統合計算 ===
/**
 * 全パターン効果を計算（enhanced, aura, moss）
 */
export function calculatePatternEffects(
  board: Board,
  cellsToRemove: readonly ClearingCell[]
): PatternEffectResult {
  return {
    enhancedBonus: calculateEnhancedBonus(board, cellsToRemove),
    auraBonus: calculateAuraBonus(board, cellsToRemove),
    mossBonus: calculateMossBonus(board, cellsToRemove),
  }
}

/**
 * スコア計算の詳細を返す（パターン効果を含む）
 */
export function calculateScoreBreakdown(
  board: Board,
  cellsToRemove: readonly ClearingCell[],
  linesCleared: number,
  comboCount: number,
  luckyRandom: () => number = Math.random
): ScoreBreakdown {
  const baseBlocks = cellsToRemove.length

  // パターン効果を計算
  const patternEffects = calculatePatternEffects(board, cellsToRemove)
  const { enhancedBonus, auraBonus, mossBonus } = patternEffects

  // 合計ブロック数（乗算対象）
  const totalBlocks = baseBlocks + enhancedBonus + auraBonus + mossBonus

  // 基本スコア
  const baseScore = totalBlocks * linesCleared

  // comboボーナス
  const comboBonus = calculateComboBonus(comboCount)

  // lucky効果
  const luckyMultiplier = rollLuckyMultiplier(board, cellsToRemove, luckyRandom)

  // 最終スコア
  const finalScore = (baseScore + comboBonus) * luckyMultiplier

  return {
    baseBlocks,
    enhancedBonus,
    auraBonus,
    mossBonus,
    totalBlocks,
    linesCleared,
    baseScore,
    comboBonus,
    luckyMultiplier,
    finalScore,
  }
}

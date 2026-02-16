/**
 * パターン効果計算ハンドラー（純粋関数）
 */

import type { Board, ClearingCell, Piece } from '..'
import type { PatternId, RelicId } from '../Core/Id'
import type { PatternEffectResult, ScoreBreakdown } from './PatternEffectTypes'
import type { RelicEffectContext, RelicEffectResult } from './RelicEffectTypes'
import type { CompletedLinesInfo } from './SealEffectTypes'
import { calculateSealEffects } from './SealEffectHandler'
import { calculateRelicEffects } from './RelicEffectHandler'
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

// === charge効果 ===
/**
 * charge効果を計算
 * 消去対象のchargeセルのchargeValueを合算
 */
export function calculateChargeBonus(
  board: Board,
  cellsToRemove: readonly ClearingCell[]
): number {
  let bonus = 0
  for (const cell of cellsToRemove) {
    const boardCell = board[cell.row][cell.col]
    if (boardCell.pattern === ('charge' as PatternId)) {
      bonus += boardCell.chargeValue
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
    chargeBonus: calculateChargeBonus(board, cellsToRemove),
  }
}

/**
 * デフォルトのレリック効果結果（レリック効果なし）
 */
const DEFAULT_RELIC_EFFECTS: RelicEffectResult = {
  activations: {
    // 既存レリック
    chainMasterActive: false,
    sizeBonusActiveRelicId: null,
    fullClearActive: false,
    // 2-A: シングルライン
    singleLineActive: false,
    // 2-B: タケノコ
    takenokoActive: false,
    takenokoCols: 0,
    // 2-C: カニ
    kaniActive: false,
    kaniRows: 0,
    // 2-D: 連射
    renshaActive: false,
    renshaMultiplier: 1.0,
    // 2-E: のびのびタケノコ
    nobiTakenokoActive: false,
    nobiTakenokoMultiplier: 1.0,
    // 2-F: のびのびカニ
    nobiKaniActive: false,
    nobiKaniMultiplier: 1.0,
    // 台本
    scriptActive: false,
    scriptMatchCount: 0,
    // タイミング
    timingActive: false,
    timingMultiplier: 1,
  },
  // 既存レリック
  chainMasterMultiplier: 1.0,
  sizeBonusTotal: 0,
  fullClearBonus: 0,
  totalRelicBonus: 0,
  // 新レリック
  singleLineMultiplier: 1,
  takenokoMultiplier: 1,
  kaniMultiplier: 1,
  renshaMultiplier: 1.0,
  nobiTakenokoMultiplier: 1.0,
  nobiKaniMultiplier: 1.0,
  scriptBonus: 0,
  timingMultiplier: 1,
  copyTargetRelicId: null,
  copyMultiplier: 1,
  copyBonus: 0,
}

/**
 * スコア計算の詳細を返す（パターン効果、シール効果、レリック効果を含む）
 */
export function calculateScoreBreakdown(
  board: Board,
  cellsToRemove: readonly ClearingCell[],
  linesCleared: number,
  comboCount: number,
  relicContext: RelicEffectContext | null = null,
  luckyRandom: () => number = Math.random,
  relicDisplayOrder: readonly RelicId[] = [],
  completedLines: CompletedLinesInfo | null = null
): ScoreBreakdown {
  const baseBlocks = cellsToRemove.length

  // chargeパターンのブロックは基礎スコア+0として扱う（chargeValueのみ寄与）
  const chargeBlockCount = cellsToRemove.filter(
    (c) => board[c.row][c.col].pattern === ('charge' as PatternId)
  ).length

  // パターン効果を計算
  const patternEffects = calculatePatternEffects(board, cellsToRemove)
  const { enhancedBonus, auraBonus, mossBonus, chargeBonus } = patternEffects

  // シール効果を計算
  const sealEffects = calculateSealEffects(board, cellsToRemove, completedLines)
  const { multiBonus, scoreBonus: sealScoreBonus, goldCount, arrowBonus } = sealEffects

  // 合計ブロック数（乗算対象）= パターン効果 + multiシール効果 + アローシール効果（chargeブロックの基礎分を除外）
  const totalBlocks =
    baseBlocks - chargeBlockCount + enhancedBonus + auraBonus + mossBonus + chargeBonus + multiBonus + arrowBonus

  // 基本スコア
  const baseScore = totalBlocks * linesCleared

  // comboボーナス
  const comboBonus = calculateComboBonus(comboCount)

  // lucky効果
  const luckyMultiplier = rollLuckyMultiplier(board, cellsToRemove, luckyRandom)

  // パターン+シール効果込みのスコア
  const scoreBeforeRelics =
    (baseScore + comboBonus) * luckyMultiplier + sealScoreBonus

  // レリック効果を計算
  const relicEffects = relicContext
    ? calculateRelicEffects(relicContext)
    : DEFAULT_RELIC_EFFECTS
  const {
    chainMasterMultiplier,
    sizeBonusTotal,
    fullClearBonus,
    singleLineMultiplier,
    takenokoMultiplier,
    kaniMultiplier,
    renshaMultiplier,
    nobiTakenokoMultiplier,
    nobiKaniMultiplier,
    scriptBonus,
    timingMultiplier,
  } = relicEffects

  // コピーレリック効果
  const { copyTargetRelicId, copyMultiplier, copyBonus } = relicEffects

  // 最終スコア計算（relicDisplayOrder に基づく動的順序）
  // 乗算レリックの倍率マップ
  const relicMultiplierMap: Record<string, number> = {
    chain_master: chainMasterMultiplier,
    single_line: singleLineMultiplier,
    takenoko: takenokoMultiplier,
    kani: kaniMultiplier,
    nobi_takenoko: nobiTakenokoMultiplier,
    nobi_kani: nobiKaniMultiplier,
    rensha: renshaMultiplier,
    timing: timingMultiplier,
  }

  // relicDisplayOrder に基づいて乗算レリックを適用
  // relicDisplayOrder が空の場合はデフォルト順序を使用
  const effectiveOrder: readonly string[] = relicDisplayOrder.length > 0
    ? relicDisplayOrder
    : ['chain_master', 'single_line', 'takenoko', 'kani', 'nobi_takenoko', 'nobi_kani', 'rensha', 'timing']

  let scoreAfterRelicMultipliers = scoreBeforeRelics
  for (const relicId of effectiveOrder) {
    // 通常の乗算レリック
    const multiplier = relicMultiplierMap[relicId]
    if (multiplier !== undefined && multiplier !== 1) {
      scoreAfterRelicMultipliers = Math.floor(scoreAfterRelicMultipliers * multiplier)
    }
    // コピーレリック: 対象レリックの直後に乗算を適用
    if (relicId === copyTargetRelicId && copyMultiplier > 1) {
      scoreAfterRelicMultipliers = Math.floor(scoreAfterRelicMultipliers * copyMultiplier)
    }
  }

  // 加算レリック（サイズボーナス + 全消しボーナス + 台本 + コピー加算）は最後
  const finalScore = scoreAfterRelicMultipliers + sizeBonusTotal + fullClearBonus + scriptBonus + copyBonus

  return {
    baseBlocks,
    enhancedBonus,
    auraBonus,
    mossBonus,
    multiBonus,
    arrowBonus,
    chargeBonus,
    totalBlocks,
    linesCleared,
    baseScore,
    comboBonus,
    luckyMultiplier,
    sealScoreBonus,
    goldCount,
    chainMasterMultiplier,
    sizeBonusTotal,
    sizeBonusRelicId: relicEffects.activations.sizeBonusActiveRelicId,
    fullClearBonus,
    relicBonusTotal: sizeBonusTotal + fullClearBonus + scriptBonus + copyBonus,
    singleLineMultiplier,
    takenokoMultiplier,
    kaniMultiplier,
    renshaMultiplier,
    nobiTakenokoMultiplier,
    nobiKaniMultiplier,
    scriptBonus,
    timingMultiplier,
    copyTargetRelicId,
    copyMultiplier,
    copyBonus,
    finalScore,
  }
}

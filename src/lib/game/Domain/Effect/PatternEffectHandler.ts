/**
 * パターン効果計算ハンドラー（純粋関数）
 */

import type { Board, ClearingCell } from '..'
import type { PatternId, RelicId, SealId } from '../Core/Id'
import type { PatternEffectResult, ScoreBreakdown } from './PatternEffectTypes'
import type { RelicEffectContext } from './RelicEffectTypes'
import type { CompletedLinesInfo } from './SealEffectTypes'
import { calculateSealEffects } from './SealEffectHandler'
import { GRID_SIZE } from '../../Data/Constants'
import { getRelicModule } from './Relics/RelicRegistry'
import { evaluateRelicEffects, evaluateCopyRelicEffect } from './Relics/RelicEffectEngine'
import { isCopyRelicInactive } from './CopyRelicResolver'

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
      const multiplier = boardCell.seal === ('multi' as SealId) ? 2 : 1
      bonus += 2 * multiplier
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
        const multiplier = currentCell.seal === ('multi' as SealId) ? 2 : 1
        bonus += 1 * multiplier
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
      const multiplier = boardCell.seal === ('multi' as SealId) ? 2 : 1
      bonus += countEdgeContacts(cell.row, cell.col) * multiplier
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
      const multiplier = boardCell.seal === ('multi' as SealId) ? 2 : 1
      bonus += boardCell.chargeValue * multiplier
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
  // multi付きluckyブロックは2回抽選
  let luckyRolls = 0
  for (const cell of cellsToRemove) {
    const boardCell = board[cell.row][cell.col]
    if (boardCell.pattern === ('lucky' as PatternId)) {
      luckyRolls += boardCell.seal === ('multi' as SealId) ? 2 : 1
    }
  }

  if (luckyRolls === 0) return 1

  // 各ロールで10%の確率 → 1回でも当たれば2倍
  for (let i = 0; i < luckyRolls; i++) {
    if (random() < 0.1) return 2
  }
  return 1
}

// === combo効果 ===
/**
 * comboボーナスを計算
 * 同時消去されたcomboブロック数に応じて指数的にブロック点ボーナス
 * 1個:+1, 2個:+3, 3個:+7, ...（合計 2^n - 1）
 */
export function calculateComboBonus(
  board: Board,
  cellsToRemove: readonly ClearingCell[]
): number {
  let comboCount = 0
  for (const cell of cellsToRemove) {
    const boardCell = board[cell.row][cell.col]
    if (boardCell.pattern === ('combo' as PatternId)) {
      const increment = boardCell.seal === ('multi' as SealId) ? 2 : 1
      comboCount += increment
    }
  }
  if (comboCount === 0) return 0
  return Math.pow(2, comboCount) - 1
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
 * スコア計算の詳細を返す（パターン効果、シール効果、レリック効果を含む）
 *
 * レリック効果はレジストリベースのエンジンで汎用的に計算される。
 * 個々のレリックIDやフィールド名のハードコードは不要。
 */
export function calculateScoreBreakdown(
  board: Board,
  cellsToRemove: readonly ClearingCell[],
  linesCleared: number,
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

  // 合計ブロック数（パターン効果 + multiシール効果 + アローシール効果、chargeブロック基礎分除外）
  const totalBlocks =
    baseBlocks - chargeBlockCount + enhancedBonus + auraBonus + chargeBonus + multiBonus + arrowBonus

  // comboボーナス（同時消去されたcomboブロック数から計算）
  const comboBonus = calculateComboBonus(board, cellsToRemove)

  // lucky効果（列点として扱う）
  const luckyMultiplier = rollLuckyMultiplier(board, cellsToRemove, luckyRandom)

  // === レリック効果計算（レジストリベース） ===
  const relicEffects = new Map<string, number>()
  let sizeBonusRelicId: string | null = null
  let copyTargetRelicId: string | null = null
  let copyMultiplier = 1
  let copyBonus = 0
  let copyLineBonus = 0

  if (relicContext) {
    // 全所持レリックの発動判定
    const activations = evaluateRelicEffects(
      relicContext.ownedRelics,
      {
        totalLines: relicContext.totalLines,
        rowLines: relicContext.rowLines,
        colLines: relicContext.colLines,
        placedBlockSize: relicContext.placedBlockSize,
        isBoardEmptyAfterClear: relicContext.isBoardEmptyAfterClear,
        completedRows: relicContext.completedRows,
        completedCols: relicContext.completedCols,
        scriptRelicLines: relicContext.scriptRelicLines,
        remainingHands: relicContext.remainingHands,
      },
      relicContext.relicMultiplierState
    )

    // 発動したレリックのみrelicEffectsマップに格納
    for (const [relicId, activation] of activations) {
      if (!activation.active) continue
      const module = getRelicModule(relicId)
      if (!module) continue

      // サイズボーナス: 仮値1を消去ブロック数に上書き
      if (relicId.startsWith('size_bonus_')) {
        relicEffects.set(relicId, baseBlocks)
        sizeBonusRelicId = relicId
      } else {
        relicEffects.set(relicId, activation.value)
      }
    }

    // コピーレリック効果
    const copyState = relicContext.copyRelicState ?? relicContext.relicMultiplierState.copyRelicState
    if (copyState?.targetRelicId) {
      const targetId = copyState.targetRelicId as string
      if (!isCopyRelicInactive(relicDisplayOrder)) {
        copyTargetRelicId = targetId

        const copyResult = evaluateCopyRelicEffect(
          targetId,
          {
            ownedRelics: relicContext.ownedRelics,
            totalLines: relicContext.totalLines,
            rowLines: relicContext.rowLines,
            colLines: relicContext.colLines,
            placedBlockSize: relicContext.placedBlockSize,
            isBoardEmptyAfterClear: relicContext.isBoardEmptyAfterClear,
            completedRows: relicContext.completedRows,
            completedCols: relicContext.completedCols,
            scriptRelicLines: relicContext.scriptRelicLines,
            remainingHands: relicContext.remainingHands,
          },
          relicContext.relicMultiplierState
        )

        copyMultiplier = copyResult.multiplier
        copyBonus = copyResult.bonus
        copyLineBonus = copyResult.lineBonus

        // サイズボーナスをコピーしている場合、copyBonusも消去ブロック数に上書き
        if (targetId.startsWith('size_bonus_') && copyBonus > 0) {
          copyBonus = baseBlocks
        }
      }
    }
  }

  // スコア計算用にコピー効果をマップに格納
  if (copyMultiplier > 1 || copyBonus > 0 || copyLineBonus > 0) {
    // コピーは対象レリックの効果種別に応じた値
    if (copyMultiplier > 1) relicEffects.set('copy', copyMultiplier)
    else if (copyLineBonus > 0) relicEffects.set('copy', copyLineBonus)
    else if (copyBonus > 0) relicEffects.set('copy', copyBonus)
  }

  // 基本スコア計算（scriptとcopyLineBonusを含む）
  const scriptLineBonus = relicEffects.get('script') ?? 0
  const effectiveLinesCleared = linesCleared > 0
    ? linesCleared + (scriptLineBonus > 0 ? scriptLineBonus : 0) + copyLineBonus
    : linesCleared
  const baseScore = totalBlocks * effectiveLinesCleared

  // === A×B方式スコア計算 ===
  const effectiveOrder: readonly string[] = relicDisplayOrder.length > 0
    ? relicDisplayOrder.map(id => id as string)
    : Array.from(relicEffects.keys()).filter(id => id !== 'copy')

  // A (ブロック点): totalBlocks + sealScoreBonus + 加算レリック + comboBonus
  let blockPoints = totalBlocks + sealScoreBonus

  for (const relicId of effectiveOrder) {
    const module = getRelicModule(relicId)
    const effectValue = relicEffects.get(relicId)
    if (!module || effectValue === undefined) continue

    // 加算系レリック → Aに加算
    if (module.scoreEffect === 'additive' && effectValue > 0) {
      blockPoints += effectValue
    }

    // コピーレリック: 加算系対象の直後にコピー分を適用
    if (relicId === copyTargetRelicId && copyBonus > 0) {
      const targetModule = getRelicModule(relicId)
      if (targetModule && targetModule.scoreEffect === 'additive') {
        blockPoints += copyBonus
      }
    }
  }

  blockPoints += comboBonus

  // B (列点): linesCleared × luckyMultiplier → レリック(台本加算・乗算)
  let linePoints = linesCleared * luckyMultiplier + mossBonus

  for (const relicId of effectiveOrder) {
    const module = getRelicModule(relicId)
    const effectValue = relicEffects.get(relicId)
    if (!module || effectValue === undefined) continue

    // ライン加算系レリック → Bにライン数加算
    if (module.scoreEffect === 'line_additive' && linesCleared > 0 && effectValue > 0) {
      linePoints += effectValue
    }

    // コピーレリック: ライン加算系対象の直後にコピー分を適用
    if (relicId === copyTargetRelicId && copyLineBonus > 0) {
      const targetModule = getRelicModule(relicId)
      if (targetModule && targetModule.scoreEffect === 'line_additive' && linesCleared > 0) {
        linePoints += copyLineBonus
      }
    }

    // 乗算系レリック → B列点に乗算（切り捨てなし）
    if (module.scoreEffect === 'multiplicative' && effectValue !== 1) {
      linePoints *= effectValue
    }

    // コピーレリック: 乗算系対象の直後にコピー乗算を適用
    if (relicId === copyTargetRelicId && copyMultiplier > 1) {
      const targetModule = getRelicModule(relicId)
      if (targetModule && targetModule.scoreEffect === 'multiplicative') {
        linePoints *= copyMultiplier
      }
    }
  }

  // 最終スコア = Math.floor(A × B)
  const finalScore = Math.floor(blockPoints * linePoints)

  // サイズボーナスの実値を取得（relicBonusTotal計算用）
  const actualSizeBonusTotal = sizeBonusRelicId ? (relicEffects.get(sizeBonusRelicId) ?? 0) : 0

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
    relicEffects,
    sizeBonusRelicId,
    copyTargetRelicId,
    relicBonusTotal: actualSizeBonusTotal + copyBonus,
    blockPoints,
    linePoints,
    finalScore,
  }
}

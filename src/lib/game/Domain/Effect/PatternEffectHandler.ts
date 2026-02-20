/**
 * パターン効果計算ハンドラー（純粋関数）
 */

import type { Board, ClearingCell } from '..'
import type { PatternId, RelicId, SealId } from '../Core/Id'
import type { PatternEffectResult, ScoreBreakdown } from './PatternEffectTypes'
import type { RelicEffectContext } from './RelicEffectTypes'
import { calculateSealEffects } from './SealEffectHandler'
import { calculateBlessingScoreEffects } from './BlessingEffectHandler'
import { getRelicModule } from './Relics/RelicRegistry'
import { evaluateRelicEffects, evaluateCopyRelicEffect } from './Relics/RelicEffectEngine'
import { isCopyRelicInactive } from './CopyRelicResolver'
import { AMPLIFIED_ENHANCED_BONUS } from './Relics/Amplifier'
import { PRISM_MULTI_MULTIPLIER } from './Relics/Prism'

// === enhanced効果 ===
/**
 * enhanced効果を計算
 * enhanced付きセルの数 × bonusPerBlock を返す（乗算対象に加算）
 * デフォルトは +2、amplifier所持時は +5
 */
export function calculateEnhancedBonus(
  board: Board,
  cellsToRemove: readonly ClearingCell[],
  bonusPerBlock: number = 2,
  multiSealMultiplier: number = 2
): number {
  let bonus = 0
  for (const cell of cellsToRemove) {
    const boardCell = board[cell.row][cell.col]
    if (boardCell.pattern === ('enhanced' as PatternId)) {
      const multiplier = boardCell.seal === ('multi' as SealId) ? multiSealMultiplier : 1
      bonus += bonusPerBlock * multiplier
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
  cellsToRemove: readonly ClearingCell[],
  multiSealMultiplier: number = 2
): number {
  let bonus = 0
  for (const cell of cellsToRemove) {
    const boardCell = board[cell.row][cell.col]
    if (boardCell.pattern === ('charge' as PatternId)) {
      const multiplier = boardCell.seal === ('multi' as SealId) ? multiSealMultiplier : 1
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
  random: () => number = Math.random,
  multiSealMultiplier: number = 2
): number {
  // multi付きluckyブロックはmultiSealMultiplier回抽選
  let luckyRolls = 0
  for (const cell of cellsToRemove) {
    const boardCell = board[cell.row][cell.col]
    if (boardCell.pattern === ('lucky' as PatternId)) {
      luckyRolls += boardCell.seal === ('multi' as SealId) ? multiSealMultiplier : 1
    }
  }

  if (luckyRolls === 0) return 1

  // 各ロールで10%の確率 → 1回でも当たれば2倍
  for (let i = 0; i < luckyRolls; i++) {
    if (random() < 0.1) return 2
  }
  return 1
}

// === 統合計算 ===
/**
 * 全パターン効果を計算（enhanced, charge）
 */
export function calculatePatternEffects(
  board: Board,
  cellsToRemove: readonly ClearingCell[],
  enhancedBonusPerBlock: number = 2,
  multiSealMultiplier: number = 2
): PatternEffectResult {
  return {
    enhancedBonus: calculateEnhancedBonus(board, cellsToRemove, enhancedBonusPerBlock, multiSealMultiplier),
    chargeBonus: calculateChargeBonus(board, cellsToRemove, multiSealMultiplier),
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
  relicDisplayOrder: readonly RelicId[] = []
): ScoreBreakdown {
  const baseBlocks = cellsToRemove.length

  // chargeパターンのブロックは基礎スコア+0として扱う（chargeValueのみ寄与）
  const chargeBlockCount = cellsToRemove.filter(
    (c) => board[c.row][c.col].pattern === ('charge' as PatternId)
  ).length

  // amplifier所持チェック → enhancedボーナス値決定
  const hasAmplifier = relicContext?.ownedRelics.some(r => r === ('amplifier' as RelicId)) ?? false
  const enhancedBonusPerBlock = hasAmplifier ? AMPLIFIED_ENHANCED_BONUS : 2

  // prism所持チェック → multiシール乗数決定
  const hasPrism = relicContext?.ownedRelics.some(r => r === ('prism' as RelicId)) ?? false
  const multiSealMultiplier = hasPrism ? PRISM_MULTI_MULTIPLIER : 2

  // パターン効果を計算
  const patternEffects = calculatePatternEffects(board, cellsToRemove, enhancedBonusPerBlock, multiSealMultiplier)
  const { enhancedBonus, chargeBonus } = patternEffects

  // シール効果を計算
  const sealEffects = calculateSealEffects(board, cellsToRemove, multiSealMultiplier)
  const { multiBonus, goldCount } = sealEffects

  // 加護効果を計算
  const blessingEffects = calculateBlessingScoreEffects(board, cellsToRemove)
  const { powerBonus: blessingPowerBonus, goldBonus: blessingGoldBonus, chainBonus: blessingChainBonus } = blessingEffects

  // 合計ブロック数（パターン効果 + multiシール効果 + 力の加護、chargeブロック基礎分除外）
  const totalBlocks =
    baseBlocks - chargeBlockCount + enhancedBonus + chargeBonus + multiBonus + blessingPowerBonus

  // lucky効果（列点として扱う）
  const luckyMultiplier = rollLuckyMultiplier(board, cellsToRemove, luckyRandom, multiSealMultiplier)

  // === レリック効果計算（レジストリベース） ===
  const relicEffects = new Map<string, number>()
  let sizeBonusRelicId: string | null = null
  let copyTargetRelicId: string | null = null
  let copyMultiplier = 1
  let copyBonus = 0
  let copyLineBonus = 0

  if (relicContext) {
    // boardから patternBlockCount, sealBlockCount, patternAndSealBlockCount, distinctPatternTypeCount を計算
    let patternBlockCount = 0
    let sealBlockCount = 0
    let patternAndSealBlockCount = 0
    let stoneBlockCount = 0
    const patternTypeSet = new Set<string>()
    for (const cell of cellsToRemove) {
      const boardCell = board[cell.row][cell.col]
      if (boardCell.pattern) {
        patternBlockCount++
        patternTypeSet.add(boardCell.pattern as string)
      }
      if (boardCell.seal) {
        sealBlockCount++
        if (boardCell.seal === ('stone' as SealId)) stoneBlockCount++
      }
      if (boardCell.pattern && boardCell.seal) patternAndSealBlockCount++
    }
    const distinctPatternTypeCount = patternTypeSet.size

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
        patternBlockCount,
        sealBlockCount,
        deckSize: relicContext.deckSize,
        boardFilledCount: relicContext.boardFilledCount,
        patternAndSealBlockCount,
        distinctPatternTypeCount,
        stoneBlockCount,
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
            patternBlockCount,
            sealBlockCount,
            deckSize: relicContext.deckSize,
            boardFilledCount: relicContext.boardFilledCount,
            patternAndSealBlockCount,
            distinctPatternTypeCount,
            stoneBlockCount,
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

  // A (ブロック点): totalBlocks + 加算レリック
  let blockPoints = totalBlocks

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

  // B (列点): linesCleared × luckyMultiplier + 連の加護 → レリック(台本加算・乗算)
  let linePoints = linesCleared * luckyMultiplier + blessingChainBonus

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
    multiBonus,
    chargeBonus,
    totalBlocks,
    linesCleared,
    baseScore,
    luckyMultiplier,
    goldCount: goldCount + blessingGoldBonus,
    relicEffects,
    sizeBonusRelicId,
    copyTargetRelicId,
    relicBonusTotal: actualSizeBonusTotal + copyBonus,
    blessingPowerBonus,
    blessingGoldBonus,
    blessingChainBonus,
    blockPoints,
    linePoints,
    finalScore,
  }
}

/**
 * スコアアニメーション用の式ステップ生成ロジック
 *
 * ScoreBreakdown と relicDisplayOrder を受け取り、
 * 各効果がどう寄与しているかを段階的に見せる FormulaStep[] を生成する。
 */

import type { RelicId } from '../Core/Id'
import type { ScoreBreakdown } from '../Effect/PatternEffectTypes'
import type { FormulaStep } from './ScoreAnimationState'
import { getRelicDefinition } from '../Effect/Relic'

/**
 * レリックIDから乗算倍率を取得
 */
function getRelicMultiplier(
  relicId: RelicId,
  breakdown: ScoreBreakdown
): number {
  switch (relicId) {
    case 'chain_master':
      return breakdown.chainMasterMultiplier
    case 'single_line':
      return breakdown.singleLineMultiplier
    case 'takenoko':
      return breakdown.takenokoMultiplier
    case 'kani':
      return breakdown.kaniMultiplier
    case 'nobi_takenoko':
      return breakdown.nobiTakenokoMultiplier
    case 'nobi_kani':
      return breakdown.nobiKaniMultiplier
    case 'rensha':
      return breakdown.renshaMultiplier
    case 'timing':
      return breakdown.timingMultiplier
    case 'full_clear_bonus':
      return breakdown.fullClearMultiplier
    default:
      return 1
  }
}

/**
 * レリックIDから加算ボーナスを取得
 */
function getRelicAdditiveBonus(
  relicId: RelicId,
  breakdown: ScoreBreakdown
): number {
  switch (relicId) {
    case 'size_bonus_1': case 'size_bonus_2': case 'size_bonus_3':
    case 'size_bonus_4': case 'size_bonus_5': case 'size_bonus_6':
      return breakdown.sizeBonusTotal
    case 'script':
      return breakdown.scriptBonus
    default:
      return 0
  }
}

/**
 * 乗算系レリックか判定
 */
function isMultiplicativeRelic(relicId: RelicId): boolean {
  const multiplicativeRelics: string[] = [
    'chain_master', 'single_line', 'takenoko', 'kani',
    'nobi_takenoko', 'nobi_kani', 'rensha', 'timing',
    'full_clear_bonus',
  ]
  return multiplicativeRelics.includes(relicId)
}

/**
 * 数値のフォーマット（小数点以下があれば表示）
 */
function formatNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

/**
 * ScoreBreakdown と relicDisplayOrder から式ステップを生成
 */
export function buildFormulaSteps(
  breakdown: ScoreBreakdown,
  relicDisplayOrder: readonly RelicId[]
): FormulaStep[] {
  const steps: FormulaStep[] = []

  // === 1. 基本式: (ブロック数 × ライン数) ===
  let innerSum = breakdown.baseBlocks
  let outerMultiplier = breakdown.linesCleared
  let additiveParts: number[] = []

  steps.push({
    type: 'base',
    label: '基本スコア',
    formula: `(${innerSum}) × ${outerMultiplier}`,
    relicId: null,
  })

  // === 2. シール効果 ===
  // multiシール: カッコ内に加算
  if (breakdown.multiBonus > 0) {
    innerSum += breakdown.multiBonus
    steps.push({
      type: 'seal',
      label: 'マルチシール',
      formula: buildFormula(innerSum, outerMultiplier, additiveParts, 1),
      relicId: null,
    })
  }

  // arrowシール: カッコ内に加算
  if (breakdown.arrowBonus > 0) {
    innerSum += breakdown.arrowBonus
    steps.push({
      type: 'seal',
      label: 'アローシール',
      formula: buildFormula(innerSum, outerMultiplier, additiveParts, 1),
      relicId: null,
    })
  }

  // scoreシール: 加算部分に追加
  if (breakdown.sealScoreBonus > 0) {
    additiveParts.push(breakdown.sealScoreBonus)
    steps.push({
      type: 'seal',
      label: 'スコアシール',
      formula: buildFormula(innerSum, outerMultiplier, additiveParts, 1),
      relicId: null,
    })
  }

  // === 3. パターン効果 ===
  // enhanced: カッコ内に加算
  if (breakdown.enhancedBonus > 0) {
    innerSum += breakdown.enhancedBonus
    steps.push({
      type: 'pattern',
      label: 'エンハンスド',
      formula: buildFormula(innerSum, outerMultiplier, additiveParts, 1),
      relicId: null,
    })
  }

  // aura: カッコ内に加算
  if (breakdown.auraBonus > 0) {
    innerSum += breakdown.auraBonus
    steps.push({
      type: 'pattern',
      label: 'オーラ',
      formula: buildFormula(innerSum, outerMultiplier, additiveParts, 1),
      relicId: null,
    })
  }

  // moss: カッコ内に加算
  if (breakdown.mossBonus > 0) {
    innerSum += breakdown.mossBonus
    steps.push({
      type: 'pattern',
      label: 'モス',
      formula: buildFormula(innerSum, outerMultiplier, additiveParts, 1),
      relicId: null,
    })
  }

  // charge: カッコ内に加算
  if (breakdown.chargeBonus > 0) {
    innerSum += breakdown.chargeBonus
    steps.push({
      type: 'pattern',
      label: 'チャージ',
      formula: buildFormula(innerSum, outerMultiplier, additiveParts, 1),
      relicId: null,
    })
  }

  // combo: 加算部分に追加
  if (breakdown.comboBonus > 0) {
    additiveParts.push(breakdown.comboBonus)
    steps.push({
      type: 'pattern',
      label: 'コンボ',
      formula: buildFormula(innerSum, outerMultiplier, additiveParts, 1),
      relicId: null,
    })
  }

  // lucky: 乗算部分（全体 × 2）
  let luckyApplied = 1
  if (breakdown.luckyMultiplier > 1) {
    luckyApplied = breakdown.luckyMultiplier
    steps.push({
      type: 'pattern',
      label: 'ラッキー ×2!',
      formula: buildFormula(innerSum, outerMultiplier, additiveParts, luckyApplied),
      relicId: null,
    })
  }

  // === 4. レリック効果を relicDisplayOrder の順に追加 ===
  // scoreBeforeRelics: パターン＋シール効果込みのスコア（PatternEffectHandlerと同じ計算）
  let currentScore =
    (breakdown.baseScore + breakdown.comboBonus) * breakdown.luckyMultiplier +
    breakdown.sealScoreBonus

  for (const relicId of relicDisplayOrder) {
    if (isMultiplicativeRelic(relicId)) {
      const multiplier = getRelicMultiplier(relicId, breakdown)
      if (multiplier !== 1) {
        currentScore = Math.floor(currentScore * multiplier)
        const def = getRelicDefinition(relicId)
        const label = def?.name ?? relicId
        steps.push({
          type: 'relic',
          label: `${label} ×${formatNum(multiplier)}`,
          formula: `${currentScore}`,
          relicId,
        })
      }
    }
    // コピーレリック: 対象レリックの直後にコピー分の乗算を追加
    if (relicId === breakdown.copyTargetRelicId && breakdown.copyMultiplier > 1) {
      currentScore = Math.floor(currentScore * breakdown.copyMultiplier)
      const targetDef = getRelicDefinition(relicId)
      const targetName = targetDef?.name ?? relicId
      steps.push({
        type: 'relic',
        label: `コピー (${targetName}) ×${formatNum(breakdown.copyMultiplier)}`,
        formula: `${currentScore}`,
        relicId: 'copy' as RelicId,
      })
    }
  }

  // 加算レリック（サイズボーナス、台本）
  for (const relicId of relicDisplayOrder) {
    if (!isMultiplicativeRelic(relicId) && relicId !== ('copy' as string)) {
      const bonus = getRelicAdditiveBonus(relicId, breakdown)
      if (bonus > 0) {
        currentScore += bonus
        const def = getRelicDefinition(relicId)
        const label = def?.name ?? relicId
        steps.push({
          type: 'relic',
          label: `${label} +${bonus}`,
          formula: `${currentScore}`,
          relicId,
        })
      }
      // コピーレリックで加算レリックをコピー中の場合
      if (relicId === breakdown.copyTargetRelicId && breakdown.copyBonus > 0) {
        currentScore += breakdown.copyBonus
        const targetDef = getRelicDefinition(relicId)
        const targetName = targetDef?.name ?? relicId
        steps.push({
          type: 'relic',
          label: `コピー (${targetName}) +${breakdown.copyBonus}`,
          formula: `${currentScore}`,
          relicId: 'copy' as RelicId,
        })
      }
    }
  }

  // === 5. 最終結果 ===
  steps.push({
    type: 'result',
    label: '最終スコア',
    formula: `+${breakdown.finalScore}`,
    relicId: null,
  })

  return steps
}

/**
 * 式文字列を構築
 */
function buildFormula(
  innerSum: number,
  multiplier: number,
  additiveParts: number[],
  luckyMultiplier: number
): string {
  let formula = `(${innerSum}) × ${multiplier}`

  if (luckyMultiplier > 1) {
    formula += ` × ${luckyMultiplier}`
  }

  const additiveTotal = sumArray(additiveParts)
  if (additiveTotal > 0) {
    formula += ` + ${additiveTotal}`
  }

  return formula
}

/**
 * 配列の合計
 */
function sumArray(arr: number[]): number {
  return arr.reduce((sum, v) => sum + v, 0)
}

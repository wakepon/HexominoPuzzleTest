/**
 * スコアアニメーション用の式ステップ生成ロジック（A×B方式）
 *
 * ScoreBreakdown と relicDisplayOrder を受け取り、
 * ブロック点(A) × 列点(B) の形式で各効果の寄与を段階的に見せる FormulaStep[] を生成する。
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
 * A×B式文字列を構築
 */
function buildABFormula(blockPoints: number, linePoints: number): string {
  return `(${formatNum(blockPoints)}) × ${formatNum(linePoints)}`
}

/**
 * ScoreBreakdown と relicDisplayOrder から式ステップを生成（A×B方式）
 */
export function buildFormulaSteps(
  breakdown: ScoreBreakdown,
  relicDisplayOrder: readonly RelicId[]
): FormulaStep[] {
  const steps: FormulaStep[] = []

  // A (ブロック点), B (列点) を段階的に構築
  let a = breakdown.baseBlocks
  let b = breakdown.linesCleared

  // === 1. 基本式: (ブロック数) × ライン数 ===
  steps.push({
    type: 'base',
    label: '基本スコア',
    formula: buildABFormula(a, b),
    relicId: null,
  })

  // === 2. パターン効果 → Aが増加 ===
  if (breakdown.enhancedBonus > 0) {
    a += breakdown.enhancedBonus
    steps.push({
      type: 'pattern',
      label: 'エンハンスド',
      formula: buildABFormula(a, b),
      relicId: null,
    })
  }

  if (breakdown.auraBonus > 0) {
    a += breakdown.auraBonus
    steps.push({
      type: 'pattern',
      label: 'オーラ',
      formula: buildABFormula(a, b),
      relicId: null,
    })
  }

  if (breakdown.mossBonus > 0) {
    a += breakdown.mossBonus
    steps.push({
      type: 'pattern',
      label: 'モス',
      formula: buildABFormula(a, b),
      relicId: null,
    })
  }

  if (breakdown.chargeBonus > 0) {
    a += breakdown.chargeBonus
    steps.push({
      type: 'pattern',
      label: 'チャージ',
      formula: buildABFormula(a, b),
      relicId: null,
    })
  }

  // === 3. シール効果 ===
  // multiシール: Aに加算
  if (breakdown.multiBonus > 0) {
    a += breakdown.multiBonus
    steps.push({
      type: 'seal',
      label: 'マルチシール',
      formula: buildABFormula(a, b),
      relicId: null,
    })
  }

  // arrowシール: Aに加算
  if (breakdown.arrowBonus > 0) {
    a += breakdown.arrowBonus
    steps.push({
      type: 'seal',
      label: 'アローシール',
      formula: buildABFormula(a, b),
      relicId: null,
    })
  }

  // scoreシール: Aに加算
  if (breakdown.sealScoreBonus > 0) {
    a += breakdown.sealScoreBonus
    steps.push({
      type: 'seal',
      label: 'スコアシール',
      formula: buildABFormula(a, b),
      relicId: null,
    })
  }

  // === 4. レリック効果（relicDisplayOrder順） ===
  // 加算系レリック → Aに加算
  for (const relicId of relicDisplayOrder) {
    // サイズボーナス（加算系レリック）: 発動したレリックのみ
    if (relicId === breakdown.sizeBonusRelicId && breakdown.sizeBonusTotal > 0) {
      a += breakdown.sizeBonusTotal
      const def = getRelicDefinition(relicId)
      const label = def?.name ?? relicId
      steps.push({
        type: 'relic',
        label: `${label} +${breakdown.sizeBonusTotal}`,
        formula: buildABFormula(a, b),
        relicId,
      })
    }
    // コピーレリック: 加算系対象の直後にコピー分
    if (relicId === breakdown.copyTargetRelicId && breakdown.copyBonus > 0 && !isMultiplicativeRelic(relicId) && relicId !== ('script' as string)) {
      a += breakdown.copyBonus
      const targetDef = getRelicDefinition(relicId)
      const targetName = targetDef?.name ?? relicId
      steps.push({
        type: 'relic',
        label: `コピー (${targetName}) +${breakdown.copyBonus}`,
        formula: buildABFormula(a, b),
        relicId: 'copy' as RelicId,
      })
    }
  }

  // === 5. コンボ → Aに加算 ===
  if (breakdown.comboBonus > 0) {
    a += breakdown.comboBonus
    steps.push({
      type: 'pattern',
      label: 'コンボ',
      formula: buildABFormula(a, b),
      relicId: null,
    })
  }

  // === 6. lucky → Bに乗算 ===
  if (breakdown.luckyMultiplier > 1) {
    b *= breakdown.luckyMultiplier
    steps.push({
      type: 'pattern',
      label: 'ラッキー ×2!',
      formula: buildABFormula(a, b),
      relicId: null,
    })
  }

  // === 7. レリック効果（relicDisplayOrder順） → Bに影響 ===
  // 台本ライン数ボーナス・乗算レリック
  let effectiveLines = b
  for (const relicId of relicDisplayOrder) {
    // 台本: Bにライン数加算
    if (relicId === ('script' as string) && (breakdown.scriptLineBonus ?? 0) > 0) {
      effectiveLines += breakdown.scriptLineBonus
      const def = getRelicDefinition(relicId)
      const label = def?.name ?? relicId
      steps.push({
        type: 'relic',
        label: `${label} +${breakdown.scriptLineBonus}列`,
        formula: buildABFormula(a, effectiveLines),
        relicId,
      })
    }
    // コピーレリックが台本をコピー中
    if (relicId === ('script' as string) && breakdown.copyTargetRelicId === ('script' as string) && (breakdown.copyLineBonus ?? 0) > 0) {
      effectiveLines += breakdown.copyLineBonus
      const targetDef = getRelicDefinition(relicId)
      const targetName = targetDef?.name ?? relicId
      steps.push({
        type: 'relic',
        label: `コピー (${targetName}) +${breakdown.copyLineBonus}列`,
        formula: buildABFormula(a, effectiveLines),
        relicId: 'copy' as RelicId,
      })
    }

    // 乗算レリック: B列倍率（X列 → Y列 形式）
    if (isMultiplicativeRelic(relicId)) {
      const multiplier = getRelicMultiplier(relicId, breakdown)
      if (multiplier !== 1) {
        const beforeLines = effectiveLines
        effectiveLines *= multiplier
        const def = getRelicDefinition(relicId)
        const label = def?.name ?? relicId
        steps.push({
          type: 'relic',
          label: `${label} 列倍率×${formatNum(multiplier)}`,
          formula: `${formatNum(beforeLines)}列 → ${formatNum(effectiveLines)}列`,
          relicId,
        })
      }
    }
    // コピーレリック: 乗算系対象の直後にコピー分の乗算
    if (relicId === breakdown.copyTargetRelicId && breakdown.copyMultiplier > 1) {
      const beforeLines = effectiveLines
      effectiveLines *= breakdown.copyMultiplier
      const targetDef = getRelicDefinition(relicId)
      const targetName = targetDef?.name ?? relicId
      steps.push({
        type: 'relic',
        label: `コピー (${targetName}) 列倍率×${formatNum(breakdown.copyMultiplier)}`,
        formula: `${formatNum(beforeLines)}列 → ${formatNum(effectiveLines)}列`,
        relicId: 'copy' as RelicId,
      })
    }
  }

  // === 8. 最終結果 ===
  steps.push({
    type: 'result',
    label: '最終スコア',
    formula: `+${breakdown.finalScore}`,
    relicId: null,
  })

  return steps
}

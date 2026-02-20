/**
 * スコアアニメーション用の式ステップ生成ロジック（A×B方式）
 *
 * ScoreBreakdown と relicDisplayOrder を受け取り、
 * ブロック点(A) × 列点(B) の形式で各効果の寄与を段階的に見せる FormulaStep[] を生成する。
 */

import type { RelicId } from '../Core/Id'
import type { ScoreBreakdown } from '../Effect/PatternEffectTypes'
import type { FormulaStep } from './ScoreAnimationState'
import { getRelicModule } from '../Effect/Relics/RelicRegistry'
import { getRelicDefinition } from '../Effect/Relic'

/**
 * レリックの表示名を取得（レジストリ → 旧定義の順にフォールバック）
 */
function getRelicName(relicId: string): string {
  const module = getRelicModule(relicId)
  if (module) return module.definition.name
  const def = getRelicDefinition(relicId as RelicId)
  return def?.name ?? relicId
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

  if (breakdown.chargeBonus > 0) {
    a += breakdown.chargeBonus
    steps.push({
      type: 'pattern',
      label: 'チャージ',
      formula: buildABFormula(a, b),
      relicId: null,
    })
  }

  // === 2.5 バフ効果 → Aが増加 ===
  if (breakdown.buffEnhancementBonus > 0) {
    a += breakdown.buffEnhancementBonus
    steps.push({
      type: 'buff',
      label: `増強 +${breakdown.buffEnhancementBonus}`,
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

  // === 4. レリック効果（relicDisplayOrder順）===
  // 加算系レリック → Aに加算
  for (const relicId of relicDisplayOrder) {
    const module = getRelicModule(relicId)
    const effectValue = breakdown.relicEffects.get(relicId as string)

    // 加算系レリック
    if (module?.scoreEffect === 'additive' && effectValue !== undefined && effectValue > 0) {
      a += effectValue
      const label = getRelicName(relicId as string)
      steps.push({
        type: 'relic',
        label: `${label} +${effectValue}`,
        formula: buildABFormula(a, b),
        relicId,
      })
    }

    // コピーレリック: 加算系対象の直後にコピー分
    if ((relicId as string) === breakdown.copyTargetRelicId && module?.scoreEffect === 'additive') {
      const copyValue = breakdown.relicEffects.get('copy')
      if (copyValue !== undefined && copyValue > 0) {
        a += copyValue
        const targetName = getRelicName(relicId as string)
        steps.push({
          type: 'relic',
          label: `コピー (${targetName}) +${copyValue}`,
          formula: buildABFormula(a, b),
          relicId: 'copy' as RelicId,
        })
      }
    }
  }

  // === 5. lucky → Bに乗算 ===
  if (breakdown.luckyMultiplier > 1) {
    b *= breakdown.luckyMultiplier
    steps.push({
      type: 'pattern',
      label: 'ラッキー ×2!',
      formula: buildABFormula(a, b),
      relicId: null,
    })
  }

  // === 5.5 バフ効果 → Bが増加 ===
  if (breakdown.buffPulsationBonus > 0) {
    b += breakdown.buffPulsationBonus
    steps.push({
      type: 'buff',
      label: `脈動 +${breakdown.buffPulsationBonus}`,
      formula: buildABFormula(a, b),
      relicId: null,
    })
  }

  // === 6. レリック効果（relicDisplayOrder順） → Bに影響 ===
  let effectiveLines = b
  for (const relicId of relicDisplayOrder) {
    const module = getRelicModule(relicId)
    const effectValue = breakdown.relicEffects.get(relicId as string)

    // ライン加算系レリック: Bにライン数加算
    if (module?.scoreEffect === 'line_additive' && effectValue !== undefined && effectValue > 0) {
      effectiveLines += effectValue
      const label = getRelicName(relicId as string)
      steps.push({
        type: 'relic',
        label: `${label} +${effectValue}列`,
        formula: buildABFormula(a, effectiveLines),
        relicId,
      })
    }

    // コピーレリック: ライン加算系対象の直後にコピー分
    if ((relicId as string) === breakdown.copyTargetRelicId && module?.scoreEffect === 'line_additive') {
      const copyValue = breakdown.relicEffects.get('copy')
      if (copyValue !== undefined && copyValue > 0) {
        effectiveLines += copyValue
        const targetName = getRelicName(relicId as string)
        steps.push({
          type: 'relic',
          label: `コピー (${targetName}) +${copyValue}列`,
          formula: buildABFormula(a, effectiveLines),
          relicId: 'copy' as RelicId,
        })
      }
    }

    // 乗算レリック: B列点（X列 → Y列 形式）
    if (module?.scoreEffect === 'multiplicative' && effectValue !== undefined && effectValue !== 1) {
      const beforeLines = effectiveLines
      effectiveLines *= effectValue
      const label = getRelicName(relicId as string)
      steps.push({
        type: 'relic',
        label: `${label} 列点×${formatNum(effectValue)}`,
        formula: `${formatNum(beforeLines)}列 → ${formatNum(effectiveLines)}列`,
        relicId,
      })
    }

    // コピーレリック: 乗算系対象の直後にコピー分の乗算
    if ((relicId as string) === breakdown.copyTargetRelicId && module?.scoreEffect === 'multiplicative') {
      const copyValue = breakdown.relicEffects.get('copy')
      if (copyValue !== undefined && copyValue > 1) {
        const beforeLines = effectiveLines
        effectiveLines *= copyValue
        const targetName = getRelicName(relicId as string)
        steps.push({
          type: 'relic',
          label: `コピー (${targetName}) 列点×${formatNum(copyValue)}`,
          formula: `${formatNum(beforeLines)}列 → ${formatNum(effectiveLines)}列`,
          relicId: 'copy' as RelicId,
        })
      }
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

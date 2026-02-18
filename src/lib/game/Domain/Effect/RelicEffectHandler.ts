/**
 * レリック効果計算ハンドラー（純粋関数）
 */

import type { RelicId } from '../Core/Id'
import { type RelicType, RELIC_EFFECT_VALUES } from './Relic'
import type {
  RelicEffectContext,
  RelicActivationState,
  RelicEffectResult,
  ActivatedRelicInfo,
} from './RelicEffectTypes'
import type { CopyRelicState } from './RelicState'

/**
 * レリックを所持しているか判定
 */
export function hasRelic(
  ownedRelics: readonly RelicId[],
  relicType: RelicType
): boolean {
  return ownedRelics.includes(relicType as RelicId)
}

/**
 * レリック発動状態を判定
 */
export function checkRelicActivations(
  context: RelicEffectContext
): RelicActivationState {
  const {
    ownedRelics,
    totalLines,
    rowLines,
    colLines,
    placedBlockSize,
    isBoardEmptyAfterClear,
    relicMultiplierState,
    completedRows,
    completedCols,
    scriptRelicLines,
  } = context

  // 台本レリック: 指定ラインのマッチ数を計算
  let scriptMatchCount = 0
  if (hasRelic(ownedRelics, 'script') && scriptRelicLines && totalLines > 0) {
    const isLineCompleted = (target: { type: 'row' | 'col'; index: number }): boolean => {
      if (target.type === 'row') return completedRows.includes(target.index)
      return completedCols.includes(target.index)
    }
    if (isLineCompleted(scriptRelicLines.target1)) scriptMatchCount++
    if (isLineCompleted(scriptRelicLines.target2)) scriptMatchCount++
  }

  // サイズボーナス: 対応サイズのピースでライン消去
  const sizeBonusRelics: { type: RelicType; size: number }[] = [
    { type: 'size_bonus_1', size: 1 },
    { type: 'size_bonus_2', size: 2 },
    { type: 'size_bonus_3', size: 3 },
    { type: 'size_bonus_4', size: 4 },
    { type: 'size_bonus_5', size: 5 },
    { type: 'size_bonus_6', size: 6 },
  ]
  let sizeBonusActiveRelicId: RelicId | null = null
  if (totalLines > 0) {
    for (const { type, size } of sizeBonusRelics) {
      if (hasRelic(ownedRelics, type) && placedBlockSize === size) {
        sizeBonusActiveRelicId = type as RelicId
        break
      }
    }
  }

  return {
    // 既存レリック
    // 連鎖の達人: 消去ライン数が2以上
    chainMasterActive:
      hasRelic(ownedRelics, 'chain_master') && totalLines >= 2,

    // サイズボーナス: 対応サイズのピース配置でライン消去
    sizeBonusActiveRelicId,

    // 全消しボーナス: 盤面が空になった
    fullClearActive:
      hasRelic(ownedRelics, 'full_clear_bonus') && isBoardEmptyAfterClear,

    // 2-A: シングルライン: 1ラインのみ消去
    singleLineActive:
      hasRelic(ownedRelics, 'single_line') && totalLines === 1,

    // 2-B: タケノコ: 縦列のみ消去（rowLines === 0 && colLines >= 1）
    takenokoActive:
      hasRelic(ownedRelics, 'takenoko') && rowLines === 0 && colLines >= 1,
    takenokoCols: colLines,

    // 2-C: カニ: 横列のみ消去（colLines === 0 && rowLines >= 1）
    kaniActive:
      hasRelic(ownedRelics, 'kani') && colLines === 0 && rowLines >= 1,
    kaniRows: rowLines,

    // 2-D: 連射: ライン消去時に発動
    renshaActive: hasRelic(ownedRelics, 'rensha') && totalLines > 0,
    renshaMultiplier: relicMultiplierState.renshaMultiplier,

    // 2-E: のびのびタケノコ: 縦列のみ消去時に発動
    nobiTakenokoActive:
      hasRelic(ownedRelics, 'nobi_takenoko') && rowLines === 0 && colLines >= 1,
    nobiTakenokoMultiplier: relicMultiplierState.nobiTakenokoMultiplier,

    // 2-F: のびのびカニ: 横列のみ消去時に発動
    nobiKaniActive:
      hasRelic(ownedRelics, 'nobi_kani') && colLines === 0 && rowLines >= 1,
    nobiKaniMultiplier: relicMultiplierState.nobiKaniMultiplier,

    // 台本: 指定ラインが揃った
    scriptActive: scriptMatchCount > 0,
    scriptMatchCount,

    // タイミング: ボーナスタイミング中かつライン消去あり
    timingActive: hasRelic(ownedRelics, 'timing') && relicMultiplierState.timingBonusActive && totalLines > 0,
    timingMultiplier: RELIC_EFFECT_VALUES.TIMING_MULTIPLIER,
  }
}

/**
 * レリック効果を計算
 */
export function calculateRelicEffects(
  context: RelicEffectContext
): RelicEffectResult {
  const activations = checkRelicActivations(context)

  // 既存レリック
  const chainMasterMultiplier = activations.chainMasterActive
    ? RELIC_EFFECT_VALUES.CHAIN_MASTER_MULTIPLIER
    : 1.0
  const sizeBonusTotal = activations.sizeBonusActiveRelicId !== null
    ? RELIC_EFFECT_VALUES.SIZE_BONUS_SCORE
    : 0
  const fullClearMultiplier = activations.fullClearActive
    ? RELIC_EFFECT_VALUES.FULL_CLEAR_MULTIPLIER
    : 1

  // 2-A: シングルライン倍率
  const singleLineMultiplier = activations.singleLineActive
    ? RELIC_EFFECT_VALUES.SINGLE_LINE_MULTIPLIER
    : 1

  // 2-B: タケノコ倍率（発動時は消去した列数、それ以外は1）
  const takenokoMultiplier = activations.takenokoActive
    ? Math.max(1, activations.takenokoCols)
    : 1

  // 2-C: カニ倍率（発動時は消去した行数、それ以外は1）
  const kaniMultiplier = activations.kaniActive
    ? Math.max(1, activations.kaniRows)
    : 1

  // 2-D: 連射倍率（発動時は累積倍率、それ以外は1.0）
  const renshaMultiplier = activations.renshaActive
    ? activations.renshaMultiplier
    : 1.0

  // 2-E: のびのびタケノコ倍率
  const nobiTakenokoMultiplier = activations.nobiTakenokoActive
    ? activations.nobiTakenokoMultiplier
    : 1.0

  // 2-F: のびのびカニ倍率
  const nobiKaniMultiplier = activations.nobiKaniActive
    ? activations.nobiKaniMultiplier
    : 1.0

  // タイミング倍率
  const timingMultiplier = activations.timingActive
    ? activations.timingMultiplier
    : 1

  // 台本ボーナス: 2本同時=60, 1本=20, 0本=0
  const scriptBonus = activations.scriptMatchCount === 2
    ? RELIC_EFFECT_VALUES.SCRIPT_BONUS_DOUBLE
    : activations.scriptMatchCount === 1
      ? RELIC_EFFECT_VALUES.SCRIPT_BONUS_SINGLE
      : 0

  // コピーレリック効果計算
  const copyResult = calculateCopyRelicEffects(context, {
    chainMasterMultiplier,
    sizeBonusTotal,
    fullClearMultiplier,
    singleLineMultiplier,
    takenokoMultiplier,
    kaniMultiplier,
    renshaMultiplier,
    nobiTakenokoMultiplier,
    nobiKaniMultiplier,
    scriptBonus,
    timingMultiplier,
    activations,
  })

  return {
    activations,
    chainMasterMultiplier,
    sizeBonusTotal,
    fullClearMultiplier,
    totalRelicBonus: sizeBonusTotal + scriptBonus + copyResult.copyBonus,
    singleLineMultiplier,
    takenokoMultiplier,
    kaniMultiplier,
    renshaMultiplier,
    nobiTakenokoMultiplier,
    nobiKaniMultiplier,
    scriptBonus,
    timingMultiplier,
    copyTargetRelicId: copyResult.copyTargetRelicId,
    copyMultiplier: copyResult.copyMultiplier,
    copyBonus: copyResult.copyBonus,
  }
}

/**
 * コピーレリック効果の乗算倍率を取得（コピー独自カウンター使用）
 */
function getCopyMultiplierForTarget(
  targetRelicType: string,
  copyState: CopyRelicState,
  context: RelicEffectContext,
  originalEffects: {
    chainMasterMultiplier: number
    singleLineMultiplier: number
    takenokoMultiplier: number
    kaniMultiplier: number
    activations: RelicActivationState
  }
): number {
  switch (targetRelicType) {
    case 'chain_master':
      return originalEffects.activations.chainMasterActive
        ? RELIC_EFFECT_VALUES.CHAIN_MASTER_MULTIPLIER : 1
    case 'single_line':
      return originalEffects.activations.singleLineActive
        ? RELIC_EFFECT_VALUES.SINGLE_LINE_MULTIPLIER : 1
    case 'takenoko':
      return originalEffects.activations.takenokoActive
        ? Math.max(1, originalEffects.activations.takenokoCols) : 1
    case 'kani':
      return originalEffects.activations.kaniActive
        ? Math.max(1, originalEffects.activations.kaniRows) : 1
    case 'rensha': {
      // コピー独自カウンター
      const totalLines = context.totalLines
      if (totalLines > 0) return copyState.renshaMultiplier
      return 1
    }
    case 'nobi_takenoko': {
      if (context.rowLines === 0 && context.colLines >= 1)
        return copyState.nobiTakenokoMultiplier
      return 1
    }
    case 'nobi_kani': {
      if (context.colLines === 0 && context.rowLines >= 1)
        return copyState.nobiKaniMultiplier
      return 1
    }
    case 'timing': {
      // コピー独自カウンター
      if (copyState.timingBonusActive && context.totalLines > 0)
        return RELIC_EFFECT_VALUES.TIMING_MULTIPLIER
      return 1
    }
    case 'full_clear_bonus':
      return originalEffects.activations.fullClearActive
        ? RELIC_EFFECT_VALUES.FULL_CLEAR_MULTIPLIER : 1
    default:
      return 1
  }
}

/**
 * コピーレリック効果の加算ボーナスを取得
 */
function getCopyBonusForTarget(
  targetRelicType: string,
  originalEffects: {
    sizeBonusTotal: number
    scriptBonus: number
    activations: RelicActivationState
  }
): number {
  switch (targetRelicType) {
    case 'size_bonus_1': case 'size_bonus_2': case 'size_bonus_3':
    case 'size_bonus_4': case 'size_bonus_5': case 'size_bonus_6':
      return originalEffects.sizeBonusTotal
    case 'script':
      // 台本コピー: 指定ラインは増やさず、ボーナスのみ2重
      return originalEffects.scriptBonus
    default:
      return 0
  }
}

/**
 * コピーレリック効果を計算
 */
function calculateCopyRelicEffects(
  context: RelicEffectContext,
  originalEffects: {
    chainMasterMultiplier: number
    sizeBonusTotal: number
    fullClearMultiplier: number
    singleLineMultiplier: number
    takenokoMultiplier: number
    kaniMultiplier: number
    renshaMultiplier: number
    nobiTakenokoMultiplier: number
    nobiKaniMultiplier: number
    scriptBonus: number
    timingMultiplier: number
    activations: RelicActivationState
  }
): { copyTargetRelicId: RelicId | null; copyMultiplier: number; copyBonus: number } {
  const copyState = context.copyRelicState
  if (!copyState || !copyState.targetRelicId) {
    return { copyTargetRelicId: null, copyMultiplier: 1, copyBonus: 0 }
  }

  const targetType = copyState.targetRelicId as string

  // 乗算レリックのコピー
  const copyMultiplier = getCopyMultiplierForTarget(targetType, copyState, context, originalEffects)

  // 加算レリックのコピー
  const copyBonus = getCopyBonusForTarget(targetType, originalEffects)

  return {
    copyTargetRelicId: copyState.targetRelicId,
    copyMultiplier,
    copyBonus,
  }
}

/**
 * 発動したレリック情報を取得（エフェクト表示用）
 */
export function getActivatedRelics(
  result: RelicEffectResult
): ActivatedRelicInfo[] {
  const activated: ActivatedRelicInfo[] = []

  // 既存レリック
  if (result.activations.chainMasterActive) {
    activated.push({
      relicId: 'chain_master' as RelicId,
      bonusValue: '×1.5',
    })
  }

  if (result.activations.sizeBonusActiveRelicId) {
    activated.push({
      relicId: result.activations.sizeBonusActiveRelicId,
      bonusValue: result.sizeBonusTotal,
    })
  }

  if (result.activations.fullClearActive) {
    activated.push({
      relicId: 'full_clear_bonus' as RelicId,
      bonusValue: `×${result.fullClearMultiplier}`,
    })
  }

  // 2-A: シングルライン
  if (result.activations.singleLineActive) {
    activated.push({
      relicId: 'single_line' as RelicId,
      bonusValue: `×${RELIC_EFFECT_VALUES.SINGLE_LINE_MULTIPLIER}`,
    })
  }

  // 2-B: タケノコ
  if (result.activations.takenokoActive) {
    activated.push({
      relicId: 'takenoko' as RelicId,
      bonusValue: `×${result.takenokoMultiplier}`,
    })
  }

  // 2-C: カニ
  if (result.activations.kaniActive) {
    activated.push({
      relicId: 'kani' as RelicId,
      bonusValue: `×${result.kaniMultiplier}`,
    })
  }

  // 2-D: 連射
  if (result.activations.renshaActive) {
    activated.push({
      relicId: 'rensha' as RelicId,
      bonusValue: `×${result.renshaMultiplier}`,
    })
  }

  // 2-E: のびのびタケノコ
  if (result.activations.nobiTakenokoActive) {
    activated.push({
      relicId: 'nobi_takenoko' as RelicId,
      bonusValue: `×${result.nobiTakenokoMultiplier}`,
    })
  }

  // 2-F: のびのびカニ
  if (result.activations.nobiKaniActive) {
    activated.push({
      relicId: 'nobi_kani' as RelicId,
      bonusValue: `×${result.nobiKaniMultiplier}`,
    })
  }

  // 台本
  if (result.activations.scriptActive) {
    activated.push({
      relicId: 'script' as RelicId,
      bonusValue: result.scriptBonus,
    })
  }

  // タイミング
  if (result.activations.timingActive) {
    activated.push({
      relicId: 'timing' as RelicId,
      bonusValue: `×${result.timingMultiplier}`,
    })
  }

  // コピーレリック
  if (result.copyTargetRelicId) {
    if (result.copyMultiplier > 1) {
      activated.push({
        relicId: 'copy' as RelicId,
        bonusValue: `×${Number.isInteger(result.copyMultiplier) ? result.copyMultiplier : result.copyMultiplier.toFixed(1)}`,
      })
    } else if (result.copyBonus > 0) {
      activated.push({
        relicId: 'copy' as RelicId,
        bonusValue: result.copyBonus,
      })
    }
  }

  return activated
}

/**
 * レリック効果をスコアに適用
 * 適用順序: 基本スコア → 乗算レリック（連鎖の達人、全消し等） → 加算レリック（サイズボーナス、台本）
 */
export function applyRelicEffectsToScore(
  baseScore: number,
  relicEffects: RelicEffectResult
): number {
  // 連鎖の達人: ×1.5（切り捨て）
  let score = Math.floor(baseScore * relicEffects.chainMasterMultiplier)

  // 全消し倍率（他の乗算レリックと同じ扱い）
  score = Math.floor(score * relicEffects.fullClearMultiplier)

  // サイズボーナス: +20
  score += relicEffects.sizeBonusTotal

  // 台本ボーナス
  score += relicEffects.scriptBonus

  return score
}

/**
 * ScoreBreakdownから発動したレリック情報を取得（エフェクト表示用）
 * calculateRelicEffectsの重複呼び出しを避けるために使用
 */
export function getActivatedRelicsFromScoreBreakdown(scoreBreakdown: {
  readonly chainMasterMultiplier: number
  readonly sizeBonusTotal: number
  readonly sizeBonusRelicId: RelicId | null
  readonly fullClearMultiplier: number
  readonly singleLineMultiplier?: number
  readonly takenokoMultiplier?: number
  readonly kaniMultiplier?: number
  readonly renshaMultiplier?: number
  readonly nobiTakenokoMultiplier?: number
  readonly nobiKaniMultiplier?: number
  readonly scriptBonus?: number
  readonly timingMultiplier?: number
  readonly copyTargetRelicId?: RelicId | null
  readonly copyMultiplier?: number
  readonly copyBonus?: number
}): ActivatedRelicInfo[] {
  const activated: ActivatedRelicInfo[] = []

  // 既存レリック
  if (scoreBreakdown.chainMasterMultiplier > 1) {
    activated.push({
      relicId: 'chain_master' as RelicId,
      bonusValue: '×1.5',
    })
  }

  if (scoreBreakdown.sizeBonusTotal > 0 && scoreBreakdown.sizeBonusRelicId) {
    activated.push({
      relicId: scoreBreakdown.sizeBonusRelicId,
      bonusValue: scoreBreakdown.sizeBonusTotal,
    })
  }

  if (scoreBreakdown.fullClearMultiplier > 1) {
    activated.push({
      relicId: 'full_clear_bonus' as RelicId,
      bonusValue: `×${scoreBreakdown.fullClearMultiplier}`,
    })
  }

  // 2-A: シングルライン
  if (scoreBreakdown.singleLineMultiplier && scoreBreakdown.singleLineMultiplier > 1) {
    activated.push({
      relicId: 'single_line' as RelicId,
      bonusValue: `×${RELIC_EFFECT_VALUES.SINGLE_LINE_MULTIPLIER}`,
    })
  }

  // 2-B: タケノコ
  if (scoreBreakdown.takenokoMultiplier && scoreBreakdown.takenokoMultiplier > 1) {
    activated.push({
      relicId: 'takenoko' as RelicId,
      bonusValue: `×${scoreBreakdown.takenokoMultiplier}`,
    })
  }

  // 2-C: カニ
  if (scoreBreakdown.kaniMultiplier && scoreBreakdown.kaniMultiplier > 1) {
    activated.push({
      relicId: 'kani' as RelicId,
      bonusValue: `×${scoreBreakdown.kaniMultiplier}`,
    })
  }

  // 2-D: 連射
  if (scoreBreakdown.renshaMultiplier && scoreBreakdown.renshaMultiplier > 1) {
    activated.push({
      relicId: 'rensha' as RelicId,
      bonusValue: `×${scoreBreakdown.renshaMultiplier}`,
    })
  }

  // 2-E: のびのびタケノコ
  if (scoreBreakdown.nobiTakenokoMultiplier && scoreBreakdown.nobiTakenokoMultiplier > 1) {
    activated.push({
      relicId: 'nobi_takenoko' as RelicId,
      bonusValue: `×${scoreBreakdown.nobiTakenokoMultiplier}`,
    })
  }

  // 2-F: のびのびカニ
  if (scoreBreakdown.nobiKaniMultiplier && scoreBreakdown.nobiKaniMultiplier > 1) {
    activated.push({
      relicId: 'nobi_kani' as RelicId,
      bonusValue: `×${scoreBreakdown.nobiKaniMultiplier}`,
    })
  }

  // 台本
  if (scoreBreakdown.scriptBonus && scoreBreakdown.scriptBonus > 0) {
    activated.push({
      relicId: 'script' as RelicId,
      bonusValue: scoreBreakdown.scriptBonus,
    })
  }

  // タイミング
  if (scoreBreakdown.timingMultiplier && scoreBreakdown.timingMultiplier > 1) {
    activated.push({
      relicId: 'timing' as RelicId,
      bonusValue: `×${scoreBreakdown.timingMultiplier}`,
    })
  }

  // コピーレリック
  if (scoreBreakdown.copyTargetRelicId) {
    if (scoreBreakdown.copyMultiplier && scoreBreakdown.copyMultiplier > 1) {
      const m = scoreBreakdown.copyMultiplier
      activated.push({
        relicId: 'copy' as RelicId,
        bonusValue: `×${Number.isInteger(m) ? m : m.toFixed(1)}`,
      })
    } else if (scoreBreakdown.copyBonus && scoreBreakdown.copyBonus > 0) {
      activated.push({
        relicId: 'copy' as RelicId,
        bonusValue: scoreBreakdown.copyBonus,
      })
    }
  }

  return activated
}

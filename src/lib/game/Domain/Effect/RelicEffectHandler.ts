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
  } = context

  return {
    // 既存レリック
    // 連鎖の達人: 消去ライン数が2以上
    chainMasterActive:
      hasRelic(ownedRelics, 'chain_master') && totalLines >= 2,

    // 小さな幸運: 3ブロックピース配置でライン消去
    smallLuckActive:
      hasRelic(ownedRelics, 'small_luck') &&
      placedBlockSize === 3 &&
      totalLines > 0,

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
  const smallLuckBonus = activations.smallLuckActive
    ? RELIC_EFFECT_VALUES.SMALL_LUCK_BONUS
    : 0
  const fullClearBonus = activations.fullClearActive
    ? RELIC_EFFECT_VALUES.FULL_CLEAR_BONUS
    : 0

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

  return {
    activations,
    chainMasterMultiplier,
    smallLuckBonus,
    fullClearBonus,
    totalRelicBonus: smallLuckBonus + fullClearBonus,
    singleLineMultiplier,
    takenokoMultiplier,
    kaniMultiplier,
    renshaMultiplier,
    nobiTakenokoMultiplier,
    nobiKaniMultiplier,
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

  if (result.activations.smallLuckActive) {
    activated.push({
      relicId: 'small_luck' as RelicId,
      bonusValue: result.smallLuckBonus,
    })
  }

  if (result.activations.fullClearActive) {
    activated.push({
      relicId: 'full_clear_bonus' as RelicId,
      bonusValue: result.fullClearBonus,
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

  return activated
}

/**
 * レリック効果をスコアに適用
 * 適用順序: 基本スコア → 連鎖の達人(×1.5) → 小さな幸運(+20) → 全消しボーナス(+20)
 */
export function applyRelicEffectsToScore(
  baseScore: number,
  relicEffects: RelicEffectResult
): number {
  // 連鎖の達人: ×1.5（切り捨て）
  let score = Math.floor(baseScore * relicEffects.chainMasterMultiplier)

  // 小さな幸運: +20
  score += relicEffects.smallLuckBonus

  // 全消しボーナス: +20
  score += relicEffects.fullClearBonus

  return score
}

/**
 * ScoreBreakdownから発動したレリック情報を取得（エフェクト表示用）
 * calculateRelicEffectsの重複呼び出しを避けるために使用
 */
export function getActivatedRelicsFromScoreBreakdown(scoreBreakdown: {
  readonly chainMasterMultiplier: number
  readonly smallLuckBonus: number
  readonly fullClearBonus: number
  readonly singleLineMultiplier?: number
  readonly takenokoMultiplier?: number
  readonly kaniMultiplier?: number
  readonly renshaMultiplier?: number
  readonly nobiTakenokoMultiplier?: number
  readonly nobiKaniMultiplier?: number
}): ActivatedRelicInfo[] {
  const activated: ActivatedRelicInfo[] = []

  // 既存レリック
  if (scoreBreakdown.chainMasterMultiplier > 1) {
    activated.push({
      relicId: 'chain_master' as RelicId,
      bonusValue: '×1.5',
    })
  }

  if (scoreBreakdown.smallLuckBonus > 0) {
    activated.push({
      relicId: 'small_luck' as RelicId,
      bonusValue: scoreBreakdown.smallLuckBonus,
    })
  }

  if (scoreBreakdown.fullClearBonus > 0) {
    activated.push({
      relicId: 'full_clear_bonus' as RelicId,
      bonusValue: scoreBreakdown.fullClearBonus,
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

  return activated
}

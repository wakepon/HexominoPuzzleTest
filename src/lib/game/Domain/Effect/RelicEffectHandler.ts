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
function hasRelic(
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
  const { ownedRelics, totalLines, placedBlockSize, isBoardEmptyAfterClear } =
    context

  return {
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
  }
}

/**
 * レリック効果を計算
 */
export function calculateRelicEffects(
  context: RelicEffectContext
): RelicEffectResult {
  const activations = checkRelicActivations(context)

  const chainMasterMultiplier = activations.chainMasterActive
    ? RELIC_EFFECT_VALUES.CHAIN_MASTER_MULTIPLIER
    : 1.0
  const smallLuckBonus = activations.smallLuckActive
    ? RELIC_EFFECT_VALUES.SMALL_LUCK_BONUS
    : 0
  const fullClearBonus = activations.fullClearActive
    ? RELIC_EFFECT_VALUES.FULL_CLEAR_BONUS
    : 0

  return {
    activations,
    chainMasterMultiplier,
    smallLuckBonus,
    fullClearBonus,
    totalRelicBonus: smallLuckBonus + fullClearBonus,
  }
}

/**
 * 発動したレリック情報を取得（エフェクト表示用）
 */
export function getActivatedRelics(
  result: RelicEffectResult
): ActivatedRelicInfo[] {
  const activated: ActivatedRelicInfo[] = []

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
}): ActivatedRelicInfo[] {
  const activated: ActivatedRelicInfo[] = []

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

  return activated
}

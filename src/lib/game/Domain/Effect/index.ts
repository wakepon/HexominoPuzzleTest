/**
 * Effect層の公開API
 */

// 型
export type { PatternId, SealId, RelicId } from './EffectTypes'

// パターン
export type { PatternType, PatternDefinition } from './Pattern'
export {
  PATTERN_DEFINITIONS,
  getPatternDefinition,
  SHOP_AVAILABLE_PATTERNS,
} from './Pattern'

// シール
export type { SealType, SealDefinition } from './Seal'
export { SEAL_DEFINITIONS, getSealDefinition, SHOP_AVAILABLE_SEALS } from './Seal'

// レリック
export type { RelicRarity, RelicType, RelicDefinition } from './Relic'
export { RELIC_DEFINITIONS, getRelicDefinition, RELIC_EFFECT_VALUES } from './Relic'

// レリック状態
export type { RelicMultiplierState } from './RelicState'
export { INITIAL_RELIC_MULTIPLIER_STATE } from './RelicState'

// パターン効果
export type {
  PatternEffectResult,
  ScoreBreakdown,
  ComboState,
} from './PatternEffectTypes'
export {
  calculateEnhancedBonus,
  calculateAuraBonus,
  calculateMossBonus,
  rollLuckyMultiplier,
  calculateComboBonus,
  hasComboPattern,
  calculatePatternEffects,
  calculateScoreBreakdown,
} from './PatternEffectHandler'

// シール効果
export type { SealEffectResult } from './SealEffectTypes'
export {
  filterClearableCells,
  calculateGoldCount,
  calculateScoreBonus,
  calculateMultiBonus,
  calculateSealEffects,
} from './SealEffectHandler'

// レリック効果
export type {
  RelicEffectContext,
  RelicActivationState,
  RelicEffectResult,
  ActivatedRelicInfo,
} from './RelicEffectTypes'
export {
  checkRelicActivations,
  calculateRelicEffects,
  getActivatedRelics,
  applyRelicEffectsToScore,
  getActivatedRelicsFromScoreBreakdown,
} from './RelicEffectHandler'

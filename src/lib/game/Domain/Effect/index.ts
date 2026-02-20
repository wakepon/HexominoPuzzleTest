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
export { RELIC_DEFINITIONS, getRelicDefinition } from './Relic'

// レリック状態
export type { RelicMultiplierState } from './RelicState'
export { INITIAL_RELIC_MULTIPLIER_STATE } from './RelicState'

// パターン効果
export type {
  PatternEffectResult,
  ScoreBreakdown,
} from './PatternEffectTypes'
export {
  calculateEnhancedBonus,
  rollLuckyMultiplier,
  calculatePatternEffects,
  calculateScoreBreakdown,
} from './PatternEffectHandler'

// シール効果
export type { SealEffectResult } from './SealEffectTypes'
export {
  filterClearableCells,
  calculateGoldCount,
  calculateMultiBonus,
  calculateSealEffects,
} from './SealEffectHandler'

// 台本レリック状態
export type { ScriptLineTarget, ScriptRelicLines } from './ScriptRelicState'
export { generateScriptLines } from './ScriptRelicState'

// レリック効果
export type {
  RelicEffectContext,
  ActivatedRelicInfo,
} from './RelicEffectTypes'
export {
  getActivatedRelicsFromScoreBreakdown,
} from './RelicEffectHandler'

// レリックモジュールレジストリ
export type { RelicModule, RelicContext, RelicActivation, ScoreEffectType } from './Relics/RelicModule'
export { getRelicModule, getAllRelicModules, getRelicDefinitionFromRegistry } from './Relics/RelicRegistry'
export { initializeRelicRegistry } from './Relics/index'
export { evaluateRelicEffects, evaluateCopyRelicEffect } from './Relics/RelicEffectEngine'
export { dispatchRelicStateEvent, dispatchOnPiecePlaced } from './Relics/RelicStateDispatcher'

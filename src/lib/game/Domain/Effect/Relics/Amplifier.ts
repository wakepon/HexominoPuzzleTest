/**
 * アンプリファイア
 * enhancedパターン（★）のブロック点ボーナスを+2から+5に強化
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** amplifier所持時のenhancedボーナス値 */
export const AMPLIFIED_ENHANCED_BONUS = 5

/** デフォルトのenhancedボーナス値 */
export const DEFAULT_ENHANCED_BONUS = 2

export const amplifierRelic: RelicModule = {
  type: 'amplifier',
  definition: {
    name: 'アンプリファイア',
    description: 'enhancedパターン（★）のブロック点ボーナスを+2から+5に強化',
    rarity: 'epic',
    price: 25,
    icon: '🔊',
  },
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    // 常時発動（enhancedボーナス値の変更は PatternEffectHandler 側で処理）
    return {
      active: true,
      value: AMPLIFIED_ENHANCED_BONUS,
      displayLabel: `★+${AMPLIFIED_ENHANCED_BONUS}`,
    }
  },
}

/**
 * 羅針盤（コンパスローズ）
 * arrow_v/arrow_hシールのボーナスを+10から+20に強化
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** compass_rose所持時のarrowシールボーナス値 */
export const COMPASS_ROSE_ARROW_BONUS = 20

/** デフォルトのarrowシールボーナス値 */
export const DEFAULT_ARROW_BONUS = 10

export const compassRoseRelic: RelicModule = {
  type: 'compass_rose',
  definition: {
    name: '羅針盤',
    description: 'arrow_v/arrow_hシールのボーナスを+10から+20に強化',
    rarity: 'uncommon',
    price: 15,
    icon: '🗺️',
  },
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    // 常時発動（arrowボーナス値の変更はSealEffectHandler側で処理）
    return {
      active: true,
      value: COMPASS_ROSE_ARROW_BONUS,
      displayLabel: `↕↔+${COMPASS_ROSE_ARROW_BONUS}`,
    }
  },
}

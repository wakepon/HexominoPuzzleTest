/**
 * プリズム
 * multiシール（×2）の効果を×3に強化
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** prism所持時のmultiシール乗数 */
export const PRISM_MULTI_MULTIPLIER = 3

/** デフォルトのmultiシール乗数 */
export const DEFAULT_MULTI_MULTIPLIER = 2

export const prismRelic: RelicModule = {
  type: 'prism',
  definition: {
    name: 'プリズム',
    description: 'multiシール（×2）の効果を×3に強化',
    rarity: 'rare',
    price: 20,
    icon: '🔻',
  },
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    // 常時発動（multiシール効果値の変更はHandler側で処理）
    return {
      active: true,
      value: PRISM_MULTI_MULTIPLIER,
      displayLabel: `×${PRISM_MULTI_MULTIPLIER}`,
    }
  },
}

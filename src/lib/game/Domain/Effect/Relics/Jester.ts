/**
 * 道化師（ジェスター）
 * レリック枠が1枠減少する代わりに、ショップで全商品が30%OFF
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** jester所持時のレリック枠減少数 */
export const JESTER_SLOT_REDUCTION = 1

/** jester所持時のショップ割引率 (30%) */
export const JESTER_DISCOUNT_RATE = 0.3

export const jesterRelic: RelicModule = {
  type: 'jester',
  definition: {
    name: '道化師',
    description: 'レリック枠が1枠減少する代わりに、ショップで全商品が30%OFF',
    rarity: 'rare',
    price: 20,
    icon: '🃎',
  },
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    // 常時発動（効果はReducer/ショップ側で処理）
    return {
      active: true,
      value: 0,
      displayLabel: '',
    }
  },
}

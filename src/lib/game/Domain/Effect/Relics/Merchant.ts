/**
 * 商人（Merchant）
 * ショップのリロール費用を-2G削減（最小0G）
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** リロール費用の割引額 */
export const MERCHANT_REROLL_DISCOUNT = 2

export const merchantRelic: RelicModule = {
  type: 'merchant',
  definition: {
    name: '商人',
    description: 'ショップのリロール費用を-2G',
    rarity: 'uncommon',
    price: 15,
    icon: '🏪',
  },
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    // 商人はスコア効果なし。ショップのリロール費用削減はShopServiceで処理
    return { active: false, value: 0, displayLabel: '' }
  },
}

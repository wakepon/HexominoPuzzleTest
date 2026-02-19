/**
 * 手札ストック
 * ストック枠が出現し、ブロックを1つ保管可能
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

export const handStockRelic: RelicModule = {
  type: 'hand_stock',
  definition: {
    name: '手札ストック',
    description: 'ストック枠が出現し、ブロックを1つ保管可能',
    rarity: 'epic',
    price: 25,
    icon: '📦',
  },
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    // 手札ストックはスコア効果なし。UI側で処理
    return { active: false, value: 0, displayLabel: '' }
  },
}

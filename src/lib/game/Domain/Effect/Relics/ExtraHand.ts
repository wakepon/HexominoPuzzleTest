/**
 * 追加ハンド（ExtraHand）
 * ラウンド中のハンド数が+2（12→14回）
 * scoreEffect: 'none' - スコアに影響せず、RoundServiceでハンド数を増加
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** ハンド数の増加分 */
export const EXTRA_HAND_BONUS = 2

export const extraHandRelic: RelicModule = {
  type: 'extra_hand',
  definition: {
    name: '追加ハンド',
    description: 'ラウンド中のハンド数が+2',
    rarity: 'epic',
    price: 25,
    icon: '✋',
  },
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    // 追加ハンドはスコア効果なし。ハンド数増加はRoundServiceで処理
    return { active: false, value: 0, displayLabel: '' }
  },
}

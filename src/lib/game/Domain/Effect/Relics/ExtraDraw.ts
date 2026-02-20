/**
 * 追加ドロー（ExtraDraw）
 * ドロー枚数が+1（3→4枚）
 * scoreEffect: 'none' - スコアに影響せず、RoundServiceでドロー枚数を増加
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** ドロー枚数の増加分 */
export const EXTRA_DRAW_BONUS = 1

export const extraDrawRelic: RelicModule = {
  type: 'extra_draw',
  definition: {
    name: '追加ドロー',
    description: 'ドロー枚数が+1',
    rarity: 'epic',
    price: 25,
    icon: '🃏',
  },
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    // 追加ドローはスコア効果なし。ドロー枚数増加はRoundServiceで処理
    return { active: false, value: 0, displayLabel: '' }
  },
}

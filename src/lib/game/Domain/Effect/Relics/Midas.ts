/**
 * ミダス（Midas）
 * 全消し（盤面を完全に空にした）時に+5G獲得
 * scoreEffect: 'none' - スコアに影響せず、Reducerでゴールド加算処理
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** 全消し時の追加ゴールド */
export const MIDAS_GOLD_BONUS = 5

export const midasRelic: RelicModule = {
  type: 'midas',
  definition: {
    name: 'ミダス',
    description: '全消し時に+5G獲得',
    rarity: 'uncommon',
    price: 15,
    icon: '✨',
  },
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    // ミダスはスコア効果なし。ゴールド加算はReducerで処理
    return { active: false, value: 0, displayLabel: '' }
  },
}

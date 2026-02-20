/**
 * トレジャーハンター（TreasureHunter）
 * ゴールドシール（G）付きブロック消去時、追加で+1G
 * scoreEffect: 'none' - スコアに影響せず、Reducerでゴールド加算処理
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** ゴールドシール1個あたりの追加ゴールド */
export const TREASURE_HUNTER_GOLD_BONUS = 1

export const treasureHunterRelic: RelicModule = {
  type: 'treasure_hunter',
  definition: {
    name: 'トレジャーハンター',
    description: 'ゴールドシール（G）付きブロック消去時、追加で+1G',
    rarity: 'common',
    price: 10,
    icon: '💎',
  },
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    // トレジャーハンターはスコア効果なし。ゴールド加算はReducerで処理
    return { active: false, value: 0, displayLabel: '' }
  },
}

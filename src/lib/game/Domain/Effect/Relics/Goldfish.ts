/**
 * 金魚（ゴールドフィッシュ）
 * ラウンドクリア時にスコアが目標の2倍以上だった場合、+3G
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** goldfish発動時のゴールドボーナス */
export const GOLDFISH_GOLD_BONUS = 3

/** スコアが目標の何倍以上で発動するか */
export const GOLDFISH_SCORE_MULTIPLIER = 2

export const goldfishRelic: RelicModule = {
  type: 'goldfish',
  definition: {
    name: '金魚',
    description: 'ラウンドクリア時にスコアが目標の2倍以上で+3G',
    rarity: 'common',
    price: 10,
    icon: '🐠',
  },
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    // スコアには直接影響しない（Reducer側でラウンドクリア時にゴールド加算）
    return { active: false, value: 0, displayLabel: '' }
  },
}

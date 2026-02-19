/**
 * 火山
 * ラウンド中にブロックが消えなかった場合、ハンド0で全消去（ブロック数×フィールド最大列数）
 */

import type {
  RelicModule,
  RelicContext,
  RelicActivation,
  RelicHookContext,
  RelicHookResult,
} from './RelicModule'

export const volcanoRelic: RelicModule = {
  type: 'volcano',
  definition: {
    name: '火山',
    description: 'ラウンド中にブロックが消えなかった場合、ハンド0で全消去（ブロック数×フィールド最大列数）',
    rarity: 'uncommon',
    price: 15,
    icon: '🌋',
  },
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    // 火山はスコア効果なし。発動はReducerフックで処理
    return { active: false, value: 0, displayLabel: '' }
  },

  onPiecePlaced(ctx: RelicHookContext): RelicHookResult {
    // ゲームオーバー時かつ火山発動可能な場合にトリガー
    if (ctx.phase === 'game_over' && ctx.volcanoEligible) {
      return { type: 'update_state', newRelicState: null }
    }
    return null
  },

  onRoundStart(_ctx: RelicHookContext): RelicHookResult {
    // ラウンド開始時にvolcanoEligibleをリセット（GameState側で処理）
    return null
  },
}

/**
 * ギャンブラー
 * ライン消去時、ランダムに列数+N(0~3)を加算
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** ランダムボーナスの最大値（0〜MAX_BONUSの範囲） */
const MAX_BONUS = 3

export const gamblerRelic: RelicModule = {
  type: 'gambler',
  definition: {
    name: 'ギャンブラー',
    description: 'ライン消去時、ランダムに列数+0〜3',
    rarity: 'uncommon',
    price: 15,
    icon: '🎰',
  },
  scoreEffect: 'line_additive',

  checkActivation(ctx: RelicContext): RelicActivation {
    if (ctx.totalLines <= 0) {
      return { active: false, value: 0, displayLabel: '' }
    }

    // 0〜3のランダム値を決定
    const bonus = Math.floor(Math.random() * (MAX_BONUS + 1))
    const active = bonus > 0

    return {
      active,
      value: bonus,
      displayLabel: active ? `列数+${bonus}` : '',
    }
  },
}

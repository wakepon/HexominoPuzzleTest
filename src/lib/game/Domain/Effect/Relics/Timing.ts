/**
 * タイミング
 * 残りハンド数が3で割り切れるとき、列点×3
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

const MULTIPLIER = 3

export const timingRelic: RelicModule = {
  type: 'timing',
  definition: {
    name: 'タイミング',
    description: '残りハンド数が3で割り切れるとき、列点×3',
    rarity: 'uncommon',
    price: 15,
    icon: '⌛',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.remainingHands % 3 === 0 && ctx.totalLines > 0
    return {
      active,
      value: active ? MULTIPLIER : 1,
      displayLabel: active ? `列点×${MULTIPLIER}` : '',
    }
  },
}

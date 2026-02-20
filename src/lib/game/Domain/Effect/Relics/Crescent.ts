/**
 * 三日月
 * 残りハンド数が奇数の時、列点×1.5
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

export const crescentRelic: RelicModule = {
  type: 'crescent',
  definition: {
    name: '三日月',
    description: '残りハンド数が奇数の時、列点×1.5',
    rarity: 'uncommon',
    price: 15,
    icon: '🌙',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.remainingHands % 2 === 1 && ctx.totalLines > 0
    const value = active ? 1.5 : 1
    return {
      active,
      value,
      displayLabel: active ? `列点×${value}` : '',
    }
  },
}

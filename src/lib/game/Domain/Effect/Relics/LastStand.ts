/**
 * ラストスタンド
 * 残りハンド数が2以下の時、列点×4
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

export const lastStandRelic: RelicModule = {
  type: 'last_stand',
  definition: {
    name: 'ラストスタンド',
    description: '残りハンド数が2以下の時、列点×4',
    rarity: 'rare',
    price: 20,
    icon: '🔥',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.remainingHands <= 2 && ctx.totalLines > 0
    const value = active ? 4 : 1
    return {
      active,
      value,
      displayLabel: active ? `列点×${value}` : '',
    }
  },
}

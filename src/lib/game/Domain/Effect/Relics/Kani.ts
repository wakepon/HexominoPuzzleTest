/**
 * カニ
 * 横列のみ揃った時、列点×揃った行数
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

export const kaniRelic: RelicModule = {
  type: 'kani',
  definition: {
    name: 'カニ',
    description: '横列のみ揃った時、列点×揃った行数',
    rarity: 'common',
    price: 10,
    icon: '🦀',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.colLines === 0 && ctx.rowLines >= 1
    const value = active ? Math.max(1, ctx.rowLines) : 1
    return {
      active,
      value,
      displayLabel: active ? `列点×${value}` : '',
    }
  },
}

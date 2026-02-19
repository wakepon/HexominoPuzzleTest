/**
 * タケノコ
 * 縦列のみ揃った時、列点×揃った列数
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

export const takenokoRelic: RelicModule = {
  type: 'takenoko',
  definition: {
    name: 'タケノコ',
    description: '縦列のみ揃った時、列点×揃った列数',
    rarity: 'common',
    price: 10,
    icon: '🎋',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.rowLines === 0 && ctx.colLines >= 1
    const value = active ? Math.max(1, ctx.colLines) : 1
    return {
      active,
      value,
      displayLabel: active ? `列点×${value}` : '',
    }
  },
}

/**
 * シンメトリー
 * 消去した行数と列数が同数の時、列点×2
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

export const symmetryRelic: RelicModule = {
  type: 'symmetry',
  definition: {
    name: 'シンメトリー',
    description: '消去した行数と列数が同数の時、列点×2',
    rarity: 'uncommon',
    price: 15,
    icon: '⚖️',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.rowLines === ctx.colLines && ctx.rowLines >= 1
    const value = active ? 2 : 1
    return {
      active,
      value,
      displayLabel: active ? `列点×${value}` : '',
    }
  },
}

/**
 * 流星
 * 3ライン以上同時消しで列点x2
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

export const meteorRelic: RelicModule = {
  type: 'meteor',
  definition: {
    name: '流星',
    description: '3ライン以上同時消しで列点×2',
    rarity: 'rare',
    price: 20,
    icon: '☄️',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.totalLines >= 3
    const value = active ? 2 : 1
    return {
      active,
      value,
      displayLabel: active ? `列点×${value}` : '',
    }
  },
}

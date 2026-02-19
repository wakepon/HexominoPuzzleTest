/**
 * 連鎖の達人
 * 複数行列を同時消しで列点×1.5
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

const MULTIPLIER = 1.5

export const chainMasterRelic: RelicModule = {
  type: 'chain_master',
  definition: {
    name: '連鎖の達人',
    description: '複数行列を同時消しで列点×1.5',
    rarity: 'rare',
    price: 20,
    icon: '⛓️',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.totalLines >= 2
    return {
      active,
      value: active ? MULTIPLIER : 1,
      displayLabel: active ? `列点×${MULTIPLIER}` : '',
    }
  },
}

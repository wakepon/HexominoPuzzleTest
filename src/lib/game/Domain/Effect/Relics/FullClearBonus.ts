/**
 * 全消しボーナス
 * 盤面を全て空にした際に列点×5
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

const MULTIPLIER = 5

export const fullClearBonusRelic: RelicModule = {
  type: 'full_clear_bonus',
  definition: {
    name: '全消しボーナス',
    description: '盤面を全て空にした際に列点×5',
    rarity: 'common',
    price: 10,
    icon: '🏆',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.isBoardEmptyAfterClear
    return {
      active,
      value: active ? MULTIPLIER : 1,
      displayLabel: active ? `列点×${MULTIPLIER}` : '',
    }
  },
}

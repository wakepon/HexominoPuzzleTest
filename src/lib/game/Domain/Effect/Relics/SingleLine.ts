/**
 * シングルライン
 * 1行または1列のみ消した時、列点×3
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

const MULTIPLIER = 3

export const singleLineRelic: RelicModule = {
  type: 'single_line',
  definition: {
    name: 'シングルライン',
    description: '1行または1列のみ消した時、列点×3',
    rarity: 'uncommon',
    price: 15,
    icon: '➖',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.totalLines === 1
    return {
      active,
      value: active ? MULTIPLIER : 1,
      displayLabel: active ? `列点×${MULTIPLIER}` : '',
    }
  },
}

/**
 * 王冠
 * ライン消去時、消去セルに含まれるパターン付きブロック1個につきブロック点+2
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

const BONUS_PER_PATTERN_BLOCK = 2

export const crownRelic: RelicModule = {
  type: 'crown',
  definition: {
    name: '王冠',
    description: 'ライン消去時、消去セルのパターン付きブロック1個につきブロック点+2',
    rarity: 'uncommon',
    price: 15,
    icon: '👑',
  },
  scoreEffect: 'additive',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.totalLines > 0 && ctx.patternBlockCount > 0
    const value = active ? ctx.patternBlockCount * BONUS_PER_PATTERN_BLOCK : 0
    return {
      active,
      value,
      displayLabel: active ? `ブロック点+${value}` : '',
    }
  },
}

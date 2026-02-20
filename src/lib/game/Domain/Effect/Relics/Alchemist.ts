/**
 * 錬金術師（alchemist）
 * パターンとシールの両方を持つブロック消去時、そのブロック点+10
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** パターン+シール両方持ちブロック1個あたりの加算値 */
const BONUS_PER_BLOCK = 10

export const alchemistRelic: RelicModule = {
  type: 'alchemist',
  definition: {
    name: '錬金術師',
    description: 'パターンとシール両方持ちのブロック消去時、1個につきブロック点+10',
    rarity: 'rare',
    price: 20,
    icon: '⚗️',
  },
  scoreEffect: 'additive',

  checkActivation(ctx: RelicContext): RelicActivation {
    const count = ctx.patternAndSealBlockCount
    const active = ctx.totalLines > 0 && count > 0
    const bonus = count * BONUS_PER_BLOCK
    return {
      active,
      value: active ? bonus : 0,
      displayLabel: active ? `ブロック点+${bonus}` : '',
    }
  },
}

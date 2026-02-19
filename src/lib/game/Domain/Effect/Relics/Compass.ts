/**
 * コンパス
 * 行と列を同時に消した時、各ブロック点+3
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** 行列同時消去時のブロック点加算値 */
const BONUS_PER_BLOCK = 3

export const compassRelic: RelicModule = {
  type: 'compass',
  definition: {
    name: 'コンパス',
    description: '行と列を同時に消した時、各ブロック点+3',
    rarity: 'uncommon',
    price: 15,
    icon: '🧭',
  },
  scoreEffect: 'additive',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.rowLines >= 1 && ctx.colLines >= 1 && ctx.totalLines > 0
    const value = active ? BONUS_PER_BLOCK : 0
    return {
      active,
      value,
      displayLabel: active ? `ブロック点+${value}` : '',
    }
  },
}

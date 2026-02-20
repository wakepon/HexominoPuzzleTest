/**
 * スタンプ
 * ライン消去時、消去セルに含まれるシール付きブロック1個につきブロック点+5
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

const BONUS_PER_SEAL_BLOCK = 5

export const stampRelic: RelicModule = {
  type: 'stamp',
  definition: {
    name: 'スタンプ',
    description: 'ライン消去時、消去セルのシール付きブロック1個につきブロック点+5',
    rarity: 'uncommon',
    price: 15,
    icon: '📬',
  },
  scoreEffect: 'additive',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.totalLines > 0 && ctx.sealBlockCount > 0
    const value = active ? ctx.sealBlockCount * BONUS_PER_SEAL_BLOCK : 0
    return {
      active,
      value,
      displayLabel: active ? `ブロック点+${value}` : '',
    }
  },
}

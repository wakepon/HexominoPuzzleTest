/**
 * 十字（cross）
 * 行と列を同時に消した時、交差セルのブロック点+30
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** 交差セル1つあたりのブロック点加算値 */
const BONUS_PER_INTERSECTION = 30

export const crossRelic: RelicModule = {
  type: 'cross',
  definition: {
    name: '十字',
    description: '行と列を同時に消した時、交差セルのブロック点+30',
    rarity: 'rare',
    price: 20,
    icon: '✝️',
  },
  scoreEffect: 'additive',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.completedRows.length >= 1 && ctx.completedCols.length >= 1 && ctx.totalLines > 0
    const intersectionCount = ctx.completedRows.length * ctx.completedCols.length
    const value = active ? intersectionCount * BONUS_PER_INTERSECTION : 0
    return {
      active,
      value,
      displayLabel: active ? `ブロック点+${value}` : '',
    }
  },
}

/**
 * 過負荷（overload）
 * 盤面の75%以上（27セル以上）が埋まっている状態でライン消去すると列点×2
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** 盤面充填率の閾値（6×6=36の75%=27） */
const FILLED_THRESHOLD = 27

/** 列点倍率 */
const MULTIPLIER = 2

export const overloadRelic: RelicModule = {
  type: 'overload',
  definition: {
    name: '過負荷',
    description: '盤面の75%以上が埋まっている状態でライン消去すると列点×2',
    rarity: 'rare',
    price: 20,
    icon: '⚡',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.totalLines > 0 && ctx.boardFilledCount >= FILLED_THRESHOLD
    return {
      active,
      value: active ? MULTIPLIER : 1,
      displayLabel: active ? `列点×${MULTIPLIER}` : '',
    }
  },
}

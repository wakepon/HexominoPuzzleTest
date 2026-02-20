/**
 * 溶鉱炉（ファーネス）
 * stoneシール付きブロックが消去された時、1個につきブロック点+15
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** furnaceのstoneブロック1個あたりのボーナス */
export const FURNACE_STONE_BONUS = 15

export const furnaceRelic: RelicModule = {
  type: 'furnace',
  definition: {
    name: '溶鉱炉',
    description: 'stoneシール付きブロック消去時、1個につきブロック点+15',
    rarity: 'uncommon',
    price: 15,
    icon: '🏭',
  },
  scoreEffect: 'additive',

  checkActivation(ctx: RelicContext): RelicActivation {
    const count = ctx.stoneBlockCount ?? 0
    const active = count > 0
    const value = count * FURNACE_STONE_BONUS
    return {
      active,
      value,
      displayLabel: active ? `石+${value}` : '',
    }
  },
}

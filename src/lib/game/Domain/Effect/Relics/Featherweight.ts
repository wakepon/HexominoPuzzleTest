/**
 * 軽量級
 * 2ブロック以下のピース配置でライン消去時、各ブロック点+4
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

export const featherweightRelic: RelicModule = {
  type: 'featherweight',
  definition: {
    name: '軽量級',
    description: '2ブロック以下のピース配置でライン消去時、各ブロック点+4',
    rarity: 'common',
    price: 10,
    icon: '🪶',
  },
  scoreEffect: 'additive',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.placedBlockSize <= 2 && ctx.totalLines > 0
    const value = active ? 4 : 0
    return {
      active,
      value,
      displayLabel: active ? `ブロック点+${value}` : '',
    }
  },
}

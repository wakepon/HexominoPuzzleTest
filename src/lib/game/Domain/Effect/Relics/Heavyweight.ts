/**
 * 重量級
 * 5ブロック以上のピース配置でライン消去時、各ブロック点+3
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

export const heavyweightRelic: RelicModule = {
  type: 'heavyweight',
  definition: {
    name: '重量級',
    description: '5ブロック以上のピース配置でライン消去時、各ブロック点+3',
    rarity: 'common',
    price: 10,
    icon: '🏋️',
  },
  scoreEffect: 'additive',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.placedBlockSize >= 5 && ctx.totalLines > 0
    const value = active ? 3 : 0
    return {
      active,
      value,
      displayLabel: active ? `ブロック点+${value}` : '',
    }
  },
}

/**
 * オーケストラ（orchestra）
 * 1回の消去で3種類以上の異なるパターンが含まれると列点×2
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** 必要なパターン種類数 */
const PATTERN_TYPE_THRESHOLD = 3

/** 列点倍率 */
const MULTIPLIER = 2

export const orchestraRelic: RelicModule = {
  type: 'orchestra',
  definition: {
    name: 'オーケストラ',
    description: '1回の消去で3種類以上の異なるパターンが含まれると列点×2',
    rarity: 'uncommon',
    price: 15,
    icon: '🎵',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.totalLines > 0 && ctx.distinctPatternTypeCount >= PATTERN_TYPE_THRESHOLD
    return {
      active,
      value: active ? MULTIPLIER : 1,
      displayLabel: active ? `列点×${MULTIPLIER}` : '',
    }
  },
}

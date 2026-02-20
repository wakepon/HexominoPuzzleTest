/**
 * ミニマリスト（minimalist）
 * デッキ枚数が5枚以下の時、全ブロック点+5
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** デッキ枚数の閾値 */
const DECK_THRESHOLD = 5

/** ブロック点加算値 */
const BONUS = 5

export const minimalistRelic: RelicModule = {
  type: 'minimalist',
  definition: {
    name: 'ミニマリスト',
    description: 'デッキ枚数が5枚以下の時、全ブロック点+5',
    rarity: 'uncommon',
    price: 15,
    icon: '🔳',
  },
  scoreEffect: 'additive',

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.totalLines > 0 && ctx.deckSize <= DECK_THRESHOLD
    return {
      active,
      value: active ? BONUS : 0,
      displayLabel: active ? `ブロック点+${BONUS}` : '',
    }
  },
}

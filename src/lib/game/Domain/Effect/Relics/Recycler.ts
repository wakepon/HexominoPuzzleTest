/**
 * リサイクラー（Recycler）
 * ラウンド中3回まで、手札の1枚を捨てて新しい1枚をドローできる（ハンド消費なし）
 * scoreEffect: 'none' - Reducerで手札入替処理
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** ラウンドあたりのリサイクル回数上限 */
export const RECYCLER_MAX_USES = 3

export const recyclerRelic: RelicModule = {
  type: 'recycler',
  definition: {
    name: 'リサイクラー',
    description: 'ラウンド中3回まで手札1枚を入替可能',
    rarity: 'uncommon',
    price: 15,
    icon: '♻️',
  },
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    return { active: false, value: 0, displayLabel: '' }
  },
}

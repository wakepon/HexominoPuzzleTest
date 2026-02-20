/**
 * 不死鳥（フェニックス）
 * ラウンド失敗時、1度だけそのラウンドを最初からやり直せる（使用後消滅）
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

export const phoenixRelic: RelicModule = {
  type: 'phoenix',
  definition: {
    name: '不死鳥',
    description: 'ラウンド失敗時、1度だけラウンドをやり直せる（使用後消滅）',
    rarity: 'epic',
    price: 25,
    icon: '🐦‍🔥',
  },
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    // スコアには直接影響しない（Reducer側でgame_over時にインターセプト）
    return { active: false, value: 0, displayLabel: '' }
  },
}

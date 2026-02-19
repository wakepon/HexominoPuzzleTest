/**
 * コピー
 * 1つ上のレリックの効果をコピー
 *
 * コピーレリックは特殊で、対象レリックのRelicModuleを参照して効果を複製する。
 * Phase 3以降でRelicEffectEngineに統合される。
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

export const copyRelic: RelicModule = {
  type: 'copy',
  definition: {
    name: 'コピー',
    description: '1つ上のレリックの効果をコピー',
    rarity: 'epic',
    price: 25,
    icon: '🪞',
  },
  // コピー先のscoreEffectに依存するため、エンジン側で特殊処理
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    // コピーレリックの効果計算はRelicEffectEngine側で
    // 対象レリックのcheckActivationを呼び出して複製する
    return { active: false, value: 0, displayLabel: '' }
  },
}

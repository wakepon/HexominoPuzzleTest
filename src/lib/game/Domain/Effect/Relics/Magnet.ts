/**
 * 磁石（マグネット）
 * chargeパターン（⚡）の蓄積速度を2倍にする（配置ごとに+2）
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

/** magnet所持時のcharge蓄積量 */
export const MAGNET_CHARGE_INCREMENT = 2

/** デフォルトのcharge蓄積量 */
export const DEFAULT_CHARGE_INCREMENT = 1

export const magnetRelic: RelicModule = {
  type: 'magnet',
  definition: {
    name: '磁石',
    description: 'chargeパターン（⚡）の蓄積速度を2倍にする',
    rarity: 'uncommon',
    price: 15,
    icon: '🧲',
  },
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    // 常時発動（charge蓄積値の変更は BoardService 側で処理）
    return {
      active: true,
      value: MAGNET_CHARGE_INCREMENT,
      displayLabel: `⚡+${MAGNET_CHARGE_INCREMENT}`,
    }
  },
}

/**
 * 庭師（gardener）
 * パターン付きブロックを消すたびに、そのラウンド中のブロック点+0.2を累積
 *
 * 状態管理:
 *   - lines_cleared (totalLines > 0 && patternBlockCount > 0):
 *     accumulatedBonus + patternBlockCount * BONUS_PER_PATTERN_BLOCK
 *   - round_start: リセット
 *   - その他: そのまま返す
 *
 * scoreEffect は additive。
 * value = accumulatedBonus でブロック点に加算する。
 *
 * checkActivation はスコア計算時（lines_detected 後）に呼ばれる。
 * lines_cleared で蓄積済みの accumulatedBonus を使って発動判定する。
 * → 最初の消去では accumulatedBonus=0 で発動しない。2回目以降から発動する。
 */

import type { RelicModule, RelicContext, RelicActivation, RelicStateEvent } from './RelicModule'

const BONUS_PER_PATTERN_BLOCK = 0.2

export interface GardenerState {
  readonly accumulatedBonus: number  // 累積ブロック点ボーナス
}

const INITIAL_STATE: GardenerState = { accumulatedBonus: 0 }

export const gardenerRelic: RelicModule = {
  type: 'gardener',
  definition: {
    name: '庭師',
    description: 'パターン付きブロックを消すたびにブロック点+0.2を累積（ラウンド中）',
    rarity: 'uncommon',
    price: 15,
    icon: '🌻',
  },
  scoreEffect: 'additive',

  checkActivation(ctx: RelicContext): RelicActivation {
    const state = (ctx.relicState as GardenerState | null) ?? INITIAL_STATE
    const active = ctx.totalLines > 0 && state.accumulatedBonus > 0
    // 表示用ラベル: 小数点以下の丸め
    const displayValue = active ? Math.round(state.accumulatedBonus * 100) / 100 : 0
    return {
      active,
      value: active ? state.accumulatedBonus : 0,
      displayLabel: active ? `ブロック点+${displayValue}` : '',
    }
  },

  initialState: (): GardenerState => INITIAL_STATE,

  updateState(state: unknown, event: RelicStateEvent): GardenerState {
    const s = (state as GardenerState | null) ?? INITIAL_STATE
    switch (event.type) {
      case 'lines_cleared':
        // パターン付きブロックが消去された場合にボーナスを蓄積
        if (event.totalLines > 0 && event.patternBlockCount > 0) {
          return {
            accumulatedBonus: s.accumulatedBonus + event.patternBlockCount * BONUS_PER_PATTERN_BLOCK,
          }
        }
        return s
      case 'round_start':
        // ラウンド開始でリセット
        return INITIAL_STATE
      default:
        return s
    }
  },
}

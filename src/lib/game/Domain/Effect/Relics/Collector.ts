/**
 * 収集家（collector）
 * ラウンド中に消去した異なるパターン種類1種につき、列点+0.5を永続加算
 *
 * 状態管理:
 *   - lines_cleared (totalLines > 0 && clearedPatternTypes に新種あり):
 *     collectedPatterns に新種追加、accumulatedBonus + 新種数 * BONUS_PER_PATTERN_TYPE
 *   - round_start: リセット
 *   - その他: そのまま返す
 *
 * scoreEffect は multiplicative。
 * value = 1 + accumulatedBonus で列点に乗算する。
 * 例: 2種収集(0.5x2=1.0) -> value=2.0 -> 列点x2.0
 *
 * checkActivation はスコア計算時（lines_detected 後）に呼ばれる。
 * lines_cleared で蓄積済みの accumulatedBonus を使って発動判定する。
 * -> 最初の消去では accumulatedBonus=0 で発動しない。2回目以降から発動する。
 */

import type { RelicModule, RelicContext, RelicActivation, RelicStateEvent } from './RelicModule'

const BONUS_PER_PATTERN_TYPE = 0.5

export interface CollectorState {
  readonly collectedPatterns: readonly string[]
  readonly accumulatedBonus: number
}

const INITIAL_STATE: CollectorState = {
  collectedPatterns: [],
  accumulatedBonus: 0,
}

export const collectorRelic: RelicModule = {
  type: 'collector',
  definition: {
    name: '収集家',
    description: 'ラウンド中に消去した異なるパターン種類1種につき列点+0.5を累積',
    rarity: 'uncommon',
    price: 15,
    icon: '🎪',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const state = (ctx.relicState as CollectorState | null) ?? INITIAL_STATE
    const active = ctx.totalLines > 0 && state.accumulatedBonus > 0
    const value = active ? 1 + state.accumulatedBonus : 1
    const displayValue = active ? Math.round(value * 100) / 100 : 1
    return {
      active,
      value: active ? value : 1,
      displayLabel: active ? `列点×${displayValue}` : '',
    }
  },

  initialState: (): CollectorState => INITIAL_STATE,

  updateState(state: unknown, event: RelicStateEvent): CollectorState {
    const s = (state as CollectorState | null) ?? INITIAL_STATE
    switch (event.type) {
      case 'lines_cleared':
        if (event.totalLines > 0 && event.clearedPatternTypes.length > 0) {
          const existingSet = new Set(s.collectedPatterns)
          const newPatterns = event.clearedPatternTypes.filter(
            (p) => !existingSet.has(p)
          )
          if (newPatterns.length > 0) {
            return {
              collectedPatterns: [...s.collectedPatterns, ...newPatterns],
              accumulatedBonus: s.accumulatedBonus + newPatterns.length * BONUS_PER_PATTERN_TYPE,
            }
          }
        }
        return s
      case 'round_start':
        return INITIAL_STATE
      default:
        return s
    }
  },
}

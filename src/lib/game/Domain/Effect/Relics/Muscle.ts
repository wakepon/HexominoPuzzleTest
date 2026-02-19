/**
 * 筋肉（muscle）
 * 4ブロック以上のピースを配置するたびに、そのラウンド中の列点+0.3を累積
 *
 * 状態管理:
 *   - hand_consumed (placedBlockSize >= 4): accumulatedBonus + BONUS_PER_LARGE_PIECE
 *   - round_start: リセット
 *   - その他: そのまま返す
 *
 * scoreEffect は multiplicative。
 * value = 1 + accumulatedBonus で列点に乗算する。
 * 例: 2回発動(0.3×2=0.6) → value=1.6 → 列点×1.6
 *
 * checkActivation はスコア計算時（lines_detected 後）に呼ばれる。
 * hand_consumed で蓄積済みの accumulatedBonus を使って発動判定する。
 */

import type { RelicModule, RelicContext, RelicActivation, RelicStateEvent } from './RelicModule'

const BONUS_PER_LARGE_PIECE = 0.3
const MIN_BLOCK_SIZE = 4

export interface MuscleState {
  readonly accumulatedBonus: number  // 累積列点ボーナス（0.3ずつ増加）
}

const INITIAL_STATE: MuscleState = { accumulatedBonus: 0 }

export const muscleRelic: RelicModule = {
  type: 'muscle',
  definition: {
    name: '筋肉',
    description: '4ブロック以上のピースを配置するたびに列点+0.3を累積（ラウンド中）',
    rarity: 'uncommon',
    price: 15,
    icon: '💪',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const state = (ctx.relicState as MuscleState | null) ?? INITIAL_STATE
    const active = ctx.totalLines > 0 && state.accumulatedBonus > 0
    const value = active ? 1 + state.accumulatedBonus : 1
    // 表示用ラベル: 小数点以下の丸め
    const displayValue = active ? Math.round(value * 100) / 100 : 1
    return {
      active,
      value: active ? value : 1,
      displayLabel: active ? `列点×${displayValue}` : '',
    }
  },

  initialState: (): MuscleState => INITIAL_STATE,

  updateState(state: unknown, event: RelicStateEvent): MuscleState {
    const s = (state as MuscleState | null) ?? INITIAL_STATE
    switch (event.type) {
      case 'hand_consumed':
        // 4ブロック以上のピース配置時にボーナスを蓄積
        return event.placedBlockSize >= MIN_BLOCK_SIZE
          ? { accumulatedBonus: s.accumulatedBonus + BONUS_PER_LARGE_PIECE }
          : s
      case 'round_start':
        // ラウンド開始でリセット
        return INITIAL_STATE
      default:
        return s
    }
  },
}

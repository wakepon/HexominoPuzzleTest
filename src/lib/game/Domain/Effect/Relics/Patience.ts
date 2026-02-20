/**
 * 忍耐（patience）
 * ラウンド中、ライン消去なしのハンドが連続3回以上あった後の次の消去で列点×3
 *
 * 発動条件:
 *   直前に3ハンド以上連続で消去なし → その次の消去で発動（1回限り、条件リセット後再度溜め可）
 *
 * 状態管理:
 *   - lines_cleared (totalLines === 0): 消去なし → カウンター増加、3以上でチャージ
 *   - lines_cleared (totalLines > 0): 消去あり → カウンターリセット、チャージ解除
 *   - round_start: 全リセット
 *
 * checkActivation は lines_cleared の前（スコア計算時）に呼ばれるため、
 * isCharged が true の状態で checkActivation が呼ばれ、
 * lines_cleared で状態がリセットされる。
 */

import type { RelicModule, RelicContext, RelicActivation, RelicStateEvent } from './RelicModule'

/** チャージに必要な連続非消去ハンド数 */
const REQUIRED_NON_CLEAR_HANDS = 3

/** 発動時の列点倍率 */
const LINE_MULTIPLIER = 3

export interface PatienceState {
  readonly consecutiveNonClearHands: number  // 連続で消去なしのハンド数
  readonly isCharged: boolean               // 3回以上溜まったかどうか
}

const INITIAL_STATE: PatienceState = {
  consecutiveNonClearHands: 0,
  isCharged: false,
}

export const patienceRelic: RelicModule = {
  type: 'patience',
  definition: {
    name: '忍耐',
    description: `連続${REQUIRED_NON_CLEAR_HANDS}回以上消去なしの後の次の消去で列点×${LINE_MULTIPLIER}`,
    rarity: 'rare',
    price: 20,
    icon: '🧘',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const state = (ctx.relicState as PatienceState | null) ?? INITIAL_STATE
    const active = state.isCharged && ctx.totalLines > 0
    return {
      active,
      value: active ? LINE_MULTIPLIER : 1,
      displayLabel: active ? `列点×${LINE_MULTIPLIER}` : '',
    }
  },

  initialState: (): PatienceState => INITIAL_STATE,

  updateState(state: unknown, event: RelicStateEvent): PatienceState {
    const s = (state as PatienceState | null) ?? INITIAL_STATE
    switch (event.type) {
      case 'lines_cleared':
        if (event.totalLines > 0) {
          // 消去が発生 → カウンターリセット、チャージ解除
          return { consecutiveNonClearHands: 0, isCharged: false }
        } else {
          // 消去なし → カウンター増加
          const newCount = s.consecutiveNonClearHands + 1
          return {
            consecutiveNonClearHands: newCount,
            isCharged: newCount >= REQUIRED_NON_CLEAR_HANDS,
          }
        }
      case 'round_start':
        return INITIAL_STATE
      default:
        return s
    }
  },
}

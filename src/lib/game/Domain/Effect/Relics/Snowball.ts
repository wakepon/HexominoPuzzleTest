/**
 * 雪だるま（snowball）
 * ライン消去ごとにブロック点+0.5（ラウンドをまたいで永続）
 *
 * 状態管理:
 *   - lines_cleared (totalLines > 0): bonus + BONUS_PER_CLEAR
 *   - round_start: リセットしない（永続）
 *   - その他: そのまま返す
 *
 * checkActivation は lines_cleared の前（スコア計算時）に呼ばれるため、
 * 最初の消去では bonus=0 で発動しない。2回目の消去から bonus=0.5 で発動する。
 */

import type { RelicModule, RelicContext, RelicActivation, RelicStateEvent } from './RelicModule'

const BONUS_PER_CLEAR = 0.5

export interface SnowballState {
  readonly bonus: number  // 累積ブロック点ボーナス（0.5ずつ増加）
}

const INITIAL_STATE: SnowballState = { bonus: 0 }

export const snowballRelic: RelicModule = {
  type: 'snowball',
  definition: {
    name: '雪だるま',
    description: 'ライン消去ごとにブロック点+0.5（ラウンドをまたいで永続）',
    rarity: 'rare',
    price: 20,
    icon: '⛄',
  },
  scoreEffect: 'additive',

  checkActivation(ctx: RelicContext): RelicActivation {
    const state = (ctx.relicState as SnowballState | null) ?? INITIAL_STATE
    const active = ctx.totalLines > 0 && state.bonus > 0
    return {
      active,
      value: active ? state.bonus : 0,
      displayLabel: active ? `ブロック点+${state.bonus}` : '',
    }
  },

  initialState: (): SnowballState => INITIAL_STATE,

  updateState(state: unknown, event: RelicStateEvent): SnowballState {
    const s = (state as SnowballState | null) ?? INITIAL_STATE
    switch (event.type) {
      case 'lines_cleared':
        // ライン消去が発生したらボーナスを蓄積
        return event.totalLines > 0
          ? { bonus: s.bonus + BONUS_PER_CLEAR }
          : s
      case 'round_start':
        // ラウンド開始でリセットしない（永続）
        return s
      default:
        return s
    }
  },
}

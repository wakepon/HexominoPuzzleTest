/**
 * 先制攻撃
 * ラウンド中の最初のライン消去で列点×2.5
 */

import type { RelicModule, RelicContext, RelicActivation, RelicStateEvent } from './RelicModule'

const LINE_MULTIPLIER = 2.5

export interface FirstStrikeState {
  readonly hasClearedInRound: boolean
}

const INITIAL_STATE: FirstStrikeState = { hasClearedInRound: false }

export const firstStrikeRelic: RelicModule = {
  type: 'first_strike',
  definition: {
    name: '先制攻撃',
    description: 'ラウンド中の最初のライン消去で列点×2.5',
    rarity: 'uncommon',
    price: 15,
    icon: '⚡',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const state = (ctx.relicState as FirstStrikeState | null) ?? INITIAL_STATE
    const active = !state.hasClearedInRound && ctx.totalLines > 0
    return {
      active,
      value: active ? LINE_MULTIPLIER : 0,
      displayLabel: active ? `列点×${LINE_MULTIPLIER}` : '',
    }
  },

  initialState: (): FirstStrikeState => INITIAL_STATE,

  updateState(state: unknown, event: RelicStateEvent): FirstStrikeState {
    const s = (state as FirstStrikeState | null) ?? INITIAL_STATE
    switch (event.type) {
      case 'lines_cleared':
        // ライン消去が発生したら hasClearedInRound を true にする
        return event.totalLines > 0 ? { hasClearedInRound: true } : s
      case 'round_start':
        return INITIAL_STATE
      default:
        return s
    }
  },
}

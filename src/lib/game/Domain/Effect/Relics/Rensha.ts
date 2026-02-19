/**
 * 連射
 * ライン揃うたびに列点+1（揃わないとリセット）
 */

import type { RelicModule, RelicContext, RelicActivation, RelicStateEvent } from './RelicModule'

const INCREMENT = 1

export interface RenshaState {
  readonly multiplier: number
}

const INITIAL_STATE: RenshaState = { multiplier: 1.0 }

export const renshaRelic: RelicModule = {
  type: 'rensha',
  definition: {
    name: '連射',
    description: 'ライン揃うたびに列点+1（揃わないとリセット）',
    rarity: 'rare',
    price: 20,
    icon: '🔫',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const state = (ctx.relicState as RenshaState | null) ?? INITIAL_STATE
    const active = ctx.totalLines > 0
    return {
      active,
      value: active ? state.multiplier : 1,
      displayLabel: active ? `列点×${state.multiplier}` : '',
    }
  },

  initialState: (): RenshaState => INITIAL_STATE,

  updateState(state: unknown, event: RelicStateEvent): RenshaState {
    const s = (state as RenshaState | null) ?? INITIAL_STATE
    switch (event.type) {
      case 'lines_cleared':
        return event.totalLines === 0
          ? { multiplier: 1.0 }
          : { multiplier: s.multiplier + INCREMENT }
      case 'round_start':
        return INITIAL_STATE
      default:
        return s
    }
  },
}

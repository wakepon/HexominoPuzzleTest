/**
 * のびのびタケノコ
 * 縦列のみ揃えるたびに列点+0.5を加える（横列消しでリセット）初期値は列点×1
 */

import type { RelicModule, RelicContext, RelicActivation, RelicStateEvent } from './RelicModule'

const INCREMENT = 0.5

export interface NobiTakenokoState {
  readonly multiplier: number
}

const INITIAL_STATE: NobiTakenokoState = { multiplier: 1.0 }

export const nobiTakenokoRelic: RelicModule = {
  type: 'nobi_takenoko',
  definition: {
    name: 'のびのびタケノコ',
    description: '縦列のみ揃えるたびに列点+0.5を加える（横列消しでリセット）初期値は列点×1',
    rarity: 'uncommon',
    price: 15,
    icon: '🌱',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const state = (ctx.relicState as NobiTakenokoState | null) ?? INITIAL_STATE
    const active = ctx.rowLines === 0 && ctx.colLines >= 1
    return {
      active,
      value: active ? state.multiplier : 1,
      displayLabel: active ? `列点×${state.multiplier}` : '',
    }
  },

  initialState: (): NobiTakenokoState => INITIAL_STATE,

  updateState(state: unknown, event: RelicStateEvent): NobiTakenokoState {
    const s = (state as NobiTakenokoState | null) ?? INITIAL_STATE
    switch (event.type) {
      case 'lines_detected':
        if (event.rowLines > 0) return { multiplier: 1.0 }
        if (event.colLines > 0) return { multiplier: s.multiplier + INCREMENT }
        return s
      case 'round_start':
        return INITIAL_STATE
      default:
        return s
    }
  },
}

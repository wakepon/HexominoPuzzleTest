/**
 * のびのびカニ
 * 横列のみ揃えるたびに列点+0.5を加える（縦列消しでリセット）初期値は列点×1
 */

import type { RelicModule, RelicContext, RelicActivation, RelicStateEvent } from './RelicModule'

const INCREMENT = 0.5

export interface NobiKaniState {
  readonly multiplier: number
}

const INITIAL_STATE: NobiKaniState = { multiplier: 1.0 }

export const nobiKaniRelic: RelicModule = {
  type: 'nobi_kani',
  definition: {
    name: 'のびのびカニ',
    description: '横列のみ揃えるたびに列点+0.5を加える（縦列消しでリセット）初期値は列点×1',
    rarity: 'uncommon',
    price: 15,
    icon: '🦞',
  },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const state = (ctx.relicState as NobiKaniState | null) ?? INITIAL_STATE
    const active = ctx.colLines === 0 && ctx.rowLines >= 1
    return {
      active,
      value: active ? state.multiplier : 1,
      displayLabel: active ? `列点×${state.multiplier}` : '',
    }
  },

  initialState: (): NobiKaniState => INITIAL_STATE,

  updateState(state: unknown, event: RelicStateEvent): NobiKaniState {
    const s = (state as NobiKaniState | null) ?? INITIAL_STATE
    switch (event.type) {
      case 'lines_detected':
        if (event.colLines > 0) return { multiplier: 1.0 }
        if (event.rowLines > 0) return { multiplier: s.multiplier + INCREMENT }
        return s
      case 'round_start':
        return INITIAL_STATE
      default:
        return s
    }
  },
}

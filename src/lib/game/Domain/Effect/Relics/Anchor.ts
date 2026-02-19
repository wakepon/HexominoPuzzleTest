/**
 * アンカー
 * ラウンド中の最初のライン消去時、各ブロック点+5
 */

import type { RelicModule, RelicContext, RelicActivation, RelicStateEvent } from './RelicModule'

const BONUS_PER_BLOCK = 5

export interface AnchorState {
  readonly hasClearedInRound: boolean
}

const INITIAL_STATE: AnchorState = { hasClearedInRound: false }

export const anchorRelic: RelicModule = {
  type: 'anchor',
  definition: {
    name: 'アンカー',
    description: 'ラウンド中の最初のライン消去時、各ブロック点+5',
    rarity: 'common',
    price: 10,
    icon: '⚓',
  },
  scoreEffect: 'additive',

  checkActivation(ctx: RelicContext): RelicActivation {
    const state = (ctx.relicState as AnchorState | null) ?? INITIAL_STATE
    const active = !state.hasClearedInRound && ctx.totalLines > 0
    return {
      active,
      value: active ? BONUS_PER_BLOCK : 0,
      displayLabel: active ? `ブロック点+${BONUS_PER_BLOCK}` : '',
    }
  },

  initialState: (): AnchorState => INITIAL_STATE,

  updateState(state: unknown, event: RelicStateEvent): AnchorState {
    const s = (state as AnchorState | null) ?? INITIAL_STATE
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

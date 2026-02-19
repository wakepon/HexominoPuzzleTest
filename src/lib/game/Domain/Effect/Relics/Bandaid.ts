/**
 * 絆創膏
 * 3ハンド消費ごとにノーハンド付きモノミノが手札に追加
 */

import type {
  RelicModule,
  RelicContext,
  RelicActivation,
  RelicStateEvent,
  RelicHookContext,
  RelicHookResult,
} from './RelicModule'

export const BANDAID_TRIGGER_COUNT = 3

export interface BandaidState {
  readonly counter: number
  readonly shouldTrigger: boolean
}

const INITIAL_STATE: BandaidState = { counter: 0, shouldTrigger: false }

export const bandaidRelic: RelicModule = {
  type: 'bandaid',
  definition: {
    name: '絆創膏',
    description: '3ハンド消費ごとにノーハンド付きモノミノが手札に追加',
    rarity: 'rare',
    price: 20,
    icon: '🩹',
  },
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    // 絆創膏はスコア効果なし。発動はReducerフックで処理
    return { active: false, value: 0, displayLabel: '' }
  },

  initialState: (): BandaidState => INITIAL_STATE,

  updateState(state: unknown, event: RelicStateEvent): BandaidState {
    const s = (state as BandaidState | null) ?? INITIAL_STATE
    switch (event.type) {
      case 'hand_consumed': {
        const newCounter = s.counter + 1
        return newCounter >= BANDAID_TRIGGER_COUNT
          ? { counter: 0, shouldTrigger: true }
          : { counter: newCounter, shouldTrigger: false }
      }
      case 'round_start':
        return INITIAL_STATE
      default:
        return { ...s, shouldTrigger: false }
    }
  },

  onPiecePlaced(ctx: RelicHookContext): RelicHookResult {
    const state = (ctx.relicState as BandaidState | null) ?? INITIAL_STATE
    if (state.shouldTrigger && ctx.remainingHands > 0) {
      return {
        type: 'inject_piece',
        newRelicState: { ...state, shouldTrigger: false },
      }
    }
    return null
  },
}

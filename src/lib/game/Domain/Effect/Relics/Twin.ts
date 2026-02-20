/**
 * 双子（Twin）
 * 直前に配置したピースと同じブロック数のピースでライン消去時、ブロック点+4
 */

import type { RelicModule, RelicContext, RelicActivation, RelicStateEvent } from './RelicModule'

const BONUS_PER_BLOCK = 4

export interface TwinState {
  /** 直前に配置したピースのブロック数（0 = まだ配置なし） */
  readonly lastPlacedBlockSize: number
}

const INITIAL_STATE: TwinState = { lastPlacedBlockSize: 0 }

export const twinRelic: RelicModule = {
  type: 'twin',
  definition: {
    name: '双子',
    description: '同サイズのピースを連続配置してライン消去時、ブロック点+4',
    rarity: 'common',
    price: 10,
    icon: '👯',
  },
  scoreEffect: 'additive',

  checkActivation(ctx: RelicContext): RelicActivation {
    const state = (ctx.relicState as TwinState | null) ?? INITIAL_STATE
    // 前回と同じサイズ かつ ライン消去あり
    const active = state.lastPlacedBlockSize > 0 &&
      ctx.placedBlockSize === state.lastPlacedBlockSize &&
      ctx.totalLines > 0
    return {
      active,
      value: active ? BONUS_PER_BLOCK : 0,
      displayLabel: active ? `ブロック点+${BONUS_PER_BLOCK}` : '',
    }
  },

  initialState: (): TwinState => INITIAL_STATE,

  updateState(state: unknown, event: RelicStateEvent): TwinState {
    const s = (state as TwinState | null) ?? INITIAL_STATE
    switch (event.type) {
      case 'hand_consumed':
        // 配置するたびに前回のブロック数を記録
        return { lastPlacedBlockSize: event.placedBlockSize }
      case 'round_start':
        return INITIAL_STATE
      default:
        return s
    }
  },
}

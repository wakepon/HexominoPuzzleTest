/**
 * レリック状態管理
 * 倍率系レリックの状態を一元管理
 */

import type { RelicId } from '../Core/Id'
import { BANDAID_TRIGGER_COUNT } from './Relics/Bandaid'

/**
 * コピーレリック専用の状態（独立カウンター管理）
 */
export interface CopyRelicState {
  readonly targetRelicId: RelicId | null
  readonly bandaidCounter: number
  readonly renshaMultiplier: number
  readonly nobiTakenokoMultiplier: number
  readonly nobiKaniMultiplier: number
}

/**
 * コピーレリック状態を初期化
 */
export function createInitialCopyRelicState(targetRelicId: RelicId | null): CopyRelicState {
  return {
    targetRelicId,
    bandaidCounter: 0,
    renshaMultiplier: 1.0,
    nobiTakenokoMultiplier: 1.0,
    nobiKaniMultiplier: 1.0,
  }
}

export interface RelicMultiplierState {
  readonly nobiTakenokoMultiplier: number  // のびのびタケノコ倍率
  readonly nobiKaniMultiplier: number      // のびのびカニ倍率
  readonly renshaMultiplier: number        // 連射倍率
  readonly bandaidCounter: number          // 絆創膏カウンター（0〜2、3で発動→0リセット）
  readonly copyRelicState: CopyRelicState | null  // コピーレリック状態（未所持時はnull）
}

export const INITIAL_RELIC_MULTIPLIER_STATE: RelicMultiplierState = {
  nobiTakenokoMultiplier: 1.0,
  nobiKaniMultiplier: 1.0,
  renshaMultiplier: 1.0,
  bandaidCounter: 0,
  copyRelicState: null,
}

// 旧更新関数（updateRenshaMultiplier等）は各レリックモジュール + RelicStateDispatcher に移行済み

/**
 * 絆創膏カウントダウン値を取得（発動まであと何ハンドか）
 */
export function getBandaidCountdown(state: RelicMultiplierState): number {
  return BANDAID_TRIGGER_COUNT - state.bandaidCounter
}

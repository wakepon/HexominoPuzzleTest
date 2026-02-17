/**
 * レリック状態管理
 * 倍率系レリックの状態を一元管理
 */

import type { RelicId } from '../Core/Id'
import { RELIC_EFFECT_VALUES } from './Relic'

/**
 * コピーレリック専用の状態（独立カウンター管理）
 */
export interface CopyRelicState {
  readonly targetRelicId: RelicId | null
  readonly timingCounter: number
  readonly timingBonusActive: boolean
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
    timingCounter: 0,
    timingBonusActive: false,
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
  readonly timingCounter: number           // タイミングカウンター（0,1,2）
  readonly timingBonusActive: boolean      // タイミングボーナスタイミングか
  readonly copyRelicState: CopyRelicState | null  // コピーレリック状態（未所持時はnull）
}

export const INITIAL_RELIC_MULTIPLIER_STATE: RelicMultiplierState = {
  nobiTakenokoMultiplier: 1.0,
  nobiKaniMultiplier: 1.0,
  renshaMultiplier: 1.0,
  bandaidCounter: 0,
  timingCounter: 0,
  timingBonusActive: false,
  copyRelicState: null,
}

/**
 * 2-D: 連射倍率の更新
 * ライン消去時に+2、消去なしでリセット
 */
export function updateRenshaMultiplier(
  state: RelicMultiplierState,
  linesCleared: number
): RelicMultiplierState {
  if (linesCleared === 0) {
    // ライン消去なし: リセット
    return {
      ...state,
      renshaMultiplier: 1.0,
    }
  }
  // ライン消去あり: +2
  return {
    ...state,
    renshaMultiplier: state.renshaMultiplier + RELIC_EFFECT_VALUES.RENSHA_INCREMENT,
  }
}

/**
 * 2-E: のびのびタケノコ倍率の更新
 * 縦列のみ消去時に+0.5、横列消去でリセット
 */
export function updateNobiTakenokoMultiplier(
  state: RelicMultiplierState,
  rowLines: number,
  colLines: number
): RelicMultiplierState {
  if (rowLines > 0) {
    // 横列消去あり: リセット
    return {
      ...state,
      nobiTakenokoMultiplier: 1.0,
    }
  }
  if (colLines > 0) {
    // 縦列のみ消去: +0.5
    return {
      ...state,
      nobiTakenokoMultiplier: state.nobiTakenokoMultiplier + RELIC_EFFECT_VALUES.NOBI_INCREMENT,
    }
  }
  // 消去なし: 変更なし
  return state
}

/**
 * 2-F: のびのびカニ倍率の更新
 * 横列のみ消去時に+0.5、縦列消去でリセット
 */
export function updateNobiKaniMultiplier(
  state: RelicMultiplierState,
  rowLines: number,
  colLines: number
): RelicMultiplierState {
  if (colLines > 0) {
    // 縦列消去あり: リセット
    return {
      ...state,
      nobiKaniMultiplier: 1.0,
    }
  }
  if (rowLines > 0) {
    // 横列のみ消去: +0.5
    return {
      ...state,
      nobiKaniMultiplier: state.nobiKaniMultiplier + RELIC_EFFECT_VALUES.NOBI_INCREMENT,
    }
  }
  // 消去なし: 変更なし
  return state
}

/**
 * 絆創膏カウンターの更新
 * ハンド消費時にカウンター+1、3に達したら発動→0リセット
 */
export function updateBandaidCounter(
  state: RelicMultiplierState,
  handConsumed: boolean
): { newState: RelicMultiplierState; shouldTrigger: boolean } {
  if (!handConsumed) return { newState: state, shouldTrigger: false }
  const newCounter = state.bandaidCounter + 1
  if (newCounter >= RELIC_EFFECT_VALUES.BANDAID_TRIGGER_COUNT) {
    return { newState: { ...state, bandaidCounter: 0 }, shouldTrigger: true }
  }
  return { newState: { ...state, bandaidCounter: newCounter }, shouldTrigger: false }
}

/**
 * 絆創膏カウントダウン値を取得（発動まであと何ハンドか）
 */
export function getBandaidCountdown(state: RelicMultiplierState): number {
  return RELIC_EFFECT_VALUES.BANDAID_TRIGGER_COUNT - state.bandaidCounter
}

/**
 * タイミングカウンターの更新
 * ハンド消費時にカウンター+1、TRIGGER_COUNT-1でボーナス待機状態に
 * ノーハンド時は変更なし（ボーナス継続）
 * bonusApplies: 今回のスコア計算にボーナスを適用するか
 */
export function updateTimingCounter(
  state: RelicMultiplierState,
  handConsumed: boolean
): { newState: RelicMultiplierState; bonusApplies: boolean } {
  const bonusApplies = state.timingBonusActive

  if (!handConsumed) {
    return { newState: state, bonusApplies }
  }

  if (state.timingBonusActive) {
    // ボーナス待機中にハンド消費 → ボーナス消費、カウンターリセット
    return {
      newState: { ...state, timingCounter: 0, timingBonusActive: false },
      bonusApplies: true,
    }
  }

  const newCounter = state.timingCounter + 1
  const bonusPending = newCounter >= RELIC_EFFECT_VALUES.TIMING_TRIGGER_COUNT - 1
  return {
    newState: { ...state, timingCounter: newCounter, timingBonusActive: bonusPending },
    bonusApplies: false,
  }
}

/**
 * タイミングカウントダウン値を取得（発動まであと何ハンドか）
 */
export function getTimingCountdown(state: RelicMultiplierState): number {
  if (state.timingBonusActive) return 0
  return RELIC_EFFECT_VALUES.TIMING_TRIGGER_COUNT - 1 - state.timingCounter
}

/**
 * 全ての倍率をリセット（ラウンド開始時に使用）
 */
export function resetAllMultipliers(): RelicMultiplierState {
  return INITIAL_RELIC_MULTIPLIER_STATE
}

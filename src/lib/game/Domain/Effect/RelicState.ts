/**
 * レリック状態管理
 * 倍率系レリックの状態を一元管理
 */

import { RELIC_EFFECT_VALUES } from './Relic'

export interface RelicMultiplierState {
  readonly nobiTakenokoMultiplier: number  // のびのびタケノコ倍率
  readonly nobiKaniMultiplier: number      // のびのびカニ倍率
  readonly renshaMultiplier: number        // 連射倍率
}

export const INITIAL_RELIC_MULTIPLIER_STATE: RelicMultiplierState = {
  nobiTakenokoMultiplier: 1.0,
  nobiKaniMultiplier: 1.0,
  renshaMultiplier: 1.0,
}

/**
 * 2-D: 連射倍率の更新
 * ライン消去時に+0.5、消去なしでリセット
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
  // ライン消去あり: +0.5
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
 * 全ての倍率をリセット（ラウンド開始時に使用）
 */
export function resetAllMultipliers(): RelicMultiplierState {
  return INITIAL_RELIC_MULTIPLIER_STATE
}

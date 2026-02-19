import type { ActivatedRelicInfo } from '../Effect/RelicEffectTypes'
import type { PatternId, SealId } from '../Core/Id'

/**
 * 消去対象セル
 *
 * 注意: x/y は後方互換性のために保持。新しいコードでは row/col を使用推奨。
 */
export interface ClearingCell {
  readonly x: number
  readonly y: number
  // 新しいコード用エイリアス
  readonly row: number
  readonly col: number
  // 順次消去用（オプショナル）
  readonly delay?: number
  readonly pattern?: PatternId | null
  readonly seal?: SealId | null
  readonly chargeValue?: number
}

/**
 * 消去アニメーション状態
 */
export interface ClearingAnimationState {
  readonly isAnimating: boolean
  readonly cells: readonly ClearingCell[]
  readonly startTime: number
  readonly duration: number           // 全体の所要時間（スタガード込み）
  readonly perCellDuration: number    // 各セルのアニメーション時間
}

/**
 * 消去アニメーションを作成
 */
export const createClearingAnimation = (
  cells: readonly ClearingCell[],
  duration: number,
  perCellDuration: number = duration
): ClearingAnimationState => ({
  isAnimating: true,
  cells,
  startTime: Date.now(),
  duration,
  perCellDuration,
})

/**
 * レリック発動アニメーション状態
 */
export interface RelicActivationAnimationState {
  readonly isAnimating: boolean
  readonly activatedRelics: readonly ActivatedRelicInfo[]
  readonly startTime: number
  readonly duration: number
}

/**
 * レリック発動アニメーションを作成
 */
export const createRelicActivationAnimation = (
  activatedRelics: readonly ActivatedRelicInfo[],
  duration: number
): RelicActivationAnimationState => ({
  isAnimating: activatedRelics.length > 0,
  activatedRelics,
  startTime: Date.now(),
  duration,
})

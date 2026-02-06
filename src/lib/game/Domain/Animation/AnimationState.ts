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
}

/**
 * 消去アニメーション状態
 */
export interface ClearingAnimationState {
  readonly isAnimating: boolean
  readonly cells: readonly ClearingCell[]
  readonly startTime: number
  readonly duration: number
}

/**
 * 消去アニメーションを作成
 */
export const createClearingAnimation = (
  cells: readonly ClearingCell[],
  duration: number
): ClearingAnimationState => ({
  isAnimating: true,
  cells,
  startTime: Date.now(),
  duration,
})

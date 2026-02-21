import type { ActivatedRelicInfo } from '../Effect/RelicEffectTypes'
import type { PatternId, SealId, BlessingId } from '../Core/Id'

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
  readonly blockBlessing?: BlessingId | null
  readonly blockPoint?: number  // このブロックのブロック点貢献値
}

/**
 * ライン消去時の列点ポップ表示データ
 */
export interface LinePointDisplay {
  readonly type: 'row' | 'col'
  readonly index: number           // 行/列インデックス
  readonly completionTime: number  // 消去完了タイミング（ms, startTimeからの相対）
  readonly point: number           // 加算される列点（基本1）
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
  readonly linePoints?: readonly LinePointDisplay[]
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

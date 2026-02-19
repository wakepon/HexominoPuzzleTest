/**
 * レリック効果計算の型定義
 */

import type { RelicId } from '../Core/Id'
import type { RelicMultiplierState, CopyRelicState } from './RelicState'
import type { ScriptRelicLines } from './ScriptRelicState'

/**
 * レリック効果計算に必要なコンテキスト
 */
export interface RelicEffectContext {
  readonly ownedRelics: readonly RelicId[]
  readonly totalLines: number          // 消去ライン数
  readonly rowLines: number            // 消去した行数
  readonly colLines: number            // 消去した列数
  readonly placedBlockSize: number     // 配置したピースのブロック数
  readonly isBoardEmptyAfterClear: boolean // 消去後に盤面が空か
  readonly relicMultiplierState: RelicMultiplierState  // 倍率状態
  readonly completedRows: readonly number[]  // 揃った行のインデックス
  readonly completedCols: readonly number[]  // 揃った列のインデックス
  readonly scriptRelicLines: ScriptRelicLines | null  // 台本レリックの指定ライン
  readonly copyRelicState?: CopyRelicState | null  // コピーレリック状態（オプショナル）
  readonly remainingHands: number  // 残りハンド数（タイミングレリック判定用）
}

/**
 * 発動したレリック情報（エフェクト表示用）
 */
export interface ActivatedRelicInfo {
  readonly relicId: RelicId
  readonly bonusValue: number | string // "+20" or "×1.5"
}

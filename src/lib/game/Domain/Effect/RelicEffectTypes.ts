/**
 * レリック効果計算の型定義
 */

import type { RelicId } from '../Core/Id'
import type { RelicMultiplierState } from './RelicState'
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
}

/**
 * 各レリックの発動状態
 */
export interface RelicActivationState {
  // 既存レリック
  readonly chainMasterActive: boolean // 連鎖の達人
  readonly smallLuckActive: boolean // 小さな幸運
  readonly fullClearActive: boolean // 全消しボーナス

  // 2-A: シングルライン
  readonly singleLineActive: boolean // 1ライン消去時に発動

  // 2-B: タケノコ
  readonly takenokoActive: boolean // 縦列のみ消去時に発動
  readonly takenokoCols: number // 消去した列数

  // 2-C: カニ
  readonly kaniActive: boolean // 横列のみ消去時に発動
  readonly kaniRows: number // 消去した行数

  // 2-D: 連射
  readonly renshaActive: boolean // ライン消去時に発動
  readonly renshaMultiplier: number // 現在の連射倍率

  // 2-E: のびのびタケノコ
  readonly nobiTakenokoActive: boolean // 縦列のみ消去時に発動
  readonly nobiTakenokoMultiplier: number // 現在の倍率

  // 2-F: のびのびカニ
  readonly nobiKaniActive: boolean // 横列のみ消去時に発動
  readonly nobiKaniMultiplier: number // 現在の倍率

  // 台本
  readonly scriptActive: boolean // 台本レリック発動（1本以上揃った）
  readonly scriptMatchCount: number // マッチした本数（0, 1, 2）
}

/**
 * レリック効果の計算結果
 */
export interface RelicEffectResult {
  readonly activations: RelicActivationState

  // 既存レリック
  readonly chainMasterMultiplier: number // 1.0 or 1.5
  readonly smallLuckBonus: number // 0 or 20
  readonly fullClearBonus: number // 0 or 20
  readonly totalRelicBonus: number // 加算ボーナス合計（小さな幸運 + 全消し）

  // 2-A: シングルライン倍率
  readonly singleLineMultiplier: number // 1 or 3

  // 2-B: タケノコ倍率
  readonly takenokoMultiplier: number // 消去した列数（発動しなければ1）

  // 2-C: カニ倍率
  readonly kaniMultiplier: number // 消去した行数（発動しなければ1）

  // 2-D: 連射倍率
  readonly renshaMultiplier: number // 累積倍率（発動しなければ1.0）

  // 2-E: のびのびタケノコ倍率
  readonly nobiTakenokoMultiplier: number // 累積倍率（発動しなければ1.0）

  // 2-F: のびのびカニ倍率
  readonly nobiKaniMultiplier: number // 累積倍率（発動しなければ1.0）

  // 台本ボーナス
  readonly scriptBonus: number // 0, 20, or 60
}

/**
 * 発動したレリック情報（エフェクト表示用）
 */
export interface ActivatedRelicInfo {
  readonly relicId: RelicId
  readonly bonusValue: number | string // "+20" or "×1.5"
}

/**
 * レリック効果計算の型定義
 */

import type { RelicId } from '../Core/Id'

/**
 * レリック効果計算に必要なコンテキスト
 */
export interface RelicEffectContext {
  readonly ownedRelics: readonly RelicId[]
  readonly totalLines: number // 消去ライン数
  readonly placedBlockSize: number // 配置したピースのブロック数
  readonly isBoardEmptyAfterClear: boolean // 消去後に盤面が空か
}

/**
 * 各レリックの発動状態
 */
export interface RelicActivationState {
  readonly chainMasterActive: boolean // 連鎖の達人
  readonly smallLuckActive: boolean // 小さな幸運
  readonly fullClearActive: boolean // 全消しボーナス
}

/**
 * レリック効果の計算結果
 */
export interface RelicEffectResult {
  readonly activations: RelicActivationState
  readonly chainMasterMultiplier: number // 1.0 or 1.5
  readonly smallLuckBonus: number // 0 or 20
  readonly fullClearBonus: number // 0 or 20
  readonly totalRelicBonus: number // 加算ボーナス合計（小さな幸運 + 全消し）
}

/**
 * 発動したレリック情報（エフェクト表示用）
 */
export interface ActivatedRelicInfo {
  readonly relicId: RelicId
  readonly bonusValue: number | string // "+20" or "×1.5"
}

/**
 * スコアアニメーション状態の型定義
 */

import type { RelicId } from '../Core/Id'

/**
 * 式ステップの種類
 */
export type FormulaStepType =
  | 'base'           // 基本式: (ブロック数 × ライン数)
  | 'seal'           // シール効果（multi/score）
  | 'pattern'        // パターン効果（enhanced/lucky/charge）
  | 'buff'           // バフ効果（増強/金鉱/脈動）
  | 'relic'          // レリック効果
  | 'simplified'     // 簡潔化された式
  | 'result'         // 最終結果表示

/**
 * 式の1ステップ
 */
export interface FormulaStep {
  readonly type: FormulaStepType
  readonly label: string           // 効果名（例: "マルチシール", "連鎖の達人"）
  readonly formula: string         // 現時点の式文字列
  readonly relicId: RelicId | null // レリックステップの場合のID
}

/**
 * スコアアニメーション状態
 */
export interface ScoreAnimationState {
  readonly isAnimating: boolean
  readonly steps: readonly FormulaStep[]
  readonly currentStepIndex: number
  readonly stepStartTime: number
  readonly stepDuration: number       // 通常1000ms
  readonly isFastForward: boolean
  readonly highlightedRelicId: RelicId | null
  readonly finalScore: number
  readonly scoreGain: number          // 獲得スコア
  readonly startingScore: number      // アニメーション前のスコア
  readonly isCountingUp: boolean      // スコアカウントアップ中
  readonly countStartTime: number
}

/**
 * スコアアニメーションの定数
 */
export const SCORE_ANIMATION = {
  stepDuration: 1000,           // 通常ステップの表示時間（ms）
  fastForwardDuration: 200,     // 早送り時のステップ表示時間（ms）
  countUpDuration: 500,         // スコアカウントアップ時間（ms）
  fadeInDuration: 200,          // フェードイン時間（ms）
  postAnimationDelay: 1500,     // アニメーション完了後の遅延時間（ms）
} as const

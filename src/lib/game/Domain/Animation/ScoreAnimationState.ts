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
 * 効果のアニメーション分類（カウンターのどちら側がポップするか）
 */
export type EffectCategory =
  | 'base'    // 基本式（両方セット）
  | 'countA'  // ブロック点(A)カウントアップ
  | 'countB'  // 列点(B)カウントアップ
  | 'addA'    // ブロック点(A)に加算
  | 'addB'    // 列点(B)に加算
  | 'multB'   // 列点(B)に乗算
  | 'result'  // 最終結果

/**
 * 式の1ステップ
 */
export interface FormulaStep {
  readonly type: FormulaStepType
  readonly label: string           // 効果名（例: "マルチシール", "連鎖の達人"）
  readonly formula: string         // 現時点の式文字列
  readonly relicId: RelicId | null // レリックステップの場合のID
  readonly blockPoints: number     // この時点のブロック点(A)
  readonly linePoints: number      // この時点の列点(B)
  readonly effectCategory: EffectCategory // アニメーション分類
  readonly duration?: number             // ステップ固有の表示時間（ms）
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
  readonly isTransferring: boolean    // スコア転送アニメーション中
  readonly transferStartTime: number  // 転送開始時刻
}

/**
 * スコアアニメーションの定数
 */
export const SCORE_ANIMATION = {
  stepDuration: 600,            // 通常ステップの表示時間（ms）
  fastForwardDuration: 120,     // 早送り時のステップ表示時間（ms）
  countStepDuration: 80,        // カウントステップの表示時間（ms）
  countFastForwardDuration: 30, // 早送り時のカウント速度（ms）
  fadeInDuration: 150,          // フェードイン時間（ms）
  popDuration: 300,             // ポップアニメーション時間（ms）
  postAnimationDelay: 1500,     // アニメーション完了後の遅延時間（ms）
  transferHoldDuration: 1000,   // C値を保持する時間（ms）
  transferDuration: 800,        // スコア転送アニメーション時間（ms）
  transferFastForwardHoldDuration: 200, // 早送り時のC値保持時間（ms）
  transferFastForwardDuration: 200, // 早送り時のスコア転送時間（ms）
} as const

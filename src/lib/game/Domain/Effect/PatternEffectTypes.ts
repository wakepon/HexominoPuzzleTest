/**
 * パターン効果計算の型定義
 */

/**
 * パターン効果計算の結果
 */
export interface PatternEffectResult {
  readonly enhancedBonus: number // enhanced効果による追加ブロック数
  readonly auraBonus: number // aura効果による追加ブロック数
  readonly mossBonus: number // moss効果による追加ブロック数
}

/**
 * スコア計算の詳細内訳
 */
export interface ScoreBreakdown {
  readonly baseBlocks: number // 基本消去ブロック数
  readonly enhancedBonus: number // enhanced効果
  readonly auraBonus: number // aura効果
  readonly mossBonus: number // moss効果
  readonly multiBonus: number // multiシール効果（追加ブロック数）
  readonly totalBlocks: number // 合計ブロック数（乗算対象）
  readonly linesCleared: number // 消去ライン数
  readonly baseScore: number // 基本スコア（totalBlocks × linesCleared）
  readonly comboBonus: number // comboボーナス
  readonly luckyMultiplier: number // lucky倍率（1 or 2）
  readonly sealScoreBonus: number // scoreシールによる加算（+5点/個）
  readonly goldCount: number // goldシール数（スコアには影響しないがReducerで使用）
  // レリック効果
  readonly chainMasterMultiplier: number // 連鎖の達人倍率（1.0 or 1.5）
  readonly smallLuckBonus: number // 小さな幸運ボーナス（0 or 20）
  readonly fullClearBonus: number // 全消しボーナス（0 or 20）
  readonly relicBonusTotal: number // レリック加算ボーナス合計
  // 2-A: シングルライン
  readonly singleLineMultiplier: number // シングルライン倍率（1 or 3）
  // 2-B: タケノコ
  readonly takenokoMultiplier: number // タケノコ倍率（縦列数、発動時は1以上）
  readonly finalScore: number // 最終スコア
}

/**
 * コンボ状態
 */
export interface ComboState {
  readonly count: number // 現在のコンボ回数
  readonly lastPatternWasCombo: boolean // 直前がcomboパターンだったか
}

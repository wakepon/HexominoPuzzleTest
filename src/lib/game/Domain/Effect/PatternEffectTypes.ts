/**
 * パターン効果計算の型定義
 */

/**
 * パターン効果計算の結果
 */
export interface PatternEffectResult {
  readonly enhancedBonus: number // enhanced効果による追加ブロック数
  readonly chargeBonus: number // charge効果による追加ブロック数
}

/**
 * スコア計算の詳細内訳
 *
 * レリック効果は relicEffects マップで動的に管理される。
 * 各レリックの効果値は ScoreEffectType に応じて解釈される:
 * - multiplicative: 列点(B)の乗算倍率（1 = 無効）
 * - additive: ブロック点(A)への加算値（0 = 無効）
 * - line_additive: ライン数への加算値（0 = 無効）
 */
export interface ScoreBreakdown {
  // === パターン・シール効果（レリック非依存） ===
  readonly baseBlocks: number       // 基本消去ブロック数
  readonly enhancedBonus: number    // enhanced効果
  readonly multiBonus: number       // multiシール効果（追加ブロック数）
  readonly chargeBonus: number      // charge効果による追加ブロック数
  readonly totalBlocks: number      // 合計ブロック数（乗算対象）
  readonly linesCleared: number     // 消去ライン数
  readonly baseScore: number        // 基本スコア（totalBlocks × linesCleared）
  readonly luckyMultiplier: number  // lucky倍率（1 or 2）
  readonly goldCount: number        // goldシール数（スコアには影響しないがReducerで使用）

  // === レリック効果（動的マップ） ===
  /**
   * 各レリックの効果値
   * key: relicId（string）
   * value: 乗算レリック→倍率, 加算レリック→加算値, ライン加算→ライン数
   *        コピーレリックは 'copy' キーで格納
   */
  readonly relicEffects: ReadonlyMap<string, number>

  /** 発動したサイズボーナスレリックID（size_bonus_1〜6のどれか） */
  readonly sizeBonusRelicId: string | null

  /** コピー対象のレリックID */
  readonly copyTargetRelicId: string | null

  /** レリック加算ボーナス合計（サイズボーナス + コピー加算） */
  readonly relicBonusTotal: number

  // === 加護効果 ===
  readonly blessingPowerBonus: number   // 力の加護ボーナス
  readonly blessingGoldBonus: number    // 金の加護ゴールド
  readonly blessingChainBonus: number   // 連の加護ボーナス

  // === 最終計算値 ===
  readonly blockPoints: number  // ブロック点(A): パターン+シール+加算レリック+力の加護
  readonly linePoints: number   // 列点(B): ライン数×lucky×乗算レリック+連の加護
  readonly finalScore: number   // 最終スコア = Math.floor(A × B)
}

/**
 * シール効果計算の型定義
 */

/**
 * 完成したラインの情報（アローシール判定用）
 */
export interface CompletedLinesInfo {
  readonly rows: readonly number[]
  readonly columns: readonly number[]
}

/**
 * シール効果計算の結果
 */
export interface SealEffectResult {
  readonly goldCount: number      // ゴールドシールの数（+1G/個）
  readonly scoreBonus: number     // スコアシールによる加算（+5点/個）
  readonly multiBonus: number     // マルチシールによる追加ブロック数
  readonly arrowBonus: number     // アローシールによる追加ブロック数（+10/個）
}

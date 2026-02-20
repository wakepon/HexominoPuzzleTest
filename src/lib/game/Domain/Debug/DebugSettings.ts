/**
 * デバッグ設定の型定義
 * ショップでのパターン/シール/加護付与確率をデバッグウィンドウから変更するための設定
 */
export interface DebugSettings {
  /** パターン付与確率 (0-100%) */
  readonly patternProbability: number
  /** シール付与確率 (0-100%) */
  readonly sealProbability: number
  /** 加護付与確率 (0-100%) */
  readonly blessingProbability: number
}

/** デバッグ設定のデフォルト値 */
export const DEFAULT_DEBUG_SETTINGS: DebugSettings = {
  patternProbability: 30,
  sealProbability: 20,
  blessingProbability: 15,
}

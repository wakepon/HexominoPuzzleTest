/**
 * RelicModule インターフェース定義
 *
 * 各レリックは1ファイル = 1モジュールとして、このインターフェースを実装する。
 * システム側はレリック個別のロジックを知らず、RelicModuleの汎用的なメソッドを通じて処理する。
 */

import type { RelicId } from '../../Core/Id'
import type { RelicRarity } from '../Relic'
import type { ScriptRelicLines } from '../ScriptRelicState'

// ============================================================
// スコア効果の分類
// ============================================================

/**
 * レリックがスコア計算にどう寄与するかの分類
 *
 * - multiplicative: 列点(B)に乗算（例: 連鎖の達人 ×1.5）
 * - additive: ブロック点(A)に加算（例: サイズボーナス +消去ブロック数）
 * - line_additive: ライン数に加算（例: 台本 +1列）
 * - none: スコアに直接影響しない（例: 手札ストック、火山）
 */
export type ScoreEffectType = 'multiplicative' | 'additive' | 'line_additive' | 'none'

// ============================================================
// 発動判定の入力コンテキスト
// ============================================================

/**
 * レリック発動判定に渡されるコンテキスト
 *
 * 個々のレリックは必要なフィールドだけを参照する。
 * 将来的にフィールドを追加しても、既存レリックに影響しない。
 */
export interface RelicContext {
  readonly ownedRelics: readonly RelicId[]
  readonly totalLines: number
  readonly rowLines: number
  readonly colLines: number
  readonly placedBlockSize: number
  readonly isBoardEmptyAfterClear: boolean
  readonly completedRows: readonly number[]
  readonly completedCols: readonly number[]
  readonly scriptRelicLines: ScriptRelicLines | null
  readonly remainingHands: number
  readonly patternBlockCount: number  // 消去セル内のパターン付きブロック数
  readonly sealBlockCount: number     // 消去セル内のシール付きブロック数
  readonly deckSize: number           // デッキの全カード枚数
  readonly boardFilledCount: number   // 盤面の埋まっているセル数（消去前）
  readonly patternAndSealBlockCount: number  // 消去セル内のパターン+シール両方持ちブロック数
  readonly distinctPatternTypeCount: number  // 消去セル内の異なるパターン種類数

  /**
   * このレリック自身の累積状態
   * 各レリックが自分のinitialState()で定義した型のオブジェクトが渡される
   */
  readonly relicState: unknown
}

// ============================================================
// 発動判定の結果
// ============================================================

/**
 * checkActivation() の戻り値
 */
export interface RelicActivation {
  /** 発動したかどうか */
  readonly active: boolean
  /** 効果値（乗算倍率、加算値、ライン数加算値など） */
  readonly value: number
  /** エフェクト表示用のラベル（例: "列点×1.5", "+20"） */
  readonly displayLabel: string
}

// ============================================================
// 累積状態のイベント
// ============================================================

/**
 * 累積状態を更新するためのイベント
 *
 * Reducerのアクション発火時にレリックの updateState() に渡される。
 * 各レリックは必要なイベントだけを処理する。
 *
 * タイミング:
 * - lines_detected: ライン完成検出直後、スコア計算の前に発火。
 *   スコア計算に反映すべき累積値の更新に使用（のびのびタケノコ、のびのびカニ等）
 * - lines_cleared: スコア計算後に発火。
 *   スコア結果に依存しない累積値の更新に使用（連射の達人等）
 * - hand_consumed: 手札消費時に発火
 * - round_start: ラウンド開始時に発火（累積状態のリセット）
 */
export type RelicStateEvent =
  | { readonly type: 'lines_detected'; readonly totalLines: number; readonly rowLines: number; readonly colLines: number }
  | { readonly type: 'lines_cleared'; readonly totalLines: number; readonly rowLines: number; readonly colLines: number; readonly patternBlockCount: number; readonly clearedPatternTypes: readonly string[] }
  | { readonly type: 'hand_consumed'; readonly placedBlockSize: number }
  | { readonly type: 'round_start' }

// ============================================================
// Reducer フック
// ============================================================

/**
 * Reducerフックに渡されるコンテキスト
 *
 * レリック固有のReducer処理（bandaidのモノミノ注入、volcanoの全消去等）で使用。
 * 必要最小限のGameState情報を提供し、フック内でのstate直接変更を防ぐ。
 */
export interface RelicHookContext {
  readonly ownedRelics: readonly RelicId[]
  readonly relicState: unknown
  readonly phase: string
  readonly remainingHands: number
  readonly volcanoEligible: boolean
}

/**
 * Reducerフックの結果
 *
 * nullを返すとフック処理なし。
 * 将来的にアクション種別を拡張可能。
 */
export type RelicHookResult =
  | null
  | { readonly type: 'update_state'; readonly newRelicState: unknown }
  | { readonly type: 'inject_piece'; readonly newRelicState: unknown }

// ============================================================
// RelicModule 本体
// ============================================================

/**
 * レリックモジュールの定義
 *
 * 各レリックファイルはこのインターフェースを満たすオブジェクトをexportする。
 * レジストリがこれらを集約し、エフェクトエンジンが汎用的に処理する。
 */
export interface RelicModule {
  // === 識別 ===
  readonly type: string
  readonly definition: RelicModuleDefinition

  // === スコア効果の分類 ===
  readonly scoreEffect: ScoreEffectType

  // === 発動判定 + 効果値計算 ===
  /**
   * このレリックの発動条件を判定し、効果値を返す
   * @param ctx - 発動判定に必要なコンテキスト
   * @returns 発動結果（active, value, displayLabel）
   */
  checkActivation(ctx: RelicContext): RelicActivation

  // === 累積状態管理（オプション） ===
  /**
   * 累積状態の初期値を返す（連射、のびのび系等で使用）
   * nullを返すと累積状態を持たないレリック
   */
  readonly initialState?: () => unknown

  /**
   * イベントに応じて累積状態を更新する
   * immutableに新しい状態を返すこと
   */
  readonly updateState?: (state: unknown, event: RelicStateEvent) => unknown

  // === Reducerフック（オプション） ===
  /**
   * ピース配置後に呼ばれるフック
   * nullを返すとフック処理なし
   */
  readonly onPiecePlaced?: (ctx: RelicHookContext) => RelicHookResult

  /**
   * ラウンド開始時に呼ばれるフック
   */
  readonly onRoundStart?: (ctx: RelicHookContext) => RelicHookResult
}

/**
 * レリック定義データ（表示・ショップ用）
 */
export interface RelicModuleDefinition {
  readonly name: string
  readonly description: string
  readonly rarity: RelicRarity
  readonly price: number
  readonly icon: string
}

/**
 * ゲームイベント型定義（スケルトン）
 *
 * 将来のローグライト機能（パターン・シール・レリック効果）で使用予定。
 * 現在は型定義のみで、実際のイベント発火は未実装。
 */

import type { Piece, Board, Cell, GridPosition, RelicId } from '../Domain'

/**
 * ゲームイベントの基底型
 */
interface BaseEvent {
  readonly timestamp: number
}

/**
 * ピース配置イベント
 */
export interface PiecePlacedEvent extends BaseEvent {
  readonly type: 'PIECE_PLACED'
  readonly piece: Piece
  readonly position: GridPosition
  readonly board: Board
}

/**
 * 消去対象セル情報（エフェクト計算用）
 */
export interface ClearingCellInfo {
  readonly position: GridPosition
  readonly cell: Cell
}

/**
 * ライン完成イベント
 */
export interface LinesCompletedEvent extends BaseEvent {
  readonly type: 'LINES_COMPLETED'
  readonly rows: readonly number[]
  readonly cols: readonly number[]
  readonly cells: readonly ClearingCellInfo[]
}

/**
 * ライン消去完了イベント（アニメーション後）
 */
export interface LinesClearedEvent extends BaseEvent {
  readonly type: 'LINES_CLEARED'
  readonly clearedCells: readonly ClearingCellInfo[]
  readonly isBoardEmpty: boolean
}

/**
 * スコアボーナス情報
 */
export interface ScoreBonus {
  readonly source: string  // 'aura' | 'moss' | 'relic:chain_master' など
  readonly amount: number
  readonly multiplier?: number
}

/**
 * スコア計算完了イベント
 */
export interface ScoreCalculatedEvent extends BaseEvent {
  readonly type: 'SCORE_CALCULATED'
  readonly baseScore: number
  readonly bonuses: readonly ScoreBonus[]
  readonly totalScore: number
}

/**
 * ゴールド獲得イベント
 */
export interface GoldGainedEvent extends BaseEvent {
  readonly type: 'GOLD_GAINED'
  readonly amount: number
  readonly source: string  // 'round_clear' | 'seal:gold' など
}

/**
 * ラウンドクリアイベント
 */
export interface RoundClearedEvent extends BaseEvent {
  readonly type: 'ROUND_CLEARED'
  readonly round: number
  readonly finalScore: number
  readonly goldReward: number
}

/**
 * ラウンド開始イベント
 */
export interface RoundStartedEvent extends BaseEvent {
  readonly type: 'ROUND_STARTED'
  readonly round: number
  readonly targetScore: number
}

/**
 * レリック効果発動イベント
 */
export interface RelicTriggeredEvent extends BaseEvent {
  readonly type: 'RELIC_TRIGGERED'
  readonly relicId: RelicId
  readonly effect: string
  readonly value: number
}

/**
 * 全ゲームイベント（判別可能なUnion型）
 */
export type GameEvent =
  | PiecePlacedEvent
  | LinesCompletedEvent
  | LinesClearedEvent
  | ScoreCalculatedEvent
  | GoldGainedEvent
  | RoundClearedEvent
  | RoundStartedEvent
  | RelicTriggeredEvent

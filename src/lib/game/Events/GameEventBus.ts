/**
 * ゲームイベントバス（シングルトン）
 *
 * ログ・デバッグ専用。Reducerは純粋関数のまま維持し、
 * 副作用としてイベントを発火する。
 */

import { EventBus } from './EventBus'
import type {
  PiecePlacedEvent,
  LinesCompletedEvent,
  LinesClearedEvent,
  ScoreCalculatedEvent,
  GoldGainedEvent,
  RoundClearedEvent,
  RoundStartedEvent,
  RelicTriggeredEvent,
  ClearingCellInfo,
  ScoreBonus,
} from './GameEvent'
import type { Piece, Board, GridPosition, RelicId } from '../Domain'

// シングルトンインスタンス（開発環境ではログ有効）
const isDev = import.meta.env.DEV
export const gameEventBus = new EventBus(100, isDev)

// イベント発火ヘルパー関数

export function emitPiecePlaced(
  piece: Piece,
  position: GridPosition,
  board: Board
): void {
  gameEventBus.emit<PiecePlacedEvent>({
    type: 'PIECE_PLACED',
    timestamp: Date.now(),
    piece,
    position,
    board,
  })
}

export function emitLinesCompleted(
  rows: readonly number[],
  cols: readonly number[],
  cells: readonly ClearingCellInfo[]
): void {
  gameEventBus.emit<LinesCompletedEvent>({
    type: 'LINES_COMPLETED',
    timestamp: Date.now(),
    rows,
    cols,
    cells,
  })
}

export function emitLinesCleared(
  clearedCells: readonly ClearingCellInfo[],
  isBoardEmpty: boolean
): void {
  gameEventBus.emit<LinesClearedEvent>({
    type: 'LINES_CLEARED',
    timestamp: Date.now(),
    clearedCells,
    isBoardEmpty,
  })
}

export function emitScoreCalculated(
  baseScore: number,
  bonuses: readonly ScoreBonus[],
  totalScore: number
): void {
  gameEventBus.emit<ScoreCalculatedEvent>({
    type: 'SCORE_CALCULATED',
    timestamp: Date.now(),
    baseScore,
    bonuses,
    totalScore,
  })
}

export function emitGoldGained(amount: number, source: string): void {
  // ゴールド0の場合は発火しない
  if (amount <= 0) return
  gameEventBus.emit<GoldGainedEvent>({
    type: 'GOLD_GAINED',
    timestamp: Date.now(),
    amount,
    source,
  })
}

export function emitRoundCleared(
  round: number,
  finalScore: number,
  goldReward: number
): void {
  gameEventBus.emit<RoundClearedEvent>({
    type: 'ROUND_CLEARED',
    timestamp: Date.now(),
    round,
    finalScore,
    goldReward,
  })
}

export function emitRoundStarted(round: number, targetScore: number): void {
  gameEventBus.emit<RoundStartedEvent>({
    type: 'ROUND_STARTED',
    timestamp: Date.now(),
    round,
    targetScore,
  })
}

export function emitRelicTriggered(
  relicId: RelicId,
  effect: string,
  value: number
): void {
  gameEventBus.emit<RelicTriggeredEvent>({
    type: 'RELIC_TRIGGERED',
    timestamp: Date.now(),
    relicId,
    effect,
    value,
  })
}

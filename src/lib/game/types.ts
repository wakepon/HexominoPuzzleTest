/**
 * ゲームの型定義（後方互換性のためのエイリアス）
 *
 * このファイルは新しいDomain層への移行期間中の互換性のために存在します。
 * 新しいコードはDomain層から直接インポートしてください。
 */

// Domain層からの再エクスポート
export type { Position, GridPosition } from './Domain/Core/Position'
export type {
  PieceId,
  MinoId,
  BlockSetId,
  PatternId,
  SealId,
  RelicId,
} from './Domain/Core/Id'
export type { PieceShape, ShapeSize } from './Domain/Piece/PieceShape'
export type { MinoCategory } from './Domain/Piece/MinoCategory'
export type { MinoDefinition } from './Domain/Piece/MinoDefinition'
export type { Piece } from './Domain/Piece/Piece'
export type { Cell } from './Domain/Board/Cell'
export type { Board } from './Domain/Board/Board'
export type { DeckState, PieceSlot, HandState } from './Domain/Deck/DeckState'
export type { GamePhase } from './Domain/Round/GamePhase'
export type {
  RoundType,
  BossConditionType,
  BossCondition,
  RoundInfo,
} from './Domain/Round/RoundTypes'
export type { ShopItem, ShopState } from './Domain/Shop/ShopTypes'
export type { DragState } from './Domain/Input/DragState'
export type { ClearingCell, ClearingAnimationState } from './Domain/Animation/AnimationState'
export type { CanvasLayout } from './Domain/Canvas/CanvasLayout'
export type { GameState } from './Domain/GameState'

// Utils層からの再エクスポート
export type { RandomGenerator } from './Utils/Random'

// Services層からの再エクスポート（CategoryWeights）
export type { CategoryWeights } from './Services/PieceService'

// State層からの再エクスポート（GameAction）
export type { GameAction } from './State/Actions/GameActions'

// Services層からの型（CompletedLines）
export type { CompletedLines } from './Services/LineService'

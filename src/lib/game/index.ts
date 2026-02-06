/**
 * ゲームモジュールのメインエントリポイント
 *
 * 新しいコードはこのファイルから、または各層から直接インポートしてください。
 *
 * 注意: Domain層とServices/Data層で同名のエクスポートがある場合、
 * Domain層の型定義を優先します。具体的な実装が必要な場合は
 * 各層から直接インポートしてください。
 */

// Domain層 - 型定義（優先）
export * from './Domain'

// Data層 - 定数・ミノ定義（Domain層と重複するものは除外）
export {
  COLORS,
  LAYOUT,
  ANIMATION,
  CELL_STYLE,
  CLEAR_ANIMATION,
  // GRID_SIZE は Domain/Board から既にエクスポート
} from './Data/Constants'
export {
  MINOS_BY_CATEGORY,
  ALL_MINOS,
  MINO_COUNTS,
  getMinoById,
} from './Data/MinoDefinitions'

// Utils層 - ユーティリティ
export * from './Utils/Random'

// Services層 - ビジネスロジック（Domain層と重複するものは除外）
export {
  placePieceOnBoard,
  // createEmptyBoard, getCell は Domain/Board から既にエクスポート
} from './Services/BoardService'
export * from './Services/LineService'
export * from './Services/CollisionService'
export * from './Services/DeckService'
export * from './Services/RoundService'
export * from './Services/ShopService'
export * from './Services/PieceService'

// Events層 - イベントシステム（スケルトン）
export * from './Events/GameEvent'
export * from './Events/EventBus'

// State層 - 状態管理
export * from './State/Actions/GameActions'
export * from './State/InitialState'
export * from './State/Reducers/GameReducer'

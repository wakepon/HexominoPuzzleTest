/**
 * ゲームの型定義
 */

// 2D座標
export interface Position {
  x: number
  y: number
}

// ボードのセル状態
export interface Cell {
  filled: boolean
}

// ボード全体（6x6のグリッド）
export type Board = Cell[][]

// ブロックの形状（true = ブロックあり）
export type PieceShape = boolean[][]

// ミノのカテゴリ（セル数による分類）
export type MinoCategory = 'monomino' | 'domino' | 'tromino' | 'tetromino' | 'pentomino' | 'hexomino'

// ゲームフェーズ
export type GamePhase = 'playing' | 'round_clear' | 'shopping' | 'game_over' | 'game_clear'

// ショップアイテム
export interface ShopItem {
  minoId: string         // ミノのID
  price: number          // 価格（セル数と同じ）
  purchased: boolean     // 購入済みフラグ
}

// ショップ状態
export interface ShopState {
  items: ShopItem[]      // ショップに並んでいるアイテム（3つ）
}

// デッキの状態
export interface DeckState {
  cards: string[]         // デッキに残っているミノIDの配列
  remainingHands: number  // 残りの配置可能回数
  allMinos: string[]      // デッキの全ミノID（初期＋購入済み、再シャッフル用）
}

// カテゴリ別の重み
export type CategoryWeights = Record<MinoCategory, number>

// ミノの定義
export interface MinoDefinition {
  id: string
  category: MinoCategory
  shape: PieceShape
  cellCount: number
}

// 乱数生成器インターフェース（DI用）
export interface RandomGenerator {
  next(): number  // 0以上1未満の乱数を返す
}

// ブロックの定義
export interface Piece {
  id: string
  shape: PieceShape
}

// ブロックスロットの状態（画面下部の3つのブロック）
export interface PieceSlot {
  piece: Piece | null
  position: Position  // スロットの画面上の位置
}

// ドラッグ状態
export interface DragState {
  isDragging: boolean
  pieceId: string | null
  slotIndex: number | null
  currentPos: Position | null    // 現在のドラッグ位置（スクリーン座標）
  startPos: Position | null      // ドラッグ開始位置
  boardPos: Position | null      // ボード上の位置（グリッド座標）
}

// 完成したラインの情報
export interface CompletedLines {
  rows: number[]      // 完成した行のインデックス配列
  columns: number[]   // 完成した列のインデックス配列
}

// 消去対象のセル座標
export interface ClearingCell {
  x: number
  y: number
}

// 消去アニメーション状態
export interface ClearingAnimationState {
  isAnimating: boolean
  cells: ClearingCell[]        // 消去対象セル
  startTime: number            // アニメーション開始時刻
  duration: number             // アニメーション継続時間（ms）
}

// ゲーム全体の状態
export interface GameState {
  board: Board
  pieceSlots: PieceSlot[]
  dragState: DragState
  score: number                               // 現在ラウンドのスコア
  clearingAnimation: ClearingAnimationState | null
  deck: DeckState
  phase: GamePhase
  round: number                               // 現在のラウンド（1-24）
  gold: number                                // 所持ゴールド
  targetScore: number                         // 現在ラウンドの目標スコア
  shopState: ShopState | null                 // ショップ状態（shoppingフェーズでのみ非null）
}

// ゲームアクション
export type GameAction =
  | { type: 'PLACE_PIECE'; slotIndex: number; position: Position }
  | { type: 'START_DRAG'; slotIndex: number; startPos: Position }
  | { type: 'UPDATE_DRAG'; currentPos: Position; boardPos: Position | null }
  | { type: 'END_DRAG' }
  | { type: 'RESET_GAME' }
  | { type: 'END_CLEAR_ANIMATION' }
  | { type: 'ADVANCE_ROUND' }
  | { type: 'BUY_ITEM'; itemIndex: number }
  | { type: 'LEAVE_SHOP' }

// Canvas描画に必要なレイアウト情報
export interface CanvasLayout {
  canvasWidth: number
  canvasHeight: number
  boardOffsetX: number
  boardOffsetY: number
  cellSize: number
  slotAreaY: number
  slotPositions: Position[]
}

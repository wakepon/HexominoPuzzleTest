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
  score: number
  clearingAnimation: ClearingAnimationState | null
}

// ゲームアクション
export type GameAction =
  | { type: 'PLACE_PIECE'; slotIndex: number; position: Position }
  | { type: 'START_DRAG'; slotIndex: number; startPos: Position }
  | { type: 'UPDATE_DRAG'; currentPos: Position; boardPos: Position | null }
  | { type: 'END_DRAG' }
  | { type: 'RESET_GAME' }
  | { type: 'END_CLEAR_ANIMATION' }

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

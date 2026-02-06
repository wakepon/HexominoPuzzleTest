/**
 * 2D座標（不変）
 */
export interface Position {
  readonly x: number
  readonly y: number
}

/**
 * 行列座標（ボード用）
 */
export interface GridPosition {
  readonly row: number
  readonly col: number
}

/**
 * Position から GridPosition への変換
 * x → col, y → row
 */
export const toGridPosition = (pos: Position): GridPosition => ({
  row: pos.y,
  col: pos.x,
})

/**
 * GridPosition から Position への変換
 * row → y, col → x
 */
export const toPosition = (gridPos: GridPosition): Position => ({
  x: gridPos.col,
  y: gridPos.row,
})

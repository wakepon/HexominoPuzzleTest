/**
 * ブロックの形状（不変の2次元配列）
 * true = ブロックあり
 */
export type PieceShape = readonly (readonly boolean[])[]

/**
 * 形状のサイズ
 */
export interface ShapeSize {
  readonly rows: number
  readonly cols: number
}

/**
 * 形状のサイズを取得
 */
export const getShapeSize = (shape: PieceShape): ShapeSize => ({
  rows: shape.length,
  cols: Math.max(...shape.map(row => row.length)),
})

/**
 * 形状内のセル数を取得
 */
export const getCellCount = (shape: PieceShape): number =>
  shape.reduce((sum, row) => sum + row.filter(Boolean).length, 0)

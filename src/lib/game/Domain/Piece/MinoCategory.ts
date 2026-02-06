/**
 * ミノのカテゴリ（セル数による分類）
 */
export type MinoCategory =
  | 'monomino'
  | 'domino'
  | 'tromino'
  | 'tetromino'
  | 'pentomino'
  | 'hexomino'

/**
 * カテゴリ別のセル数
 */
export const MINO_CATEGORY_CELL_COUNT: Record<MinoCategory, number> = {
  monomino: 1,
  domino: 2,
  tromino: 3,
  tetromino: 4,
  pentomino: 5,
  hexomino: 6,
}

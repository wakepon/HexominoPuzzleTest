import { Board, CanvasLayout, ClearingCell } from '../../lib/game/types'
import { COLORS, LAYOUT, GRID_SIZE } from '../../lib/game/constants'
import { drawWoodenCell } from './cellRenderer'

/**
 * 消去中のセルかどうかをチェック
 */
function isClearingCell(x: number, y: number, clearingCells: ClearingCell[] | null): boolean {
  if (!clearingCells) return false
  return clearingCells.some(cell => cell.x === x && cell.y === y)
}

/**
 * ボードを描画
 * @param clearingCells 消去アニメーション中のセル（これらのセルは空として描画）
 */
export function renderBoard(
  ctx: CanvasRenderingContext2D,
  board: Board,
  layout: CanvasLayout,
  clearingCells: ClearingCell[] | null = null
): void {
  const { boardOffsetX, boardOffsetY, cellSize } = layout
  const boardSize = GRID_SIZE * cellSize

  // ボード背景
  ctx.fillStyle = COLORS.boardBackground
  ctx.fillRect(
    boardOffsetX - LAYOUT.boardPadding,
    boardOffsetY - LAYOUT.boardPadding,
    boardSize + LAYOUT.boardPadding * 2,
    boardSize + LAYOUT.boardPadding * 2
  )

  // 各セルを描画
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cellX = boardOffsetX + x * cellSize
      const cellY = boardOffsetY + y * cellSize
      const cell = board[y][x]

      // 消去アニメーション中のセルは空として描画（アニメーションで別途描画される）
      const isClearing = isClearingCell(x, y, clearingCells)

      // セル背景
      if (cell.filled && !isClearing) {
        // 配置済みブロック（消去中でない場合のみ）
        drawWoodenCell(ctx, cellX, cellY, cellSize)
      } else {
        // 空のセル
        drawEmptyCell(ctx, cellX, cellY, cellSize)
      }

      // セル枠線
      ctx.strokeStyle = COLORS.cellBorder
      ctx.lineWidth = 1
      ctx.strokeRect(cellX, cellY, cellSize, cellSize)
    }
  }
}

/**
 * 空のセルを描画
 */
function drawEmptyCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  ctx.fillStyle = COLORS.cellBackground
  ctx.fillRect(x, y, size, size)
}

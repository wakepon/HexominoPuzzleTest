import { Board, CanvasLayout } from '../../lib/game/types'
import { COLORS, LAYOUT, GRID_SIZE } from '../../lib/game/constants'
import { drawWoodenCell } from './cellRenderer'

/**
 * ボードを描画
 */
export function renderBoard(
  ctx: CanvasRenderingContext2D,
  board: Board,
  layout: CanvasLayout
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

      // セル背景
      if (cell.filled) {
        // 配置済みブロック
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

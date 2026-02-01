import { COLORS, CELL_STYLE } from '../../lib/game/constants'

/**
 * 木目調のセルを描画する共通関数
 */
export function drawWoodenCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  const { padding, highlightWidth, shadowWidth } = CELL_STYLE

  // ベース色
  ctx.fillStyle = COLORS.piece
  ctx.fillRect(x + padding, y + padding, size - padding * 2, size - padding * 2)

  // ハイライト（上端と左端）
  ctx.fillStyle = COLORS.pieceHighlight
  ctx.fillRect(x + padding, y + padding, size - padding * 2, highlightWidth)
  ctx.fillRect(x + padding, y + padding, highlightWidth, size - padding * 2)

  // シャドウ（下端と右端）
  ctx.fillStyle = COLORS.pieceShadow
  ctx.fillRect(x + padding, y + size - padding - shadowWidth, size - padding * 2, shadowWidth)
  ctx.fillRect(x + size - padding - shadowWidth, y + padding, shadowWidth, size - padding * 2)
}

/**
 * 木目調のセルを描画（枠線付き）
 */
export function drawWoodenCellWithBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  const { padding } = CELL_STYLE

  drawWoodenCell(ctx, x, y, size)

  // 枠線
  ctx.strokeStyle = COLORS.cellBorder
  ctx.lineWidth = 1
  ctx.strokeRect(x + padding, y + padding, size - padding * 2, size - padding * 2)
}

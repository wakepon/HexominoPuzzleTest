import { Board, CanvasLayout, ClearingCell } from '../../lib/game/types'
import { COLORS, LAYOUT, GRID_SIZE } from '../../lib/game/Data/Constants'
import { drawWoodenCell, drawBuffIndicator } from './cellRenderer'
import type { ScriptRelicLines } from '../../lib/game/Domain/Effect/ScriptRelicState'

/**
 * 消去中のセルかどうかをチェック
 */
function isClearingCell(x: number, y: number, clearingCells: readonly ClearingCell[] | null): boolean {
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
  clearingCells: readonly ClearingCell[] | null = null
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
        // 配置済みブロック（消去中でない場合のみ）- パターンとシールを渡す
        drawWoodenCell(ctx, cellX, cellY, cellSize, cell.pattern, cell.seal, cell.chargeValue)
        // 配置済みセル + バフの場合: バフの光を表示
        if (cell.buff && cell.buffLevel > 0) {
          drawBuffIndicator(ctx, cellX, cellY, cellSize, cell.buff, cell.buffLevel, cell.pattern === 'obstacle')
        }
      } else {
        // 空のセル
        drawEmptyCell(ctx, cellX, cellY, cellSize)
        // 空セル + バフの場合: 淡いシンボル表示
        if (cell.buff && cell.buffLevel > 0) {
          drawBuffIndicator(ctx, cellX, cellY, cellSize, cell.buff, cell.buffLevel)
        }
      }

      // セル枠線
      ctx.strokeStyle = COLORS.cellBorder
      ctx.lineWidth = 1
      ctx.strokeRect(cellX, cellY, cellSize, cellSize)
    }
  }
}

/**
 * 台本レリックの三角形マーカーを描画
 * 行マーカー: ボード左端の外側に右向き三角形
 * 列マーカー: ボード上端の外側に下向き三角形
 */
export function renderScriptMarkers(
  ctx: CanvasRenderingContext2D,
  scriptLines: ScriptRelicLines,
  layout: CanvasLayout
): void {
  const { boardOffsetX, boardOffsetY, cellSize } = layout
  const markerSize = 8
  const markerColor = '#FFD700'
  const gap = 4

  const drawMarker = (target: { type: 'row' | 'col'; index: number }) => {
    ctx.fillStyle = markerColor
    ctx.beginPath()

    if (target.type === 'row') {
      // 左端の外側に右向き三角形
      const centerY = boardOffsetY + target.index * cellSize + cellSize / 2
      const tipX = boardOffsetX - gap
      const baseX = tipX - markerSize
      ctx.moveTo(tipX, centerY)
      ctx.lineTo(baseX, centerY - markerSize / 2)
      ctx.lineTo(baseX, centerY + markerSize / 2)
    } else {
      // 上端の外側に下向き三角形
      const centerX = boardOffsetX + target.index * cellSize + cellSize / 2
      const tipY = boardOffsetY - gap
      const baseY = tipY - markerSize
      ctx.moveTo(centerX, tipY)
      ctx.lineTo(centerX - markerSize / 2, baseY)
      ctx.lineTo(centerX + markerSize / 2, baseY)
    }

    ctx.closePath()
    ctx.fill()
  }

  drawMarker(scriptLines.target1)
  drawMarker(scriptLines.target2)
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

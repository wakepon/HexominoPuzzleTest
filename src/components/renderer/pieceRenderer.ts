import type { PieceSlot, DragState, CanvasLayout, Piece } from '../../lib/game/types'
import type { Position } from '../../lib/game/Domain'
import { ANIMATION, HD_LAYOUT } from '../../lib/game/Data/Constants'
import { drawWoodenCellWithBorder } from './cellRenderer'
import { BlockDataMapUtils } from '../../lib/game/Domain/Piece/BlockData'

/** リサイクルボタンの当たり判定結果 */
export interface RecycleButtonHitResult {
  readonly slotIndex: number
}

/**
 * スロットエリアのブロックを描画
 */
export function renderPieceSlots(
  ctx: CanvasRenderingContext2D,
  pieceSlots: readonly PieceSlot[],
  layout: CanvasLayout,
  dragState: DragState
): void {
  pieceSlots.forEach((slot, index) => {
    if (!slot.piece) return // 配置済みでスロットが空
    if (dragState.isDragging && dragState.slotIndex === index) return // ドラッグ中のブロックは別で描画

    const slotPos = layout.slotPositions[index]
    // レイアウト再計算中にslotPositionsとpieceSlotsの数が一致しない場合はスキップ
    if (!slotPos) return

    renderPiece(
      ctx,
      slot.piece,
      slotPos.x,
      slotPos.y,
      layout.cellSize * HD_LAYOUT.slotCellSizeRatio,
      1.0
    )
  })
}

/**
 * ドラッグ中のブロックを描画
 */
export function renderDraggingPiece(
  ctx: CanvasRenderingContext2D,
  pieceSlots: readonly PieceSlot[],
  dragState: DragState,
  layout: CanvasLayout
): void {
  if (
    !dragState.isDragging ||
    dragState.slotIndex === null ||
    !dragState.currentPos
  ) {
    return
  }

  const slot = pieceSlots[dragState.slotIndex]
  if (!slot?.piece) return

  const piece = slot.piece
  const shape = piece.shape

  // ブロックの中心をドラッグ位置に合わせる
  const pieceWidth = shape[0].length * layout.cellSize
  const pieceHeight = shape.length * layout.cellSize
  const drawX = dragState.currentPos.x - pieceWidth / 2
  const drawY = dragState.currentPos.y - pieceHeight / 2

  renderPiece(ctx, piece, drawX, drawY, layout.cellSize, ANIMATION.dragOpacity)
}

/**
 * Pieceを描画（パターン・シール対応版）
 */
export function renderPiece(
  ctx: CanvasRenderingContext2D,
  piece: Piece,
  startX: number,
  startY: number,
  cellSize: number,
  opacity: number
): void {
  const originalAlpha = ctx.globalAlpha
  const { shape, blocks } = piece

  try {
    ctx.globalAlpha = opacity

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue

        const cellX = startX + x * cellSize
        const cellY = startY + y * cellSize

        // BlockDataからパターンとシールを取得
        const blockData = BlockDataMapUtils.get(blocks, y, x)
        const pattern = blockData?.pattern ?? null
        const seal = blockData?.seal ?? null

        drawWoodenCellWithBorder(ctx, cellX, cellY, cellSize, pattern, seal)
      }
    }
  } finally {
    ctx.globalAlpha = originalAlpha
  }
}

/** リサイクルボタンのサイズ（スロットセルサイズの倍率） */
const RECYCLE_BUTTON_SIZE_RATIO = 0.7

/**
 * リサイクルボタンを各ピーススロットの下に描画
 */
export function renderRecycleButtons(
  ctx: CanvasRenderingContext2D,
  pieceSlots: readonly PieceSlot[],
  layout: CanvasLayout,
  usesRemaining: number
): void {
  if (usesRemaining <= 0) return

  const slotCellSize = layout.cellSize * HD_LAYOUT.slotCellSizeRatio
  const btnSize = slotCellSize * RECYCLE_BUTTON_SIZE_RATIO

  pieceSlots.forEach((slot, index) => {
    if (!slot.piece) return

    const slotPos = layout.slotPositions[index]
    if (!slotPos) return

    // ボタン位置: スロットの下中央
    const btnX = slotPos.x + slotCellSize * 1.5 - btnSize / 2
    const btnY = slotPos.y + slotCellSize * 4.5

    // ボタン背景
    ctx.save()
    ctx.fillStyle = 'rgba(76, 175, 80, 0.8)'
    ctx.beginPath()
    ctx.roundRect(btnX, btnY, btnSize, btnSize, btnSize * 0.2)
    ctx.fill()

    // ♻️ アイコン
    ctx.fillStyle = '#fff'
    ctx.font = `${btnSize * 0.55}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('♻️', btnX + btnSize / 2, btnY + btnSize / 2)
    ctx.restore()
  })

  // 残り回数表示（右端に小さく）
  const lastSlot = layout.slotPositions[pieceSlots.length - 1]
  if (lastSlot) {
    const slotCell = layout.cellSize * HD_LAYOUT.slotCellSizeRatio
    ctx.save()
    ctx.fillStyle = '#fff'
    ctx.font = `bold ${slotCell * 0.4}px sans-serif`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'top'
    ctx.fillText(`♻️×${usesRemaining}`, lastSlot.x + slotCell * 6, lastSlot.y + slotCell * 4.5)
    ctx.restore()
  }
}

/**
 * リサイクルボタンのヒットテスト
 */
export function hitTestRecycleButton(
  pos: Position,
  pieceSlots: readonly PieceSlot[],
  layout: CanvasLayout
): RecycleButtonHitResult | null {
  const slotCellSize = layout.cellSize * HD_LAYOUT.slotCellSizeRatio
  const btnSize = slotCellSize * RECYCLE_BUTTON_SIZE_RATIO

  for (let index = 0; index < pieceSlots.length; index++) {
    if (!pieceSlots[index]?.piece) continue

    const slotPos = layout.slotPositions[index]
    if (!slotPos) continue

    const btnX = slotPos.x + slotCellSize * 1.5 - btnSize / 2
    const btnY = slotPos.y + slotCellSize * 4.5

    if (
      pos.x >= btnX && pos.x <= btnX + btnSize &&
      pos.y >= btnY && pos.y <= btnY + btnSize
    ) {
      return { slotIndex: index }
    }
  }

  return null
}


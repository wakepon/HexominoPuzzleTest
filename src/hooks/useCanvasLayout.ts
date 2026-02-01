import { useState, useEffect, useCallback, useMemo } from 'react'
import { CanvasLayout, Position, PieceSlot } from '../lib/game/types'
import { GRID_SIZE, LAYOUT } from '../lib/game/constants'
import { getPieceSize } from '../lib/game/pieceDefinitions'

/**
 * Canvasレイアウト計算フック
 * @param pieceSlots 現在のピーススロット（動的にスロット位置を計算するため）
 */
export function useCanvasLayout(pieceSlots: PieceSlot[]): CanvasLayout | null {
  const [layout, setLayout] = useState<CanvasLayout | null>(null)

  // pieceSlots の参照が変わるたびに再計算されないよう、形状のみを比較するキーを生成
  const pieceSlotsKey = useMemo(() => {
    return pieceSlots.map(slot => {
      if (!slot.piece) return 'empty'
      return slot.piece.shape
        .map(row => row.map(cell => cell ? '1' : '0').join(''))
        .join('|')
    }).join('_')
  }, [pieceSlots])

  // pieceSlotsKey を使って形状が変わったときのみ再計算
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stablePieceSlots = useMemo(() => pieceSlots, [pieceSlotsKey])

  const calculateLayout = useCallback(() => {
    // 画面サイズ取得
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    // パディング（定数から取得）
    const horizontalPadding = LAYOUT.canvasPaddingHorizontal
    const verticalPadding = LAYOUT.canvasPaddingVertical

    // 利用可能な幅と高さ
    const availableWidth = screenWidth - horizontalPadding * 2
    const availableHeight = screenHeight - verticalPadding * 2

    // ボードのセルサイズを計算
    const boardAreaHeight = availableHeight * LAYOUT.boardAreaRatio
    const maxCellSizeByHeight = boardAreaHeight / GRID_SIZE
    const maxCellSizeByWidth = availableWidth / GRID_SIZE
    const cellSize = Math.floor(Math.min(maxCellSizeByHeight, maxCellSizeByWidth))

    // ボードサイズ
    const boardSize = GRID_SIZE * cellSize

    // Canvas全体サイズ
    const canvasWidth = Math.max(boardSize + LAYOUT.boardPadding * 2, availableWidth)
    const canvasHeight = availableHeight

    // ボードの位置（中央上部）
    const boardOffsetX = (canvasWidth - boardSize) / 2
    const boardOffsetY = verticalPadding

    // スロットエリアの位置
    const slotAreaY = boardOffsetY + boardSize + LAYOUT.slotAreaPadding * 2

    // スロット位置を計算（実際のピースに基づいて動的に計算）
    const slotPositions = calculateSlotPositions(
      canvasWidth,
      slotAreaY,
      cellSize,
      stablePieceSlots
    )

    setLayout({
      canvasWidth,
      canvasHeight,
      boardOffsetX,
      boardOffsetY,
      cellSize,
      slotAreaY,
      slotPositions,
    })
  }, [stablePieceSlots])

  useEffect(() => {
    calculateLayout()

    const handleResize = () => {
      calculateLayout()
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [calculateLayout])

  return layout
}

/**
 * スロット位置を計算（実際のピースに基づいて動的に計算）
 */
function calculateSlotPositions(
  canvasWidth: number,
  slotAreaY: number,
  cellSize: number,
  pieceSlots: PieceSlot[]
): Position[] {
  const slotCellSize = cellSize * LAYOUT.slotCellSizeRatio
  const positions: Position[] = []

  // 各ブロックの幅を計算（空スロットは最小幅1セル）
  const pieceWidths = pieceSlots.map(slot => {
    if (!slot.piece) {
      return slotCellSize  // 空スロットは1セル分の幅
    }
    const size = getPieceSize(slot.piece.shape)
    return size.width * slotCellSize
  })

  // 全体の幅を計算
  const totalWidth = pieceWidths.reduce((sum, w) => sum + w, 0) + LAYOUT.slotGap * Math.max(0, pieceSlots.length - 1)

  // 開始位置（中央揃え）
  let currentX = (canvasWidth - totalWidth) / 2

  for (let i = 0; i < pieceSlots.length; i++) {
    positions.push({
      x: currentX,
      y: slotAreaY,
    })
    currentX += pieceWidths[i] + LAYOUT.slotGap
  }

  return positions
}

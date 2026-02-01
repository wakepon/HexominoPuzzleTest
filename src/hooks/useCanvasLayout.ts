import { useState, useEffect, useCallback } from 'react'
import { CanvasLayout, Position } from '../lib/game/types'
import { GRID_SIZE, SLOT_COUNT, LAYOUT } from '../lib/game/constants'
import { getPieceSize, getInitialPieces } from '../lib/game/pieceDefinitions'

/**
 * Canvasレイアウト計算フック
 */
export function useCanvasLayout(): CanvasLayout | null {
  const [layout, setLayout] = useState<CanvasLayout | null>(null)

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

    // スロット位置を計算
    const slotPositions = calculateSlotPositions(
      canvasWidth,
      slotAreaY,
      cellSize
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
  }, [])

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
 * スロット位置を計算
 */
function calculateSlotPositions(
  canvasWidth: number,
  slotAreaY: number,
  cellSize: number
): Position[] {
  const pieces = getInitialPieces()
  const slotCellSize = cellSize * LAYOUT.slotCellSizeRatio
  const positions: Position[] = []

  // 各ブロックの幅を計算
  const pieceWidths = pieces.map(piece => {
    const size = getPieceSize(piece.shape)
    return size.width * slotCellSize
  })

  // 全体の幅を計算
  const totalWidth = pieceWidths.reduce((sum, w) => sum + w, 0) + LAYOUT.slotGap * (SLOT_COUNT - 1)

  // 開始位置
  let currentX = (canvasWidth - totalWidth) / 2

  for (let i = 0; i < SLOT_COUNT; i++) {
    positions.push({
      x: currentX,
      y: slotAreaY,
    })
    currentX += pieceWidths[i] + LAYOUT.slotGap
  }

  return positions
}

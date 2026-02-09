import { useState, useEffect, useCallback, useMemo } from 'react'
import type { CanvasLayout, Position, PieceSlot } from '../lib/game/Domain'
import type { RelicId } from '../lib/game/Domain/Core/Id'
import { HD_LAYOUT, STOCK_SLOT_STYLE } from '../lib/game/Data/Constants'
import { getPieceSize } from '../lib/game/Services/PieceService'
import { hasRelic } from '../lib/game/Domain/Effect/RelicEffectHandler'

/**
 * Canvasレイアウト計算フック（HD 1280x720固定レイアウト）
 * @param pieceSlots 現在のピーススロット（動的にスロット位置を計算するため）
 * @param ownedRelics 所持レリック（ストック枠表示判定用）
 */
export function useCanvasLayout(
  pieceSlots: readonly PieceSlot[],
  ownedRelics: readonly RelicId[] = []
): CanvasLayout | null {
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

  // hand_stockレリックを所持しているか
  const hasHandStock = hasRelic(ownedRelics, 'hand_stock')

  const calculateLayout = useCallback(() => {
    // HD固定サイズ
    const canvasWidth = HD_LAYOUT.canvasWidth
    const canvasHeight = HD_LAYOUT.canvasHeight

    // セルサイズ（固定）
    const cellSize = HD_LAYOUT.cellSize

    // ボードの位置（右側パネルの中央）
    const boardOffsetX = HD_LAYOUT.boardOffsetX
    const boardOffsetY = HD_LAYOUT.boardOffsetY

    // スロットエリアの位置
    const slotAreaY = HD_LAYOUT.slotAreaY

    // スロット位置を計算（右側パネル内で中央揃え）
    const slotPositions = calculateSlotPositions(
      HD_LAYOUT.rightPanelStartX,
      canvasWidth,
      slotAreaY,
      cellSize,
      stablePieceSlots
    )

    // ストック枠位置（hand_stockレリック所持時のみ）
    const stockSlotPosition = hasHandStock
      ? { x: STOCK_SLOT_STYLE.x, y: STOCK_SLOT_STYLE.y }
      : null

    setLayout({
      canvasWidth,
      canvasHeight,
      boardOffsetX,
      boardOffsetY,
      cellSize,
      slotAreaY,
      slotPositions,
      stockSlotPosition,
    })
  }, [stablePieceSlots, hasHandStock])

  useEffect(() => {
    calculateLayout()

    // HD固定レイアウトなのでリサイズイベントは不要だが、
    // 将来的な拡張のために残しておく
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
 * スロット位置を計算（ボードの中央に揃える）
 */
function calculateSlotPositions(
  _rightPanelStartX: number,
  _canvasWidth: number,
  slotAreaY: number,
  cellSize: number,
  pieceSlots: readonly PieceSlot[]
): Position[] {
  const slotCellSize = cellSize * HD_LAYOUT.slotCellSizeRatio
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
  const totalWidth = pieceWidths.reduce((sum, w) => sum + w, 0) + HD_LAYOUT.slotGap * Math.max(0, pieceSlots.length - 1)

  // ボードの幅と中央位置
  const boardWidth = 6 * cellSize  // 6x6グリッド
  const boardCenterX = HD_LAYOUT.boardOffsetX + boardWidth / 2

  // 開始位置（ボードの中央に揃える）
  let currentX = boardCenterX - totalWidth / 2

  for (let i = 0; i < pieceSlots.length; i++) {
    positions.push({
      x: currentX,
      y: slotAreaY,
    })
    currentX += pieceWidths[i] + HD_LAYOUT.slotGap
  }

  return positions
}

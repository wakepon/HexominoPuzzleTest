import { useRef, useEffect, useCallback, useState } from 'react'
import { GameState, CanvasLayout, Position } from '../lib/game/types'
import { COLORS, LAYOUT } from '../lib/game/constants'
import { renderBoard } from './renderer/boardRenderer'
import { renderPieceSlots, renderDraggingPiece } from './renderer/pieceRenderer'
import { renderPlacementPreview } from './renderer/previewRenderer'
import { renderClearAnimation } from './renderer/clearAnimationRenderer'
import { renderScore } from './renderer/scoreRenderer'
import { screenToBoardPosition } from '../lib/game/collisionDetection'
import { getPieceSize } from '../lib/game/pieceDefinitions'

interface GameCanvasProps {
  state: GameState
  layout: CanvasLayout
  onDragStart: (slotIndex: number, startPos: { x: number; y: number }) => void
  onDragMove: (currentPos: { x: number; y: number }, boardPos: { x: number; y: number } | null) => void
  onDragEnd: () => void
  onClearAnimationEnd: () => void
}

export function GameCanvas({
  state,
  layout,
  onDragStart,
  onDragMove,
  onDragEnd,
  onClearAnimationEnd,
}: GameCanvasProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const dprRef = useRef(window.devicePixelRatio || 1)
  const isDraggingRef = useRef(false)
  const activeSlotRef = useRef<number | null>(null)

  // callback ref でcanvasを取得
  const canvasRefCallback = useCallback((node: HTMLCanvasElement | null) => {
    setCanvas(node)
  }, [])

  // 描画関数
  const render = useCallback(() => {
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = dprRef.current

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.fillStyle = COLORS.boardBackground
    ctx.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight)

    // スコア描画
    renderScore(ctx, state.score, layout)

    // ボード描画（消去アニメーション中のセルは除外）
    const clearingCells = state.clearingAnimation?.isAnimating
      ? state.clearingAnimation.cells
      : null
    renderBoard(ctx, state.board, layout, clearingCells)

    renderPlacementPreview(ctx, state.board, state.pieceSlots, state.dragState, layout)
    renderPieceSlots(ctx, state.pieceSlots, layout, state.dragState)
    renderDraggingPiece(ctx, state.pieceSlots, state.dragState, layout)

    // 消去アニメーション描画（ボードから除外されたセルをアニメーションとして描画）
    if (state.clearingAnimation?.isAnimating) {
      const isComplete = renderClearAnimation(ctx, state.clearingAnimation, layout)
      if (isComplete) {
        onClearAnimationEnd()
      }
    }
  }, [canvas, state, layout, onClearAnimationEnd])

  // Canvasサイズの設定
  useEffect(() => {
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    dprRef.current = dpr

    canvas.width = layout.canvasWidth * dpr
    canvas.height = layout.canvasHeight * dpr
    canvas.style.width = `${layout.canvasWidth}px`
    canvas.style.height = `${layout.canvasHeight}px`
  }, [canvas, layout])

  // 描画更新
  useEffect(() => {
    render()
  }, [render])

  // ドラッグ中のアニメーションループ
  useEffect(() => {
    if (!state.dragState.isDragging) return

    let animationId: number

    const animate = () => {
      render()
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [state.dragState.isDragging, render])

  // 消去アニメーションのループ
  useEffect(() => {
    if (!state.clearingAnimation?.isAnimating) return

    let animationId: number

    const animate = () => {
      render()
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [state.clearingAnimation?.isAnimating, render])

  // ドラッグ&ドロップイベントリスナー
  useEffect(() => {
    if (!canvas) return

    const getCanvasPosition = (e: MouseEvent | Touch): Position => {
      const rect = canvas.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const findSlotAtPosition = (pos: Position): number | null => {
      for (let i = 0; i < state.pieceSlots.length; i++) {
        const slot = state.pieceSlots[i]
        if (!slot.piece) continue

        const slotPos = layout.slotPositions[i]
        const pieceSize = getPieceSize(slot.piece.shape)
        const slotCellSize = layout.cellSize * LAYOUT.slotCellSizeRatio

        const slotWidth = pieceSize.width * slotCellSize
        const slotHeight = pieceSize.height * slotCellSize

        if (
          pos.x >= slotPos.x &&
          pos.x <= slotPos.x + slotWidth &&
          pos.y >= slotPos.y &&
          pos.y <= slotPos.y + slotHeight
        ) {
          return i
        }
      }
      return null
    }

    const calculateBoardPosition = (pos: Position, slotIndex: number): Position | null => {
      const slot = state.pieceSlots[slotIndex]
      if (!slot?.piece) return null

      const shape = slot.piece.shape
      const pieceWidth = shape[0].length * layout.cellSize
      const pieceHeight = shape.length * layout.cellSize

      const pieceLeft = pos.x - pieceWidth / 2
      const pieceTop = pos.y - pieceHeight / 2

      return screenToBoardPosition(
        { x: pieceLeft, y: pieceTop },
        layout.boardOffsetX,
        layout.boardOffsetY,
        layout.cellSize
      )
    }

    const handleMouseDown = (e: MouseEvent) => {
      // アニメーション中は操作をブロック
      if (state.clearingAnimation?.isAnimating) return

      e.preventDefault()
      const pos = getCanvasPosition(e)
      const slotIndex = findSlotAtPosition(pos)

      if (slotIndex === null) return

      isDraggingRef.current = true
      activeSlotRef.current = slotIndex
      onDragStart(slotIndex, pos)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || activeSlotRef.current === null) return
      e.preventDefault()

      const pos = getCanvasPosition(e)
      const boardPos = calculateBoardPosition(pos, activeSlotRef.current)
      onDragMove(pos, boardPos)
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      e.preventDefault()

      isDraggingRef.current = false
      activeSlotRef.current = null
      onDragEnd()
    }

    const handleTouchStart = (e: TouchEvent) => {
      // アニメーション中は操作をブロック
      if (state.clearingAnimation?.isAnimating) return

      e.preventDefault()
      const pos = getCanvasPosition(e.touches[0])
      const slotIndex = findSlotAtPosition(pos)

      if (slotIndex === null) return

      isDraggingRef.current = true
      activeSlotRef.current = slotIndex
      onDragStart(slotIndex, pos)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || activeSlotRef.current === null) return
      e.preventDefault()

      const pos = getCanvasPosition(e.touches[0])
      const boardPos = calculateBoardPosition(pos, activeSlotRef.current)
      onDragMove(pos, boardPos)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDraggingRef.current) return
      e.preventDefault()

      isDraggingRef.current = false
      activeSlotRef.current = null
      onDragEnd()
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: false })
    window.addEventListener('touchcancel', handleTouchEnd, { passive: false })

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      canvas.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [canvas, layout, state.pieceSlots, state.clearingAnimation, onDragStart, onDragMove, onDragEnd])

  return (
    <canvas
      ref={canvasRefCallback}
      className="touch-none"
      style={{
        display: 'block',
      }}
    />
  )
}

import { useRef, useEffect, useCallback, useState } from 'react'
import { GameState, CanvasLayout, Position } from '../lib/game/types'
import { COLORS, LAYOUT, ROUND_CLEAR_STYLE, DEBUG_PROBABILITY_SETTINGS } from '../lib/game/constants'
import { renderBoard } from './renderer/boardRenderer'
import { renderPieceSlots, renderDraggingPiece } from './renderer/pieceRenderer'
import { renderPlacementPreview } from './renderer/previewRenderer'
import { renderClearAnimation } from './renderer/clearAnimationRenderer'
import { renderScore } from './renderer/scoreRenderer'
import { renderRemainingHands, renderGold } from './renderer/uiRenderer'
import { renderRoundInfo } from './renderer/roundRenderer'
import { renderRoundClear, renderGameOver, renderGameClear } from './renderer/overlayRenderer'
import { renderShop, ShopRenderResult } from './renderer/shopRenderer'
import { renderDebugWindow, DebugWindowRenderResult } from './renderer/debugRenderer'
import { renderTooltip } from './renderer/tooltipRenderer'
import { renderRelicPanel } from './renderer/relicPanelRenderer'
import { renderRelicEffect } from './renderer/relicEffectRenderer'
import type { DebugSettings } from '../lib/game/Domain/Debug'
import type { TooltipState } from '../lib/game/Domain/Tooltip'
import { INITIAL_TOOLTIP_STATE } from '../lib/game/Domain/Tooltip'
import { calculateTooltipState } from '../lib/game/Services/TooltipService'
import { screenToBoardPosition } from '../lib/game/collisionDetection'
import { getPieceSize } from '../lib/game/pieceDefinitions'
import { canAfford } from '../lib/game/shopLogic'

interface GameCanvasProps {
  state: GameState
  layout: CanvasLayout
  debugSettings: DebugSettings
  onDragStart: (slotIndex: number, startPos: { x: number; y: number }) => void
  onDragMove: (currentPos: { x: number; y: number }, boardPos: { x: number; y: number } | null) => void
  onDragEnd: () => void
  onClearAnimationEnd: () => void
  onRelicActivationAnimationEnd: () => void
  onAdvanceRound: () => void
  onReset: () => void
  onBuyItem: (itemIndex: number) => void
  onLeaveShop: () => void
  onUpdateDebugSettings: (updates: Partial<DebugSettings>) => void
}

export function GameCanvas({
  state,
  layout,
  debugSettings,
  onDragStart,
  onDragMove,
  onDragEnd,
  onClearAnimationEnd,
  onRelicActivationAnimationEnd,
  onAdvanceRound,
  onReset,
  onBuyItem,
  onLeaveShop,
  onUpdateDebugSettings,
}: GameCanvasProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [showDebugWindow, setShowDebugWindow] = useState(false)
  const [tooltipState, setTooltipState] = useState<TooltipState>(INITIAL_TOOLTIP_STATE)
  const dprRef = useRef(window.devicePixelRatio || 1)
  const isDraggingRef = useRef(false)
  const activeSlotRef = useRef<number | null>(null)
  const buttonAreaRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null)
  const roundClearTimeRef = useRef<number | null>(null)
  const shopRenderResultRef = useRef<ShopRenderResult | null>(null)
  const debugWindowResultRef = useRef<DebugWindowRenderResult | null>(null)

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

    // ゴールド描画
    renderGold(ctx, state.player.gold)

    // レリックパネル描画（ゴールドの右隣）
    renderRelicPanel(ctx, state.player.ownedRelics)

    // スコア描画
    renderScore(ctx, state.score, layout)

    // 残りハンド・目標描画（中央）
    renderRemainingHands(ctx, state.deck.remainingHands, state.targetScore, layout)

    // ラウンド情報描画（右上）
    renderRoundInfo(ctx, state.roundInfo, layout)

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

    // レリック発動エフェクト描画
    if (state.relicActivationAnimation?.isAnimating) {
      const isComplete = renderRelicEffect(ctx, state.relicActivationAnimation, layout)
      if (isComplete) {
        onRelicActivationAnimationEnd()
      }
    }

    // オーバーレイ描画
    if (state.phase === 'round_clear') {
      const goldReward = state.deck.remainingHands
      renderRoundClear(ctx, state.round, goldReward, layout)
      buttonAreaRef.current = null
      shopRenderResultRef.current = null
    } else if (state.phase === 'shopping' && state.shopState) {
      shopRenderResultRef.current = renderShop(ctx, state.shopState, state.player.gold, layout)
      buttonAreaRef.current = null
    } else if (state.phase === 'game_over') {
      buttonAreaRef.current = renderGameOver(ctx, state.round, state.score, state.player.gold, layout)
      shopRenderResultRef.current = null
    } else if (state.phase === 'game_clear') {
      buttonAreaRef.current = renderGameClear(ctx, state.player.gold, layout)
      shopRenderResultRef.current = null
    } else {
      buttonAreaRef.current = null
      shopRenderResultRef.current = null
    }

    // デバッグウィンドウ描画
    if (showDebugWindow) {
      debugWindowResultRef.current = renderDebugWindow(ctx, state.deck, debugSettings)
    } else {
      debugWindowResultRef.current = null
    }

    // ツールチップ描画（オーバーレイ表示中やドラッグ中は非表示）
    const showTooltip =
      tooltipState.visible &&
      !state.dragState.isDragging &&
      !state.clearingAnimation?.isAnimating &&
      state.phase !== 'round_clear' &&
      state.phase !== 'game_over' &&
      state.phase !== 'game_clear'

    if (showTooltip) {
      renderTooltip(ctx, tooltipState, layout.canvasWidth, layout.canvasHeight)
    }
  }, [canvas, state, layout, onClearAnimationEnd, onRelicActivationAnimationEnd, showDebugWindow, debugSettings, tooltipState])

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

  // レリック発動アニメーションのループ
  useEffect(() => {
    if (!state.relicActivationAnimation?.isAnimating) return

    let animationId: number

    const animate = () => {
      render()
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [state.relicActivationAnimation?.isAnimating, render])

  // ラウンドクリア演出のタイマー
  useEffect(() => {
    if (state.phase !== 'round_clear') {
      roundClearTimeRef.current = null
      return
    }

    // 演出開始時刻を記録
    if (roundClearTimeRef.current === null) {
      roundClearTimeRef.current = Date.now()
    }

    const timer = setTimeout(() => {
      onAdvanceRound()
    }, ROUND_CLEAR_STYLE.duration)

    return () => {
      clearTimeout(timer)
    }
  }, [state.phase, onAdvanceRound])

  // キーボードイベントリスナー（Shift + 1 でデバッグウィンドウのトグル）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + 1 でデバッグウィンドウをトグル
      if (e.shiftKey && e.key === '!') {
        setShowDebugWindow(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

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

    const isPointInButton = (pos: Position): boolean => {
      const btn = buttonAreaRef.current
      if (!btn) return false
      return (
        pos.x >= btn.x &&
        pos.x <= btn.x + btn.width &&
        pos.y >= btn.y &&
        pos.y <= btn.y + btn.height
      )
    }

    const isPointInArea = (pos: Position, area: { x: number; y: number; width: number; height: number }): boolean => {
      return (
        pos.x >= area.x &&
        pos.x <= area.x + area.width &&
        pos.y >= area.y &&
        pos.y <= area.y + area.height
      )
    }

    const handleShopClick = (pos: Position): boolean => {
      const shopResult = shopRenderResultRef.current
      if (!shopResult || !state.shopState) return false

      // 店を出るボタンのクリック
      if (isPointInArea(pos, shopResult.leaveButtonArea)) {
        onLeaveShop()
        return true
      }

      // アイテムのクリック
      for (const itemArea of shopResult.itemAreas) {
        if (isPointInArea(pos, itemArea)) {
          const item = state.shopState.items[itemArea.itemIndex]
          // 購入済みでなく、ゴールドが足りている場合のみ購入
          if (!item.purchased && canAfford(state.player.gold, item.price)) {
            onBuyItem(itemArea.itemIndex)
          }
          return true
        }
      }

      return false
    }

    const handleDebugWindowClick = (pos: Position): boolean => {
      const debugResult = debugWindowResultRef.current
      if (!debugResult || !showDebugWindow) return false

      const { MIN, MAX, STEP } = DEBUG_PROBABILITY_SETTINGS

      // パターン確率のマイナスボタン
      if (isPointInArea(pos, debugResult.patternMinusButton)) {
        onUpdateDebugSettings({
          patternProbability: Math.max(MIN, debugSettings.patternProbability - STEP),
        })
        return true
      }

      // パターン確率のプラスボタン
      if (isPointInArea(pos, debugResult.patternPlusButton)) {
        onUpdateDebugSettings({
          patternProbability: Math.min(MAX, debugSettings.patternProbability + STEP),
        })
        return true
      }

      // シール確率のマイナスボタン
      if (isPointInArea(pos, debugResult.sealMinusButton)) {
        onUpdateDebugSettings({
          sealProbability: Math.max(MIN, debugSettings.sealProbability - STEP),
        })
        return true
      }

      // シール確率のプラスボタン
      if (isPointInArea(pos, debugResult.sealPlusButton)) {
        onUpdateDebugSettings({
          sealProbability: Math.min(MAX, debugSettings.sealProbability + STEP),
        })
        return true
      }

      // ウィンドウ内のクリックはイベントを消費（貫通しない）
      if (isPointInArea(pos, debugResult.windowBounds)) {
        return true
      }

      return false
    }

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      const pos = getCanvasPosition(e)

      // デバッグウィンドウのクリック判定（最優先）
      if (handleDebugWindowClick(pos)) {
        return
      }

      // ショッピングフェーズ
      if (state.phase === 'shopping') {
        handleShopClick(pos)
        return
      }

      // ゲームオーバー/クリア時はボタンクリックのみ許可
      if (state.phase === 'game_over' || state.phase === 'game_clear') {
        if (isPointInButton(pos)) {
          onReset()
        }
        return
      }

      // アニメーション中またはラウンドクリア中は操作をブロック
      if (state.clearingAnimation?.isAnimating || state.phase === 'round_clear') return

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
      e.preventDefault()
      const pos = getCanvasPosition(e.touches[0])

      // デバッグウィンドウのクリック判定（最優先）
      if (handleDebugWindowClick(pos)) {
        return
      }

      // ショッピングフェーズ
      if (state.phase === 'shopping') {
        handleShopClick(pos)
        return
      }

      // ゲームオーバー/クリア時はボタンクリックのみ許可
      if (state.phase === 'game_over' || state.phase === 'game_clear') {
        if (isPointInButton(pos)) {
          onReset()
        }
        return
      }

      // アニメーション中またはラウンドクリア中は操作をブロック
      if (state.clearingAnimation?.isAnimating || state.phase === 'round_clear') return

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

    // ツールチップ用のマウス移動ハンドラー
    const handleCanvasMouseMove = (e: MouseEvent) => {
      // ドラッグ中はツールチップを更新しない
      if (isDraggingRef.current) {
        setTooltipState((prev) => (prev.visible ? INITIAL_TOOLTIP_STATE : prev))
        return
      }

      const pos = getCanvasPosition(e)
      const newTooltipState = calculateTooltipState(pos, state, layout)

      // 変化がある場合のみ更新（不要な再レンダリングを防ぐ）
      setTooltipState((prev) => {
        if (
          prev.visible === newTooltipState.visible &&
          prev.x === newTooltipState.x &&
          prev.y === newTooltipState.y &&
          prev.effects.length === newTooltipState.effects.length
        ) {
          return prev
        }
        return newTooltipState
      })
    }

    // マウスがCanvas外に出た時のハンドラー
    const handleCanvasMouseLeave = () => {
      setTooltipState((prev) => (prev.visible ? INITIAL_TOOLTIP_STATE : prev))
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleCanvasMouseMove)
    canvas.addEventListener('mouseleave', handleCanvasMouseLeave)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: false })
    window.addEventListener('touchcancel', handleTouchEnd, { passive: false })

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleCanvasMouseMove)
      canvas.removeEventListener('mouseleave', handleCanvasMouseLeave)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      canvas.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [canvas, layout, state.pieceSlots, state.clearingAnimation, state.phase, state.shopState, state.player, state.board, state.dragState, onDragStart, onDragMove, onDragEnd, onReset, onBuyItem, onLeaveShop, showDebugWindow, debugSettings, onUpdateDebugSettings])

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

import { useRef, useEffect, useCallback, useState } from 'react'
import { GameState, CanvasLayout, Position } from '../lib/game/types'
import { COLORS, HD_LAYOUT, ROUND_CLEAR_STYLE, DEBUG_PROBABILITY_SETTINGS } from '../lib/game/Data/Constants'
import { SCORE_ANIMATION } from '../lib/game/Domain/Animation/ScoreAnimationState'
import { renderBoard, renderScriptMarkers } from './renderer/boardRenderer'
import { renderPieceSlots, renderDraggingPiece, renderRecycleButtons, hitTestRecycleButton } from './renderer/pieceRenderer'
import { renderPlacementPreview } from './renderer/previewRenderer'
import { renderClearAnimation } from './renderer/clearAnimationRenderer'
import { renderStatusPanel, StatusPanelRenderResult } from './renderer/statusPanelRenderer'
import { renderRoundClear, renderGameOver, renderGameClear } from './renderer/overlayRenderer'
import { renderShop, ShopRenderResult } from './renderer/shopRenderer'
import { renderDebugWindow, DebugWindowRenderResult } from './renderer/debugRenderer'
import { renderTooltip } from './renderer/tooltipRenderer'
import { renderRelicPanel, type RelicPanelRenderResult } from './renderer/relicPanelRenderer'
import { renderRelicEffect } from './renderer/relicEffectRenderer'
import { renderScoreAnimation, type ScoreAnimationRenderResult } from './renderer/scoreAnimationRenderer'
import { renderRoundProgress, RoundProgressRenderResult } from './renderer/RoundProgressRenderer'
import { renderDeckView, DeckViewRenderResult } from './renderer/DeckViewRenderer'
import { renderStockSlot, renderStockSlot2, StockSlotRenderResult, StockSlot2RenderResult } from './renderer/StockSlotRenderer'
import { drawWoodenCellWithBorder } from './renderer/cellRenderer'
import { BlockDataMapUtils } from '../lib/game/Domain/Piece/BlockData'
import type { DebugSettings } from '../lib/game/Domain/Debug'
import type { RelicType } from '../lib/game/Domain/Effect/Relic'
import { hasRelic } from '../lib/game/Domain/Effect/RelicEffectHandler'
import { getBandaidCountdown } from '../lib/game/Domain/Effect/RelicState'
import { calculateGoldReward, calculateInterest } from '../lib/game/Services/RoundService'
import { resolveCopyTarget, isCopyRelicInactive } from '../lib/game/Domain/Effect/CopyRelicResolver'
import type { RelicId } from '../lib/game/Domain/Core/Id'
import type { TooltipState } from '../lib/game/Domain/Tooltip'
import { INITIAL_TOOLTIP_STATE } from '../lib/game/Domain/Tooltip'
import { calculateTooltipState } from '../lib/game/Services/TooltipService'
import { screenToBoardPosition } from '../lib/game/Services/CollisionService'
import { getPieceSize } from '../lib/game/Services/PieceService'
import { canAfford, getRerollCost } from '../lib/game/Services/ShopService'
import { renderAmuletModal, type AmuletModalRenderResult } from './renderer/AmuletModalRenderer'
import { isAmuletShopItem } from '../lib/game/Domain/Shop/ShopTypes'
import { MAX_AMULET_STOCK } from '../lib/game/Domain/Effect/Amulet'
import type { AmuletType } from '../lib/game/Domain/Effect/Amulet'
import type { MinoId } from '../lib/game/Domain/Core/Id'

interface GameCanvasProps {
  state: GameState
  layout: CanvasLayout
  debugSettings: DebugSettings
  onDragStart: (slotIndex: number, startPos: { x: number; y: number }) => void
  onDragStartFromStock: (startPos: { x: number; y: number }) => void
  onDragStartFromStock2: (startPos: { x: number; y: number }) => void
  onDragMove: (currentPos: { x: number; y: number }, boardPos: { x: number; y: number } | null) => void
  onDragEnd: () => void
  onClearAnimationEnd: () => void
  onRelicActivationAnimationEnd: () => void
  onAdvanceScoreStep: () => void
  onEndScoreAnimation: () => void
  onSetFastForward: (isFastForward: boolean) => void
  onAdvanceRound: () => void
  onReset: () => void
  onBuyItem: (itemIndex: number) => void
  onLeaveShop: () => void
  onRerollShop: () => void
  onStartSellMode: () => void
  onCancelSellMode: () => void
  onSellRelic: (relicIndex: number) => void
  onUpdateDebugSettings: (updates: Partial<DebugSettings>) => void
  onDeleteSave: () => void
  onStartRound: () => void
  onOpenDeckView: () => void
  onCloseDeckView: () => void
  onMoveToStock: (slotIndex: number) => void
  onMoveFromStock: (targetSlotIndex: number) => void
  onSwapWithStock: (slotIndex: number) => void
  onMoveToStock2: (slotIndex: number) => void
  onMoveFromStock2: (targetSlotIndex: number) => void
  onSwapWithStock2: (slotIndex: number) => void
  onReorderRelic: (fromIndex: number, toIndex: number) => void
  onRecyclePiece: (slotIndex: number) => void
  onApplyPendingPhase: () => void
  // 護符操作
  onUseAmulet: (amuletIndex: number) => void
  onAmuletSelectPiece: (minoId: MinoId) => void
  onAmuletConfirm: () => void
  onAmuletCancel: () => void
  onAmuletSell: (amuletIndex: number) => void
  onAmuletSculptToggleBlock: (row: number, col: number) => void
  // デバッグ用
  onDebugToggleRelic: (relicType: RelicType) => void
  onDebugAddGold: (amount: number) => void
  onDebugAddScore: (amount: number) => void
  onDebugAddAmulet: (amuletType: AmuletType) => void
  onDebugRemoveAmulet: (amuletIndex: number) => void
  onDebugAddRandomEffects: () => void
}

export function GameCanvas({
  state,
  layout,
  debugSettings,
  onDragStart,
  onDragStartFromStock,
  onDragStartFromStock2,
  onDragMove,
  onDragEnd,
  onClearAnimationEnd,
  onRelicActivationAnimationEnd,
  onAdvanceScoreStep,
  onEndScoreAnimation,
  onSetFastForward,
  onAdvanceRound,
  onReset,
  onBuyItem,
  onLeaveShop,
  onRerollShop,
  onStartSellMode,
  onCancelSellMode,
  onSellRelic,
  onUpdateDebugSettings,
  onDeleteSave,
  onStartRound,
  onOpenDeckView,
  onCloseDeckView,
  onMoveToStock,
  onMoveFromStock,
  onSwapWithStock,
  onMoveToStock2,
  onMoveFromStock2,
  onSwapWithStock2,
  onReorderRelic,
  onRecyclePiece,
  onApplyPendingPhase,
  onUseAmulet,
  onAmuletSelectPiece,
  onAmuletConfirm,
  onAmuletCancel,
  onAmuletSell: _onAmuletSell,
  onAmuletSculptToggleBlock,
  onDebugToggleRelic,
  onDebugAddGold,
  onDebugAddScore,
  onDebugAddAmulet,
  onDebugRemoveAmulet: _onDebugRemoveAmulet,
  onDebugAddRandomEffects,
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
  const roundProgressResultRef = useRef<RoundProgressRenderResult | null>(null)
  const deckViewResultRef = useRef<DeckViewRenderResult | null>(null)
  const statusPanelResultRef = useRef<StatusPanelRenderResult | null>(null)
  const stockSlotResultRef = useRef<StockSlotRenderResult | null>(null)
  const stockSlot2ResultRef = useRef<StockSlot2RenderResult | null>(null)
  const scoreAnimationResultRef = useRef<ScoreAnimationRenderResult | null>(null)
  const relicPanelResultRef = useRef<RelicPanelRenderResult | null>(null)
  const amuletModalResultRef = useRef<AmuletModalRenderResult | null>(null)
  // ストックからのドラッグかどうかを追跡
  const isDraggingFromStockRef = useRef(false)
  // ストック2からのドラッグかどうかを追跡
  const isDraggingFromStock2Ref = useRef(false)
  // レリックドラッグ&ドロップ状態
  const relicDragRef = useRef<{
    isDragging: boolean
    dragIndex: number | null
    currentY: number
    dropTargetIndex: number | null
  }>({ isDragging: false, dragIndex: null, currentY: 0, dropTargetIndex: null })

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

    // 左側ステータスパネル描画
    // コピーレリック用カウントダウン計算
    const copyState = state.relicMultiplierState.copyRelicState
    const copyBandaidCountdown = copyState?.targetRelicId === ('bandaid' as RelicId)
      ? 3 - copyState.bandaidCounter
      : null

    const isTimingActive = hasRelic(state.player.ownedRelics, 'timing') && state.deck.remainingHands % 3 === 0

    statusPanelResultRef.current = renderStatusPanel(ctx, {
      targetScore: state.targetScore,
      roundScore: state.score,
      gold: state.player.gold,
      roundInfo: state.roundInfo,
      remainingHands: state.deck.remainingHands,
      bandaidCountdown: hasRelic(state.player.ownedRelics, 'bandaid')
        ? getBandaidCountdown(state.relicMultiplierState)
        : null,
      timingBonusActive: isTimingActive,
      pendingPhase: state.pendingPhase,
      scoreAnimation: state.scoreAnimation,
      copyBandaidCountdown,
      amuletStock: state.player.amuletStock,
    }, layout)

    // レリックパネル描画（ボードの左側）
    const highlightedRelicId = state.scoreAnimation?.highlightedRelicId ?? null
    const grayedOutRelics = new Set<RelicId>()
    if (hasRelic(state.player.ownedRelics, 'volcano') && !state.volcanoEligible) {
      grayedOutRelics.add('volcano' as RelicId)
    }
    // コピーレリック非アクティブ時のグレーアウト
    if (isCopyRelicInactive(state.player.relicDisplayOrder)) {
      grayedOutRelics.add('copy' as RelicId)
    }

    const timingBonusRelicId = isTimingActive ? 'timing' as RelicId : null

    // コピーリンク表示用のレリックセット
    const copyLinkRelics = new Set<RelicId>()
    if (hasRelic(state.player.ownedRelics, 'copy')) {
      const copyTarget = resolveCopyTarget(state.player.relicDisplayOrder)
      if (copyTarget) {
        copyLinkRelics.add('copy' as RelicId)
        copyLinkRelics.add(copyTarget)
      }
    }

    relicPanelResultRef.current = renderRelicPanel(
      ctx,
      state.player.relicDisplayOrder,
      layout,
      highlightedRelicId,
      relicDragRef.current,
      grayedOutRelics,
      timingBonusRelicId,
      copyLinkRelics
    )

    // ボード描画（消去アニメーション中の開始済みセルのみ除外）
    const clearingCells = (() => {
      if (!state.clearingAnimation?.isAnimating) return null
      const animElapsed = Date.now() - state.clearingAnimation.startTime
      return state.clearingAnimation.cells.filter(cell => {
        const cellDelay = cell.delay ?? 0
        return animElapsed >= cellDelay
      })
    })()
    renderBoard(ctx, state.board, layout, clearingCells)

    // 台本レリックのマーカー描画
    if (state.scriptRelicLines) {
      renderScriptMarkers(ctx, state.scriptRelicLines, layout)
    }

    renderPlacementPreview(ctx, state.board, state.pieceSlots, state.dragState, layout)
    renderPieceSlots(ctx, state.pieceSlots, layout, state.dragState)

    // リサイクルボタン描画（recyclerレリック所持時のみ）
    if (state.phase === 'playing' && hasRelic(state.player.ownedRelics, 'recycler')) {
      renderRecycleButtons(ctx, state.pieceSlots, layout, state.relicMultiplierState.recyclerUsesRemaining)
    }

    // ストック枠描画（hand_stockレリック所持時のみ）
    stockSlotResultRef.current = renderStockSlot(ctx, state.deck.stockSlot, layout, state.dragState)

    // ストック枠2描画（コピーレリックでhand_stockをコピー中のみ）
    const copyTargetForStock = state.relicMultiplierState.copyRelicState?.targetRelicId
    const showStock2 = hasRelic(state.player.ownedRelics, 'hand_stock') &&
      hasRelic(state.player.ownedRelics, 'copy') &&
      copyTargetForStock === ('hand_stock' as RelicId)
    stockSlot2ResultRef.current = showStock2
      ? renderStockSlot2(ctx, state.deck.stockSlot2, layout, state.dragState)
      : null

    // ドラッグ中のピース描画（手札から）
    renderDraggingPiece(ctx, state.pieceSlots, state.dragState, layout)

    // ストックからのドラッグ中のピース描画
    const dragFromStockPiece = state.dragState.isDragging && state.dragState.currentPos
      ? (state.dragState.dragSource === 'stock' ? state.deck.stockSlot
        : state.dragState.dragSource === 'stock2' ? state.deck.stockSlot2
        : null)
      : null
    if (dragFromStockPiece && state.dragState.currentPos) {
      const pieceWidth = dragFromStockPiece.shape[0].length * layout.cellSize
      const pieceHeight = dragFromStockPiece.shape.length * layout.cellSize
      const drawX = state.dragState.currentPos.x - pieceWidth / 2
      const drawY = state.dragState.currentPos.y - pieceHeight / 2

      ctx.globalAlpha = 0.8
      for (let y = 0; y < dragFromStockPiece.shape.length; y++) {
        for (let x = 0; x < dragFromStockPiece.shape[y].length; x++) {
          if (!dragFromStockPiece.shape[y][x]) continue
          const cellX = drawX + x * layout.cellSize
          const cellY = drawY + y * layout.cellSize
          const blockData = BlockDataMapUtils.get(dragFromStockPiece.blocks, y, x)
          const pattern = blockData?.pattern ?? null
          const seal = blockData?.seal ?? null
          drawWoodenCellWithBorder(ctx, cellX, cellY, layout.cellSize, pattern, seal)
        }
      }
      ctx.globalAlpha = 1.0
    }

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

    // スコアアニメーション描画
    if (state.scoreAnimation?.isAnimating && statusPanelResultRef.current) {
      scoreAnimationResultRef.current = renderScoreAnimation(ctx, state.scoreAnimation, statusPanelResultRef.current.formulaY)
    } else {
      scoreAnimationResultRef.current = null
    }

    // オーバーレイ描画
    if (state.phase === 'round_progress') {
      roundProgressResultRef.current = renderRoundProgress(
        ctx,
        state.round,
        state.roundInfo,
        state.targetScore,
        layout
      )
      buttonAreaRef.current = null
      shopRenderResultRef.current = null
    } else if (state.phase === 'round_clear') {
      const goldReward = calculateGoldReward(state.deck.remainingHands, state.roundInfo.roundType)
      const interest = calculateInterest(state.player.gold)
      renderRoundClear(ctx, state.round, goldReward, interest, state.player.gold, layout)
      buttonAreaRef.current = null
      shopRenderResultRef.current = null
      roundProgressResultRef.current = null
    } else if (state.phase === 'shopping' && state.shopState) {
      shopRenderResultRef.current = renderShop(ctx, state.shopState, state.player.gold, layout, state.shopState.rerollCount, state.player.relicDisplayOrder, state.player.amuletStock.length)
      buttonAreaRef.current = null
      roundProgressResultRef.current = null
    } else if (state.phase === 'game_over') {
      buttonAreaRef.current = renderGameOver(ctx, state.round, state.score, state.player.earnedGold, layout)
      shopRenderResultRef.current = null
      roundProgressResultRef.current = null
    } else if (state.phase === 'game_clear') {
      buttonAreaRef.current = renderGameClear(ctx, state.player.earnedGold, layout)
      shopRenderResultRef.current = null
      roundProgressResultRef.current = null
    } else {
      buttonAreaRef.current = null
      shopRenderResultRef.current = null
      roundProgressResultRef.current = null
    }

    // デッキ一覧画面（他のオーバーレイより上に描画）
    if (state.deckViewOpen) {
      deckViewResultRef.current = renderDeckView(ctx, state.deck, state.pieceSlots, layout)
    } else {
      deckViewResultRef.current = null
    }

    // 護符モーダル描画（デッキ一覧より上に描画）
    if (state.amuletModal) {
      amuletModalResultRef.current = renderAmuletModal(ctx, state.amuletModal, state.deck, layout)
    } else {
      amuletModalResultRef.current = null
    }

    // デバッグウィンドウ描画
    if (showDebugWindow) {
      debugWindowResultRef.current = renderDebugWindow(
        ctx,
        state.deck,
        debugSettings,
        state.player.gold,
        state.score,
        state.player.ownedRelics
      )
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

  // スコアアニメーション終了後の遅延遷移
  useEffect(() => {
    // scoreAnimationが終了し、pendingPhaseがある場合に遅延して遷移
    if (state.scoreAnimation !== null || !state.pendingPhase) return

    const timer = setTimeout(() => {
      onApplyPendingPhase()
    }, SCORE_ANIMATION.postAnimationDelay)

    return () => clearTimeout(timer)
  }, [state.scoreAnimation, state.pendingPhase, onApplyPendingPhase])

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

  // スコアアニメーションのループ
  useEffect(() => {
    if (!state.scoreAnimation?.isAnimating) return

    let animationId: number

    const animate = () => {
      const anim = state.scoreAnimation
      if (!anim || !anim.isAnimating) return

      const now = Date.now()
      const stepDuration = anim.isFastForward ? 200 : anim.stepDuration

      if (anim.isCountingUp) {
        // カウントアップ完了チェック
        const countElapsed = now - anim.countStartTime
        if (countElapsed >= 500) {
          onEndScoreAnimation()
          return
        }
      } else {
        // ステップ時間経過で次のステップへ
        const elapsed = now - anim.stepStartTime
        if (elapsed >= stepDuration) {
          onAdvanceScoreStep()
        }
      }

      render()
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [state.scoreAnimation?.isAnimating, state.scoreAnimation?.currentStepIndex, state.scoreAnimation?.isCountingUp, state.scoreAnimation?.isFastForward, render, onAdvanceScoreStep, onEndScoreAnimation])

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
      // スペースキーで早送り開始
      if (e.code === 'Space' && state.scoreAnimation?.isAnimating) {
        e.preventDefault()
        onSetFastForward(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      // スペースキー離しで早送り終了
      if (e.code === 'Space') {
        onSetFastForward(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [state.scoreAnimation?.isAnimating, onSetFastForward])

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
        // レイアウト再計算中にslotPositionsとpieceSlotsの数が一致しない場合はスキップ
        if (!slotPos) continue

        const pieceSize = getPieceSize(slot.piece.shape)
        const slotCellSize = layout.cellSize * HD_LAYOUT.slotCellSizeRatio

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

    // ストックからのドラッグ時のボード位置計算
    const calculateBoardPositionForStock = (pos: Position): Position | null => {
      const stockPiece = state.deck.stockSlot
      if (!stockPiece) return null

      const shape = stockPiece.shape
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

    // ストック枠がクリックされたか判定
    const isPointInStockSlot = (pos: Position): boolean => {
      const stockResult = stockSlotResultRef.current
      if (!stockResult) return false
      return isPointInArea(pos, stockResult.bounds)
    }

    // ストック枠にピースがあるか
    const hasStockPiece = (): boolean => {
      return state.deck.stockSlot !== null
    }

    // ストック枠2がクリックされたか判定
    const isPointInStockSlot2 = (pos: Position): boolean => {
      const stock2Result = stockSlot2ResultRef.current
      if (!stock2Result) return false
      return isPointInArea(pos, stock2Result.bounds)
    }

    // ストック枠2にピースがあるか
    const hasStock2Piece = (): boolean => {
      return state.deck.stockSlot2 !== null
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

    // 護符モーダルのクリック処理
    const handleAmuletModalClick = (pos: Position): boolean => {
      const modalResult = amuletModalResultRef.current
      if (!modalResult || !state.amuletModal) return false

      // キャンセルボタン
      if (isPointInArea(pos, modalResult.cancelButton)) {
        onAmuletCancel()
        return true
      }

      // 確定ボタン（sculpt_edit時）
      if (modalResult.confirmButton && isPointInArea(pos, modalResult.confirmButton)) {
        onAmuletConfirm()
        return true
      }

      // ピース選択（select_piece時）
      for (const pieceArea of modalResult.pieceAreas) {
        if (isPointInArea(pos, pieceArea)) {
          onAmuletSelectPiece(pieceArea.minoId)
          return true
        }
      }

      // セルトグル（sculpt_edit時）
      for (const cellArea of modalResult.sculptCellAreas) {
        if (isPointInArea(pos, cellArea)) {
          onAmuletSculptToggleBlock(cellArea.row, cellArea.col)
          return true
        }
      }

      // モーダル内クリックはイベント消費
      return true
    }

    // 護符スロットのクリック処理
    const handleAmuletSlotClick = (pos: Position): boolean => {
      const statusResult = statusPanelResultRef.current
      if (!statusResult) return false

      for (const slotArea of statusResult.amuletSlotAreas) {
        if (isPointInArea(pos, slotArea)) {
          onUseAmulet(slotArea.amuletIndex)
          return true
        }
      }
      return false
    }

    const handleShopClick = (pos: Position): boolean => {
      const shopResult = shopRenderResultRef.current
      if (!shopResult || !state.shopState) return false

      // 売却モード/入れ替えモード中
      if (state.shopState.sellMode) {
        // キャンセルボタンのクリック
        if (shopResult.cancelSellButtonArea && isPointInArea(pos, shopResult.cancelSellButtonArea)) {
          onCancelSellMode()
          return true
        }

        // レリッククリック → 売却
        for (const relicArea of shopResult.ownedRelicAreas) {
          if (isPointInArea(pos, relicArea)) {
            onSellRelic(relicArea.relicIndex)
            return true
          }
        }

        // 売却モード中は他のクリックをブロック
        return true
      }

      // 売却ボタンのクリック
      if (shopResult.sellButtonArea && isPointInArea(pos, shopResult.sellButtonArea)) {
        onStartSellMode()
        return true
      }

      // リロールボタンのクリック
      if (isPointInArea(pos, shopResult.rerollButtonArea)) {
        if (canAfford(state.player.gold, getRerollCost(state.shopState.rerollCount, state.player.ownedRelics))) {
          onRerollShop()
        }
        return true
      }

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
            // 護符の場合はストック満杯チェック
            if (isAmuletShopItem(item) && state.player.amuletStock.length >= MAX_AMULET_STOCK) {
              return true
            }
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

      // 加護確率のマイナスボタン
      if (isPointInArea(pos, debugResult.blessingMinusButton)) {
        onUpdateDebugSettings({
          blessingProbability: Math.max(MIN, debugSettings.blessingProbability - STEP),
        })
        return true
      }

      // 加護確率のプラスボタン
      if (isPointInArea(pos, debugResult.blessingPlusButton)) {
        onUpdateDebugSettings({
          blessingProbability: Math.min(MAX, debugSettings.blessingProbability + STEP),
        })
        return true
      }

      // レリックボタンのクリック判定
      for (const relicButton of debugResult.relicButtons) {
        if (isPointInArea(pos, relicButton)) {
          onDebugToggleRelic(relicButton.relicType)
          return true
        }
      }

      // ゴールド調整ボタン
      if (isPointInArea(pos, debugResult.goldMinus50Button)) {
        onDebugAddGold(-50)
        return true
      }
      if (isPointInArea(pos, debugResult.goldMinus10Button)) {
        onDebugAddGold(-10)
        return true
      }
      if (isPointInArea(pos, debugResult.goldPlus10Button)) {
        onDebugAddGold(10)
        return true
      }
      if (isPointInArea(pos, debugResult.goldPlus50Button)) {
        onDebugAddGold(50)
        return true
      }

      // スコア調整ボタン
      if (isPointInArea(pos, debugResult.scoreMinus50Button)) {
        onDebugAddScore(-50)
        return true
      }
      if (isPointInArea(pos, debugResult.scoreMinus10Button)) {
        onDebugAddScore(-10)
        return true
      }
      if (isPointInArea(pos, debugResult.scorePlus10Button)) {
        onDebugAddScore(10)
        return true
      }
      if (isPointInArea(pos, debugResult.scorePlus50Button)) {
        onDebugAddScore(50)
        return true
      }

      // 護符ボタンのクリック判定
      for (const amuletButton of debugResult.amuletButtons) {
        if (isPointInArea(pos, amuletButton)) {
          onDebugAddAmulet(amuletButton.amuletType)
          return true
        }
      }

      // セーブデータ削除ボタン
      if (isPointInArea(pos, debugResult.deleteSaveButton)) {
        onDeleteSave()
        return true
      }

      // エフェクト付与ボタン
      if (isPointInArea(pos, debugResult.addEffectsButton)) {
        onDebugAddRandomEffects()
        return true
      }

      // ウィンドウ内のクリックはイベントを消費（貫通しない）
      if (isPointInArea(pos, debugResult.windowBounds)) {
        return true
      }

      return false
    }

    // ラウンド進行画面のクリック処理
    const handleRoundProgressClick = (pos: Position): boolean => {
      const result = roundProgressResultRef.current
      if (!result) return false

      if (isPointInArea(pos, result.startButtonArea)) {
        onStartRound()
        return true
      }
      return false
    }

    // デッキ一覧画面のクリック処理
    const handleDeckViewClick = (pos: Position): boolean => {
      const result = deckViewResultRef.current
      if (!result || !state.deckViewOpen) return false

      if (isPointInArea(pos, result.closeButtonArea)) {
        onCloseDeckView()
        return true
      }
      // 画面内クリックはイベントを消費
      return true
    }

    // デッキボタンのクリック処理
    const handleDeckButtonClick = (pos: Position): boolean => {
      const result = statusPanelResultRef.current
      if (!result) return false

      if (isPointInArea(pos, result.deckButtonArea)) {
        onOpenDeckView()
        return true
      }
      return false
    }

    // スコアアニメーション中の早送りボタンクリック処理
    const handleScoreAnimationClick = (pos: Position): boolean => {
      if (!state.scoreAnimation?.isAnimating) return false
      const result = scoreAnimationResultRef.current
      if (result?.fastForwardButton && isPointInArea(pos, result.fastForwardButton)) {
        onSetFastForward(!state.scoreAnimation.isFastForward)
        return true
      }
      // アニメーション中はクリックで次ステップ
      onAdvanceScoreStep()
      return true
    }

    // レリックパネル内のヒット検出
    const findRelicAtPosition = (pos: Position): number | null => {
      const result = relicPanelResultRef.current
      if (!result) return null
      for (const area of result.relicAreas) {
        if (isPointInArea(pos, area)) {
          return area.index
        }
      }
      return null
    }

    // レリックD&D中のドロップ先インデックスを計算
    const calculateRelicDropTarget = (pos: Position): number | null => {
      const result = relicPanelResultRef.current
      if (!result || result.relicAreas.length === 0) return null
      for (const area of result.relicAreas) {
        if (pos.y >= area.y && pos.y < area.y + area.height) {
          return area.index
        }
      }
      return null
    }

    // レリックD&Dが使えるフェーズか判定
    const canDragRelics = (): boolean => {
      return (
        (state.phase === 'playing' || state.phase === 'round_progress') &&
        !state.scoreAnimation?.isAnimating &&
        !state.clearingAnimation?.isAnimating
      )
    }

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      const pos = getCanvasPosition(e)

      // デバッグウィンドウのクリック判定（最優先）
      if (handleDebugWindowClick(pos)) {
        return
      }

      // 護符モーダルが開いている場合（デバッグの次に優先）
      if (state.amuletModal) {
        handleAmuletModalClick(pos)
        return
      }

      // スコアアニメーション中はクリックで進行/早送り
      if (state.scoreAnimation?.isAnimating) {
        handleScoreAnimationClick(pos)
        return
      }

      // デッキ一覧が開いている場合
      if (state.deckViewOpen) {
        handleDeckViewClick(pos)
        return
      }

      // ラウンド進行画面
      if (state.phase === 'round_progress') {
        // レリックD&D開始判定
        if (canDragRelics()) {
          const relicIndex = findRelicAtPosition(pos)
          if (relicIndex !== null) {
            relicDragRef.current = {
              isDragging: true,
              dragIndex: relicIndex,
              currentY: pos.y,
              dropTargetIndex: relicIndex,
            }
            return
          }
        }
        handleRoundProgressClick(pos)
        return
      }

      // ショッピングフェーズ
      if (state.phase === 'shopping') {
        if (handleAmuletSlotClick(pos)) return
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

      // 護符スロットのクリック判定（playing 時）
      if (state.phase === 'playing') {
        if (handleAmuletSlotClick(pos)) {
          return
        }
      }

      // リサイクルボタンのクリック判定（playing 時）
      if (state.phase === 'playing' && hasRelic(state.player.ownedRelics, 'recycler') && state.relicMultiplierState.recyclerUsesRemaining > 0) {
        const recycleHit = hitTestRecycleButton(pos, state.pieceSlots, layout)
        if (recycleHit) {
          onRecyclePiece(recycleHit.slotIndex)
          return
        }
      }

      // デッキボタンのクリック判定（playing 時のみ）
      if (state.phase === 'playing') {
        if (handleDeckButtonClick(pos)) {
          return
        }
      }

      // レリックD&D開始判定（playing 時）
      if (canDragRelics()) {
        const relicIndex = findRelicAtPosition(pos)
        if (relicIndex !== null) {
          relicDragRef.current = {
            isDragging: true,
            dragIndex: relicIndex,
            currentY: pos.y,
            dropTargetIndex: relicIndex,
          }
          return
        }
      }

      // ストック枠からのドラッグ開始判定（playing 時のみ）
      if (state.phase === 'playing' && isPointInStockSlot(pos) && hasStockPiece()) {
        isDraggingRef.current = true
        isDraggingFromStockRef.current = true
        activeSlotRef.current = null
        onDragStartFromStock(pos)
        return
      }

      // ストック枠2からのドラッグ開始判定
      if (state.phase === 'playing' && isPointInStockSlot2(pos) && hasStock2Piece()) {
        isDraggingRef.current = true
        isDraggingFromStock2Ref.current = true
        activeSlotRef.current = null
        onDragStartFromStock2(pos)
        return
      }

      const slotIndex = findSlotAtPosition(pos)

      if (slotIndex === null) return

      isDraggingRef.current = true
      isDraggingFromStockRef.current = false
      isDraggingFromStock2Ref.current = false
      activeSlotRef.current = slotIndex
      onDragStart(slotIndex, pos)
    }

    const handleMouseMove = (e: MouseEvent) => {
      // レリックD&D中
      if (relicDragRef.current.isDragging) {
        e.preventDefault()
        const pos = getCanvasPosition(e)
        const dropTarget = calculateRelicDropTarget(pos)
        relicDragRef.current = {
          ...relicDragRef.current,
          currentY: pos.y,
          dropTargetIndex: dropTarget,
        }
        render()
        return
      }

      // ストックからのドラッグ中はactiveSlotRef.currentがnullになる
      if (!isDraggingRef.current) return
      if (!isDraggingFromStockRef.current && activeSlotRef.current === null) return
      e.preventDefault()

      const pos = getCanvasPosition(e)

      // ストックからのドラッグの場合
      if (isDraggingFromStockRef.current) {
        const boardPos = calculateBoardPositionForStock(pos)
        onDragMove(pos, boardPos)
      } else if (activeSlotRef.current !== null) {
        const boardPos = calculateBoardPosition(pos, activeSlotRef.current)
        onDragMove(pos, boardPos)
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      // レリックD&D完了
      if (relicDragRef.current.isDragging) {
        e.preventDefault()
        const { dragIndex, dropTargetIndex } = relicDragRef.current
        if (dragIndex !== null && dropTargetIndex !== null && dragIndex !== dropTargetIndex) {
          onReorderRelic(dragIndex, dropTargetIndex)
        }
        relicDragRef.current = { isDragging: false, dragIndex: null, currentY: 0, dropTargetIndex: null }
        render()
        return
      }

      if (!isDraggingRef.current) return
      e.preventDefault()

      const pos = getCanvasPosition(e)

      // 手札からストック枠へのドロップ判定
      if (!isDraggingFromStockRef.current && !isDraggingFromStock2Ref.current && activeSlotRef.current !== null) {
        if (isPointInStockSlot(pos) && layout.stockSlotPosition) {
          if (hasStockPiece()) {
            onSwapWithStock(activeSlotRef.current)
          } else {
            onMoveToStock(activeSlotRef.current)
          }
          isDraggingRef.current = false
          isDraggingFromStockRef.current = false
          isDraggingFromStock2Ref.current = false
          activeSlotRef.current = null
          return
        }
        // 手札からストック枠2へのドロップ判定
        if (isPointInStockSlot2(pos)) {
          if (hasStock2Piece()) {
            onSwapWithStock2(activeSlotRef.current)
          } else {
            onMoveToStock2(activeSlotRef.current)
          }
          isDraggingRef.current = false
          isDraggingFromStockRef.current = false
          isDraggingFromStock2Ref.current = false
          activeSlotRef.current = null
          return
        }
      }

      // ストックから空きスロットへのドロップ判定
      if (isDraggingFromStockRef.current) {
        const slotIndex = findSlotAtPosition(pos)
        if (slotIndex !== null) {
          const slot = state.pieceSlots[slotIndex]
          if (slot && !slot.piece) {
            // 空きスロットへドロップ
            onMoveFromStock(slotIndex)
            isDraggingRef.current = false
            isDraggingFromStockRef.current = false
            activeSlotRef.current = null
            return
          }
        }
      }

      // ストック2から空きスロットへのドロップ判定
      if (isDraggingFromStock2Ref.current) {
        const slotIndex = findSlotAtPosition(pos)
        if (slotIndex !== null) {
          const slot = state.pieceSlots[slotIndex]
          if (slot && !slot.piece) {
            onMoveFromStock2(slotIndex)
            isDraggingRef.current = false
            isDraggingFromStock2Ref.current = false
            activeSlotRef.current = null
            return
          }
        }
      }

      isDraggingRef.current = false
      isDraggingFromStockRef.current = false
      activeSlotRef.current = null
      onDragEnd()
    }

    // タッチデバイス用: レリックタップでツールチップのトグル
    const handleRelicTouch = (pos: Position): boolean => {
      // ツールチップが表示されるかチェック（レリック領域のヒットテスト）
      const newTooltipState = calculateTooltipState(pos, state, layout)

      // 同じ場所で既にツールチップが表示中なら非表示にする
      if (
        tooltipState.visible &&
        newTooltipState.visible &&
        newTooltipState.effects.length > 0 &&
        tooltipState.effects.length > 0 &&
        tooltipState.effects[0].name === newTooltipState.effects[0].name
      ) {
        setTooltipState(INITIAL_TOOLTIP_STATE)
        return true
      }

      // 新しいレリックをタップした場合はそのツールチップを表示
      if (newTooltipState.visible && newTooltipState.effects.length > 0) {
        setTooltipState(newTooltipState)
        return true
      }

      // レリック以外の場所をタップした場合、ツールチップを非表示
      if (tooltipState.visible) {
        setTooltipState(INITIAL_TOOLTIP_STATE)
      }

      return false
    }

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const pos = getCanvasPosition(e.touches[0])

      // デバッグウィンドウのクリック判定（最優先）
      if (handleDebugWindowClick(pos)) {
        return
      }

      // 護符モーダルが開いている場合（デバッグの次に優先）
      if (state.amuletModal) {
        handleAmuletModalClick(pos)
        return
      }

      // スコアアニメーション中はタップで進行/早送り
      if (state.scoreAnimation?.isAnimating) {
        handleScoreAnimationClick(pos)
        return
      }

      // デッキ一覧が開いている場合
      if (state.deckViewOpen) {
        handleDeckViewClick(pos)
        return
      }

      // ラウンド進行画面
      if (state.phase === 'round_progress') {
        // レリックD&D開始判定
        if (canDragRelics()) {
          const relicIndex = findRelicAtPosition(pos)
          if (relicIndex !== null) {
            relicDragRef.current = {
              isDragging: true,
              dragIndex: relicIndex,
              currentY: pos.y,
              dropTargetIndex: relicIndex,
            }
            return
          }
        }
        handleRoundProgressClick(pos)
        return
      }

      // レリックのタップトグル処理（ショッピングフェーズ以外で優先）
      // ショッピングフェーズではショップ購入処理を優先
      if (state.phase !== 'shopping') {
        // オーバーレイ表示中はツールチップを表示しない
        if (
          state.phase !== 'round_clear' &&
          state.phase !== 'game_over' &&
          state.phase !== 'game_clear'
        ) {
          if (handleRelicTouch(pos)) {
            return
          }
        }
      }

      // ショッピングフェーズ
      if (state.phase === 'shopping') {
        if (handleAmuletSlotClick(pos)) return
        // ショッピング中もレリックパネルのタップを処理
        if (handleRelicTouch(pos)) {
          return
        }
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

      // 護符スロットのクリック判定（playing 時）
      if (state.phase === 'playing') {
        if (handleAmuletSlotClick(pos)) {
          return
        }
      }

      // リサイクルボタンのクリック判定（playing 時）
      if (state.phase === 'playing' && hasRelic(state.player.ownedRelics, 'recycler') && state.relicMultiplierState.recyclerUsesRemaining > 0) {
        const recycleHit = hitTestRecycleButton(pos, state.pieceSlots, layout)
        if (recycleHit) {
          onRecyclePiece(recycleHit.slotIndex)
          return
        }
      }

      // デッキボタンのクリック判定（playing 時のみ）
      if (state.phase === 'playing') {
        if (handleDeckButtonClick(pos)) {
          return
        }
      }

      // レリックD&D開始判定（playing 時）
      if (canDragRelics()) {
        const relicIndex = findRelicAtPosition(pos)
        if (relicIndex !== null) {
          relicDragRef.current = {
            isDragging: true,
            dragIndex: relicIndex,
            currentY: pos.y,
            dropTargetIndex: relicIndex,
          }
          return
        }
      }

      // ストック枠からのドラッグ開始判定（playing 時のみ）
      if (state.phase === 'playing' && isPointInStockSlot(pos) && hasStockPiece()) {
        isDraggingRef.current = true
        isDraggingFromStockRef.current = true
        activeSlotRef.current = null
        onDragStartFromStock(pos)
        return
      }

      // ストック枠2からのドラッグ開始判定
      if (state.phase === 'playing' && isPointInStockSlot2(pos) && hasStock2Piece()) {
        isDraggingRef.current = true
        isDraggingFromStock2Ref.current = true
        activeSlotRef.current = null
        onDragStartFromStock2(pos)
        return
      }

      const slotIndex = findSlotAtPosition(pos)

      if (slotIndex === null) return

      isDraggingRef.current = true
      isDraggingFromStockRef.current = false
      isDraggingFromStock2Ref.current = false
      activeSlotRef.current = slotIndex
      onDragStart(slotIndex, pos)
    }

    const handleTouchMove = (e: TouchEvent) => {
      // レリックD&D中
      if (relicDragRef.current.isDragging) {
        e.preventDefault()
        const pos = getCanvasPosition(e.touches[0])
        const dropTarget = calculateRelicDropTarget(pos)
        relicDragRef.current = {
          ...relicDragRef.current,
          currentY: pos.y,
          dropTargetIndex: dropTarget,
        }
        render()
        return
      }

      if (!isDraggingRef.current) return
      if (!isDraggingFromStockRef.current && activeSlotRef.current === null) return
      e.preventDefault()

      const pos = getCanvasPosition(e.touches[0])

      // ストックからのドラッグの場合
      if (isDraggingFromStockRef.current) {
        const boardPos = calculateBoardPositionForStock(pos)
        onDragMove(pos, boardPos)
      } else if (activeSlotRef.current !== null) {
        const boardPos = calculateBoardPosition(pos, activeSlotRef.current)
        onDragMove(pos, boardPos)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      // レリックD&D完了
      if (relicDragRef.current.isDragging) {
        e.preventDefault()
        const { dragIndex, dropTargetIndex } = relicDragRef.current
        if (dragIndex !== null && dropTargetIndex !== null && dragIndex !== dropTargetIndex) {
          onReorderRelic(dragIndex, dropTargetIndex)
        }
        relicDragRef.current = { isDragging: false, dragIndex: null, currentY: 0, dropTargetIndex: null }
        render()
        return
      }

      if (!isDraggingRef.current) return
      e.preventDefault()

      // タッチ終了時の位置を取得（changedTouchesを使用）
      const touch = e.changedTouches[0]
      if (touch) {
        const pos = getCanvasPosition(touch)

        // 手札からストック枠へのドロップ判定
        if (!isDraggingFromStockRef.current && activeSlotRef.current !== null) {
          if (isPointInStockSlot(pos) && layout.stockSlotPosition) {
            if (hasStockPiece()) {
              onSwapWithStock(activeSlotRef.current)
            } else {
              onMoveToStock(activeSlotRef.current)
            }
            isDraggingRef.current = false
            isDraggingFromStockRef.current = false
            activeSlotRef.current = null
            return
          }
        }

        // ストックから空きスロットへのドロップ判定
        if (isDraggingFromStockRef.current) {
          const slotIndex = findSlotAtPosition(pos)
          if (slotIndex !== null) {
            const slot = state.pieceSlots[slotIndex]
            if (slot && !slot.piece) {
              onMoveFromStock(slotIndex)
              isDraggingRef.current = false
              isDraggingFromStockRef.current = false
              activeSlotRef.current = null
              return
            }
          }
        }

        // ストック2から空きスロットへのドロップ判定
        if (isDraggingFromStock2Ref.current) {
          const slotIndex = findSlotAtPosition(pos)
          if (slotIndex !== null) {
            const slot = state.pieceSlots[slotIndex]
            if (slot && !slot.piece) {
              onMoveFromStock2(slotIndex)
              isDraggingRef.current = false
              isDraggingFromStock2Ref.current = false
              activeSlotRef.current = null
              return
            }
          }
        }
      }

      isDraggingRef.current = false
      isDraggingFromStockRef.current = false
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
  }, [canvas, layout, state.pieceSlots, state.clearingAnimation, state.scoreAnimation, state.phase, state.shopState, state.player, state.board, state.dragState, state.deckViewOpen, state.amuletModal, onDragStart, onDragMove, onDragEnd, onReset, onBuyItem, onLeaveShop, onRerollShop, onStartSellMode, onCancelSellMode, onSellRelic, onStartRound, onOpenDeckView, onCloseDeckView, onAdvanceScoreStep, onSetFastForward, onReorderRelic, onUseAmulet, onAmuletSelectPiece, onAmuletConfirm, onAmuletCancel, onAmuletSculptToggleBlock, onDebugAddAmulet, showDebugWindow, debugSettings, onUpdateDebugSettings])

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

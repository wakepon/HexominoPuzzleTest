import { useReducer, useCallback, useState } from 'react'
import type { Position } from '../lib/game/Domain'
import { gameReducer, createInitialState } from '../lib/game/State'
import { type DebugSettings, DEFAULT_DEBUG_SETTINGS } from '../lib/game/Domain/Debug'
import type { RelicType } from '../lib/game/Domain/Effect/Relic'
import type { AmuletType } from '../lib/game/Domain/Effect/Amulet'
import type { MinoId } from '../lib/game/Domain/Core/Id'

/**
 * ゲーム状態管理フック
 */
export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState)
  const [debugSettings, setDebugSettings] = useState<DebugSettings>(DEFAULT_DEBUG_SETTINGS)

  const startDrag = useCallback((slotIndex: number, startPos: Position) => {
    dispatch({ type: 'UI/START_DRAG', slotIndex, startPos })
  }, [])

  const startDragFromStock = useCallback((startPos: Position) => {
    dispatch({ type: 'UI/START_DRAG_FROM_STOCK', startPos })
  }, [])

  const updateDrag = useCallback((currentPos: Position, boardPos: Position | null) => {
    dispatch({ type: 'UI/UPDATE_DRAG', currentPos, boardPos })
  }, [])

  const endDrag = useCallback(() => {
    dispatch({ type: 'UI/END_DRAG' })
  }, [])

  const resetGame = useCallback(() => {
    dispatch({ type: 'GAME/RESET' })
  }, [])

  const endClearAnimation = useCallback(() => {
    dispatch({ type: 'ANIMATION/END_CLEAR' })
  }, [])

  const endRelicActivationAnimation = useCallback(() => {
    dispatch({ type: 'ANIMATION/END_RELIC_ACTIVATION' })
  }, [])

  const advanceScoreStep = useCallback(() => {
    dispatch({ type: 'ANIMATION/ADVANCE_SCORE_STEP' })
  }, [])

  const endScoreAnimation = useCallback(() => {
    dispatch({ type: 'ANIMATION/END_SCORE' })
  }, [])

  const setFastForward = useCallback((isFastForward: boolean) => {
    dispatch({ type: 'ANIMATION/SET_FAST_FORWARD', isFastForward })
  }, [])

  const applyPendingPhase = useCallback(() => {
    dispatch({ type: 'PHASE/APPLY_PENDING' })
  }, [])

  const reorderRelic = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'RELIC/REORDER', fromIndex, toIndex })
  }, [])

  const recyclePiece = useCallback((slotIndex: number) => {
    dispatch({ type: 'RELIC/RECYCLE_PIECE', slotIndex })
  }, [])

  const advanceRound = useCallback(() => {
    dispatch({
      type: 'ROUND/ADVANCE',
      probabilityOverride: {
        pattern: debugSettings.patternProbability / 100,
        seal: debugSettings.sealProbability / 100,
        blessing: debugSettings.blessingProbability / 100,
      },
    })
  }, [debugSettings])

  const buyItem = useCallback((itemIndex: number) => {
    dispatch({ type: 'SHOP/BUY_ITEM', itemIndex })
  }, [])

  const leaveShop = useCallback(() => {
    dispatch({ type: 'SHOP/LEAVE' })
  }, [])

  const rerollShop = useCallback(() => {
    dispatch({ type: 'SHOP/REROLL' })
  }, [])

  const startSellMode = useCallback(() => {
    dispatch({ type: 'SHOP/START_SELL_MODE' })
  }, [])

  const cancelSellMode = useCallback(() => {
    dispatch({ type: 'SHOP/CANCEL_SELL_MODE' })
  }, [])

  const sellRelic = useCallback((relicIndex: number) => {
    dispatch({ type: 'SHOP/SELL_RELIC', relicIndex })
  }, [])

  const startRound = useCallback(() => {
    dispatch({ type: 'ROUND/START' })
  }, [])

  const openDeckView = useCallback(() => {
    dispatch({ type: 'UI/OPEN_DECK_VIEW' })
  }, [])

  const closeDeckView = useCallback(() => {
    dispatch({ type: 'UI/CLOSE_DECK_VIEW' })
  }, [])

  const moveToStock = useCallback((slotIndex: number) => {
    dispatch({ type: 'STOCK/MOVE_TO_STOCK', slotIndex })
  }, [])

  const moveFromStock = useCallback((targetSlotIndex: number) => {
    dispatch({ type: 'STOCK/MOVE_FROM_STOCK', targetSlotIndex })
  }, [])

  const swapWithStock = useCallback((slotIndex: number) => {
    dispatch({ type: 'STOCK/SWAP', slotIndex })
  }, [])

  const startDragFromStock2 = useCallback((startPos: Position) => {
    dispatch({ type: 'UI/START_DRAG_FROM_STOCK2', startPos })
  }, [])

  const moveToStock2 = useCallback((slotIndex: number) => {
    dispatch({ type: 'STOCK/MOVE_TO_STOCK2', slotIndex })
  }, [])

  const moveFromStock2 = useCallback((targetSlotIndex: number) => {
    dispatch({ type: 'STOCK/MOVE_FROM_STOCK2', targetSlotIndex })
  }, [])

  const swapWithStock2 = useCallback((slotIndex: number) => {
    dispatch({ type: 'STOCK/SWAP2', slotIndex })
  }, [])

  const updateDebugSettings = useCallback((updates: Partial<DebugSettings>) => {
    setDebugSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  // セーブデータを削除してゲームをリセット（デバッグ用）
  // GAME/RESET アクション内で clearGameState() が呼ばれる
  const deleteSave = useCallback(() => {
    dispatch({ type: 'GAME/RESET' })
  }, [])

  // デバッグ用: レリック追加
  const debugAddRelic = useCallback((relicType: RelicType) => {
    dispatch({ type: 'DEBUG/ADD_RELIC', relicType })
  }, [])

  // デバッグ用: レリック削除
  const debugRemoveRelic = useCallback((relicType: RelicType) => {
    dispatch({ type: 'DEBUG/REMOVE_RELIC', relicType })
  }, [])

  // デバッグ用: ゴールド増減
  const debugAddGold = useCallback((amount: number) => {
    dispatch({ type: 'DEBUG/ADD_GOLD', amount })
  }, [])

  // デバッグ用: スコア増減
  const debugAddScore = useCallback((amount: number) => {
    dispatch({ type: 'DEBUG/ADD_SCORE', amount })
  }, [])

  // 護符アクション
  const useAmulet = useCallback((amuletIndex: number) => {
    dispatch({ type: 'AMULET/USE', amuletIndex })
  }, [])

  const amuletSelectPiece = useCallback((minoId: MinoId) => {
    dispatch({ type: 'AMULET/SELECT_PIECE', minoId })
  }, [])

  const amuletConfirm = useCallback(() => {
    dispatch({ type: 'AMULET/CONFIRM' })
  }, [])

  const amuletCancel = useCallback(() => {
    dispatch({ type: 'AMULET/CANCEL' })
  }, [])

  const amuletSell = useCallback((amuletIndex: number) => {
    dispatch({ type: 'AMULET/SELL', amuletIndex })
  }, [])

  const amuletSculptToggleBlock = useCallback((row: number, col: number) => {
    dispatch({ type: 'AMULET/SCULPT_TOGGLE_BLOCK', row, col })
  }, [])

  // デバッグ用: 護符追加
  const debugAddAmulet = useCallback((amuletType: AmuletType) => {
    dispatch({ type: 'DEBUG/ADD_AMULET', amuletType })
  }, [])

  // デバッグ用: 護符削除
  const debugRemoveAmulet = useCallback((amuletIndex: number) => {
    dispatch({ type: 'DEBUG/REMOVE_AMULET', amuletIndex })
  }, [])

  // デバッグ用: 先頭ピースにランダムなエフェクト付与
  const debugAddRandomEffects = useCallback(() => {
    dispatch({ type: 'DEBUG/ADD_RANDOM_EFFECTS' })
  }, [])

  return {
    state,
    debugSettings,
    actions: {
      startDrag,
      startDragFromStock,
      startDragFromStock2,
      updateDrag,
      endDrag,
      resetGame,
      endClearAnimation,
      endRelicActivationAnimation,
      advanceScoreStep,
      endScoreAnimation,
      setFastForward,
      reorderRelic,
      recyclePiece,
      advanceRound,
      buyItem,
      leaveShop,
      rerollShop,
      startSellMode,
      cancelSellMode,
      sellRelic,
      updateDebugSettings,
      deleteSave,
      startRound,
      openDeckView,
      closeDeckView,
      moveToStock,
      moveFromStock,
      swapWithStock,
      moveToStock2,
      moveFromStock2,
      swapWithStock2,
      debugAddRelic,
      debugRemoveRelic,
      debugAddGold,
      debugAddScore,
      applyPendingPhase,
      useAmulet,
      amuletSelectPiece,
      amuletConfirm,
      amuletCancel,
      amuletSell,
      amuletSculptToggleBlock,
      debugAddAmulet,
      debugRemoveAmulet,
      debugAddRandomEffects,
    },
  }
}

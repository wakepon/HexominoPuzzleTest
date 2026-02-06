import { useReducer, useCallback, useState } from 'react'
import type { Position } from '../lib/game/Domain'
import { gameReducer, createInitialState } from '../lib/game/State'
import { type DebugSettings, DEFAULT_DEBUG_SETTINGS } from '../lib/game/Domain/Debug'

/**
 * ゲーム状態管理フック
 */
export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState)
  const [debugSettings, setDebugSettings] = useState<DebugSettings>(DEFAULT_DEBUG_SETTINGS)

  const startDrag = useCallback((slotIndex: number, startPos: Position) => {
    dispatch({ type: 'UI/START_DRAG', slotIndex, startPos })
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

  const advanceRound = useCallback(() => {
    dispatch({
      type: 'ROUND/ADVANCE',
      probabilityOverride: {
        pattern: debugSettings.patternProbability / 100,
        seal: debugSettings.sealProbability / 100,
      },
    })
  }, [debugSettings])

  const buyItem = useCallback((itemIndex: number) => {
    dispatch({ type: 'SHOP/BUY_ITEM', itemIndex })
  }, [])

  const leaveShop = useCallback(() => {
    dispatch({ type: 'SHOP/LEAVE' })
  }, [])

  const updateDebugSettings = useCallback((updates: Partial<DebugSettings>) => {
    setDebugSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  return {
    state,
    debugSettings,
    actions: {
      startDrag,
      updateDrag,
      endDrag,
      resetGame,
      endClearAnimation,
      advanceRound,
      buyItem,
      leaveShop,
      updateDebugSettings,
    },
  }
}

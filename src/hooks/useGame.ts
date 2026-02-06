import { useReducer, useCallback } from 'react'
import type { Position } from '../lib/game/Domain'
import { gameReducer, createInitialState } from '../lib/game/State'

/**
 * ゲーム状態管理フック
 */
export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState)

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
    dispatch({ type: 'ROUND/ADVANCE' })
  }, [])

  const buyItem = useCallback((itemIndex: number) => {
    dispatch({ type: 'SHOP/BUY_ITEM', itemIndex })
  }, [])

  const leaveShop = useCallback(() => {
    dispatch({ type: 'SHOP/LEAVE' })
  }, [])

  return {
    state,
    actions: {
      startDrag,
      updateDrag,
      endDrag,
      resetGame,
      endClearAnimation,
      advanceRound,
      buyItem,
      leaveShop,
    },
  }
}

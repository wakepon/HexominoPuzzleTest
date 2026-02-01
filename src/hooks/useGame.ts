import { useReducer, useCallback } from 'react'
import { GameState, GameAction, PieceSlot, DragState, Position } from '../lib/game/types'
import { createEmptyBoard, placePieceOnBoard } from '../lib/game/boardLogic'
import { getInitialPieces } from '../lib/game/pieceDefinitions'
import { canPlacePiece } from '../lib/game/collisionDetection'

/**
 * 初期ドラッグ状態
 */
const initialDragState: DragState = {
  isDragging: false,
  pieceId: null,
  slotIndex: null,
  currentPos: null,
  startPos: null,
  boardPos: null,
}

/**
 * 初期ゲーム状態を作成
 */
function createInitialState(): GameState {
  const pieces = getInitialPieces()
  const pieceSlots: PieceSlot[] = pieces.map((piece) => ({
    piece,
    position: { x: 0, y: 0 },  // レイアウト計算後に更新
  }))

  return {
    board: createEmptyBoard(),
    pieceSlots,
    dragState: initialDragState,
  }
}

/**
 * ゲームリデューサー
 */
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_DRAG': {
      const slot = state.pieceSlots[action.slotIndex]
      if (!slot?.piece) return state

      return {
        ...state,
        dragState: {
          isDragging: true,
          pieceId: slot.piece.id,
          slotIndex: action.slotIndex,
          currentPos: action.startPos,
          startPos: action.startPos,
          boardPos: null,
        },
      }
    }

    case 'UPDATE_DRAG': {
      if (!state.dragState.isDragging) return state

      return {
        ...state,
        dragState: {
          ...state.dragState,
          currentPos: action.currentPos,
          boardPos: action.boardPos,
        },
      }
    }

    case 'END_DRAG': {
      if (!state.dragState.isDragging || state.dragState.slotIndex === null) {
        return {
          ...state,
          dragState: initialDragState,
        }
      }

      const slotIndex = state.dragState.slotIndex
      const slot = state.pieceSlots[slotIndex]
      const boardPos = state.dragState.boardPos

      // 配置可能かチェック
      if (slot?.piece && boardPos && canPlacePiece(state.board, slot.piece.shape, boardPos)) {
        // ブロックを配置
        const newBoard = placePieceOnBoard(state.board, slot.piece.shape, boardPos)

        // スロットからブロックを削除
        const newSlots = state.pieceSlots.map((s, i) =>
          i === slotIndex ? { ...s, piece: null } : s
        )

        return {
          ...state,
          board: newBoard,
          pieceSlots: newSlots,
          dragState: initialDragState,
        }
      }

      // 配置不可の場合は元に戻す
      return {
        ...state,
        dragState: initialDragState,
      }
    }

    case 'PLACE_PIECE': {
      const slot = state.pieceSlots[action.slotIndex]
      if (!slot?.piece) return state

      if (!canPlacePiece(state.board, slot.piece.shape, action.position)) {
        return state
      }

      const newBoard = placePieceOnBoard(state.board, slot.piece.shape, action.position)
      const newSlots = state.pieceSlots.map((s, i) =>
        i === action.slotIndex ? { ...s, piece: null } : s
      )

      return {
        ...state,
        board: newBoard,
        pieceSlots: newSlots,
      }
    }

    case 'RESET_GAME': {
      return createInitialState()
    }

    default:
      return state
  }
}

/**
 * ゲーム状態管理フック
 */
export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState)

  const startDrag = useCallback((slotIndex: number, startPos: Position) => {
    dispatch({ type: 'START_DRAG', slotIndex, startPos })
  }, [])

  const updateDrag = useCallback((currentPos: Position, boardPos: Position | null) => {
    dispatch({ type: 'UPDATE_DRAG', currentPos, boardPos })
  }, [])

  const endDrag = useCallback(() => {
    dispatch({ type: 'END_DRAG' })
  }, [])

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' })
  }, [])

  return {
    state,
    actions: {
      startDrag,
      updateDrag,
      endDrag,
      resetGame,
    },
  }
}

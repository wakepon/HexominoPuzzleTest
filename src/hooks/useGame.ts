import { useReducer, useCallback } from 'react'
import { GameState, GameAction, PieceSlot, DragState, Position, DeckState, GamePhase } from '../lib/game/types'
import { createEmptyBoard, placePieceOnBoard } from '../lib/game/boardLogic'
import { canPlacePiece } from '../lib/game/collisionDetection'
import { findCompletedLines, calculateScore, getCellsToRemove, clearLines } from '../lib/game/lineLogic'
import { CLEAR_ANIMATION } from '../lib/game/constants'
import { DefaultRandom } from '../lib/game/random'
import { createInitialDeckState, drawPiecesFromDeck, decrementRemainingHands } from '../lib/game/deckLogic'

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
 * デッキから新しいピースセットを生成してスロットに配置
 */
function generateNewPieceSlotsFromDeck(deck: DeckState): { slots: PieceSlot[]; newDeck: DeckState } {
  const rng = new DefaultRandom()
  const { pieces, newDeck } = drawPiecesFromDeck(deck, rng)
  const slots = pieces.map((piece) => ({
    piece,
    position: { x: 0, y: 0 },  // レイアウト計算後に更新
  }))
  return { slots, newDeck }
}

/**
 * 全てのスロットが空かチェック
 */
function areAllSlotsEmpty(slots: PieceSlot[]): boolean {
  return slots.every(slot => slot.piece === null)
}

/**
 * 配置後のデッキとスロットの状態を計算
 * END_DRAGとPLACE_PIECEで共通のロジックを抽出
 */
function handlePlacement(
  slots: PieceSlot[],
  deck: DeckState
): { finalSlots: PieceSlot[]; finalDeck: DeckState; phase: GamePhase } {
  const updatedDeck = decrementRemainingHands(deck)
  const isGameOver = updatedDeck.remainingHands === 0

  if (!areAllSlotsEmpty(slots) || isGameOver) {
    return {
      finalSlots: slots,
      finalDeck: updatedDeck,
      phase: isGameOver ? 'finished' : 'playing',
    }
  }

  const result = generateNewPieceSlotsFromDeck(updatedDeck)
  return {
    finalSlots: result.slots,
    finalDeck: result.newDeck,
    phase: 'playing',
  }
}

/**
 * 初期ゲーム状態を作成
 */
function createInitialState(): GameState {
  const rng = new DefaultRandom()
  const initialDeck = createInitialDeckState(rng)
  const { slots, newDeck } = generateNewPieceSlotsFromDeck(initialDeck)

  return {
    board: createEmptyBoard(),
    pieceSlots: slots,
    dragState: initialDragState,
    score: 0,
    clearingAnimation: null,
    deck: newDeck,
    phase: 'playing',
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

      // ゲーム終了状態では配置不可
      if (state.phase === 'finished') {
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

        // 配置後の状態を計算
        const { finalSlots, finalDeck, phase: newPhase } = handlePlacement(newSlots, state.deck)

        // ライン消去判定
        const completedLines = findCompletedLines(newBoard)
        const totalLines = completedLines.rows.length + completedLines.columns.length

        if (totalLines > 0) {
          const cells = getCellsToRemove(completedLines)
          const scoreGain = calculateScore(completedLines)

          return {
            ...state,
            board: newBoard,
            pieceSlots: finalSlots,
            dragState: initialDragState,
            clearingAnimation: {
              isAnimating: true,
              cells,
              startTime: Date.now(),
              duration: CLEAR_ANIMATION.duration,
            },
            score: state.score + scoreGain,
            deck: finalDeck,
            phase: newPhase,
          }
        }

        return {
          ...state,
          board: newBoard,
          pieceSlots: finalSlots,
          dragState: initialDragState,
          deck: finalDeck,
          phase: newPhase,
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

      // ゲーム終了状態では配置不可
      if (state.phase === 'finished') return state

      if (!canPlacePiece(state.board, slot.piece.shape, action.position)) {
        return state
      }

      const newBoard = placePieceOnBoard(state.board, slot.piece.shape, action.position)
      const newSlots = state.pieceSlots.map((s, i) =>
        i === action.slotIndex ? { ...s, piece: null } : s
      )

      // 配置後の状態を計算
      const { finalSlots, finalDeck, phase: newPhase } = handlePlacement(newSlots, state.deck)

      return {
        ...state,
        board: newBoard,
        pieceSlots: finalSlots,
        deck: finalDeck,
        phase: newPhase,
      }
    }

    case 'RESET_GAME': {
      return createInitialState()
    }

    case 'END_CLEAR_ANIMATION': {
      if (!state.clearingAnimation) return state

      const clearedBoard = clearLines(state.board, state.clearingAnimation.cells)

      return {
        ...state,
        board: clearedBoard,
        clearingAnimation: null,
      }
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

  const endClearAnimation = useCallback(() => {
    dispatch({ type: 'END_CLEAR_ANIMATION' })
  }, [])

  return {
    state,
    actions: {
      startDrag,
      updateDrag,
      endDrag,
      resetGame,
      endClearAnimation,
    },
  }
}

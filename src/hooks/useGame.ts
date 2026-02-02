import { useReducer, useCallback } from 'react'
import { GameState, GameAction, PieceSlot, DragState, Position, DeckState, GamePhase } from '../lib/game/types'
import { createEmptyBoard, placePieceOnBoard } from '../lib/game/boardLogic'
import { canPlacePiece } from '../lib/game/collisionDetection'
import { findCompletedLines, calculateScore, getCellsToRemove, clearLines } from '../lib/game/lineLogic'
import { CLEAR_ANIMATION, ROUND_CONFIG, DECK_CONFIG } from '../lib/game/constants'
import { DefaultRandom } from '../lib/game/random'
import { createInitialDeckState, drawPiecesFromDeck, decrementRemainingHands } from '../lib/game/deckLogic'
import { calculateTargetScore, isRoundCleared, isFinalRound, calculateGoldReward } from '../lib/game/roundLogic'
import { createShopState, canAfford, addToDeck, markItemAsPurchased, shuffleCurrentDeck } from '../lib/game/shopLogic'

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
 * ラウンドクリア/ゲームオーバーの判定はスコア計算後に別途行う
 */
function handlePlacement(
  slots: PieceSlot[],
  deck: DeckState
): { finalSlots: PieceSlot[]; finalDeck: DeckState } {
  const updatedDeck = decrementRemainingHands(deck)

  if (!areAllSlotsEmpty(slots) || updatedDeck.remainingHands === 0) {
    return {
      finalSlots: slots,
      finalDeck: updatedDeck,
    }
  }

  const result = generateNewPieceSlotsFromDeck(updatedDeck)
  return {
    finalSlots: result.slots,
    finalDeck: result.newDeck,
  }
}

/**
 * スコアに基づいてフェーズを判定
 */
function determinePhase(
  score: number,
  targetScore: number,
  remainingHands: number
): GamePhase {
  if (isRoundCleared(score, targetScore)) {
    return 'round_clear'
  }
  if (remainingHands === 0) {
    return 'game_over'
  }
  return 'playing'
}

/**
 * 初期ゲーム状態を作成
 */
function createInitialState(): GameState {
  const rng = new DefaultRandom()
  const initialDeck = createInitialDeckState(rng)
  const { slots, newDeck } = generateNewPieceSlotsFromDeck(initialDeck)
  const initialRound = 1

  return {
    board: createEmptyBoard(),
    pieceSlots: slots,
    dragState: initialDragState,
    score: 0,
    clearingAnimation: null,
    deck: newDeck,
    phase: 'playing',
    round: initialRound,
    gold: ROUND_CONFIG.initialGold,
    targetScore: calculateTargetScore(initialRound),
    shopState: null,
  }
}

/**
 * 次のラウンドの状態を作成（スコア・フィールド・ストックをリセット）
 * shopState内のデッキを使用してゲームを再開
 */
function createNextRoundState(currentState: GameState): GameState {
  const rng = new DefaultRandom()
  // ショップで追加されたカードを含むデッキをシャッフルして使用
  const shuffledDeck = currentState.shopState
    ? shuffleCurrentDeck(currentState.deck, rng)
    : createInitialDeckState(rng)

  // ハンド数を12にリセット
  const deckWithResetHands: DeckState = {
    ...shuffledDeck,
    remainingHands: DECK_CONFIG.totalHands,
  }

  const { slots, newDeck } = generateNewPieceSlotsFromDeck(deckWithResetHands)
  const nextRound = currentState.round + 1

  return {
    board: createEmptyBoard(),
    pieceSlots: slots,
    dragState: initialDragState,
    score: 0,
    clearingAnimation: null,
    deck: newDeck,
    phase: 'playing',
    round: nextRound,
    gold: currentState.gold,  // ゴールドはOPEN_SHOPで加算済み
    targetScore: calculateTargetScore(nextRound),
    shopState: null,
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
      if (state.phase !== 'playing') {
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
        const { finalSlots, finalDeck } = handlePlacement(newSlots, state.deck)

        // ライン消去判定
        const completedLines = findCompletedLines(newBoard)
        const totalLines = completedLines.rows.length + completedLines.columns.length

        if (totalLines > 0) {
          const cells = getCellsToRemove(completedLines)
          const scoreGain = calculateScore(completedLines)
          const newScore = state.score + scoreGain
          const newPhase = determinePhase(newScore, state.targetScore, finalDeck.remainingHands)

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
            score: newScore,
            deck: finalDeck,
            phase: newPhase,
          }
        }

        // ライン消去なしでもフェーズ判定
        const newPhase = determinePhase(state.score, state.targetScore, finalDeck.remainingHands)

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
      if (state.phase !== 'playing') return state

      if (!canPlacePiece(state.board, slot.piece.shape, action.position)) {
        return state
      }

      const newBoard = placePieceOnBoard(state.board, slot.piece.shape, action.position)
      const newSlots = state.pieceSlots.map((s, i) =>
        i === action.slotIndex ? { ...s, piece: null } : s
      )

      // 配置後の状態を計算
      const { finalSlots, finalDeck } = handlePlacement(newSlots, state.deck)
      const newPhase = determinePhase(state.score, state.targetScore, finalDeck.remainingHands)

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

    case 'ADVANCE_ROUND': {
      // round_clear状態でのみショップに進める
      if (state.phase !== 'round_clear') return state

      // 最終ラウンドならゲームクリア（ショップをスキップ）
      if (isFinalRound(state.round)) {
        const goldReward = calculateGoldReward(state.deck.remainingHands)
        return {
          ...state,
          phase: 'game_clear',
          gold: state.gold + goldReward,
          shopState: null,
        }
      }

      // ショップへ遷移
      const rng = new DefaultRandom()
      const goldReward = calculateGoldReward(state.deck.remainingHands)
      return {
        ...state,
        phase: 'shopping',
        gold: state.gold + goldReward,
        shopState: createShopState(rng),
      }
    }

    case 'BUY_ITEM': {
      // shopping状態でのみ購入可能
      if (state.phase !== 'shopping' || !state.shopState) return state

      const { itemIndex } = action

      // 配列境界チェック
      if (itemIndex < 0 || itemIndex >= state.shopState.items.length) return state

      const item = state.shopState.items[itemIndex]

      // 既に購入済み、またはゴールド不足の場合は何もしない
      if (item.purchased || !canAfford(state.gold, item.price)) return state

      // アイテムを購入済みにし、デッキに追加
      const newShopState = markItemAsPurchased(state.shopState, itemIndex)
      const newDeck = addToDeck(state.deck, item.minoId)

      return {
        ...state,
        gold: state.gold - item.price,
        deck: newDeck,
        shopState: newShopState,
      }
    }

    case 'LEAVE_SHOP': {
      // shopping状態でのみ店を出られる
      if (state.phase !== 'shopping') return state

      return createNextRoundState(state)
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

  const advanceRound = useCallback(() => {
    dispatch({ type: 'ADVANCE_ROUND' })
  }, [])

  const buyItem = useCallback((itemIndex: number) => {
    dispatch({ type: 'BUY_ITEM', itemIndex })
  }, [])

  const leaveShop = useCallback(() => {
    dispatch({ type: 'LEAVE_SHOP' })
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

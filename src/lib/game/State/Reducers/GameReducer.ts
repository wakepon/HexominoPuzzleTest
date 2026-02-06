/**
 * ゲームReducer
 */

import type { GameState, PieceSlot, DeckState } from '../../Domain'
import type { GameAction } from '../Actions/GameActions'
import {
  initialDragState,
  createInitialState,
  generateNewPieceSlotsFromDeck,
  areAllSlotsEmpty,
  determinePhase,
} from '../InitialState'
import { createEmptyBoard, placePieceOnBoard } from '../../Services/BoardService'
import { canPlacePiece } from '../../Services/CollisionService'
import {
  findCompletedLines,
  calculateScore,
  getCellsToRemove,
  clearLines,
} from '../../Services/LineService'
import { decrementRemainingHands } from '../../Services/DeckService'
import {
  calculateTargetScore,
  isFinalRound,
  calculateGoldReward,
} from '../../Services/RoundService'
import {
  createShopState,
  canAfford,
  addToDeck,
  markItemAsPurchased,
  shuffleCurrentDeck,
} from '../../Services/ShopService'
import { DefaultRandom } from '../../Utils/Random'
import { CLEAR_ANIMATION, DECK_CONFIG } from '../../Data/Constants'

/**
 * 配置後のデッキとスロットの状態を計算
 */
function handlePlacement(
  slots: readonly PieceSlot[],
  deck: DeckState
): { finalSlots: PieceSlot[]; finalDeck: DeckState } {
  const updatedDeck = decrementRemainingHands(deck)

  if (!areAllSlotsEmpty(slots) || updatedDeck.remainingHands === 0) {
    return {
      finalSlots: [...slots],
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
 * 次のラウンドの状態を作成
 */
function createNextRoundState(currentState: GameState): GameState {
  const rng = new DefaultRandom()

  // allMinos（初期デッキ + 購入済みブロック）を使って新しいデッキを作成
  const baseDeck = currentState.shopState
    ? {
        cards: shuffleCurrentDeck(currentState.deck, rng).cards,
        allMinos: currentState.deck.allMinos,
        remainingHands: DECK_CONFIG.totalHands,
      }
    : {
        cards: shuffleCurrentDeck(currentState.deck, rng).cards,
        allMinos: currentState.deck.allMinos,
        remainingHands: DECK_CONFIG.totalHands,
      }

  const { slots, newDeck } = generateNewPieceSlotsFromDeck(baseDeck)
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
    gold: currentState.gold,
    targetScore: calculateTargetScore(nextRound),
    shopState: null,
  }
}

/**
 * ゲームリデューサー
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UI/START_DRAG': {
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

    case 'UI/UPDATE_DRAG': {
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

    case 'UI/END_DRAG': {
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

    case 'BOARD/PLACE_PIECE': {
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

    case 'GAME/RESET': {
      return createInitialState()
    }

    case 'ANIMATION/END_CLEAR': {
      if (!state.clearingAnimation) return state

      const clearedBoard = clearLines(state.board, state.clearingAnimation.cells)

      return {
        ...state,
        board: clearedBoard,
        clearingAnimation: null,
      }
    }

    case 'ROUND/ADVANCE': {
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

    case 'SHOP/BUY_ITEM': {
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

    case 'SHOP/LEAVE': {
      // shopping状態でのみ店を出られる
      if (state.phase !== 'shopping') return state

      return createNextRoundState(state)
    }

    default:
      return state
  }
}

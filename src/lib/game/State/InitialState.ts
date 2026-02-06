/**
 * 初期状態の生成
 */

import type { GameState, DragState, PieceSlot, DeckState, GamePhase } from '../Domain'
import { createEmptyBoard } from '../Services/BoardService'
import { createInitialDeckState, drawPiecesFromDeck } from '../Services/DeckService'
import { calculateTargetScore } from '../Services/RoundService'
import { DefaultRandom } from '../Utils/Random'
import { ROUND_CONFIG } from '../Data/Constants'

/**
 * 初期ドラッグ状態
 */
export const initialDragState: DragState = {
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
export function generateNewPieceSlotsFromDeck(deck: DeckState): { slots: PieceSlot[]; newDeck: DeckState } {
  const rng = new DefaultRandom()
  const { pieces, newDeck } = drawPiecesFromDeck(deck, rng)
  const slots = pieces.map((piece) => ({
    piece,
    position: { x: 0, y: 0 },  // レイアウト計算後に更新
  }))
  return { slots, newDeck }
}

/**
 * 初期ゲーム状態を作成
 */
export function createInitialState(): GameState {
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
 * 全てのスロットが空かチェック
 */
export function areAllSlotsEmpty(slots: readonly PieceSlot[]): boolean {
  return slots.every(slot => slot.piece === null)
}

/**
 * スコアに基づいてフェーズを判定
 */
export function determinePhase(
  score: number,
  targetScore: number,
  remainingHands: number
): GamePhase {
  if (score >= targetScore) {
    return 'round_clear'
  }
  if (remainingHands === 0) {
    return 'game_over'
  }
  return 'playing'
}

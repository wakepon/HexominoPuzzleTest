/**
 * 初期状態の生成
 */

import type { GameState, DragState, PieceSlot, DeckState, GamePhase } from '../Domain'
import type { RandomGenerator } from '../Utils/Random'
import { createEmptyBoard, placeObstacleOnBoard } from '../Services/BoardService'
import {
  createInitialDeckStateWithParams,
  drawPiecesFromDeck,
  drawPiecesFromDeckWithCount,
} from '../Services/DeckService'
import {
  calculateTargetScore,
  createRoundInfo,
  getMaxPlacements,
  getDrawCount,
} from '../Services/RoundService'
import { DefaultRandom } from '../Utils/Random'
import { ROUND_CONFIG } from '../Data/Constants'
import { createInitialPlayerState } from '../Domain/Player/PlayerState'
import { loadGameState, restoreGameState, clearGameState } from '../Services/StorageService'
import { INITIAL_RELIC_MULTIPLIER_STATE } from '../Domain/Effect/RelicState'

/**
 * 初期ドラッグ状態
 */
export const initialDragState: DragState = {
  isDragging: false,
  pieceId: null,
  slotIndex: null,
  dragSource: null,
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
 * 指定枚数でデッキから新しいピースセットを生成
 */
export function generateNewPieceSlotsFromDeckWithCount(
  deck: DeckState,
  count: number,
  rng?: RandomGenerator
): { slots: PieceSlot[]; newDeck: DeckState } {
  const random = rng ?? new DefaultRandom()
  const { pieces, newDeck } = drawPiecesFromDeckWithCount(deck, count, random)
  const slots = pieces.map((piece) => ({
    piece,
    position: { x: 0, y: 0 },
  }))
  return { slots, newDeck }
}

/**
 * 新規ゲーム状態を作成（保存データなし）
 */
function createNewGameState(): GameState {
  const rng = new DefaultRandom()
  const initialRound = 1
  const roundInfo = createRoundInfo(initialRound, rng)

  // ボス条件に基づいた配置回数とドロー枚数を取得
  const maxHands = getMaxPlacements(roundInfo)
  const drawCount = getDrawCount(roundInfo)

  const initialDeck = createInitialDeckStateWithParams(rng, maxHands)
  const { slots, newDeck } = generateNewPieceSlotsFromDeckWithCount(
    initialDeck,
    drawCount,
    rng
  )

  // ボス条件「おじゃまブロック」の場合は配置
  let board = createEmptyBoard()
  if (roundInfo.bossCondition?.id === 'obstacle') {
    board = placeObstacleOnBoard(board, rng)
  }

  return {
    board,
    pieceSlots: slots,
    dragState: initialDragState,
    score: 0,
    clearingAnimation: null,
    relicActivationAnimation: null,
    scoreAnimation: null,
    deck: newDeck,
    phase: 'round_progress',
    round: initialRound,
    roundInfo,
    player: createInitialPlayerState(ROUND_CONFIG.initialGold),
    targetScore: calculateTargetScore(initialRound),
    shopState: null,
    comboCount: 0,
    relicMultiplierState: INITIAL_RELIC_MULTIPLIER_STATE,
    deckViewOpen: false,
  }
}

/**
 * 初期ゲーム状態を作成
 * 保存データがあれば復元、なければ新規作成
 */
export function createInitialState(): GameState {
  // 保存データの読み込みを試みる
  const saved = loadGameState()

  // 保存データがある場合は復元を試みる
  if (saved) {
    try {
      return restoreGameState(saved, initialDragState)
    } catch (error) {
      console.warn('Failed to restore game state, starting new game:', error)
      clearGameState()
    }
  }

  // 保存データがない、または復元失敗の場合は新規ゲーム
  return createNewGameState()
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

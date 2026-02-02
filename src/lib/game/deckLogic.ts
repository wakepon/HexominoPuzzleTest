/**
 * デッキ操作のpure functions
 */

import { DeckState, Piece, RandomGenerator } from './types'
import { DECK_CONFIG } from './constants'
import { getMinoById } from './minoDefinitions'

/**
 * デッキのミノIDリストを取得
 */
export function getDeckMinoIds(): string[] {
  return [...DECK_CONFIG.minoIds]
}

/**
 * Fisher-Yatesアルゴリズムでシャッフル
 */
export function shuffleDeck(cards: string[], rng: RandomGenerator): string[] {
  const shuffled = [...cards]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }
  return shuffled
}

/**
 * デッキからカードを引く
 * デッキが足りない場合は再シャッフルして引く
 */
export function drawFromDeck(
  deck: DeckState,
  count: number,
  rng: RandomGenerator
): { drawn: string[]; newDeck: DeckState } {
  let cards = [...deck.cards]

  // デッキが足りない場合は再シャッフル
  if (cards.length < count) {
    const newCards = getDeckMinoIds()
    cards = shuffleDeck(newCards, rng)
  }

  const drawn = cards.slice(0, count)
  const remaining = cards.slice(count)

  return {
    drawn,
    newDeck: {
      ...deck,
      cards: remaining,
    },
  }
}

/**
 * ミノIDからPieceを生成
 */
export function minoIdToPiece(minoId: string): Piece | null {
  const mino = getMinoById(minoId)
  if (!mino) return null

  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  return {
    id: `${mino.id}-${uniqueSuffix}`,
    shape: mino.shape,
  }
}

/**
 * 初期デッキ状態を作成
 */
export function createInitialDeckState(rng: RandomGenerator): DeckState {
  const cards = getDeckMinoIds()
  const shuffled = shuffleDeck(cards, rng)

  return {
    cards: shuffled,
    remainingHands: DECK_CONFIG.totalHands,
  }
}

/**
 * デッキから3つのPieceを生成
 */
export function drawPiecesFromDeck(
  deck: DeckState,
  rng: RandomGenerator
): { pieces: Piece[]; newDeck: DeckState } {
  const { drawn, newDeck } = drawFromDeck(deck, DECK_CONFIG.drawCount, rng)

  const pieces: Piece[] = []
  for (const minoId of drawn) {
    const piece = minoIdToPiece(minoId)
    if (piece) {
      pieces.push(piece)
    }
  }

  return { pieces, newDeck }
}

/**
 * 残りハンドをデクリメント
 */
export function decrementRemainingHands(deck: DeckState): DeckState {
  return {
    ...deck,
    remainingHands: Math.max(0, deck.remainingHands - 1),
  }
}

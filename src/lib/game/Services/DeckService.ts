/**
 * デッキ操作サービス
 */

import type { DeckState, Piece } from '../Domain'
import type { RandomGenerator } from '../Utils/Random'
import { DECK_CONFIG } from '../Data/Constants'
import { getMinoById } from '../Data/MinoDefinitions'
import { createPiece } from './PieceService'

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
 * デッキが足りない場合は、残りを全て引いてから再シャッフルして補充
 */
export function drawFromDeck(
  deck: DeckState,
  count: number,
  rng: RandomGenerator
): { drawn: string[]; newDeck: DeckState } {
  const cards = [...deck.cards]
  const allMinos = deck.allMinos

  // デッキが十分にある場合はそのまま引く
  if (cards.length >= count) {
    const drawn = cards.slice(0, count)
    const remaining = cards.slice(count)
    return {
      drawn,
      newDeck: {
        ...deck,
        cards: remaining,
        allMinos,
      },
    }
  }

  // デッキが足りない場合:
  // 1. まず残りのカードを全て引く
  const drawnFromCurrent = [...cards]
  const stillNeeded = count - drawnFromCurrent.length

  // 2. allMinosをシャッフルして新しいデッキを作成
  const newCards = shuffleDeck([...allMinos], rng)

  // 3. 新しいデッキから不足分を引く
  const drawnFromNew = newCards.slice(0, stillNeeded)
  const remaining = newCards.slice(stillNeeded)

  return {
    drawn: [...drawnFromCurrent, ...drawnFromNew],
    newDeck: {
      ...deck,
      cards: remaining,
      allMinos,
    },
  }
}

/**
 * ミノIDからPieceを生成
 */
export function minoIdToPiece(minoId: string): Piece | null {
  const mino = getMinoById(minoId)
  if (!mino) return null

  return createPiece(mino)
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
    allMinos: [...cards],
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

/**
 * ショップ機能のpure functions
 */

import { ShopItem, ShopState, DeckState, RandomGenerator, MinoCategory } from './types'
import { MINOS_BY_CATEGORY, getMinoById } from './minoDefinitions'
import { shuffleDeck } from './deckLogic'

/**
 * カテゴリごとのミノIDリスト
 */
const SMALL_CATEGORIES: MinoCategory[] = ['monomino', 'domino', 'tromino']
const MEDIUM_CATEGORIES: MinoCategory[] = ['tetromino', 'pentomino']
const LARGE_CATEGORIES: MinoCategory[] = ['pentomino', 'hexomino']

/**
 * 指定カテゴリ群からランダムにミノIDを1つ選択
 */
function pickRandomMinoFromCategories(
  categories: MinoCategory[],
  rng: RandomGenerator
): string {
  // カテゴリをランダムに選択
  const categoryIndex = Math.floor(rng.next() * categories.length)
  const category = categories[categoryIndex]

  // そのカテゴリのミノからランダムに選択
  const minos = MINOS_BY_CATEGORY[category]
  const minoIndex = Math.floor(rng.next() * minos.length)
  return minos[minoIndex].id
}

/**
 * ミノIDから価格を計算（セル数 = 価格）
 */
export function calculatePrice(minoId: string): number {
  const mino = getMinoById(minoId)
  return mino ? mino.cellCount : 0
}

/**
 * ショップアイテムを生成（3種類）
 * - 小: モノミノ/ドミノ/トリミノ
 * - 中: テトロミノ/ペントミノ
 * - 大: ペントミノ/ヘキソミノ
 */
export function generateShopItems(rng: RandomGenerator): ShopItem[] {
  const smallMinoId = pickRandomMinoFromCategories(SMALL_CATEGORIES, rng)
  const mediumMinoId = pickRandomMinoFromCategories(MEDIUM_CATEGORIES, rng)
  const largeMinoId = pickRandomMinoFromCategories(LARGE_CATEGORIES, rng)

  return [
    { minoId: smallMinoId, price: calculatePrice(smallMinoId), purchased: false },
    { minoId: mediumMinoId, price: calculatePrice(mediumMinoId), purchased: false },
    { minoId: largeMinoId, price: calculatePrice(largeMinoId), purchased: false },
  ]
}

/**
 * ショップ状態を作成
 */
export function createShopState(rng: RandomGenerator): ShopState {
  return {
    items: generateShopItems(rng),
  }
}

/**
 * 購入可能かチェック
 */
export function canAfford(gold: number, price: number): boolean {
  return gold >= price
}

/**
 * デッキにミノIDを追加
 */
export function addToDeck(deck: DeckState, minoId: string): DeckState {
  return {
    ...deck,
    cards: [...deck.cards, minoId],
  }
}

/**
 * ショップアイテムを購入済みにする
 */
export function markItemAsPurchased(shopState: ShopState, itemIndex: number): ShopState {
  return {
    ...shopState,
    items: shopState.items.map((item, i) =>
      i === itemIndex ? { ...item, purchased: true } : item
    ),
  }
}

/**
 * デッキをシャッフルして新しい状態を返す
 */
export function shuffleCurrentDeck(deck: DeckState, rng: RandomGenerator): DeckState {
  return {
    ...deck,
    cards: shuffleDeck(deck.cards, rng),
  }
}

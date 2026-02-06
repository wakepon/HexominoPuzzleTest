/**
 * ショップ機能のpure functions
 */

import type { ShopItem, ShopState, DeckState, MinoCategory, Piece } from '../Domain'
import type { PatternId, SealId } from '../Domain/Core/Id'
import type { RandomGenerator } from '../Utils/Random'
import { MINOS_BY_CATEGORY } from '../Data/MinoDefinitions'
import { shuffleDeck } from './DeckService'
import {
  createPiece,
  createPieceWithPattern,
  createPieceWithSeal,
  createPieceWithPatternAndSeal,
} from './PieceService'
import { SHOP_AVAILABLE_PATTERNS } from '../Domain/Effect/Pattern'
import { SHOP_AVAILABLE_SEALS } from '../Domain/Effect/Seal'

/**
 * カテゴリごとのミノIDリスト
 */
const SMALL_CATEGORIES: MinoCategory[] = ['monomino', 'domino', 'tromino']
const MEDIUM_CATEGORIES: MinoCategory[] = ['tetromino', 'pentomino']
const LARGE_CATEGORIES: MinoCategory[] = ['pentomino', 'hexomino']

/**
 * ショップ商品サイズ
 */
type ShopItemSize = 'small' | 'medium' | 'large'

/**
 * サイズ別のパターン付与確率
 */
const PATTERN_PROBABILITY: Record<ShopItemSize, number> = {
  small: 0, // 0%
  medium: 0.3, // 30%
  large: 0.5, // 50%
}

/**
 * サイズ別のシール付与確率（パターンとは独立）
 */
const SEAL_PROBABILITY: Record<ShopItemSize, number> = {
  small: 0, // 0%
  medium: 0.2, // 20%
  large: 0.3, // 30%
}

/**
 * 指定カテゴリ群からランダムにミノ定義を取得
 */
function pickRandomMinoFromCategories(
  categories: MinoCategory[],
  rng: RandomGenerator
) {
  const categoryIndex = Math.floor(rng.next() * categories.length)
  const category = categories[categoryIndex]
  const minos = MINOS_BY_CATEGORY[category]
  const minoIndex = Math.floor(rng.next() * minos.length)
  return minos[minoIndex]
}

/**
 * ランダムにパターンを選択
 */
function pickRandomPattern(rng: RandomGenerator): PatternId {
  const index = Math.floor(rng.next() * SHOP_AVAILABLE_PATTERNS.length)
  return SHOP_AVAILABLE_PATTERNS[index] as PatternId
}

/**
 * ランダムにシールを選択
 */
function pickRandomSeal(rng: RandomGenerator): SealId {
  const index = Math.floor(rng.next() * SHOP_AVAILABLE_SEALS.length)
  return SHOP_AVAILABLE_SEALS[index] as SealId
}

/** パターン付きの追加価格 */
const PATTERN_PRICE_BONUS = 3

/** シール付きの追加価格 */
const SEAL_PRICE_BONUS = 2

/**
 * Pieceの価格を計算
 * - 基本価格: セル数
 * - パターン付きの場合: +PATTERN_PRICE_BONUS
 * - シール付きの場合: +SEAL_PRICE_BONUS
 */
function calculatePiecePrice(piece: Piece): number {
  const cellCount = piece.shape.reduce(
    (sum, row) => sum + row.filter(Boolean).length,
    0
  )

  // パターンとシールの有無をチェック
  let hasPattern = false
  let hasSeal = false
  for (const blockData of piece.blocks.values()) {
    if (blockData.pattern) hasPattern = true
    if (blockData.seal) hasSeal = true
    if (hasPattern && hasSeal) break
  }

  return (
    cellCount +
    (hasPattern ? PATTERN_PRICE_BONUS : 0) +
    (hasSeal ? SEAL_PRICE_BONUS : 0)
  )
}

/**
 * ショップ用のPieceを生成（パターン・シール付与判定含む）
 */
function createShopPiece(
  categories: MinoCategory[],
  size: ShopItemSize,
  rng: RandomGenerator
): Piece {
  const mino = pickRandomMinoFromCategories(categories, rng)

  // パターンとシールの付与判定（独立）
  const patternProb = PATTERN_PROBABILITY[size]
  const sealProb = SEAL_PROBABILITY[size]

  const addPattern = patternProb > 0 && rng.next() < patternProb
  const addSeal = sealProb > 0 && rng.next() < sealProb

  // 4パターンで分岐
  if (addPattern && addSeal) {
    const pattern = pickRandomPattern(rng)
    const seal = pickRandomSeal(rng)
    return createPieceWithPatternAndSeal(mino, pattern, seal, rng)
  }

  if (addPattern) {
    const pattern = pickRandomPattern(rng)
    return createPieceWithPattern(mino, pattern)
  }

  if (addSeal) {
    const seal = pickRandomSeal(rng)
    return createPieceWithSeal(mino, seal, rng)
  }

  return createPiece(mino)
}

/**
 * ショップアイテムを生成（3種類）
 * - 小: モノミノ/ドミノ/トリミノ（パターンなし）
 * - 中: テトロミノ/ペントミノ（30%でパターン付き）
 * - 大: ペントミノ/ヘキソミノ（50%でパターン付き）
 */
export function generateShopItems(rng: RandomGenerator): ShopItem[] {
  const smallPiece = createShopPiece(SMALL_CATEGORIES, 'small', rng)
  const mediumPiece = createShopPiece(MEDIUM_CATEGORIES, 'medium', rng)
  const largePiece = createShopPiece(LARGE_CATEGORIES, 'large', rng)

  return [
    {
      type: 'block',
      piece: smallPiece,
      price: calculatePiecePrice(smallPiece),
      purchased: false,
      onSale: false,
    },
    {
      type: 'block',
      piece: mediumPiece,
      price: calculatePiecePrice(mediumPiece),
      purchased: false,
      onSale: false,
    },
    {
      type: 'block',
      piece: largePiece,
      price: calculatePiecePrice(largePiece),
      purchased: false,
      onSale: false,
    },
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
 * ショップアイテムを購入済みにする
 */
export function markItemAsPurchased(
  shopState: ShopState,
  itemIndex: number
): ShopState {
  return {
    ...shopState,
    items: shopState.items.map((item, i) =>
      i === itemIndex ? { ...item, purchased: true } : item
    ),
  }
}

/**
 * デッキをシャッフルして新しい状態を返す
 * allMinosを使って完全にシャッフルした新しいcardsを生成
 */
export function shuffleCurrentDeck(
  deck: DeckState,
  rng: RandomGenerator
): DeckState {
  return {
    ...deck,
    cards: shuffleDeck([...deck.allMinos], rng),
  }
}

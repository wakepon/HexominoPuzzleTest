/**
 * ショップ機能のpure functions
 */

import type { ShopItem, ShopState, DeckState, MinoCategory, Piece, RelicShopItem, BlockShopItem } from '../Domain'
import type { PatternId, SealId, RelicId } from '../Domain/Core/Id'
import type { RandomGenerator } from '../Utils/Random'
import { RELIC_DEFINITIONS, RelicType } from '../Domain/Effect/Relic'
import { calculatePiecePrice, calculateSalePrice } from './ShopPriceCalculator'

/**
 * 確率オーバーライド設定（デバッグ用）
 * 指定された場合、サイズ別の確率を上書きする
 */
export interface ProbabilityOverride {
  /** パターン付与確率 (0-1) */
  pattern?: number
  /** シール付与確率 (0-1) */
  seal?: number
}
import { SHOP_STYLE } from '../Data/Constants'
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

// 価格計算は ShopPriceCalculator に移動

/**
 * ショップ用のPieceを生成（パターン・シール付与判定含む）
 */
function createShopPiece(
  categories: MinoCategory[],
  size: ShopItemSize,
  rng: RandomGenerator,
  override?: ProbabilityOverride
): Piece {
  const mino = pickRandomMinoFromCategories(categories, rng)

  // パターンとシールの付与判定（独立）
  // オーバーライドがあれば使用、なければサイズ別のデフォルト確率
  const patternProb = override?.pattern ?? PATTERN_PROBABILITY[size]
  const sealProb = override?.seal ?? SEAL_PROBABILITY[size]

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
 * @param override デバッグ用の確率オーバーライド
 */
export function generateShopItems(
  rng: RandomGenerator,
  override?: ProbabilityOverride
): BlockShopItem[] {
  const smallPiece = createShopPiece(SMALL_CATEGORIES, 'small', rng, override)
  const mediumPiece = createShopPiece(MEDIUM_CATEGORIES, 'medium', rng, override)
  const largePiece = createShopPiece(LARGE_CATEGORIES, 'large', rng, override)

  const smallPrice = calculatePiecePrice(smallPiece)
  const mediumPrice = calculatePiecePrice(mediumPiece)
  const largePrice = calculatePiecePrice(largePiece)

  return [
    {
      type: 'block',
      piece: smallPiece,
      price: smallPrice,
      originalPrice: smallPrice,
      purchased: false,
      onSale: false,
    },
    {
      type: 'block',
      piece: mediumPiece,
      price: mediumPrice,
      originalPrice: mediumPrice,
      purchased: false,
      onSale: false,
    },
    {
      type: 'block',
      piece: largePiece,
      price: largePrice,
      originalPrice: largePrice,
      purchased: false,
      onSale: false,
    },
  ]
}

/**
 * 未所持レリックからランダムに選択してショップ商品を生成
 * @param ownedRelics 所持済みレリックID配列
 * @param maxCount 最大生成数
 */
export function generateRelicShopItems(
  rng: RandomGenerator,
  ownedRelics: readonly RelicId[],
  maxCount: number = 3
): RelicShopItem[] {
  // 全レリックから未所持のものをフィルタ
  const allRelicTypes = Object.keys(RELIC_DEFINITIONS) as RelicType[]
  const availableRelics = allRelicTypes.filter(
    (type) => !ownedRelics.includes(type as RelicId)
  )

  if (availableRelics.length === 0) {
    return []
  }

  // シャッフルして最大maxCount個を選択
  const shuffled = [...availableRelics].sort(() => rng.next() - 0.5)
  const selected = shuffled.slice(0, Math.min(maxCount, shuffled.length))

  return selected.map((type) => {
    const def = RELIC_DEFINITIONS[type]
    return {
      type: 'relic' as const,
      relicId: def.id,
      price: def.price,
      originalPrice: def.price,
      purchased: false,
      onSale: false,
    }
  })
}

/**
 * ランダムに1つの商品にセールを適用
 */
function applySaleToRandomItem(
  items: ShopItem[],
  rng: RandomGenerator
): ShopItem[] {
  if (items.length === 0) return items

  // ランダムに1つ選択
  const saleIndex = Math.floor(rng.next() * items.length)

  return items.map((item, i) => {
    if (i !== saleIndex) return item

    // セール価格を計算（25%OFF、切り下げ）
    const salePrice = calculateSalePrice(item.originalPrice)

    return {
      ...item,
      price: salePrice,
      onSale: true,
    }
  })
}

/**
 * ショップ状態を作成
 * @param ownedRelics 所持済みレリックID配列（所持レリックはショップに出ない）
 * @param override デバッグ用の確率オーバーライド
 */
export function createShopState(
  rng: RandomGenerator,
  ownedRelics: readonly RelicId[] = [],
  override?: ProbabilityOverride
): ShopState {
  const blockItems = generateShopItems(rng, override)
  const relicItems = generateRelicShopItems(rng, ownedRelics)

  // 全商品からランダムに1つセール対象を選択
  const allItems = [...blockItems, ...relicItems]
  const itemsWithSale = applySaleToRandomItem(allItems, rng)

  return {
    items: itemsWithSale,
    rerollCount: 0,
    sellMode: false,
    pendingPurchaseIndex: null,
  }
}

/**
 * リロールコストを計算
 */
export function getRerollCost(rerollCount: number): number {
  return SHOP_STYLE.rerollInitialCost + rerollCount * SHOP_STYLE.rerollCostIncrement
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

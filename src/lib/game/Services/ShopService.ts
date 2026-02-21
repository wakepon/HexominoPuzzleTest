/**
 * ショップ機能のpure functions
 */

import type { ShopItem, ShopState, DeckState, MinoCategory, Piece, RelicShopItem, BlockShopItem } from '../Domain'
import type { AmuletShopItem } from '../Domain/Shop/ShopTypes'
import type { PatternId, SealId, RelicId, BlessingId } from '../Domain/Core/Id'
import type { RandomGenerator } from '../Utils/Random'
import { RELIC_DEFINITIONS, RelicType, RelicRarity } from '../Domain/Effect/Relic'
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
  /** 加護付与確率 (0-1) */
  blessing?: number
}
import { SHOP_STYLE } from '../Data/Constants'
import { MERCHANT_REROLL_DISCOUNT } from '../Domain/Effect/Relics/Merchant'
import { JESTER_DISCOUNT_RATE } from '../Domain/Effect/Relics/Jester'
import { MINOS_BY_CATEGORY } from '../Data/MinoDefinitions'
import { shuffleDeck } from './DeckService'
import {
  createPiece,
  createPieceWithPattern,
  getFilledPositions,
} from './PieceService'
import { BlockDataMapUtils } from '../Domain/Piece/BlockData'
import { SHOP_AVAILABLE_PATTERNS } from '../Domain/Effect/Pattern'
import { SHOP_AVAILABLE_SEALS } from '../Domain/Effect/Seal'
import { SHOP_AVAILABLE_BLESSINGS } from '../Domain/Effect/Blessing'
import { AMULET_DEFINITIONS, type AmuletType } from '../Domain/Effect/Amulet'

/**
 * カテゴリごとのミノIDリスト
 */
const SMALL_MEDIUM_CATEGORIES: MinoCategory[] = ['monomino', 'domino', 'tromino', 'tetromino']
const MEDIUM_LARGE_CATEGORIES: MinoCategory[] = ['tetromino', 'pentomino', 'hexomino']

/**
 * パターン付与確率（ミノサイズに関わらず一律）
 */
const PATTERN_PROBABILITY = 0.75 // 75%

/**
 * シール付与確率（ブロック単位で独立抽選）
 */
const SEAL_PROBABILITY = 0.03 // 3%

/**
 * 加護付与確率（ブロック単位で独立抽選）
 */
const BLESSING_PROBABILITY = 0.03 // 3%

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

/**
 * ランダムに加護を選択
 */
function pickRandomBlessing(rng: RandomGenerator): BlessingId {
  const index = Math.floor(rng.next() * SHOP_AVAILABLE_BLESSINGS.length)
  return SHOP_AVAILABLE_BLESSINGS[index] as BlessingId
}

// 価格計算は ShopPriceCalculator に移動

/**
 * ショップ用のPieceを生成（パターン・シール・加護付与判定含む）
 * パターンはピース単位、シール・加護はブロック単位で独立抽選
 */
function createShopPiece(
  categories: MinoCategory[],
  rng: RandomGenerator,
  override?: ProbabilityOverride
): Piece {
  const mino = pickRandomMinoFromCategories(categories, rng)

  // 確率設定
  const patternProb = override?.pattern ?? PATTERN_PROBABILITY
  const sealProb = override?.seal ?? SEAL_PROBABILITY
  const blessingProb = override?.blessing ?? BLESSING_PROBABILITY

  // 1. パターン判定（ピース単位）
  const addPattern = patternProb > 0 && rng.next() < patternProb
  const piece = addPattern
    ? createPieceWithPattern(mino, pickRandomPattern(rng))
    : createPiece(mino)

  // 2. 全ブロックを走査し、各ブロックで独立にシール・加護を抽選
  const positions = getFilledPositions(piece.shape)
  let blocks = piece.blocks

  for (const pos of positions) {
    if (sealProb > 0 && rng.next() < sealProb) {
      blocks = BlockDataMapUtils.setSeal(blocks, pos.row, pos.col, pickRandomSeal(rng))
    }
    if (blessingProb > 0 && rng.next() < blessingProb) {
      blocks = BlockDataMapUtils.setBlessing(blocks, pos.row, pos.col, pickRandomBlessing(rng))
    }
  }

  return {
    ...piece,
    blocks,
  }
}

/**
 * ショップアイテムを生成（2種類）
 * - 小中: モノミノ/ドミノ/トリミノ/テトロミノ
 * - 中大: テトロミノ/ペントミノ/ヘキソミノ
 * パターン付与確率は一律75%、シール/加護はブロック単位5%
 * @param override デバッグ用の確率オーバーライド
 */
export function generateShopItems(
  rng: RandomGenerator,
  override?: ProbabilityOverride
): BlockShopItem[] {
  const smallMediumPiece = createShopPiece(SMALL_MEDIUM_CATEGORIES, rng, override)
  const mediumLargePiece = createShopPiece(MEDIUM_LARGE_CATEGORIES, rng, override)

  const smallMediumPrice = calculatePiecePrice(smallMediumPiece)
  const mediumLargePrice = calculatePiecePrice(mediumLargePiece)

  return [
    {
      type: 'block',
      piece: smallMediumPiece,
      price: smallMediumPrice,
      originalPrice: smallMediumPrice,
      purchased: false,
      onSale: false,
    },
    {
      type: 'block',
      piece: mediumLargePiece,
      price: mediumLargePrice,
      originalPrice: mediumLargePrice,
      purchased: false,
      onSale: false,
    },
  ]
}

/** レアリティ別の出現重み */
const RARITY_WEIGHTS: Record<RelicRarity, number> = {
  common: 70,
  uncommon: 25,
  rare: 5,
  epic: 0.3,
}

/**
 * 重み付きランダム選択（重複なし）
 */
function weightedSelectWithoutDuplication(
  rng: RandomGenerator,
  candidates: RelicType[],
  count: number
): RelicType[] {
  const remaining = [...candidates]
  const selected: RelicType[] = []

  for (let i = 0; i < count && remaining.length > 0; i++) {
    const weights = remaining.map((type) => RARITY_WEIGHTS[RELIC_DEFINITIONS[type].rarity])
    const totalWeight = weights.reduce((sum, w) => sum + w, 0)

    let roll = rng.next() * totalWeight
    let chosenIndex = 0
    for (let j = 0; j < weights.length; j++) {
      roll -= weights[j]
      if (roll <= 0) {
        chosenIndex = j
        break
      }
    }

    selected.push(remaining[chosenIndex])
    remaining.splice(chosenIndex, 1)
  }

  return selected
}

/**
 * 未所持レリックからレアリティに基づく重み付きランダムで選択
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

  const selected = weightedSelectWithoutDuplication(
    rng, availableRelics, Math.min(maxCount, availableRelics.length)
  )

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
 * 護符ショップアイテムを生成
 * AMULET_DEFINITIONSからランダム選択、minPrice〜maxPrice範囲で価格決定
 */
export function generateAmuletShopItem(
  rng: RandomGenerator
): AmuletShopItem {
  const allTypes = Object.keys(AMULET_DEFINITIONS) as AmuletType[]
  const typeIndex = Math.floor(rng.next() * allTypes.length)
  const amuletType = allTypes[typeIndex]
  const def = AMULET_DEFINITIONS[amuletType]

  // minPrice〜maxPrice範囲でランダム価格
  const priceRange = def.maxPrice - def.minPrice
  const price = def.minPrice + Math.floor(rng.next() * (priceRange + 1))

  return {
    type: 'amulet',
    amuletId: def.id,
    amuletType: def.type,
    name: def.name,
    description: def.description,
    icon: def.icon,
    price,
    originalPrice: price,
    purchased: false,
    onSale: false,
  }
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

  // 30%の確率でレリック枠の1つを護符に置換
  let finalRelicItems: ShopItem[] = [...relicItems]
  if (relicItems.length > 0 && rng.next() < 0.3) {
    const amuletItem = generateAmuletShopItem(rng)
    // 最後のレリック枠を護符に置換
    finalRelicItems = [...relicItems.slice(0, -1), amuletItem]
  }

  // 全商品からランダムに1つセール対象を選択
  const allItems: ShopItem[] = [...blockItems, ...finalRelicItems]
  const itemsWithSale = applySaleToRandomItem(allItems, rng)

  // jester所持時は全商品30%OFF
  const hasJester = ownedRelics.includes('jester' as RelicId)
  const finalItems = hasJester
    ? itemsWithSale.map(item => ({
        ...item,
        price: Math.floor(item.price * (1 - JESTER_DISCOUNT_RATE)),
      }))
    : itemsWithSale

  return {
    items: finalItems,
    rerollCount: 0,
    sellMode: false,
    pendingPurchaseIndex: null,
  }
}

/**
 * リロールコストを計算
 * @param rerollCount リロール回数
 * @param ownedRelics 所持レリック（merchantレリック所持時は-2G割引）
 */
export function getRerollCost(
  rerollCount: number,
  ownedRelics: readonly RelicId[] = []
): number {
  const baseCost = SHOP_STYLE.rerollInitialCost + rerollCount * SHOP_STYLE.rerollCostIncrement
  const hasMerchant = ownedRelics.includes('merchant' as RelicId)
  if (hasMerchant) {
    return Math.max(0, baseCost - MERCHANT_REROLL_DISCOUNT)
  }
  return baseCost
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

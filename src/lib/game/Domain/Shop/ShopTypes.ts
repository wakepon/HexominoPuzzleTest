import type { RelicId } from '../Core/Id'
import type { Piece } from '../Piece/Piece'

/**
 * ブロック商品
 *
 * - Pieceを直接持つ（パターン・シール情報はPiece.blocksに含まれる）
 * - 価格はセル数 + パターン/シールの付加価値で計算
 */
export interface BlockShopItem {
  readonly type: 'block'
  readonly piece: Piece
  readonly price: number
  readonly purchased: boolean
  readonly onSale: boolean
}

/**
 * レリック商品
 */
export interface RelicShopItem {
  readonly type: 'relic'
  readonly relicId: RelicId
  readonly price: number
  readonly purchased: boolean
  readonly onSale: boolean
}

/**
 * ショップ商品（判別可能なUnion型）
 */
export type ShopItem = BlockShopItem | RelicShopItem

/**
 * ショップ状態
 */
export interface ShopState {
  readonly items: readonly ShopItem[]
}

/**
 * BlockShopItemかどうかを判定
 */
export function isBlockShopItem(item: ShopItem): item is BlockShopItem {
  return item.type === 'block'
}

/**
 * RelicShopItemかどうかを判定
 */
export function isRelicShopItem(item: ShopItem): item is RelicShopItem {
  return item.type === 'relic'
}

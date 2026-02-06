import type { MinoId, RelicId } from '../Core/Id'
import type { Piece } from '../Piece/Piece'

/**
 * ショップアイテム（基本）
 *
 * 注意: 現在の基本パズル実装ではMinoIdベースのシンプルな構造。
 * 将来的にBlockShopItem / RelicShopItem に分割予定。
 */
export interface ShopItem {
  readonly minoId: MinoId          // ミノのID
  readonly price: number           // 価格（セル数と同じ）
  readonly purchased: boolean      // 購入済みフラグ
}

/**
 * ブロック商品（将来のローグライト機能用）
 */
export interface BlockShopItem {
  readonly type: 'block'
  readonly piece: Piece
  readonly purchased: boolean
  readonly onSale: boolean
}

/**
 * レリック商品（将来のローグライト機能用）
 */
export interface RelicShopItem {
  readonly type: 'relic'
  readonly relicId: RelicId
  readonly purchased: boolean
  readonly onSale: boolean
}

/**
 * ショップ商品（判別可能なUnion型）- 将来用
 */
export type AdvancedShopItem = BlockShopItem | RelicShopItem

/**
 * ショップ状態
 */
export interface ShopState {
  readonly items: readonly ShopItem[]
}

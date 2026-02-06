/**
 * 後方互換性のためのエイリアス
 * 新しいコードはServices/ShopServiceから直接インポートしてください。
 */
export {
  generateShopItems,
  createShopState,
  canAfford,
  markItemAsPurchased,
  shuffleCurrentDeck,
} from './Services/ShopService'

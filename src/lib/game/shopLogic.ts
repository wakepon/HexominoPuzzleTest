/**
 * 後方互換性のためのエイリアス
 * 新しいコードはServices/ShopServiceから直接インポートしてください。
 */
export {
  calculatePrice,
  generateShopItems,
  createShopState,
  canAfford,
  addToDeck,
  markItemAsPurchased,
  shuffleCurrentDeck,
} from './Services/ShopService'

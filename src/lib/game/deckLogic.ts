/**
 * 後方互換性のためのエイリアス
 * 新しいコードはServices/DeckServiceから直接インポートしてください。
 */
export {
  getDeckMinoIds,
  shuffleDeck,
  drawFromDeck,
  minoIdToPiece,
  createInitialDeckState,
  drawPiecesFromDeck,
  decrementRemainingHands,
} from './Services/DeckService'

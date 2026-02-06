/**
 * 後方互換性のためのエイリアス
 * 新しいコードはServices/BoardServiceから直接インポートしてください。
 */
export {
  createEmptyBoard,
  placePieceOnBoard,
  getCell,
} from './Services/BoardService'

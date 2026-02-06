/**
 * 後方互換性のためのエイリアス
 * 新しいコードはServices/PieceServiceから直接インポートしてください。
 */
export {
  DEFAULT_WEIGHTS,
  selectCategory,
  selectMinoFromCategory,
  generatePieceSet,
} from './Services/PieceService'
export type { CategoryWeights } from './Services/PieceService'

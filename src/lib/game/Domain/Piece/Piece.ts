import type { PieceId, BlockSetId } from '../Core/Id'
import type { PieceShape } from './PieceShape'
import type { BlockDataMap } from './BlockData'

/**
 * ゲーム内で使用されるピース（ブロックセット）
 *
 * 不変オブジェクトとして設計
 * - 各BlockがBlockDataを持つ（パターン・シール情報）
 * - パターンはPiece全体で同じ値が設定される
 * - シールは一部のBlockのみに設定される
 */
export interface Piece {
  readonly id: PieceId
  readonly shape: PieceShape
  readonly blockSetId: BlockSetId
  readonly blocks: BlockDataMap
}

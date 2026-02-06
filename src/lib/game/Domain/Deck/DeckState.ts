import type { MinoId } from '../Core/Id'
import type { Piece } from '../Piece/Piece'
import type { Position } from '../Core/Position'

/**
 * デッキの状態
 */
export interface DeckState {
  readonly cards: readonly MinoId[]         // 山札（残りカード）
  readonly allMinos: readonly MinoId[]      // 全カード（再シャッフル用）
  readonly remainingHands: number           // 残り配置回数
}

/**
 * ピーススロットの状態（画面下部の3つのブロック）
 */
export interface PieceSlot {
  readonly piece: Piece | null
  readonly position: Position  // スロットの画面上の位置
}

/**
 * 手札状態
 */
export interface HandState {
  readonly pieces: readonly (Piece | null)[]  // 手札のピース（通常3枚）
  readonly maxHandSize: number                // 最大手札枚数
}

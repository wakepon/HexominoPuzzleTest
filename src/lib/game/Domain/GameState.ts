import type { Board } from './Board/Board'
import type { DeckState, PieceSlot } from './Deck/DeckState'
import type { GamePhase } from './Round/GamePhase'
import type { ShopState } from './Shop/ShopTypes'
import type { DragState } from './Input/DragState'
import type { ClearingAnimationState } from './Animation/AnimationState'

/**
 * ゲーム全体の状態（不変）
 *
 * 注意: Architecture.mdでは player, roundInfo, hand 等が分離されているが、
 * 現在の基本パズル実装では既存構造を維持。
 * 将来のローグライト機能で完全準拠に移行予定。
 */
export interface GameState {
  // ボード関連
  readonly board: Board
  readonly pieceSlots: readonly PieceSlot[]
  readonly deck: DeckState

  // UI関連
  readonly dragState: DragState
  readonly clearingAnimation: ClearingAnimationState | null

  // ラウンド関連
  readonly phase: GamePhase
  readonly round: number
  readonly score: number
  readonly targetScore: number

  // プレイヤー関連
  readonly gold: number

  // ショップ関連
  readonly shopState: ShopState | null
}

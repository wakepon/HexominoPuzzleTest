import type { Board } from './Board/Board'
import type { DeckState, PieceSlot } from './Deck/DeckState'
import type { GamePhase } from './Round/GamePhase'
import type { ShopState } from './Shop/ShopTypes'
import type { DragState } from './Input/DragState'
import type { ClearingAnimationState } from './Animation/AnimationState'
import type { PlayerState } from './Player/PlayerState'

/**
 * ゲーム全体の状態（不変）
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
  readonly player: PlayerState

  // ショップ関連
  readonly shopState: ShopState | null

  // コンボ状態（combo効果用）
  readonly comboCount: number
}

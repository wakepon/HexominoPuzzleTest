/**
 * ゲームアクション定義
 *
 * プレフィックス形式のAction型
 * - BOARD/: ボード操作
 * - UI/: UI操作（ドラッグ等）
 * - GAME/: ゲーム全体
 * - ANIMATION/: アニメーション
 * - ROUND/: ラウンド進行
 * - SHOP/: ショップ操作
 */

import type { Position } from '../../Domain'
import type { ProbabilityOverride } from '../../Services/ShopService'

// ボードアクション
export type BoardAction =
  | { type: 'BOARD/PLACE_PIECE'; slotIndex: number; position: Position }

// UIアクション
export type UIAction =
  | { type: 'UI/START_DRAG'; slotIndex: number; startPos: Position }
  | { type: 'UI/UPDATE_DRAG'; currentPos: Position; boardPos: Position | null }
  | { type: 'UI/END_DRAG' }

// ゲームアクション
export type GameCoreAction =
  | { type: 'GAME/RESET' }

// アニメーションアクション
export type AnimationAction =
  | { type: 'ANIMATION/END_CLEAR' }
  | { type: 'ANIMATION/END_RELIC_ACTIVATION' }

// ラウンドアクション
export type RoundAction =
  | { type: 'ROUND/ADVANCE'; probabilityOverride?: ProbabilityOverride }

// ショップアクション
export type ShopAction =
  | { type: 'SHOP/BUY_ITEM'; itemIndex: number }
  | { type: 'SHOP/LEAVE' }

/**
 * 全アクション型（判別可能なUnion型）
 */
export type GameAction =
  | BoardAction
  | UIAction
  | GameCoreAction
  | AnimationAction
  | RoundAction
  | ShopAction

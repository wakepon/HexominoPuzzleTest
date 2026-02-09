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
 * - STOCK/: ストック操作
 * - DEBUG/: デバッグ操作
 */

import type { Position } from '../../Domain'
import type { ProbabilityOverride } from '../../Services/ShopService'
import type { RelicType } from '../../Domain/Effect/Relic'

// ボードアクション
export type BoardAction =
  | { type: 'BOARD/PLACE_PIECE'; slotIndex: number; position: Position }

// UIアクション
export type UIAction =
  | { type: 'UI/START_DRAG'; slotIndex: number; startPos: Position }
  | { type: 'UI/START_DRAG_FROM_STOCK'; startPos: Position }
  | { type: 'UI/UPDATE_DRAG'; currentPos: Position; boardPos: Position | null }
  | { type: 'UI/END_DRAG' }
  | { type: 'UI/OPEN_DECK_VIEW' }
  | { type: 'UI/CLOSE_DECK_VIEW' }

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
  | { type: 'ROUND/SHOW_PROGRESS' }
  | { type: 'ROUND/START' }

// ショップアクション
export type ShopAction =
  | { type: 'SHOP/BUY_ITEM'; itemIndex: number }
  | { type: 'SHOP/LEAVE' }

// ストックアクション
export type StockAction =
  | { type: 'STOCK/MOVE_TO_STOCK'; slotIndex: number }      // 手札→ストック
  | { type: 'STOCK/MOVE_FROM_STOCK'; targetSlotIndex: number }  // ストック→手札
  | { type: 'STOCK/SWAP'; slotIndex: number }               // 手札とストック交換

// デバッグアクション
export type DebugAction =
  | { type: 'DEBUG/ADD_RELIC'; relicType: RelicType }
  | { type: 'DEBUG/REMOVE_RELIC'; relicType: RelicType }
  | { type: 'DEBUG/ADD_GOLD'; amount: number }
  | { type: 'DEBUG/ADD_SCORE'; amount: number }

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
  | StockAction
  | DebugAction

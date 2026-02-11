/**
 * ゲーム状態の永続化サービス
 *
 * LocalStorageを使用したゲーム状態の保存・復元機能を提供。
 * Map型のシリアライズ対応（purchasedPieces, blocks）。
 */

import type { GameState } from '../Domain/GameState'
import type { GamePhase } from '../Domain/Round/GamePhase'
import type { RoundInfo } from '../Domain/Round/RoundTypes'
import type { Board } from '../Domain/Board/Board'
import type { Piece } from '../Domain/Piece/Piece'
import type { PieceSlot, DeckState } from '../Domain/Deck/DeckState'
import type { ShopState, ShopItem, RelicShopItem } from '../Domain/Shop/ShopTypes'
import type { BlockData, BlockDataMap } from '../Domain/Piece/BlockData'
import type { MinoId, RelicId, BlockSetId } from '../Domain/Core/Id'
import type { PieceShape } from '../Domain/Piece/PieceShape'
import type { Position } from '../Domain/Core/Position'
import { INITIAL_RELIC_MULTIPLIER_STATE } from '../Domain/Effect/RelicState'

// ========================================
// 定数
// ========================================

const STORAGE_KEY = 'hexomino_puzzle_game_state'
const CURRENT_VERSION = 1

// ========================================
// シリアライズ用の型定義
// ========================================

/**
 * シリアライズされたPiece（Mapを配列に変換）
 */
interface SerializedPiece {
  readonly id: string
  readonly blockSetId: BlockSetId
  readonly shape: PieceShape
  readonly blocks: ReadonlyArray<readonly [string, BlockData]>
}

/**
 * シリアライズされたPieceSlot
 */
interface SerializedPieceSlot {
  readonly piece: SerializedPiece | null
  readonly position: Position
}

/**
 * シリアライズされたDeckState
 */
interface SerializedDeckState {
  readonly cards: readonly MinoId[]
  readonly allMinos: readonly MinoId[]
  readonly remainingHands: number
  readonly purchasedPieces: ReadonlyArray<readonly [MinoId, SerializedPiece]>
  readonly stockSlot?: SerializedPiece | null  // 追加（マイグレーション対応でオプショナル）
}

/**
 * シリアライズされたBlockShopItem
 */
interface SerializedBlockShopItem {
  readonly type: 'block'
  readonly piece: SerializedPiece
  readonly price: number
  readonly originalPrice: number
  readonly purchased: boolean
  readonly onSale: boolean
}

/**
 * シリアライズされたShopItem
 */
type SerializedShopItem = SerializedBlockShopItem | RelicShopItem

/**
 * シリアライズされたShopState
 */
interface SerializedShopState {
  readonly items: readonly SerializedShopItem[]
}

/**
 * LocalStorageに保存する状態
 */
interface SavedGameState {
  readonly version: number

  // ラウンド関連
  readonly round: number
  readonly score: number
  readonly targetScore: number
  readonly phase: GamePhase
  readonly roundInfo: RoundInfo
  readonly comboCount: number

  // プレイヤー関連
  readonly player: {
    readonly gold: number
    readonly ownedRelics: readonly RelicId[]
    readonly relicDisplayOrder?: readonly RelicId[]
  }

  // デッキ関連
  readonly deck: SerializedDeckState

  // ボード関連
  readonly board: Board

  // 手札関連
  readonly pieceSlots: readonly SerializedPieceSlot[]

  // ショップ関連
  readonly shopState: SerializedShopState | null

  // レリック倍率状態（追加、マイグレーション対応でオプショナル）
  readonly relicMultiplierState?: {
    readonly nobiTakenokoMultiplier: number
    readonly nobiKaniMultiplier: number
    readonly renshaMultiplier: number
  }
}

// ========================================
// シリアライズ関数
// ========================================

/**
 * PieceをシリアライズしてMapを配列に変換
 */
function serializePiece(piece: Piece): SerializedPiece {
  return {
    id: piece.id,
    blockSetId: piece.blockSetId,
    shape: piece.shape,
    blocks: Array.from(piece.blocks.entries()),
  }
}

/**
 * PieceSlotをシリアライズ
 */
function serializePieceSlot(slot: PieceSlot): SerializedPieceSlot {
  return {
    piece: slot.piece ? serializePiece(slot.piece) : null,
    position: slot.position,
  }
}

/**
 * DeckStateをシリアライズ
 */
function serializeDeckState(deck: DeckState): SerializedDeckState {
  const purchasedPiecesArray: Array<readonly [MinoId, SerializedPiece]> = []
  deck.purchasedPieces.forEach((piece, minoId) => {
    purchasedPiecesArray.push([minoId, serializePiece(piece)] as const)
  })

  return {
    cards: deck.cards,
    allMinos: deck.allMinos,
    remainingHands: deck.remainingHands,
    purchasedPieces: purchasedPiecesArray,
    stockSlot: deck.stockSlot ? serializePiece(deck.stockSlot) : null,
  }
}

/**
 * ShopItemをシリアライズ
 */
function serializeShopItem(item: ShopItem): SerializedShopItem {
  if (item.type === 'relic') {
    return item
  }
  return {
    type: 'block',
    piece: serializePiece(item.piece),
    price: item.price,
    originalPrice: item.originalPrice,
    purchased: item.purchased,
    onSale: item.onSale,
  }
}

/**
 * ShopStateをシリアライズ
 */
function serializeShopState(shopState: ShopState | null): SerializedShopState | null {
  if (!shopState) return null
  return {
    items: shopState.items.map(serializeShopItem),
  }
}

/**
 * GameStateをシリアライズ
 */
function serializeState(state: GameState): SavedGameState {
  return {
    version: CURRENT_VERSION,
    round: state.round,
    score: state.score,
    targetScore: state.targetScore,
    phase: state.phase,
    roundInfo: state.roundInfo,
    comboCount: state.comboCount,
    player: {
      gold: state.player.gold,
      ownedRelics: state.player.ownedRelics,
      relicDisplayOrder: state.player.relicDisplayOrder,
    },
    deck: serializeDeckState(state.deck),
    board: state.board,
    pieceSlots: state.pieceSlots.map(serializePieceSlot),
    shopState: serializeShopState(state.shopState),
    relicMultiplierState: state.relicMultiplierState,
  }
}

// ========================================
// デシリアライズ関数
// ========================================

/**
 * シリアライズされたPieceを復元
 */
function deserializePiece(serialized: SerializedPiece): Piece {
  return {
    id: serialized.id,
    blockSetId: serialized.blockSetId,
    shape: serialized.shape,
    blocks: new Map(serialized.blocks) as BlockDataMap,
  }
}

/**
 * シリアライズされたPieceSlotを復元
 */
function deserializePieceSlot(serialized: SerializedPieceSlot): PieceSlot {
  return {
    piece: serialized.piece ? deserializePiece(serialized.piece) : null,
    position: serialized.position,
  }
}

/**
 * シリアライズされたDeckStateを復元
 */
function deserializeDeckState(serialized: SerializedDeckState): DeckState {
  const purchasedPiecesMap = new Map<MinoId, Piece>()
  for (const [minoId, serializedPiece] of serialized.purchasedPieces) {
    purchasedPiecesMap.set(minoId, deserializePiece(serializedPiece))
  }

  return {
    cards: serialized.cards,
    allMinos: serialized.allMinos,
    remainingHands: serialized.remainingHands,
    purchasedPieces: purchasedPiecesMap,
    // マイグレーション対応: 古いセーブデータにはstockSlotがない
    stockSlot: serialized.stockSlot ? deserializePiece(serialized.stockSlot) : null,
  }
}

/**
 * シリアライズされたShopItemを復元
 */
function deserializeShopItem(serialized: SerializedShopItem): ShopItem {
  if (serialized.type === 'relic') {
    return serialized
  }
  return {
    type: 'block',
    piece: deserializePiece(serialized.piece),
    price: serialized.price,
    originalPrice: serialized.originalPrice,
    purchased: serialized.purchased,
    onSale: serialized.onSale,
  }
}

/**
 * シリアライズされたShopStateを復元
 */
function deserializeShopState(serialized: SerializedShopState | null): ShopState | null {
  if (!serialized) return null
  return {
    items: serialized.items.map(deserializeShopItem),
  }
}

// ========================================
// バリデーション
// ========================================

/**
 * 保存データが有効かチェック
 */
function isValidSavedState(saved: unknown): saved is SavedGameState {
  if (!saved || typeof saved !== 'object') return false

  const s = saved as Record<string, unknown>

  // バージョンチェック
  if (typeof s.version !== 'number' || s.version !== CURRENT_VERSION) {
    return false
  }

  // 基本フィールドチェック
  if (
    typeof s.round !== 'number' ||
    typeof s.score !== 'number' ||
    typeof s.targetScore !== 'number' ||
    typeof s.phase !== 'string' ||
    typeof s.comboCount !== 'number' ||
    !s.roundInfo ||
    !s.player ||
    !s.deck ||
    !Array.isArray(s.board) ||
    !Array.isArray(s.pieceSlots)
  ) {
    return false
  }

  // player構造の検証
  const player = s.player as Record<string, unknown>
  if (typeof player.gold !== 'number' || !Array.isArray(player.ownedRelics)) {
    return false
  }

  // deck構造の検証
  const deck = s.deck as Record<string, unknown>
  if (
    !Array.isArray(deck.cards) ||
    !Array.isArray(deck.allMinos) ||
    typeof deck.remainingHands !== 'number' ||
    !Array.isArray(deck.purchasedPieces)
  ) {
    return false
  }

  return true
}

// ========================================
// パブリックAPI
// ========================================

/**
 * ゲーム状態をLocalStorageに保存
 */
export function saveGameState(state: GameState): void {
  try {
    const serialized = serializeState(state)
    const json = JSON.stringify(serialized)
    localStorage.setItem(STORAGE_KEY, json)
  } catch (error) {
    console.warn('Failed to save game state:', error)
  }
}

/**
 * LocalStorageからゲーム状態を読み込み
 */
export function loadGameState(): SavedGameState | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (!json) return null

    const parsed = JSON.parse(json)
    if (!isValidSavedState(parsed)) {
      console.warn('Invalid saved state, clearing...')
      clearGameState()
      return null
    }

    return parsed
  } catch (error) {
    console.warn('Failed to load game state:', error)
    clearGameState()
    return null
  }
}

/**
 * LocalStorageから保存データを削除
 */
export function clearGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear game state:', error)
  }
}

/**
 * 保存データが存在するかチェック
 */
export function hasSavedGame(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

/**
 * 保存データからGameStateを復元
 */
export function restoreGameState(
  saved: SavedGameState,
  initialDragState: GameState['dragState']
): GameState {
  return {
    board: saved.board,
    pieceSlots: saved.pieceSlots.map(deserializePieceSlot),
    dragState: initialDragState,
    score: saved.score,
    clearingAnimation: null,
    relicActivationAnimation: null,
    scoreAnimation: null,
    deck: deserializeDeckState(saved.deck),
    phase: saved.phase,
    round: saved.round,
    roundInfo: saved.roundInfo,
    player: {
      gold: saved.player.gold,
      ownedRelics: [...saved.player.ownedRelics] as RelicId[],
      // マイグレーション対応: 古いセーブデータにはrelicDisplayOrderがない
      relicDisplayOrder: saved.player.relicDisplayOrder
        ? [...saved.player.relicDisplayOrder] as RelicId[]
        : [...saved.player.ownedRelics] as RelicId[],
    },
    targetScore: saved.targetScore,
    shopState: deserializeShopState(saved.shopState),
    comboCount: saved.comboCount,
    // マイグレーション対応: 古いセーブデータにはrelicMultiplierStateがない
    relicMultiplierState: saved.relicMultiplierState ?? INITIAL_RELIC_MULTIPLIER_STATE,
    // UI状態は常にリセット
    deckViewOpen: false,
  }
}

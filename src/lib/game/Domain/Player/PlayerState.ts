/**
 * プレイヤー状態
 */

import type { RelicId } from '../Core/Id'

/**
 * プレイヤー状態
 */
export interface PlayerState {
  readonly gold: number
  readonly earnedGold: number
  readonly ownedRelics: readonly RelicId[]
  readonly relicDisplayOrder: readonly RelicId[]
}

/**
 * 初期プレイヤー状態を作成
 */
export function createInitialPlayerState(initialGold: number): PlayerState {
  return {
    gold: initialGold,
    earnedGold: 0,
    ownedRelics: [],
    relicDisplayOrder: [],
  }
}

/**
 * レリックを所持しているか判定
 */
export function hasRelic(player: PlayerState, relicId: RelicId): boolean {
  return player.ownedRelics.includes(relicId)
}

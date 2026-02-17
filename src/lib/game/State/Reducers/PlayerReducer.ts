/**
 * プレイヤー状態のReducer
 */

import type { PlayerState } from '../../Domain/Player/PlayerState'
import type { RelicId } from '../../Domain/Core/Id'

/**
 * レリックを追加
 */
export function addRelic(player: PlayerState, relicId: RelicId): PlayerState {
  // 既に所持している場合は何もしない
  if (player.ownedRelics.includes(relicId)) {
    return player
  }
  return {
    ...player,
    ownedRelics: [...player.ownedRelics, relicId],
    relicDisplayOrder: [...player.relicDisplayOrder, relicId],
  }
}

/**
 * レリックを売却（removeRelicと同じ処理だが意味的に分離）
 */
export function sellRelic(player: PlayerState, relicId: RelicId): PlayerState {
  return removeRelic(player, relicId)
}

/**
 * レリックを削除（デバッグ用）
 */
export function removeRelic(player: PlayerState, relicId: RelicId): PlayerState {
  return {
    ...player,
    ownedRelics: player.ownedRelics.filter((id) => id !== relicId),
    relicDisplayOrder: player.relicDisplayOrder.filter((id) => id !== relicId),
  }
}

/**
 * ゴールドを加算
 * @param amount 加算量（負の値は不可）
 */
export function addGold(player: PlayerState, amount: number): PlayerState {
  if (amount < 0) {
    console.warn('addGold: amount must be non-negative. Use subtractGold for deductions.')
    return player
  }
  return {
    ...player,
    gold: player.gold + amount,
    earnedGold: player.earnedGold + amount,
  }
}

/**
 * ゴールドを減算
 * @param amount 減算量（負の値は不可、不足時は0にクランプ）
 */
export function subtractGold(player: PlayerState, amount: number): PlayerState {
  if (amount < 0) {
    console.warn('subtractGold: amount must be non-negative')
    return player
  }
  const newGold = player.gold - amount
  if (newGold < 0) {
    console.warn('subtractGold: insufficient gold, clamping to 0')
  }
  return {
    ...player,
    gold: Math.max(0, newGold),
  }
}

/**
 * プレイヤー状態をリセット（ゲームオーバー時）
 */
export function resetPlayerState(initialGold: number): PlayerState {
  return {
    gold: initialGold,
    earnedGold: 0,
    ownedRelics: [],
    relicDisplayOrder: [],
  }
}

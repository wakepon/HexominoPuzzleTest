/**
 * ラウンド・ゴールド関連のロジック
 */

import { ROUND_CONFIG, DECK_CONFIG } from '../Data/Constants'
import {
  BOSS_CONDITIONS,
  BOSS_CONDITION_IDS,
  ENERGY_SAVE_RATIO,
  TWO_CARDS_DRAW_COUNT,
} from '../Data/BossConditions'
import type { BossCondition, RoundInfo, RoundType } from '../Domain/Round/RoundTypes'
import { calculateRoundInfo } from '../Domain/Round/RoundTypes'
import type { RandomGenerator } from '../Utils/Random'
import type { RelicId } from '../Domain/Core/Id'
import { hasRelic } from '../Domain/Effect/RelicEffectHandler'
import { EXTRA_DRAW_BONUS } from '../Domain/Effect/Relics/ExtraDraw'
import { EXTRA_HAND_BONUS } from '../Domain/Effect/Relics/ExtraHand'

/**
 * 目標スコアを計算
 * 初期: 20, ラウンドごとに+10
 */
export function calculateTargetScore(round: number): number {
  return ROUND_CONFIG.initialTargetScore + (round - 1) * ROUND_CONFIG.targetScoreIncrement
}

/**
 * ラウンドタイプ別の基本報酬
 */
const BASE_REWARD: Record<RoundType, number> = {
  normal: 1,
  elite: 2,
  boss: 5,
}

/**
 * 基本報酬を取得（UI表示用）
 */
export function getBaseReward(roundType: RoundType): number {
  return BASE_REWARD[roundType]
}

/**
 * ゴールド報酬を計算
 * 基本報酬 + 残りハンド数
 */
export function calculateGoldReward(remainingHands: number, roundType: RoundType): number {
  return BASE_REWARD[roundType] + remainingHands
}

/**
 * 利息を計算
 * 5Gにつき1G（切り捨て）
 */
export function calculateInterest(currentGold: number): number {
  return Math.floor(Math.max(0, currentGold) / 5)
}

/**
 * ラウンドクリア判定
 */
export function isRoundCleared(score: number, targetScore: number): boolean {
  return score >= targetScore
}

/**
 * 最終ラウンドかどうか
 */
export function isFinalRound(round: number): boolean {
  return round >= ROUND_CONFIG.maxRound
}

/**
 * ボス条件をランダムに抽選
 */
export function selectRandomBossCondition(rng: RandomGenerator): BossCondition {
  const index = Math.floor(rng.next() * BOSS_CONDITION_IDS.length)
  const id = BOSS_CONDITION_IDS[index]
  return BOSS_CONDITIONS[id]
}

/**
 * ラウンド情報を生成（ボスラウンドの場合はボス条件を抽選）
 */
export function createRoundInfo(round: number, rng: RandomGenerator): RoundInfo {
  const positionInSet = (round - 1) % 3
  const isBossRound = positionInSet === 2
  const bossCondition = isBossRound ? selectRandomBossCondition(rng) : null
  return calculateRoundInfo(round, bossCondition)
}

/**
 * ボス条件とレリックに基づく配置可能回数を取得
 */
export function getMaxPlacements(roundInfo: RoundInfo | null, ownedRelics?: readonly RelicId[]): number {
  let base = DECK_CONFIG.totalHands
  // extra_hand レリック: ハンド数+2
  if (ownedRelics && hasRelic(ownedRelics, 'extra_hand')) {
    base += EXTRA_HAND_BONUS
  }
  if (roundInfo?.bossCondition?.id === 'energy_save') {
    return Math.floor(base * ENERGY_SAVE_RATIO) // 25%減少
  }
  return base
}

/**
 * ボス条件とレリックに基づくドロー枚数を取得
 */
export function getDrawCount(roundInfo: RoundInfo | null, ownedRelics?: readonly RelicId[]): number {
  let count: number
  if (roundInfo?.bossCondition?.id === 'two_cards') {
    count = TWO_CARDS_DRAW_COUNT
  } else {
    count = DECK_CONFIG.drawCount
  }
  // extra_draw レリック: ドロー枚数+1
  if (ownedRelics && hasRelic(ownedRelics, 'extra_draw')) {
    count += EXTRA_DRAW_BONUS
  }
  return count
}

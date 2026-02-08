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
import type { BossCondition, RoundInfo } from '../Domain/Round/RoundTypes'
import { calculateRoundInfo } from '../Domain/Round/RoundTypes'
import type { RandomGenerator } from '../Utils/Random'

/**
 * 目標スコアを計算
 * 初期: 20, ラウンドごとに+10
 */
export function calculateTargetScore(round: number): number {
  return ROUND_CONFIG.initialTargetScore + (round - 1) * ROUND_CONFIG.targetScoreIncrement
}

/**
 * ゴールド報酬を計算
 * 残りハンド数がそのまま報酬になる
 */
export function calculateGoldReward(remainingHands: number): number {
  return remainingHands
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
 * ボス条件に基づく配置可能回数を取得
 */
export function getMaxPlacements(roundInfo: RoundInfo | null): number {
  const base = DECK_CONFIG.totalHands
  if (roundInfo?.bossCondition?.id === 'energy_save') {
    return Math.floor(base * ENERGY_SAVE_RATIO) // 25%減少（12 → 9）
  }
  return base
}

/**
 * ボス条件に基づくドロー枚数を取得
 */
export function getDrawCount(roundInfo: RoundInfo | null): number {
  if (roundInfo?.bossCondition?.id === 'two_cards') {
    return TWO_CARDS_DRAW_COUNT
  }
  return DECK_CONFIG.drawCount
}

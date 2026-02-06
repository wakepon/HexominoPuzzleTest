/**
 * ラウンド・ゴールド関連のロジック
 */

import { ROUND_CONFIG } from '../Data/Constants'

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

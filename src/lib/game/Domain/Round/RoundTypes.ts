/**
 * ラウンドタイプ（将来のローグライト機能用）
 */
export type RoundType = 'normal' | 'elite' | 'boss'

/**
 * ボス条件タイプ（将来のローグライト機能用）
 */
export type BossConditionType =
  | 'obstacle'     // おじゃまブロック
  | 'energy_save'  // 省エネ
  | 'two_cards'    // 手札2枚

/**
 * ボス条件定義（将来のローグライト機能用）
 */
export interface BossCondition {
  readonly id: BossConditionType
  readonly name: string
  readonly description: string
}

/**
 * ラウンド情報（将来のローグライト機能用）
 */
export interface RoundInfo {
  readonly round: number           // 1-24
  readonly setNumber: number       // セット番号
  readonly positionInSet: number   // セット内位置 (0, 1, 2)
  readonly roundType: RoundType
  readonly bossCondition: BossCondition | null
}

/**
 * ラウンド番号からラウンド情報を計算
 */
export const calculateRoundInfo = (
  round: number,
  bossCondition: BossCondition | null = null
): RoundInfo => {
  const setNumber = Math.floor((round - 1) / 3) + 1
  const positionInSet = (round - 1) % 3
  const roundTypes: RoundType[] = ['normal', 'elite', 'boss']

  return {
    round,
    setNumber,
    positionInSet,
    roundType: roundTypes[positionInSet],
    bossCondition: positionInSet === 2 ? bossCondition : null,
  }
}

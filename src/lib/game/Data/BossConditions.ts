/**
 * ボス条件マスターデータ
 */

import type {
  BossCondition,
  BossConditionType,
} from '../Domain/Round/RoundTypes'

/**
 * ボス条件定義
 */
export const BOSS_CONDITIONS: Record<BossConditionType, BossCondition> = {
  obstacle: {
    id: 'obstacle',
    name: 'おじゃまブロック',
    description: 'ランダムな4マスが埋まっている（消去不可）',
  },
  energy_save: {
    id: 'energy_save',
    name: '省エネ',
    description: '配置可能数が減少',
  },
  two_cards: {
    id: 'two_cards',
    name: '手札2枚',
    description: '手札が2枚になる',
  },
}

/**
 * ボス条件IDのリスト（抽選用）
 */
export const BOSS_CONDITION_IDS: BossConditionType[] = [
  'obstacle',
  'energy_save',
  'two_cards',
]

/**
 * 省エネ条件時の配置回数比率
 */
export const ENERGY_SAVE_RATIO = 0.75

/**
 * 手札2枚条件時のドロー枚数
 */
export const TWO_CARDS_DRAW_COUNT = 2

/**
 * おじゃまブロック条件時の配置数
 */
export const OBSTACLE_BLOCK_COUNT = 4

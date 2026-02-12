/**
 * レリック定義
 */

import type { RelicId } from '../Core/Id'

/**
 * レリック効果の数値定数
 */
export const RELIC_EFFECT_VALUES = {
  CHAIN_MASTER_MULTIPLIER: 1.5,
  SMALL_LUCK_BONUS: 20,
  FULL_CLEAR_BONUS: 20,
  SINGLE_LINE_MULTIPLIER: 3,     // シングルライン: ×3
  RENSHA_INCREMENT: 0.5,         // 連射: +0.5ずつ
  NOBI_INCREMENT: 0.5,           // のびのび系: +0.5ずつ
  SCRIPT_BONUS_SINGLE: 20,       // 台本: 1本揃い
  SCRIPT_BONUS_DOUBLE: 60,       // 台本: 2本同時揃い
  VOLCANO_MULTIPLIER: 5,         // 火山: ブロック数×5
} as const

/**
 * レリックのレアリティ
 */
export type RelicRarity = 'common' | 'uncommon' | 'rare' | 'epic'

/**
 * レリックの種類
 */
export type RelicType =
  | 'full_clear_bonus'  // 全消しボーナス
  | 'small_luck'        // 小さな幸運
  | 'chain_master'      // 連鎖の達人
  | 'single_line'       // シングルライン
  | 'takenoko'          // タケノコ
  | 'kani'              // カニ
  | 'rensha'            // 連射
  | 'nobi_takenoko'     // のびのびタケノコ
  | 'nobi_kani'         // のびのびカニ
  | 'hand_stock'        // 手札ストック
  | 'script'            // 台本
  | 'volcano'           // 火山

/**
 * レリック定義
 */
export interface RelicDefinition {
  readonly id: RelicId
  readonly type: RelicType
  readonly name: string
  readonly description: string
  readonly rarity: RelicRarity
  readonly price: number
  readonly icon: string
}

/**
 * レリック定義マスターデータ
 */
export const RELIC_DEFINITIONS: Record<RelicType, RelicDefinition> = {
  full_clear_bonus: {
    id: 'full_clear_bonus' as RelicId,
    type: 'full_clear_bonus',
    name: '全消しボーナス',
    description: '盤面を全て空にするとスコア+20',
    rarity: 'common',
    price: 15,
    icon: '🏆',
  },
  small_luck: {
    id: 'small_luck' as RelicId,
    type: 'small_luck',
    name: '小さな幸運',
    description: '3ブロックのピースでライン消去時+20点',
    rarity: 'common',
    price: 15,
    icon: '🍀',
  },
  chain_master: {
    id: 'chain_master' as RelicId,
    type: 'chain_master',
    name: '連鎖の達人',
    description: '複数行列を同時消しでスコア×1.5',
    rarity: 'rare',
    price: 30,
    icon: '⛓️',
  },
  single_line: {
    id: 'single_line' as RelicId,
    type: 'single_line',
    name: 'シングルライン',
    description: '1行または1列のみ消した時、スコア×3',
    rarity: 'uncommon',
    price: 20,
    icon: '➖',
  },
  takenoko: {
    id: 'takenoko' as RelicId,
    type: 'takenoko',
    name: 'タケノコ',
    description: '縦列のみ揃った時、スコア×揃った列数',
    rarity: 'uncommon',
    price: 25,
    icon: '🎋',
  },
  kani: {
    id: 'kani' as RelicId,
    type: 'kani',
    name: 'カニ',
    description: '横列のみ揃った時、スコア×揃った行数',
    rarity: 'uncommon',
    price: 25,
    icon: '🦀',
  },
  rensha: {
    id: 'rensha' as RelicId,
    type: 'rensha',
    name: '連射',
    description: 'ライン揃うたびにスコア倍率+0.5（揃わないとリセット）',
    rarity: 'rare',
    price: 35,
    icon: '🔫',
  },
  nobi_takenoko: {
    id: 'nobi_takenoko' as RelicId,
    type: 'nobi_takenoko',
    name: 'のびのびタケノコ',
    description: '縦列のみ揃えるたびに倍率+0.5（横列消しでリセット）',
    rarity: 'rare',
    price: 35,
    icon: '🌱',
  },
  nobi_kani: {
    id: 'nobi_kani' as RelicId,
    type: 'nobi_kani',
    name: 'のびのびカニ',
    description: '横列のみ揃えるたびに倍率+0.5（縦列消しでリセット）',
    rarity: 'rare',
    price: 35,
    icon: '🦞',
  },
  hand_stock: {
    id: 'hand_stock' as RelicId,
    type: 'hand_stock',
    name: '手札ストック',
    description: 'ストック枠が出現し、ブロックを1つ保管可能',
    rarity: 'epic',
    price: 40,
    icon: '📦',
  },
  script: {
    id: 'script' as RelicId,
    type: 'script',
    name: '台本',
    description: 'ラウンド開始時に指定ラインが2本出現。揃えると+20、2本同時で+60',
    rarity: 'common',
    price: 15,
    icon: '📜',
  },
  volcano: {
    id: 'volcano' as RelicId,
    type: 'volcano',
    name: '火山',
    description: 'ラウンド中にブロックが消えなかった場合、ハンド0で全消去（ブロック数×5）',
    rarity: 'rare',
    price: 30,
    icon: '🌋',
  },
}

/**
 * RelicIdからRelicDefinitionを取得
 */
export const getRelicDefinition = (
  relicId: RelicId
): RelicDefinition | undefined => {
  return RELIC_DEFINITIONS[relicId as RelicType]
}

/**
 * レリック定義
 */

import type { RelicId } from '../Core/Id'

/**
 * レリック効果の数値定数
 */
export const RELIC_EFFECT_VALUES = {
  CHAIN_MASTER_MULTIPLIER: 1.5,
  FULL_CLEAR_MULTIPLIER: 5,
  SINGLE_LINE_MULTIPLIER: 3,     // シングルライン: ×3
  RENSHA_INCREMENT: 1,           // 連射: +1ずつ
  NOBI_INCREMENT: 0.5,           // のびのび系: +0.5ずつ
  SCRIPT_LINE_BONUS_SINGLE: 1,   // 台本: 1本揃い（ライン数+1）
  SCRIPT_LINE_BONUS_DOUBLE: 2,   // 台本: 2本同時揃い（ライン数+2）
  BANDAID_TRIGGER_COUNT: 3,      // 絆創膏: 発動に必要なハンド消費回数
  TIMING_MULTIPLIER: 3,          // タイミング: スコア倍率
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
  | 'size_bonus_1'      // 1サイズボーナス
  | 'size_bonus_2'      // 2サイズボーナス
  | 'size_bonus_3'      // 3サイズボーナス
  | 'size_bonus_4'      // 4サイズボーナス
  | 'size_bonus_5'      // 5サイズボーナス
  | 'size_bonus_6'      // 6サイズボーナス
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
  | 'bandaid'           // 絆創膏
  | 'timing'            // タイミング
  | 'copy'              // コピー

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
    description: '盤面を全て空にした際にスコア倍率+5',
    rarity: 'common',
    price: 10,
    icon: '🏆',
  },
  size_bonus_1: {
    id: 'size_bonus_1' as RelicId,
    type: 'size_bonus_1',
    name: '1サイズボーナス',
    description: '1ブロックのピースでライン消去時、各ブロック点を+1',
    rarity: 'common',
    price: 10,
    icon: '1️⃣',
  },
  size_bonus_2: {
    id: 'size_bonus_2' as RelicId,
    type: 'size_bonus_2',
    name: '2サイズボーナス',
    description: '2ブロックのピースでライン消去時、各ブロック点を+1',
    rarity: 'common',
    price: 10,
    icon: '2️⃣',
  },
  size_bonus_3: {
    id: 'size_bonus_3' as RelicId,
    type: 'size_bonus_3',
    name: '3サイズボーナス',
    description: '3ブロックのピースでライン消去時、各ブロック点を+1',
    rarity: 'common',
    price: 10,
    icon: '3️⃣',
  },
  size_bonus_4: {
    id: 'size_bonus_4' as RelicId,
    type: 'size_bonus_4',
    name: '4サイズボーナス',
    description: '4ブロックのピースでライン消去時、各ブロック点を+1',
    rarity: 'common',
    price: 10,
    icon: '4️⃣',
  },
  size_bonus_5: {
    id: 'size_bonus_5' as RelicId,
    type: 'size_bonus_5',
    name: '5サイズボーナス',
    description: '5ブロックのピースでライン消去時、各ブロック点を+1',
    rarity: 'common',
    price: 10,
    icon: '5️⃣',
  },
  size_bonus_6: {
    id: 'size_bonus_6' as RelicId,
    type: 'size_bonus_6',
    name: '6サイズボーナス',
    description: '6ブロックのピースでライン消去時、各ブロック点を+1',
    rarity: 'common',
    price: 10,
    icon: '6️⃣',
  },
  chain_master: {
    id: 'chain_master' as RelicId,
    type: 'chain_master',
    name: '連鎖の達人',
    description: '複数行列を同時消しでスコア×1.5',
    rarity: 'rare',
    price: 20,
    icon: '⛓️',
  },
  single_line: {
    id: 'single_line' as RelicId,
    type: 'single_line',
    name: 'シングルライン',
    description: '1行または1列のみ消した時、スコア×3',
    rarity: 'uncommon',
    price: 15,
    icon: '➖',
  },
  takenoko: {
    id: 'takenoko' as RelicId,
    type: 'takenoko',
    name: 'タケノコ',
    description: '縦列のみ揃った時、スコア×揃った列数',
    rarity: 'common',
    price: 10,
    icon: '🎋',
  },
  kani: {
    id: 'kani' as RelicId,
    type: 'kani',
    name: 'カニ',
    description: '横列のみ揃った時、スコア×揃った行数',
    rarity: 'common',
    price: 10,
    icon: '🦀',
  },
  rensha: {
    id: 'rensha' as RelicId,
    type: 'rensha',
    name: '連射',
    description: 'ライン揃うたびに倍率+1（揃わないとリセット）',
    rarity: 'rare',
    price: 20,
    icon: '🔫',
  },
  nobi_takenoko: {
    id: 'nobi_takenoko' as RelicId,
    type: 'nobi_takenoko',
    name: 'のびのびタケノコ',
    description: '縦列のみ揃えるたびに倍率+0.5を加える（横列消しでリセット）初期値は倍率x1',
    rarity: 'uncommon',
    price: 15,
    icon: '🌱',
  },
  nobi_kani: {
    id: 'nobi_kani' as RelicId,
    type: 'nobi_kani',
    name: 'のびのびカニ',
    description: '横列のみ揃えるたびに倍率+0.5を加える（縦列消しでリセット）初期値は倍率x1',
    rarity: 'uncommon',
    price: 15,
    icon: '🦞',
  },
  hand_stock: {
    id: 'hand_stock' as RelicId,
    type: 'hand_stock',
    name: '手札ストック',
    description: 'ストック枠が出現し、ブロックを1つ保管可能',
    rarity: 'epic',
    price: 25,
    icon: '📦',
  },
  script: {
    id: 'script' as RelicId,
    type: 'script',
    name: '台本',
    description: 'ラウンド開始時に指定ラインが2本出現。揃えた際の列数+1、2本同時で+2',
    rarity: 'uncommon',
    price: 15,
    icon: '📜',
  },
  volcano: {
    id: 'volcano' as RelicId,
    type: 'volcano',
    name: '火山',
    description: 'ラウンド中にブロックが消えなかった場合、ハンド0で全消去（ブロック数×フィールド最大列数）',
    rarity: 'uncommon',
    price: 15,
    icon: '🌋',
  },
  bandaid: {
    id: 'bandaid' as RelicId,
    type: 'bandaid',
    name: '絆創膏',
    description: '3ハンド消費ごとにノーハンド付きモノミノが手札に追加',
    rarity: 'rare',
    price: 20,
    icon: '🩹',
  },
  timing: {
    id: 'timing' as RelicId,
    type: 'timing',
    name: 'タイミング',
    description: '残りハンド数が3で割り切れるとき、スコア×3',
    rarity: 'uncommon',
    price: 15,
    icon: '⌛',
  },
  copy: {
    id: 'copy' as RelicId,
    type: 'copy',
    name: 'コピー',
    description: '1つ上のレリックの効果をコピー',
    rarity: 'epic',
    price: 25,
    icon: '🪞',
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

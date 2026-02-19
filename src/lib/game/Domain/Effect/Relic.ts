/**
 * レリック定義
 */

import type { RelicId } from '../Core/Id'

// 効果の数値定数は各レリックモジュール (Relics/*.ts) に移行済み

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
  | 'anchor'            // アンカー
  | 'crown'             // 王冠
  | 'stamp'             // スタンプ
  | 'compass'           // コンパス
  | 'featherweight'     // 軽量級
  | 'heavyweight'       // 重量級
  | 'meteor'            // 流星
  | 'symmetry'          // シンメトリー
  | 'crescent'          // 三日月
  | 'last_stand'        // ラストスタンド
  | 'first_strike'      // 先制攻撃
  | 'patience'          // 忍耐
  | 'snowball'          // 雪だるま
  | 'muscle'            // 筋肉
  | 'gardener'          // 庭師
  | 'collector'         // 収集家

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
    description: '盤面を全て空にした際に列点×5',
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
    description: '複数行列を同時消しで列点×1.5',
    rarity: 'rare',
    price: 20,
    icon: '⛓️',
  },
  single_line: {
    id: 'single_line' as RelicId,
    type: 'single_line',
    name: 'シングルライン',
    description: '1行または1列のみ消した時、列点×3',
    rarity: 'uncommon',
    price: 15,
    icon: '➖',
  },
  takenoko: {
    id: 'takenoko' as RelicId,
    type: 'takenoko',
    name: 'タケノコ',
    description: '縦列のみ揃った時、列点×揃った列数',
    rarity: 'common',
    price: 10,
    icon: '🎋',
  },
  kani: {
    id: 'kani' as RelicId,
    type: 'kani',
    name: 'カニ',
    description: '横列のみ揃った時、列点×揃った行数',
    rarity: 'common',
    price: 10,
    icon: '🦀',
  },
  rensha: {
    id: 'rensha' as RelicId,
    type: 'rensha',
    name: '連射',
    description: 'ライン揃うたびに列点+1（揃わないとリセット）',
    rarity: 'rare',
    price: 20,
    icon: '🔫',
  },
  nobi_takenoko: {
    id: 'nobi_takenoko' as RelicId,
    type: 'nobi_takenoko',
    name: 'のびのびタケノコ',
    description: '縦列のみ揃えるたびに列点+0.5を加える（横列消しでリセット）初期値は列点×1',
    rarity: 'uncommon',
    price: 15,
    icon: '🌱',
  },
  nobi_kani: {
    id: 'nobi_kani' as RelicId,
    type: 'nobi_kani',
    name: 'のびのびカニ',
    description: '横列のみ揃えるたびに列点+0.5を加える（縦列消しでリセット）初期値は列点×1',
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
    description: '残りハンド数が3で割り切れるとき、列点×3',
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
  anchor: {
    id: 'anchor' as RelicId,
    type: 'anchor',
    name: 'アンカー',
    description: 'ラウンド中の最初のライン消去時、各ブロック点+5',
    rarity: 'common',
    price: 10,
    icon: '⚓',
  },
  crown: {
    id: 'crown' as RelicId,
    type: 'crown',
    name: '王冠',
    description: 'ライン消去時、消去セルのパターン付きブロック1個につきブロック点+2',
    rarity: 'uncommon',
    price: 15,
    icon: '👑',
  },
  stamp: {
    id: 'stamp' as RelicId,
    type: 'stamp',
    name: 'スタンプ',
    description: 'ライン消去時、消去セルのシール付きブロック1個につきブロック点+5',
    rarity: 'uncommon',
    price: 15,
    icon: '📬',
  },
  compass: {
    id: 'compass' as RelicId,
    type: 'compass',
    name: 'コンパス',
    description: '行と列を同時に消した時、各ブロック点+3',
    rarity: 'uncommon',
    price: 15,
    icon: '🧭',
  },
  featherweight: {
    id: 'featherweight' as RelicId,
    type: 'featherweight',
    name: '軽量級',
    description: '2ブロック以下のピース配置でライン消去時、各ブロック点+4',
    rarity: 'common',
    price: 10,
    icon: '🪶',
  },
  heavyweight: {
    id: 'heavyweight' as RelicId,
    type: 'heavyweight',
    name: '重量級',
    description: '5ブロック以上のピース配置でライン消去時、各ブロック点+3',
    rarity: 'common',
    price: 10,
    icon: '🏋️',
  },
  meteor: {
    id: 'meteor' as RelicId,
    type: 'meteor',
    name: '流星',
    description: '3ライン以上同時消しで列点×2',
    rarity: 'rare',
    price: 20,
    icon: '☄️',
  },
  symmetry: {
    id: 'symmetry' as RelicId,
    type: 'symmetry',
    name: 'シンメトリー',
    description: '消去した行数と列数が同数の時、列点×2',
    rarity: 'uncommon',
    price: 15,
    icon: '⚖️',
  },
  crescent: {
    id: 'crescent' as RelicId,
    type: 'crescent',
    name: '三日月',
    description: '残りハンド数が奇数の時、列点×1.5',
    rarity: 'uncommon',
    price: 15,
    icon: '🌙',
  },
  last_stand: {
    id: 'last_stand' as RelicId,
    type: 'last_stand',
    name: 'ラストスタンド',
    description: '残りハンド数が2以下の時、列点×4',
    rarity: 'rare',
    price: 20,
    icon: '🔥',
  },
  first_strike: {
    id: 'first_strike' as RelicId,
    type: 'first_strike',
    name: '先制攻撃',
    description: 'ラウンド中の最初のライン消去で列点×2.5',
    rarity: 'uncommon',
    price: 15,
    icon: '⚡',
  },
  patience: {
    id: 'patience' as RelicId,
    type: 'patience',
    name: '忍耐',
    description: '連続3回以上消去なしの後の次の消去で列点×3',
    rarity: 'rare',
    price: 20,
    icon: '🧘',
  },
  snowball: {
    id: 'snowball' as RelicId,
    type: 'snowball',
    name: '雪だるま',
    description: 'ライン消去ごとにブロック点+0.5（ラウンドをまたいで永続）',
    rarity: 'rare',
    price: 20,
    icon: '⛄',
  },
  muscle: {
    id: 'muscle' as RelicId,
    type: 'muscle',
    name: '筋肉',
    description: '4ブロック以上のピースを配置するたびに列点+0.3を累積（ラウンド中）',
    rarity: 'uncommon',
    price: 15,
    icon: '💪',
  },
  gardener: {
    id: 'gardener' as RelicId,
    type: 'gardener',
    name: '庭師',
    description: 'パターン付きブロックを消すたびにブロック点+0.2を累積（ラウンド中）',
    rarity: 'uncommon',
    price: 15,
    icon: '🌻',
  },
  collector: {
    id: 'collector' as RelicId,
    type: 'collector',
    name: '収集家',
    description: 'ラウンド中に消去した異なるパターン種類1種につき列点+0.5を累積',
    rarity: 'uncommon',
    price: 15,
    icon: '🎪',
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

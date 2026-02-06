/**
 * レリック定義
 */

import type { RelicId } from '../Core/Id'

/**
 * レリックのレアリティ
 */
export type RelicRarity = 'common' | 'uncommon' | 'rare' | 'epic'

/**
 * レリックの種類
 */
export type RelicType =
  | 'full_clear_bonus' // 全消しボーナス
  | 'small_luck' // 小さな幸運
  | 'chain_master' // 連鎖の達人

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
  },
  small_luck: {
    id: 'small_luck' as RelicId,
    type: 'small_luck',
    name: '小さな幸運',
    description: '3ブロックのピースでライン消去時+20点',
    rarity: 'common',
    price: 15,
  },
  chain_master: {
    id: 'chain_master' as RelicId,
    type: 'chain_master',
    name: '連鎖の達人',
    description: '複数行列を同時消しでスコア×1.5',
    rarity: 'rare',
    price: 30,
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

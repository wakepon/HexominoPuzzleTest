/**
 * 加護定義
 */

import type { BlessingId } from '../Core/Id'

/**
 * 加護の種類
 */
export type BlessingType = 'power' | 'gold' | 'chain'

/**
 * 加護定義
 */
export interface BlessingDefinition {
  readonly id: BlessingId
  readonly type: BlessingType
  readonly name: string
  readonly description: string
  readonly symbol: string
  readonly maxLevel: number
  readonly price: number // ショップでの価格ボーナス
}

/**
 * 加護定義マスターデータ
 */
export const BLESSING_DEFINITIONS: Record<BlessingType, BlessingDefinition> = {
  power: {
    id: 'power' as BlessingId,
    type: 'power',
    name: '力の加護',
    description: 'ブロック点+Lv',
    symbol: '力',
    maxLevel: 3,
    price: 3,
  },
  gold: {
    id: 'gold' as BlessingId,
    type: 'gold',
    name: '金の加護',
    description: '消去時+LvG',
    symbol: '金',
    maxLevel: 3,
    price: 3,
  },
  chain: {
    id: 'chain' as BlessingId,
    type: 'chain',
    name: '連の加護',
    description: 'ライン点+Lv',
    symbol: '連',
    maxLevel: 3,
    price: 3,
  },
}

/**
 * BlessingIdからBlessingDefinitionを取得
 */
export const getBlessingDefinition = (blessingId: BlessingId): BlessingDefinition | undefined => {
  return BLESSING_DEFINITIONS[blessingId as BlessingType]
}

/**
 * ショップで購入可能な加護タイプ
 */
export const SHOP_AVAILABLE_BLESSINGS: BlessingType[] = ['power', 'gold', 'chain']

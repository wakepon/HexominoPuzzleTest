/**
 * 加護定義
 *
 * 加護 = ピース上の効果。消去時にセルにバフとして刻まれる。
 */

import type { BlessingId } from '../Core/Id'

/**
 * 加護の種類
 */
export type BlessingType = 'power' | 'gold' | 'chain' | 'phase'

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
    description: '消滅時に25%の確率でセルに+1増強を付与する',
    symbol: '力',
    maxLevel: 3,
    price: 3,
  },
  gold: {
    id: 'gold' as BlessingId,
    type: 'gold',
    name: '金の加護',
    description: '消滅時に25%の確率でセルに+1金鉱を付与する',
    symbol: '金',
    maxLevel: 3,
    price: 3,
  },
  chain: {
    id: 'chain' as BlessingId,
    type: 'chain',
    name: '連の加護',
    description: '消滅時に25%の確率でセルに+1脈動を付与する',
    symbol: '連',
    maxLevel: 3,
    price: 3,
  },
  phase: {
    id: 'phase' as BlessingId,
    type: 'phase',
    name: '透の加護',
    description: '消滅時に25%の確率でセルに透過を付与する',
    symbol: '透',
    maxLevel: 1,
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
 * 加護の説明文を取得（バフ付与の説明）
 */
export const getBlessingDescription = (
  blessingId: BlessingId,
  _level: number
): string => {
  const def = getBlessingDefinition(blessingId)
  if (!def) return ''
  return def.description
}

/**
 * ショップで購入可能な加護タイプ
 */
export const SHOP_AVAILABLE_BLESSINGS: BlessingType[] = ['power', 'gold', 'chain', 'phase']

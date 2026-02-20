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
 * 加護の効果テキストをレベル込みで取得
 * 例: "ブロック点+2"
 */
function getBlessingEffectText(type: BlessingType, level: number): string {
  switch (type) {
    case 'power':
      return `ブロック点+${level}`
    case 'gold':
      return `消去時+${level}G`
    case 'chain':
      return `ライン点+${level}`
    default:
      return ''
  }
}

/**
 * 加護のレベル込み説明文を取得
 * 例: "力の加護 Lv2 / ブロック点+2"
 */
export const getBlessingDescription = (
  blessingId: BlessingId,
  level: number
): string => {
  const def = getBlessingDefinition(blessingId)
  if (!def || level === 0) return ''
  return `${def.name} Lv${level} / ${getBlessingEffectText(def.type, level)}`
}

/**
 * ショップで購入可能な加護タイプ
 */
export const SHOP_AVAILABLE_BLESSINGS: BlessingType[] = ['power', 'gold', 'chain']

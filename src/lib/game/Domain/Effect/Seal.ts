/**
 * シール定義
 */

import type { SealId } from '../Core/Id'

/**
 * シールの種類
 */
export type SealType =
  | 'gold' // ゴールドシール
  | 'score' // スコアシール
  | 'multi' // マルチシール
  | 'stone' // 石シール
  | 'arrow_v' // アローシール(縦)
  | 'arrow_h' // アローシール(横)

/**
 * シール定義
 */
export interface SealDefinition {
  readonly id: SealId
  readonly type: SealType
  readonly name: string
  readonly description: string
  readonly symbol: string
  readonly preventsClearing: boolean
  readonly price: number // ショップでの価格ボーナス
}

/**
 * シール定義マスターデータ
 */
export const SEAL_DEFINITIONS: Record<SealType, SealDefinition> = {
  gold: {
    id: 'gold' as SealId,
    type: 'gold',
    name: 'ゴールドシール',
    description: 'このブロックが消えると+1G',
    symbol: 'G',
    preventsClearing: false,
    price: 3, // ゴールド獲得で回収可能
  },
  score: {
    id: 'score' as SealId,
    type: 'score',
    name: 'スコアシール',
    description: 'このブロックが消えると+5点',
    symbol: '+5',
    preventsClearing: false,
    price: 2, // 固定+5点
  },
  multi: {
    id: 'multi' as SealId,
    type: 'multi',
    name: 'マルチシール',
    description: 'ライン消し時にこのブロックが2回カウントされる',
    symbol: '×2',
    preventsClearing: false,
    price: 4, // 2倍カウントで高い効果
  },
  stone: {
    id: 'stone' as SealId,
    type: 'stone',
    name: '石',
    description: 'このブロックは消えない',
    symbol: '石',
    preventsClearing: true,
    price: 0, // ショップに出ない
  },
  arrow_v: {
    id: 'arrow_v' as SealId,
    type: 'arrow_v',
    name: 'アローシール(縦)',
    description: '縦ライン消去時に+10/ブロック',
    symbol: '↕',
    preventsClearing: false,
    price: 4,
  },
  arrow_h: {
    id: 'arrow_h' as SealId,
    type: 'arrow_h',
    name: 'アローシール(横)',
    description: '横ライン消去時に+10/ブロック',
    symbol: '↔',
    preventsClearing: false,
    price: 4,
  },
}

/**
 * SealIdからSealDefinitionを取得
 */
export const getSealDefinition = (sealId: SealId): SealDefinition | undefined => {
  return SEAL_DEFINITIONS[sealId as SealType]
}

/**
 * ショップで購入可能なシールタイプ（ネガティブ効果のstoneは除外）
 */
export const SHOP_AVAILABLE_SEALS: SealType[] = ['gold', 'score', 'multi', 'arrow_v', 'arrow_h']

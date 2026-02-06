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
  },
  score: {
    id: 'score' as SealId,
    type: 'score',
    name: 'スコアシール',
    description: 'このブロックが消えると+5点',
    symbol: '+5',
    preventsClearing: false,
  },
  multi: {
    id: 'multi' as SealId,
    type: 'multi',
    name: 'マルチシール',
    description: 'ライン消し時にこのブロックが2回カウントされる',
    symbol: '×2',
    preventsClearing: false,
  },
  stone: {
    id: 'stone' as SealId,
    type: 'stone',
    name: '石',
    description: 'このブロックは消えない',
    symbol: '石',
    preventsClearing: true,
  },
}

/**
 * SealIdからSealDefinitionを取得
 */
export const getSealDefinition = (sealId: SealId): SealDefinition | undefined => {
  return SEAL_DEFINITIONS[sealId as SealType]
}

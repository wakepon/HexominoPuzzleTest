/**
 * バフ定義
 *
 * バフ = セル上の永続効果（消去後もセルに残る）
 * 加護（Blessing）がブロック消去時にセルに刻まれると、対応するバフになる。
 */

import type { BlessingId } from '../Core/Id'

/**
 * バフの種類
 */
export type BuffType = 'enhancement' | 'gold_mine' | 'pulsation' | 'phase'

/**
 * バフ定義
 */
export interface BuffDefinition {
  readonly type: BuffType
  readonly name: string
  readonly description: string
  readonly symbol: string
  readonly maxLevel: number
}

/**
 * バフ定義マスターデータ
 */
export const BUFF_DEFINITIONS: Record<BuffType, BuffDefinition> = {
  enhancement: {
    type: 'enhancement',
    name: '増強',
    description: 'ブロック点+Lv',
    symbol: '増',
    maxLevel: 3,
  },
  gold_mine: {
    type: 'gold_mine',
    name: '金鉱',
    description: '消去時+LvG',
    symbol: '鉱',
    maxLevel: 3,
  },
  pulsation: {
    type: 'pulsation',
    name: '脈動',
    description: 'ライン点+Lv',
    symbol: '脈',
    maxLevel: 3,
  },
  phase: {
    type: 'phase',
    name: '透過',
    description: '重ね配置可能',
    symbol: '透',
    maxLevel: 1,
  },
}

/**
 * 加護ID → バフ種類のマッピング
 */
export function blessingToBuffType(blessingId: BlessingId): BuffType {
  switch (blessingId as string) {
    case 'power':
      return 'enhancement'
    case 'gold':
      return 'gold_mine'
    case 'chain':
      return 'pulsation'
    case 'phase':
      return 'phase'
    default:
      return 'enhancement'
  }
}

/**
 * BuffTypeからBuffDefinitionを取得
 */
export const getBuffDefinition = (buffType: BuffType): BuffDefinition | undefined => {
  return BUFF_DEFINITIONS[buffType]
}

/**
 * バフの効果テキストをレベル込みで取得
 * 例: "ブロック点+2"
 */
function getBuffEffectText(type: BuffType, level: number): string {
  switch (type) {
    case 'enhancement':
      return `ブロック点+${level}`
    case 'gold_mine':
      return `消去時+${level}G`
    case 'pulsation':
      return `ライン点+${level}`
    case 'phase':
      return '重ね配置可能'
    default:
      return ''
  }
}

/**
 * バフのレベル込み説明文を取得
 * 例: "増強 Lv2 / ブロック点+2"
 */
export const getBuffDescription = (
  buffType: BuffType,
  level: number
): string => {
  const def = getBuffDefinition(buffType)
  if (!def || level === 0) return ''
  if (def.maxLevel === 1) {
    return `${def.name} / ${getBuffEffectText(def.type, level)}`
  }
  return `${def.name} Lv${level} / ${getBuffEffectText(def.type, level)}`
}

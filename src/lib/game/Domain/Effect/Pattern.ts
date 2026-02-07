/**
 * パターン定義
 */

import type { PatternId } from '../Core/Id'

/**
 * パターンの種類
 */
export type PatternType =
  | 'enhanced' // 強化ブロック
  | 'lucky' // ラッキーブロック
  | 'combo' // コンボブロック
  | 'aura' // オーラブロック
  | 'moss' // 苔ブロック
  | 'obstacle' // おじゃまブロック（ボス条件）

/**
 * パターン定義
 */
export interface PatternDefinition {
  readonly id: PatternId
  readonly type: PatternType
  readonly name: string
  readonly description: string
  readonly symbol: string // 表示記号
  readonly isNegative: boolean // おじゃまブロック等
}

/**
 * パターン定義マスターデータ
 */
export const PATTERN_DEFINITIONS: Record<PatternType, PatternDefinition> = {
  enhanced: {
    id: 'enhanced' as PatternId,
    type: 'enhanced',
    name: '強化ブロック',
    description: 'このセットのブロックが消えると+2点/ブロック',
    symbol: '★',
    isNegative: false,
  },
  lucky: {
    id: 'lucky' as PatternId,
    type: 'lucky',
    name: 'ラッキーブロック',
    description: 'このブロックが消えると10%の確率でスコア2倍',
    symbol: '♣',
    isNegative: false,
  },
  combo: {
    id: 'combo' as PatternId,
    type: 'combo',
    name: 'コンボブロック',
    description: '連続配置でボーナススコア',
    symbol: 'C',
    isNegative: false,
  },
  aura: {
    id: 'aura' as PatternId,
    type: 'aura',
    name: 'オーラブロック',
    description: '隣接する既存ブロックにバフ付与（消去時+1点）',
    symbol: '◎',
    isNegative: false,
  },
  moss: {
    id: 'moss' as PatternId,
    type: 'moss',
    name: '苔ブロック',
    description: 'フィールド端と接している辺の数だけスコア加算',
    symbol: 'M',
    isNegative: false,
  },
  obstacle: {
    id: 'obstacle' as PatternId,
    type: 'obstacle',
    name: 'おじゃまブロック',
    description: '消去できないブロック',
    symbol: '×',
    isNegative: true,
  },
}

/**
 * PatternIdからPatternDefinitionを取得
 */
export const getPatternDefinition = (
  patternId: PatternId
): PatternDefinition | undefined => {
  return PATTERN_DEFINITIONS[patternId as PatternType]
}

/**
 * ショップで付与可能なパターン（ネガティブ除外）
 */
export const SHOP_AVAILABLE_PATTERNS: PatternType[] = [
  'enhanced',
  'lucky',
  'combo',
  'aura',
  'moss',
]

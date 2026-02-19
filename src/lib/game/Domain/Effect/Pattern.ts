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
  | 'feather' // 羽ブロック
  | 'nohand' // ノーハンドブロック
  | 'charge' // チャージブロック
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
  readonly price: number // ショップでの価格ボーナス
}

/**
 * パターン定義マスターデータ
 */
export const PATTERN_DEFINITIONS: Record<PatternType, PatternDefinition> = {
  enhanced: {
    id: 'enhanced' as PatternId,
    type: 'enhanced',
    name: '強化ブロック',
    description: 'ブロック点+2',
    symbol: '★',
    isNegative: false,
    price: 4, // 安定したブロック点+2
  },
  lucky: {
    id: 'lucky' as PatternId,
    type: 'lucky',
    name: 'ラッキーブロック',
    description: 'このブロックが消えると10%の確率でスコア2倍',
    symbol: '♣',
    isNegative: false,
    price: 5, // 10%で2倍という高いリターン
  },
  combo: {
    id: 'combo' as PatternId,
    type: 'combo',
    name: 'コンボブロック',
    description: '連続配置でボーナススコア',
    symbol: 'C',
    isNegative: false,
    price: 3, // 連続配置が必要で条件付き
  },
  aura: {
    id: 'aura' as PatternId,
    type: 'aura',
    name: 'オーラブロック',
    description: '隣接する既存ブロックにバフ付与（消去時+1点）',
    symbol: '◎',
    isNegative: false,
    price: 4, // 隣接バフで安定
  },
  moss: {
    id: 'moss' as PatternId,
    type: 'moss',
    name: '苔ブロック',
    description: 'フィールド端と接している辺の数だけスコア加算',
    symbol: 'M',
    isNegative: false,
    price: 3, // 端配置が必要で条件付き
  },
  feather: {
    id: 'feather' as PatternId,
    type: 'feather',
    name: '羽ブロック',
    description: '既にブロックがある場所に重ねて配置できる',
    symbol: 'F',
    isNegative: false,
    price: 3,
  },
  nohand: {
    id: 'nohand' as PatternId,
    type: 'nohand',
    name: 'ノーハンドブロック',
    description: '配置してもハンドを消費しない',
    symbol: 'N',
    isNegative: false,
    price: 5,
  },
  charge: {
    id: 'charge' as PatternId,
    type: 'charge',
    name: 'チャージブロック',
    description: '配置後、他のブロックが置かれるたびにスコア+0.5',
    symbol: '⚡',
    isNegative: false,
    price: 3,
  },
  obstacle: {
    id: 'obstacle' as PatternId,
    type: 'obstacle',
    name: 'おじゃまブロック',
    description: '消去できないブロック',
    symbol: '×',
    isNegative: true,
    price: 0, // ショップに出ない
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
  'aura',
  'moss',
  'feather',
  'nohand',
  'charge',
]

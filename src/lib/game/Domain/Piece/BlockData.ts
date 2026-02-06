import type { PatternId, SealId } from '../Core/Id'
import type { PieceShape } from './PieceShape'

/**
 * Block単位のデータ
 *
 * - pattern: パターン（Piece全体で同じ値が設定される）
 * - seal: シール（一部のBlockのみに設定される）
 *
 * 注意: 現在の基本パズル実装ではnull固定。
 * 将来のローグライト機能で使用予定。
 */
export interface BlockData {
  readonly pattern: PatternId | null
  readonly seal: SealId | null
}

/**
 * BlockDataの配置マップ
 * キー: "row,col" 形式の文字列
 */
export type BlockDataMap = ReadonlyMap<string, BlockData>

/**
 * BlockDataMapのユーティリティ
 */
export const BlockDataMapUtils = {
  /**
   * 空のBlockDataMapを作成
   */
  create: (): BlockDataMap => new Map(),

  /**
   * 形状からBlockDataMapを作成（パターン・シールなし）
   */
  createFromShape: (shape: PieceShape): BlockDataMap => {
    const map = new Map<string, BlockData>()
    shape.forEach((row, rowIdx) => {
      row.forEach((filled, colIdx) => {
        if (filled) {
          map.set(`${rowIdx},${colIdx}`, { pattern: null, seal: null })
        }
      })
    })
    return map
  },

  /**
   * 全Blockに同じパターンを設定（Piece生成時に使用）
   */
  createWithPattern: (
    shape: PieceShape,
    pattern: PatternId
  ): BlockDataMap => {
    const map = new Map<string, BlockData>()
    shape.forEach((row, rowIdx) => {
      row.forEach((filled, colIdx) => {
        if (filled) {
          map.set(`${rowIdx},${colIdx}`, { pattern, seal: null })
        }
      })
    })
    return map
  },

  /**
   * 特定のBlockにシールを設定
   */
  setSeal: (
    map: BlockDataMap,
    row: number,
    col: number,
    seal: SealId
  ): BlockDataMap => {
    const key = `${row},${col}`
    const existing = map.get(key)
    if (!existing) return map

    const newMap = new Map(map)
    newMap.set(key, { ...existing, seal })
    return newMap
  },

  /**
   * BlockDataを取得
   */
  get: (map: BlockDataMap, row: number, col: number): BlockData | undefined =>
    map.get(`${row},${col}`),

  /**
   * BlockDataが存在するかチェック
   */
  has: (map: BlockDataMap, row: number, col: number): boolean =>
    map.has(`${row},${col}`),
}

import type { BlockSetId, PatternId, SealId } from '../Core/Id'

/**
 * セルの状態
 *
 * 注意: 現在の基本パズル実装では blockSetId, pattern, seal は使用せず null。
 * 将来のローグライト機能で使用予定。
 */
export interface Cell {
  readonly filled: boolean
  readonly blockSetId: BlockSetId | null
  readonly pattern: PatternId | null
  readonly seal: SealId | null
}

/**
 * 空のセルを作成
 */
export const createEmptyCell = (): Cell => ({
  filled: false,
  blockSetId: null,
  pattern: null,
  seal: null,
})

/**
 * 埋まったセルを作成
 */
export const createFilledCell = (
  blockSetId: BlockSetId | null = null,
  pattern: PatternId | null = null,
  seal: SealId | null = null
): Cell => ({
  filled: true,
  blockSetId,
  pattern,
  seal,
})

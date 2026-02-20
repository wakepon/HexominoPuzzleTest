import type { BlockSetId, PatternId, SealId, BlessingId } from '../Core/Id'

/**
 * セルの状態
 *
 * - blessing/blessingLevel: 加護（永続効果、消去後もセルに残る）
 * - blockBlessing: ブロック配置時の加護（消去時にセルに刻まれる一時フィールド）
 */
export interface Cell {
  readonly filled: boolean
  readonly blockSetId: BlockSetId | null
  readonly pattern: PatternId | null
  readonly seal: SealId | null
  readonly chargeValue: number
  readonly blessing: BlessingId | null
  readonly blessingLevel: number
  readonly blockBlessing: BlessingId | null
}

/**
 * 空のセルを作成
 */
export const createEmptyCell = (): Cell => ({
  filled: false,
  blockSetId: null,
  pattern: null,
  seal: null,
  chargeValue: 0,
  blessing: null,
  blessingLevel: 0,
  blockBlessing: null,
})

/**
 * 埋まったセルを作成
 */
export const createFilledCell = (
  blockSetId: BlockSetId | null = null,
  pattern: PatternId | null = null,
  seal: SealId | null = null,
  chargeValue: number = 0
): Cell => ({
  filled: true,
  blockSetId,
  pattern,
  seal,
  chargeValue,
  blessing: null,
  blessingLevel: 0,
  blockBlessing: null,
})

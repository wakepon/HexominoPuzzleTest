/**
 * ピース生成サービス
 */

import type { MinoCategory, MinoDefinition, Piece, PieceShape } from '../Domain'
import type { PatternId, SealId, BlessingId } from '../Domain/Core/Id'
import type { RandomGenerator } from '../Utils/Random'
import { MINOS_BY_CATEGORY } from '../Data/MinoDefinitions'
import { createPieceId, createBlockSetId } from '../Domain/Core/Id'
import { BlockDataMapUtils } from '../Domain/Piece/BlockData'

/**
 * カテゴリ別の重み
 */
export type CategoryWeights = Record<MinoCategory, number>

/**
 * デフォルトのカテゴリ重み
 * ゲームバランスに応じて調整可能
 */
export const DEFAULT_WEIGHTS: CategoryWeights = {
  monomino: 5,
  domino: 10,
  tromino: 20,
  tetromino: 30,
  pentomino: 25,
  hexomino: 10,
}

/**
 * カテゴリの順序（重み計算用）
 */
const CATEGORY_ORDER: MinoCategory[] = [
  'monomino',
  'domino',
  'tromino',
  'tetromino',
  'pentomino',
  'hexomino',
]

/**
 * 重みに従ってカテゴリを選択する
 */
export function selectCategory(
  weights: CategoryWeights,
  rng: RandomGenerator
): MinoCategory {
  const totalWeight = CATEGORY_ORDER.reduce((sum, cat) => sum + weights[cat], 0)

  if (totalWeight === 0) {
    throw new Error('全ての重みが0です')
  }

  const random = rng.next() * totalWeight
  let cumulative = 0

  for (const category of CATEGORY_ORDER) {
    cumulative += weights[category]
    if (random < cumulative) {
      return category
    }
  }

  // フォールバック（通常到達しない）
  return CATEGORY_ORDER[CATEGORY_ORDER.length - 1]
}

/**
 * 指定カテゴリからランダムにミノを選択する
 */
export function selectMinoFromCategory(
  category: MinoCategory,
  rng: RandomGenerator
): MinoDefinition {
  const minos = MINOS_BY_CATEGORY[category]

  if (minos.length === 0) {
    throw new Error(`カテゴリ ${category} にミノがありません`)
  }

  const index = Math.floor(rng.next() * minos.length)
  return minos[index]
}

/**
 * ミノ定義からPieceを生成する（パターンなし）
 */
export function createPiece(mino: MinoDefinition): Piece {
  return {
    id: createPieceId(mino.id),
    shape: mino.shape,
    blockSetId: createBlockSetId(),
    blocks: BlockDataMapUtils.createFromShape(mino.shape),
  }
}

/**
 * パターン付きPieceを生成する
 */
export function createPieceWithPattern(
  mino: MinoDefinition,
  pattern: PatternId
): Piece {
  return {
    id: createPieceId(mino.id),
    shape: mino.shape,
    blockSetId: createBlockSetId(),
    blocks: BlockDataMapUtils.createWithPattern(mino.shape, pattern),
  }
}

/**
 * 形状内の有効ブロック位置をリストアップ
 */
function getFilledPositions(shape: PieceShape): Array<{ row: number; col: number }> {
  const positions: Array<{ row: number; col: number }> = []
  shape.forEach((rowData, row) => {
    rowData.forEach((filled, col) => {
      if (filled) {
        positions.push({ row, col })
      }
    })
  })
  return positions
}

/**
 * シール付きPieceを生成する（パターンなし）
 */
export function createPieceWithSeal(
  mino: MinoDefinition,
  seal: SealId,
  rng: RandomGenerator
): Piece {
  const shape = mino.shape
  let blocks = BlockDataMapUtils.createFromShape(shape)

  // ランダムな位置にシールを付与
  const positions = getFilledPositions(shape)
  if (positions.length > 0) {
    const idx = Math.floor(rng.next() * positions.length)
    const pos = positions[idx]
    blocks = BlockDataMapUtils.setSeal(blocks, pos.row, pos.col, seal)
  }

  return {
    id: createPieceId(mino.id),
    shape,
    blockSetId: createBlockSetId(),
    blocks,
  }
}

/**
 * パターン+シール付きPieceを生成する
 */
export function createPieceWithPatternAndSeal(
  mino: MinoDefinition,
  pattern: PatternId,
  seal: SealId,
  rng: RandomGenerator
): Piece {
  const shape = mino.shape
  let blocks = BlockDataMapUtils.createWithPattern(shape, pattern)

  // ランダムな位置にシールを付与
  const positions = getFilledPositions(shape)
  if (positions.length > 0) {
    const idx = Math.floor(rng.next() * positions.length)
    const pos = positions[idx]
    blocks = BlockDataMapUtils.setSeal(blocks, pos.row, pos.col, seal)
  }

  return {
    id: createPieceId(mino.id),
    shape,
    blockSetId: createBlockSetId(),
    blocks,
  }
}

/**
 * 加護付きPieceを生成する（パターン・シールなし）
 */
export function createPieceWithBlessing(
  mino: MinoDefinition,
  blessing: BlessingId,
  rng: RandomGenerator
): Piece {
  const shape = mino.shape
  let blocks = BlockDataMapUtils.createFromShape(shape)

  // ランダムな位置に加護を付与
  const positions = getFilledPositions(shape)
  if (positions.length > 0) {
    const idx = Math.floor(rng.next() * positions.length)
    const pos = positions[idx]
    blocks = BlockDataMapUtils.setBlessing(blocks, pos.row, pos.col, blessing)
  }

  return {
    id: createPieceId(mino.id),
    shape,
    blockSetId: createBlockSetId(),
    blocks,
  }
}

/**
 * パターン+加護付きPieceを生成する
 */
export function createPieceWithPatternAndBlessing(
  mino: MinoDefinition,
  pattern: PatternId,
  blessing: BlessingId,
  rng: RandomGenerator
): Piece {
  const shape = mino.shape
  let blocks = BlockDataMapUtils.createWithPattern(shape, pattern)

  const positions = getFilledPositions(shape)
  if (positions.length > 0) {
    const idx = Math.floor(rng.next() * positions.length)
    const pos = positions[idx]
    blocks = BlockDataMapUtils.setBlessing(blocks, pos.row, pos.col, blessing)
  }

  return {
    id: createPieceId(mino.id),
    shape,
    blockSetId: createBlockSetId(),
    blocks,
  }
}

/**
 * シール+加護付きPieceを生成する
 */
export function createPieceWithSealAndBlessing(
  mino: MinoDefinition,
  seal: SealId,
  blessing: BlessingId,
  rng: RandomGenerator
): Piece {
  const shape = mino.shape
  let blocks = BlockDataMapUtils.createFromShape(shape)

  const positions = getFilledPositions(shape)
  if (positions.length > 0) {
    const sealIdx = Math.floor(rng.next() * positions.length)
    blocks = BlockDataMapUtils.setSeal(blocks, positions[sealIdx].row, positions[sealIdx].col, seal)

    const blessingIdx = Math.floor(rng.next() * positions.length)
    blocks = BlockDataMapUtils.setBlessing(blocks, positions[blessingIdx].row, positions[blessingIdx].col, blessing)
  }

  return {
    id: createPieceId(mino.id),
    shape,
    blockSetId: createBlockSetId(),
    blocks,
  }
}

/**
 * パターン+シール+加護付きPieceを生成する
 */
export function createPieceWithPatternSealAndBlessing(
  mino: MinoDefinition,
  pattern: PatternId,
  seal: SealId,
  blessing: BlessingId,
  rng: RandomGenerator
): Piece {
  const shape = mino.shape
  let blocks = BlockDataMapUtils.createWithPattern(shape, pattern)

  const positions = getFilledPositions(shape)
  if (positions.length > 0) {
    const sealIdx = Math.floor(rng.next() * positions.length)
    blocks = BlockDataMapUtils.setSeal(blocks, positions[sealIdx].row, positions[sealIdx].col, seal)

    const blessingIdx = Math.floor(rng.next() * positions.length)
    blocks = BlockDataMapUtils.setBlessing(blocks, positions[blessingIdx].row, positions[blessingIdx].col, blessing)
  }

  return {
    id: createPieceId(mino.id),
    shape,
    blockSetId: createBlockSetId(),
    blocks,
  }
}

/**
 * 形状から直接Pieceを生成する（パターンなし）
 */
export function createPieceFromShape(idPrefix: string, shape: PieceShape): Piece {
  return {
    id: createPieceId(idPrefix),
    shape,
    blockSetId: createBlockSetId(),
    blocks: BlockDataMapUtils.createFromShape(shape),
  }
}

/**
 * 3つのピースセットを生成する
 */
export function generatePieceSet(
  weights: CategoryWeights,
  rng: RandomGenerator
): Piece[] {
  const pieces: Piece[] = []

  for (let i = 0; i < 3; i++) {
    const category = selectCategory(weights, rng)
    const mino = selectMinoFromCategory(category, rng)
    const piece = createPiece(mino)
    pieces.push(piece)
  }

  return pieces
}

// ====================================
// ピース定義ユーティリティ（元 pieceDefinitions.ts）
// ====================================

/**
 * ブロック形状の定義
 * true = ブロックがある位置
 */

// 1x1 ブロック
const SHAPE_SINGLE: PieceShape = [[true]]

// 2x2 ブロック
const SHAPE_SQUARE: PieceShape = [
  [true, true],
  [true, true],
]

// 3x1 ブロック（横長）
const SHAPE_LINE_3: PieceShape = [[true, true, true]]

/**
 * 初期ブロックセットを取得
 */
export function getInitialPieces(): Piece[] {
  return [
    createPieceFromShape('piece-1', SHAPE_SINGLE),
    createPieceFromShape('piece-2', SHAPE_SQUARE),
    createPieceFromShape('piece-3', SHAPE_LINE_3),
  ]
}

/**
 * ピースのBlockDataから最初のpatternを取得
 */
export function getPiecePattern(piece: Piece): PatternId | null {
  for (const blockData of piece.blocks.values()) {
    if (blockData.pattern) return blockData.pattern
  }
  return null
}

/**
 * ブロック形状のサイズを取得
 */
export function getPieceSize(shape: PieceShape): { width: number; height: number } {
  const height = shape.length
  const width = shape[0]?.length ?? 0
  return { width, height }
}

/**
 * ブロック形状内の有効なセル数を取得
 */
export function getPieceCellCount(shape: PieceShape): number {
  let count = 0
  for (const row of shape) {
    for (const cell of row) {
      if (cell) count++
    }
  }
  return count
}

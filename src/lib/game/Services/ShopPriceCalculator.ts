/**
 * ショップ価格計算ロジック
 */

import type { Piece } from '../Domain'
import type { PatternId, SealId } from '../Domain/Core/Id'
import { PATTERN_DEFINITIONS, PatternType } from '../Domain/Effect/Pattern'
import { SEAL_DEFINITIONS, SealType } from '../Domain/Effect/Seal'

/** セール割引率 (25%) */
export const SALE_DISCOUNT_RATE = 0.25

/**
 * パターンIDから価格を取得
 */
export function getPatternPrice(patternId: PatternId): number {
  const definition = PATTERN_DEFINITIONS[patternId as PatternType]
  return definition?.price ?? 0
}

/**
 * シールIDから価格を取得
 */
export function getSealPrice(sealId: SealId): number {
  const definition = SEAL_DEFINITIONS[sealId as SealType]
  return definition?.price ?? 0
}

/**
 * Pieceの価格を計算
 * - 基本価格: セル数
 * - パターン付きの場合: パターン定義の価格を加算
 * - シール付きの場合: シール定義の価格を加算
 */
export function calculatePiecePrice(piece: Piece): number {
  const cellCount = piece.shape.reduce(
    (sum, row) => sum + row.filter(Boolean).length,
    0
  )

  // イミュータブルにパターンとシールの価格を取得
  const blocksArray = Array.from(piece.blocks.values())
  const patternBlock = blocksArray.find((b) => b.pattern)
  const sealBlock = blocksArray.find((b) => b.seal)

  const patternPrice = patternBlock?.pattern
    ? getPatternPrice(patternBlock.pattern)
    : 0
  const sealPrice = sealBlock?.seal ? getSealPrice(sealBlock.seal) : 0

  return cellCount + patternPrice + sealPrice
}

/**
 * セール価格を計算（25%OFF、切り下げ）
 */
export function calculateSalePrice(originalPrice: number): number {
  return Math.floor(originalPrice * (1 - SALE_DISCOUNT_RATE))
}

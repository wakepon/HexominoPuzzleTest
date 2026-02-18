/**
 * 護符効果の適用サービス
 *
 * 各護符タイプの効果を純粋関数として実装。
 * 既存のPieceService、BlockDataMapUtilsを再利用。
 */

import type { Piece } from '../Domain/Piece/Piece'
import type { DeckState } from '../Domain/Deck/DeckState'
import type { MinoId, PatternId, SealId } from '../Domain/Core/Id'
import type { PieceShape } from '../Domain/Piece/PieceShape'
import type { RandomGenerator } from '../Utils/Random'
import { BlockDataMapUtils } from '../Domain/Piece/BlockData'
import { createPieceWithPattern } from './PieceService'
import { getMinoById } from '../Data/MinoDefinitions'
import { SHOP_AVAILABLE_PATTERNS } from '../Domain/Effect/Pattern'
import { SHOP_AVAILABLE_SEALS } from '../Domain/Effect/Seal'

/**
 * パターン追加: ピースにランダムなパターンを付与
 * 既存のパターンは上書きされる
 */
export function applyPatternAdd(
  minoId: MinoId,
  rng: RandomGenerator
): Piece | null {
  const mino = getMinoById(minoId)
  if (!mino) return null

  const index = Math.floor(rng.next() * SHOP_AVAILABLE_PATTERNS.length)
  const pattern = SHOP_AVAILABLE_PATTERNS[index] as PatternId

  return createPieceWithPattern(mino, pattern)
}

/**
 * シール追加: ピースのランダムなブロックにシールを付与
 */
export function applySealAdd(
  piece: Piece,
  rng: RandomGenerator
): Piece {
  const index = Math.floor(rng.next() * SHOP_AVAILABLE_SEALS.length)
  const seal = SHOP_AVAILABLE_SEALS[index] as SealId

  // ブロック位置の一覧を取得
  const positions: { row: number; col: number }[] = []
  piece.shape.forEach((row, rowIdx) => {
    row.forEach((filled, colIdx) => {
      if (filled) {
        positions.push({ row: rowIdx, col: colIdx })
      }
    })
  })

  if (positions.length === 0) return piece

  // ランダムに1つ選択してシールを付与
  const posIndex = Math.floor(rng.next() * positions.length)
  const pos = positions[posIndex]
  const newBlocks = BlockDataMapUtils.setSeal(piece.blocks, pos.row, pos.col, seal)

  return {
    ...piece,
    blocks: newBlocks,
  }
}

/**
 * 消去: デッキからピースを削除
 */
export function applyVanish(
  deck: DeckState,
  minoId: MinoId
): DeckState {
  return {
    ...deck,
    cards: deck.cards.filter(id => id !== minoId),
    allMinos: deck.allMinos.filter(id => id !== minoId),
    purchasedPieces: (() => {
      const newMap = new Map(deck.purchasedPieces)
      newMap.delete(minoId)
      return newMap
    })(),
  }
}

/**
 * 形状編集: ピースの形状を新しい形状に変更
 */
export function applySculpt(
  piece: Piece,
  newShape: PieceShape
): Piece {
  // 新しい形状に合わせてBlockDataMapを再構築
  const newBlocks = new Map<string, { pattern: PatternId | null; seal: SealId | null }>()
  const existingBlocks = piece.blocks

  newShape.forEach((row, rowIdx) => {
    row.forEach((filled, colIdx) => {
      if (filled) {
        const key = `${rowIdx},${colIdx}`
        const existing = existingBlocks.get(key)
        if (existing) {
          // 既存ブロックのデータを維持
          newBlocks.set(key, existing)
        } else {
          // 新規ブロック: パターンは既存から引き継ぎ、シールはなし
          const firstBlock = Array.from(existingBlocks.values())[0]
          newBlocks.set(key, {
            pattern: firstBlock?.pattern ?? null,
            seal: null,
          })
        }
      }
    })
  })

  return {
    ...piece,
    shape: newShape,
    blocks: newBlocks,
  }
}

/**
 * 形状が連結しているかBFSで検証
 */
export function isShapeConnected(shape: PieceShape): boolean {
  // filledセルの座標を収集
  const filled: { row: number; col: number }[] = []
  shape.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      if (cell) {
        filled.push({ row: rowIdx, col: colIdx })
      }
    })
  })

  if (filled.length === 0) return false

  // BFSで連結判定
  const visited = new Set<string>()
  const queue: { row: number; col: number }[] = [filled[0]]
  visited.add(`${filled[0].row},${filled[0].col}`)

  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ]

  while (queue.length > 0) {
    const current = queue.shift()!
    for (const dir of directions) {
      const nr = current.row + dir.row
      const nc = current.col + dir.col
      const key = `${nr},${nc}`
      if (!visited.has(key) && nr >= 0 && nr < shape.length && nc >= 0 && nc < shape[0].length && shape[nr][nc]) {
        visited.add(key)
        queue.push({ row: nr, col: nc })
      }
    }
  }

  return visited.size === filled.length
}

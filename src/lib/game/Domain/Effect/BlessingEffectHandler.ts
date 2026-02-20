/**
 * バフ効果ハンドラー
 *
 * - stampBlessingsOnBoard: ブロック消去時にセルへバフを刻む（加護→バフ変換）
 * - calculateBuffScoreEffects: バフがスコアに与える効果を計算
 */

import type { Board } from '../Board/Board'
import type { ClearingCell } from '../Animation/AnimationState'
import type { BuffType } from './Buff'
import type { RandomGenerator } from '../../Utils/Random'
import { blessingToBuffType, getBuffDefinition } from './Buff'
import { BLESSING_STAMP_PROBABILITY } from '../../Data/Constants'

/**
 * バフスコア効果の結果
 */
export interface BuffScoreResult {
  readonly enhancementBonus: number    // ブロック点(A)加算
  readonly goldMineBonus: number       // ゴールド加算（スコア外）
  readonly pulsationBonus: number      // 列点(B)加算
}

/**
 * レベルアップ計算
 * - 同種: +1 (multi付き: +2)、上限maxLevel
 * - 異種: 変更なし（既存維持）
 * - 新規: Lv1 (multi付き: Lv2)
 */
export function calculateBuffLevelUp(
  currentBuff: BuffType | null,
  currentLevel: number,
  incomingBuff: BuffType,
  hasMultiSeal: boolean
): { buff: BuffType; level: number } {
  const increment = hasMultiSeal ? 2 : 1
  const buffDef = getBuffDefinition(incomingBuff)
  const maxLevel = buffDef?.maxLevel ?? 3

  if (!currentBuff || currentLevel === 0) {
    // 新規: Lv1 (multi付き: Lv2)
    return {
      buff: incomingBuff,
      level: Math.min(increment, maxLevel),
    }
  }

  if (currentBuff === incomingBuff) {
    // 同種: +increment、上限maxLevel
    return {
      buff: currentBuff,
      level: Math.min(currentLevel + increment, maxLevel),
    }
  }

  // 異種: 変更なし
  return {
    buff: currentBuff,
    level: currentLevel,
  }
}

/**
 * ブロック消去時にセルへバフを刻む
 * ClearingCell の blockBlessing を参照し、バフ種別に変換してセルの buff/buffLevel を更新
 */
export function stampBlessingsOnBoard(
  board: Board,
  cellsToRemove: readonly ClearingCell[],
  rng: RandomGenerator
): Board {
  // 加護付きブロックがなければ早期リターン
  const hasBlessings = cellsToRemove.some(c => c.blockBlessing)
  if (!hasBlessings) return board

  // 新しいボードを作成（immutable）
  const newBoard = board.map(row => row.map(cell => ({ ...cell })))

  for (const cell of cellsToRemove) {
    if (!cell.blockBlessing) continue

    // 1/4の確率でバフ付与
    if (rng.next() >= BLESSING_STAMP_PROBABILITY) continue

    const boardCell = newBoard[cell.row][cell.col]
    const hasMulti = boardCell.seal === 'multi'

    // 加護をバフ種別に変換
    const incomingBuff = blessingToBuffType(cell.blockBlessing)

    const result = calculateBuffLevelUp(
      boardCell.buff,
      boardCell.buffLevel,
      incomingBuff,
      hasMulti
    )

    newBoard[cell.row][cell.col] = {
      ...boardCell,
      buff: result.buff,
      buffLevel: result.level,
    }
  }

  return newBoard
}

/**
 * バフがスコアに与える効果を計算
 * 消去対象セルの下にあるバフを参照
 * obstacleパターンが乗っているセルのバフは無効化
 */
export function calculateBuffScoreEffects(
  board: Board,
  cellsToRemove: readonly ClearingCell[]
): BuffScoreResult {
  let enhancementBonus = 0
  let goldMineBonus = 0
  let pulsationBonus = 0

  for (const cell of cellsToRemove) {
    const boardCell = board[cell.row][cell.col]

    // バフなし or obstacle上は無効
    if (!boardCell.buff || boardCell.buffLevel === 0) continue
    if (boardCell.pattern === 'obstacle') continue

    const level = boardCell.buffLevel

    switch (boardCell.buff) {
      case 'enhancement':
        enhancementBonus += level
        break
      case 'gold_mine':
        goldMineBonus += level
        break
      case 'pulsation':
        pulsationBonus += level
        break
    }
  }

  return { enhancementBonus, goldMineBonus, pulsationBonus }
}

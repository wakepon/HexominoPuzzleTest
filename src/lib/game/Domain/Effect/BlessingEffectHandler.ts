/**
 * 加護効果ハンドラー
 *
 * - stampBlessingsOnBoard: ブロック消去時にセルへ加護を刻む
 * - calculateBlessingScoreEffects: 加護がスコアに与える効果を計算
 */

import type { Board } from '../Board/Board'
import type { ClearingCell } from '../Animation/AnimationState'
import type { BlessingId } from '../Core/Id'
import { getBlessingDefinition } from './Blessing'

/**
 * 加護スコア効果の結果
 */
export interface BlessingScoreResult {
  readonly powerBonus: number    // ブロック点(A)加算
  readonly goldBonus: number     // ゴールド加算（スコア外）
  readonly chainBonus: number    // 列点(B)加算
}

/**
 * レベルアップ計算
 * - 同種: +1 (multi付き: +2)、上限Lv3
 * - 異種: 変更なし（既存維持）
 * - 新規: Lv1 (multi付き: Lv2)
 */
export function calculateBlessingLevelUp(
  currentBlessing: BlessingId | null,
  currentLevel: number,
  incomingBlessing: BlessingId,
  hasMultiSeal: boolean
): { blessing: BlessingId; level: number } {
  const increment = hasMultiSeal ? 2 : 1
  const blessingDef = getBlessingDefinition(incomingBlessing)
  const maxLevel = blessingDef?.maxLevel ?? 3

  if (!currentBlessing || currentLevel === 0) {
    // 新規: Lv1 (multi付き: Lv2)
    return {
      blessing: incomingBlessing,
      level: Math.min(increment, maxLevel),
    }
  }

  if (currentBlessing === incomingBlessing) {
    // 同種: +increment、上限3
    return {
      blessing: currentBlessing,
      level: Math.min(currentLevel + increment, maxLevel),
    }
  }

  // 異種: 変更なし
  return {
    blessing: currentBlessing,
    level: currentLevel,
  }
}

/**
 * ブロック消去時にセルへ加護を刻む
 * ClearingCell の blockBlessing を参照し、セルの blessing/blessingLevel を更新
 */
export function stampBlessingsOnBoard(
  board: Board,
  cellsToRemove: readonly ClearingCell[]
): Board {
  // 加護付きブロックがなければ早期リターン
  const hasBlessings = cellsToRemove.some(c => c.blockBlessing)
  if (!hasBlessings) return board

  // 新しいボードを作成（immutable）
  const newBoard = board.map(row => row.map(cell => ({ ...cell })))

  for (const cell of cellsToRemove) {
    if (!cell.blockBlessing) continue

    const boardCell = newBoard[cell.row][cell.col]
    const hasMulti = boardCell.seal === 'multi'

    const result = calculateBlessingLevelUp(
      boardCell.blessing,
      boardCell.blessingLevel,
      cell.blockBlessing,
      hasMulti
    )

    newBoard[cell.row][cell.col] = {
      ...boardCell,
      blessing: result.blessing,
      blessingLevel: result.level,
    }
  }

  return newBoard
}

/**
 * 加護がスコアに与える効果を計算
 * 消去対象セルの下にある加護を参照
 * obstacleパターンが乗っているセルの加護は無効化
 */
export function calculateBlessingScoreEffects(
  board: Board,
  cellsToRemove: readonly ClearingCell[]
): BlessingScoreResult {
  let powerBonus = 0
  let goldBonus = 0
  let chainBonus = 0

  for (const cell of cellsToRemove) {
    const boardCell = board[cell.row][cell.col]

    // 加護なし or obstacle上は無効
    if (!boardCell.blessing || boardCell.blessingLevel === 0) continue
    if (boardCell.pattern === 'obstacle') continue

    const level = boardCell.blessingLevel

    switch (boardCell.blessing) {
      case 'power':
        powerBonus += level
        break
      case 'gold':
        goldBonus += level
        break
      case 'chain':
        chainBonus += level
        break
    }
  }

  return { powerBonus, goldBonus, chainBonus }
}

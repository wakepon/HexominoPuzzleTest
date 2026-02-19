/**
 * ライン消去ロジック
 */

import type { Board, ClearingCell, ScoreBreakdown } from '../Domain'
import type { RelicId } from '../Domain/Core/Id'
import type { RelicEffectContext } from '../Domain/Effect/RelicEffectTypes'
import { calculateScoreBreakdown as calculatePatternScoreBreakdown } from '../Domain/Effect/PatternEffectHandler'
import { filterClearableCells } from '../Domain/Effect/SealEffectHandler'
import { GRID_SIZE } from '../Data/Constants'

/**
 * 完成したラインの情報
 */
export interface CompletedLines {
  rows: number[]      // 完成した行のインデックス配列
  columns: number[]   // 完成した列のインデックス配列
}

/**
 * 完成した行と列を検出する
 */
export function findCompletedLines(board: Board): CompletedLines {
  const rows: number[] = []
  const columns: number[] = []

  // 行をチェック
  for (let y = 0; y < GRID_SIZE; y++) {
    const isRowComplete = board[y].every(cell => cell.filled)
    if (isRowComplete) {
      rows.push(y)
    }
  }

  // 列をチェック
  for (let x = 0; x < GRID_SIZE; x++) {
    const isColumnComplete = board.every(row => row[x].filled)
    if (isColumnComplete) {
      columns.push(x)
    }
  }

  return { rows, columns }
}

/**
 * 消去対象のセルを取得（重複なし）
 * 石シールを持つセルはフィルタされない（boardを渡した場合のみフィルタ可能）
 */
export function getCellsToRemove(completedLines: CompletedLines): ClearingCell[] {
  const cellSet = new Set<string>()
  const cells: ClearingCell[] = []

  // 行のセルを追加
  for (const y of completedLines.rows) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const key = `${x},${y}`
      if (!cellSet.has(key)) {
        cellSet.add(key)
        cells.push({ x, y, row: y, col: x })
      }
    }
  }

  // 列のセルを追加
  for (const x of completedLines.columns) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const key = `${x},${y}`
      if (!cellSet.has(key)) {
        cellSet.add(key)
        cells.push({ x, y, row: y, col: x })
      }
    }
  }

  return cells
}

/**
 * 消去対象のセルを取得（石シール付きセルを除外）
 * @param board 現在のボード状態
 * @param completedLines 完成したライン情報
 * @returns 石シールを除いた消去対象セル
 */
export function getCellsToRemoveWithFilter(
  board: Board,
  completedLines: CompletedLines
): ClearingCell[] {
  const cells = getCellsToRemove(completedLines)
  return filterClearableCells(board, cells)
}

/**
 * スコアを計算する
 * スコア = 消えたブロック数 x 消えたライン数
 */
export function calculateScore(completedLines: CompletedLines): number {
  const totalLines = completedLines.rows.length + completedLines.columns.length
  if (totalLines === 0) return 0

  const cells = getCellsToRemove(completedLines)
  const blockCount = cells.length

  return blockCount * totalLines
}

/**
 * パターン効果、シール効果、レリック効果を考慮したスコアを計算
 * @param board 現在のボード状態
 * @param completedLines 完成したライン情報
 * @param comboCount 現在のコンボ回数
 * @param relicContext レリック効果コンテキスト（null可）
 * @param luckyRandom 乱数生成関数（テスト用に注入可能）
 * @returns スコア計算の詳細内訳
 */
export function calculateScoreWithEffects(
  board: Board,
  completedLines: CompletedLines,
  comboCount: number,
  relicContext: RelicEffectContext | null = null,
  luckyRandom: () => number = Math.random,
  relicDisplayOrder: readonly RelicId[] = []
): ScoreBreakdown {
  const totalLines = completedLines.rows.length + completedLines.columns.length
  if (totalLines === 0) {
    return {
      baseBlocks: 0,
      enhancedBonus: 0,
      auraBonus: 0,
      mossBonus: 0,
      multiBonus: 0,
      arrowBonus: 0,
      chargeBonus: 0,
      totalBlocks: 0,
      linesCleared: 0,
      baseScore: 0,
      comboBonus: 0,
      luckyMultiplier: 1,
      sealScoreBonus: 0,
      goldCount: 0,
      chainMasterMultiplier: 1,
      sizeBonusTotal: 0,
      sizeBonusRelicId: null,
      fullClearMultiplier: 1,
      relicBonusTotal: 0,
      singleLineMultiplier: 1,
      takenokoMultiplier: 1,
      kaniMultiplier: 1,
      renshaMultiplier: 1,
      nobiTakenokoMultiplier: 1,
      nobiKaniMultiplier: 1,
      scriptLineBonus: 0,
      timingMultiplier: 1,
      copyTargetRelicId: null,
      copyMultiplier: 1,
      copyBonus: 0,
      copyLineBonus: 0,
      blockPoints: 0,
      linePoints: 0,
      finalScore: 0,
    }
  }

  // 石シールを除いた消去対象セルを取得
  const cellsToRemove = getCellsToRemoveWithFilter(board, completedLines)

  return calculatePatternScoreBreakdown(
    board,
    cellsToRemove,
    totalLines,
    comboCount,
    relicContext,
    luckyRandom,
    relicDisplayOrder,
    { rows: completedLines.rows, columns: completedLines.columns }
  )
}

/**
 * 指定したセルをクリアする（immutable）
 */
export function clearLines(board: Board, cellsToClear: readonly ClearingCell[]): Board {
  // 新しいボードを作成
  const newBoard = board.map(row =>
    row.map(cell => ({ ...cell }))
  )

  // セルをクリア
  for (const { row, col } of cellsToClear) {
    newBoard[row][col] = {
      filled: false,
      blockSetId: null,
      pattern: null,
      seal: null,
      chargeValue: 0,
    }
  }

  return newBoard
}

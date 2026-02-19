/**
 * エフェクト付きスコア計算テスト
 * calculateScoreWithEffects のパターン・シール・レリック効果を検証
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { calculateScoreWithEffects } from '../Services/LineService'
import type { CompletedLines } from '../Services/LineService'
import { createEmptyBoard } from '../Services/BoardService'
import type { Board } from '../Domain'
import type { BlockSetId, PatternId, SealId, RelicId } from '../Domain/Core/Id'
import type { RelicEffectContext } from '../Domain/Effect/RelicEffectTypes'
import { INITIAL_RELIC_MULTIPLIER_STATE } from '../Domain/Effect/RelicState'
import { initializeRelicRegistry } from '../Domain/Effect/Relics/index'

// === 乱数制御 ===
const noLuck = () => 0.5           // lucky不発（0.1以上）
const guaranteedLuck = () => 0.01  // lucky確定（0.1未満）

// === ヘルパー関数 ===

/** セルオーバーライド型 */
interface CellOverride {
  readonly pattern?: PatternId | null
  readonly seal?: SealId | null
  readonly blockSetId?: BlockSetId | null
  readonly chargeValue?: number
}

/** 行を埋めたボード生成（セル単位でpattern/seal/blockSetId指定可能） */
function createBoardWithFilledRow(
  rowIndex: number,
  cellOverrides: Record<number, CellOverride> = {}
): Board {
  return createEmptyBoard().map((row, y) =>
    y === rowIndex
      ? row.map((_cell, x) => {
          const override = cellOverrides[x]
          return {
            filled: true,
            blockSetId: override?.blockSetId ?? (1 as BlockSetId),
            pattern: override?.pattern ?? null,
            seal: override?.seal ?? null,
            chargeValue: override?.chargeValue ?? 0,
          }
        })
      : row
  )
}

/** 複数行を埋めたボード生成（キー "row,col" でオーバーライド） */
function createBoardWithFilledRows(
  rowIndices: number[],
  cellOverrides: Record<string, CellOverride> = {}
): Board {
  return createEmptyBoard().map((row, y) =>
    rowIndices.includes(y)
      ? row.map((_cell, x) => {
          const key = `${y},${x}`
          const override = cellOverrides[key]
          return {
            filled: true,
            blockSetId: override?.blockSetId ?? (1 as BlockSetId),
            pattern: override?.pattern ?? null,
            seal: override?.seal ?? null,
            chargeValue: override?.chargeValue ?? 0,
          }
        })
      : row
  )
}

/** 列を埋めたボード生成 */
function createBoardWithFilledColumn(
  colIndex: number,
  cellOverrides: Record<number, CellOverride> = {}
): Board {
  return createEmptyBoard().map((row, y) =>
    row.map((cell, x) => {
      if (x !== colIndex) return cell
      const override = cellOverrides[y]
      return {
        filled: true,
        blockSetId: override?.blockSetId ?? (1 as BlockSetId),
        pattern: override?.pattern ?? null,
        seal: override?.seal ?? null,
        chargeValue: override?.chargeValue ?? 0,
      }
    })
  )
}

/** 行+列を埋めたボード生成（キー "row,col" でオーバーライド） */
function createBoardWithFilledRowAndColumn(
  rowIndex: number,
  colIndex: number,
  cellOverrides: Record<string, CellOverride> = {}
): Board {
  return createEmptyBoard().map((row, y) =>
    row.map((cell, x) => {
      if (y !== rowIndex && x !== colIndex) return cell
      const key = `${y},${x}`
      const override = cellOverrides[key]
      return {
        filled: true,
        blockSetId: override?.blockSetId ?? (1 as BlockSetId),
        pattern: override?.pattern ?? null,
        seal: override?.seal ?? null,
        chargeValue: override?.chargeValue ?? 0,
      }
    })
  )
}

/** RelicEffectContextのデフォルト値付きファクトリ */
function createDefaultRelicContext(
  overrides: Partial<RelicEffectContext> = {}
): RelicEffectContext {
  return {
    ownedRelics: [],
    totalLines: 1,
    rowLines: 1,
    colLines: 0,
    placedBlockSize: 3,
    isBoardEmptyAfterClear: false,
    relicMultiplierState: INITIAL_RELIC_MULTIPLIER_STATE,
    completedRows: [0],
    completedCols: [],
    scriptRelicLines: null,
    remainingHands: 5,
    ...overrides,
  }
}

// === テスト ===

describe('calculateScoreWithEffects', () => {
  beforeAll(() => {
    initializeRelicRegistry()
  })

  // ========================================
  // 基本ケース
  // ========================================
  describe('基本ケース', () => {
    it('エフェクトなし: 1行消去 → A=6, B=1, score=6', () => {
      const board = createBoardWithFilledRow(0)
      const lines: CompletedLines = { rows: [0], columns: [] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.blockPoints).toBe(6)
      expect(result.linePoints).toBe(1)
      expect(result.finalScore).toBe(6)
    })

    it('エフェクトなし: 2行消去 → A=12, B=2, score=24', () => {
      const board = createBoardWithFilledRows([0, 1])
      const lines: CompletedLines = { rows: [0, 1], columns: [] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.blockPoints).toBe(12)
      expect(result.linePoints).toBe(2)
      expect(result.finalScore).toBe(24)
    })

    it('エフェクトなし: 1行1列交差 → A=11, B=2, score=22', () => {
      const board = createBoardWithFilledRowAndColumn(0, 0)
      const lines: CompletedLines = { rows: [0], columns: [0] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.blockPoints).toBe(11)
      expect(result.linePoints).toBe(2)
      expect(result.finalScore).toBe(22)
    })
  })

  // ========================================
  // パターン効果
  // ========================================
  describe('パターン効果', () => {
    it('enhanced: 1セルで+2 → A=8, B=1, score=8', () => {
      const board = createBoardWithFilledRow(0, {
        0: { pattern: 'enhanced' as PatternId },
      })
      const lines: CompletedLines = { rows: [0], columns: [] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.enhancedBonus).toBe(2)
      expect(result.blockPoints).toBe(8)
      expect(result.finalScore).toBe(8)
    })

    it('enhanced+multi: enhanced×2=+4, multi=+1 → A=11, B=1, score=11', () => {
      const board = createBoardWithFilledRow(0, {
        0: { pattern: 'enhanced' as PatternId, seal: 'multi' as SealId },
      })
      const lines: CompletedLines = { rows: [0], columns: [] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.enhancedBonus).toBe(4)
      expect(result.multiBonus).toBe(1)
      expect(result.blockPoints).toBe(11)
      expect(result.finalScore).toBe(11)
    })

    it('aura: 隣接する別セットのセルに+1 → A=8, B=1, score=8', () => {
      // col0: aura(bsId=1), col1: 通常(bsId=2) → col1のスコアにaura+1
      // col1の左にaura(bsId=1)があるので+1
      // 更にcol0自身の右にbsId=2があるがcol0はauraなので自分自身にはaura効かない
      // col1(bsId=2)の左にaura(bsId=1) → +1
      // col2(bsId=1)の左にbsId=2, bsId=2のcol1にはauraなし → +0
      // 実際: auraセル(col0)の隣に別セット(col1)がある → col1に+1
      // col1の隣にaura(col0, 別セット) → +1
      // 他のセルの隣にはauraなし → +0
      // auraBonus = 2 (col0の右にbsId=2 → col1は別セットでcol0がaura...
      // 実装: 各消去セルについて隣接にauraかつ別セットがあれば+1(break)
      // col0(bsId=1): 隣接col1(bsId=2)はauraではない → +0
      // col1(bsId=2): 隣接col0(bsId=1)はaura+別セット → +1 (break)
      // col2(bsId=1): 隣接col1(bsId=2)はauraではない → +0
      // ... 以降同じパターン → auraBonus=1
      // ただしcol0がauraで、残り5セルのうちcol1のみが別セット
      // でもauraの判定は「隣接セルがauraで別セットか」なので
      // col1(bsId=2)の左隣col0がaura(bsId=1)→別セット→+1
      // 他のセルはbsId=1同士で隣接にauraあっても同セットなので+0
      // auraBonus=1 → totalBlocks=7 → 実はauraは+2(各2辺)...
      // 再確認: auraの定義は「隣接する別セットのauraブロックが1つでもあれば+1」
      // col1(bsId=2): 左隣col0がaura+bsId=1(別セット) → +1
      // ではauraBonus=1, totalBlocks=6+1=7 → score=7?
      //
      // 計画では aura(bsId=1), 他全部(bsId=2) → auraBonus=2と記載
      // col0がauraで残り5セルがbsId=2の場合:
      // col1(bsId=2): 隣接col0=aura+bsId=1(別セット) → +1
      // col0(bsId=1): 隣接col1=bsId=2(auraではない) → +0
      // auraBonus=1... ではない。計画を再確認
      //
      // 「aura(bsId=1), 他(bsId=2)」で auraBonus=2 の計画
      // これはcol0をauraにしてbsId=1, 残りをbsId=2にする設定
      // col0の左右: 左=なし, 右=col1(bsId=2, auraなし)→+0
      // col1: 左=col0(bsId=1, aura) → auraかつ別セット → +1
      // col2: 左=col1(bsId=2, auraなし) → +0
      // ...
      // auraBonus=1のみ → 計画のA=8(6+2=8)は誤り
      //
      // auraBonus=2を得るには、auraセル2つ必要
      // col0: aura(bsId=1), col5: aura(bsId=1), 他: bsId=2
      // col1: 左=aura(bsId=1, 別セット) → +1
      // col4: 右=aura(bsId=1, 別セット) → +1
      // auraBonus=2 → A=6+2=8
      const board = createBoardWithFilledRow(0, {
        0: { pattern: 'aura' as PatternId, blockSetId: 1 as BlockSetId },
        1: { blockSetId: 2 as BlockSetId },
        2: { blockSetId: 2 as BlockSetId },
        3: { blockSetId: 2 as BlockSetId },
        4: { blockSetId: 2 as BlockSetId },
        5: { pattern: 'aura' as PatternId, blockSetId: 1 as BlockSetId },
      })
      const lines: CompletedLines = { rows: [0], columns: [] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.auraBonus).toBe(2)
      expect(result.blockPoints).toBe(8)
      expect(result.finalScore).toBe(8)
    })

    it('moss: 角セル(0,0)で端2辺 → B=1+2=3, score=18', () => {
      const board = createBoardWithFilledRow(0, {
        0: { pattern: 'moss' as PatternId },
      })
      const lines: CompletedLines = { rows: [0], columns: [] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.mossBonus).toBe(2)
      expect(result.linePoints).toBe(3) // 1 + mossBonus(2)
      expect(result.finalScore).toBe(18) // 6 × 3
    })

    it('charge: chargeValue=5 → A=6-1+5=10, B=1, score=10', () => {
      const board = createBoardWithFilledRow(0, {
        0: { pattern: 'charge' as PatternId, chargeValue: 5 },
      })
      const lines: CompletedLines = { rows: [0], columns: [] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.chargeBonus).toBe(5)
      expect(result.blockPoints).toBe(10)  // 6 - 1(charge基礎除外) + 5(chargeValue)
      expect(result.finalScore).toBe(10)
    })

    it('lucky当選: B×2 → score=12', () => {
      const board = createBoardWithFilledRow(0, {
        0: { pattern: 'lucky' as PatternId },
      })
      const lines: CompletedLines = { rows: [0], columns: [] }

      const result = calculateScoreWithEffects(board, lines, null, guaranteedLuck)

      expect(result.luckyMultiplier).toBe(2)
      expect(result.linePoints).toBe(2)
      expect(result.finalScore).toBe(12)
    })

    it('lucky外れ: 変化なし → score=6', () => {
      const board = createBoardWithFilledRow(0, {
        0: { pattern: 'lucky' as PatternId },
      })
      const lines: CompletedLines = { rows: [0], columns: [] }

      const result = calculateScoreWithEffects(board, lines, null, noLuck)

      expect(result.luckyMultiplier).toBe(1)
      expect(result.finalScore).toBe(6)
    })

    it('combo: 1個で+1 → A=7, score=7', () => {
      const board = createBoardWithFilledRow(0, {
        0: { pattern: 'combo' as PatternId },
      })
      const lines: CompletedLines = { rows: [0], columns: [] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.comboBonus).toBe(1)  // 2^1 - 1 = 1
      expect(result.blockPoints).toBe(7)
      expect(result.finalScore).toBe(7)
    })

    it('combo: 3個で+7 → A=13, score=13', () => {
      const board = createBoardWithFilledRow(0, {
        0: { pattern: 'combo' as PatternId },
        1: { pattern: 'combo' as PatternId },
        2: { pattern: 'combo' as PatternId },
      })
      const lines: CompletedLines = { rows: [0], columns: [] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.comboBonus).toBe(7)  // 2^3 - 1 = 7
      expect(result.blockPoints).toBe(13)
      expect(result.finalScore).toBe(13)
    })

    it('combo+multi: comboCount=2 → +3 → A=10, score=10', () => {
      // combo+multiのセル: comboCountが2（multi分）、残り5セルは通常
      // comboBonus = 2^2 - 1 = 3
      // multiBonus = 1
      // A = 6 + 1(multi) + 3(combo) = 10
      const board = createBoardWithFilledRow(0, {
        0: { pattern: 'combo' as PatternId, seal: 'multi' as SealId },
      })
      const lines: CompletedLines = { rows: [0], columns: [] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.comboBonus).toBe(3)  // 2^2 - 1 = 3
      expect(result.multiBonus).toBe(1)
      expect(result.blockPoints).toBe(10) // 6 + 1 + 3
      expect(result.finalScore).toBe(10)
    })

    it('obstacle: 消去除外で5ブロック → A=5, B=1, score=5', () => {
      const board = createBoardWithFilledRow(0, {
        0: { pattern: 'obstacle' as PatternId },
      })
      const lines: CompletedLines = { rows: [0], columns: [] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.baseBlocks).toBe(5)
      expect(result.blockPoints).toBe(5)
      expect(result.finalScore).toBe(5)
    })
  })

  // ========================================
  // シール効果
  // ========================================
  describe('シール効果', () => {
    it('score: +5 → A=11, B=1, score=11', () => {
      const board = createBoardWithFilledRow(0, {
        0: { seal: 'score' as SealId },
      })
      const lines: CompletedLines = { rows: [0], columns: [] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.sealScoreBonus).toBe(5)
      expect(result.blockPoints).toBe(11)
      expect(result.finalScore).toBe(11)
    })

    it('multi: +1 → A=7, B=1, score=7', () => {
      const board = createBoardWithFilledRow(0, {
        0: { seal: 'multi' as SealId },
      })
      const lines: CompletedLines = { rows: [0], columns: [] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.multiBonus).toBe(1)
      expect(result.blockPoints).toBe(7)
      expect(result.finalScore).toBe(7)
    })

    it('gold: スコア不変、goldCount=1', () => {
      const board = createBoardWithFilledRow(0, {
        0: { seal: 'gold' as SealId },
      })
      const lines: CompletedLines = { rows: [0], columns: [] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.goldCount).toBe(1)
      expect(result.finalScore).toBe(6)
    })

    it('arrow_h: 行消去で+10 → A=16, B=1, score=16', () => {
      const board = createBoardWithFilledRow(0, {
        0: { seal: 'arrow_h' as SealId },
      })
      const lines: CompletedLines = { rows: [0], columns: [] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.arrowBonus).toBe(10)
      expect(result.blockPoints).toBe(16) // 6 + 10
      expect(result.finalScore).toBe(16)
    })

    it('arrow_v: 列消去で+10 → A=16, B=1, score=16', () => {
      const board = createBoardWithFilledColumn(0, {
        0: { seal: 'arrow_v' as SealId },
      })
      const lines: CompletedLines = { rows: [], columns: [0] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.arrowBonus).toBe(10)
      expect(result.blockPoints).toBe(16)
      expect(result.finalScore).toBe(16)
    })

    it('stone: 消去除外で5ブロック → A=5, B=1, score=5', () => {
      const board = createBoardWithFilledRow(0, {
        0: { seal: 'stone' as SealId },
      })
      const lines: CompletedLines = { rows: [0], columns: [] }

      const result = calculateScoreWithEffects(board, lines)

      expect(result.baseBlocks).toBe(5)
      expect(result.blockPoints).toBe(5)
      expect(result.finalScore).toBe(5)
    })
  })

  // ========================================
  // レリック効果
  // ========================================
  describe('レリック効果', () => {
    it('chain_master: 2ライン消去で×1.5 → B=2×1.5=3, score=36', () => {
      const board = createBoardWithFilledRows([0, 1])
      const lines: CompletedLines = { rows: [0, 1], columns: [] }
      const ctx = createDefaultRelicContext({
        ownedRelics: ['chain_master' as RelicId],
        totalLines: 2,
        rowLines: 2,
        colLines: 0,
        completedRows: [0, 1],
        completedCols: [],
      })

      const result = calculateScoreWithEffects(board, lines, ctx)

      expect(result.relicEffects.get('chain_master')).toBe(1.5)
      expect(result.blockPoints).toBe(12)
      expect(result.linePoints).toBe(3)
      expect(result.finalScore).toBe(36)
    })

    it('chain_master: 1ライン消去では無効 → score=6', () => {
      const board = createBoardWithFilledRow(0)
      const lines: CompletedLines = { rows: [0], columns: [] }
      const ctx = createDefaultRelicContext({
        ownedRelics: ['chain_master' as RelicId],
        totalLines: 1,
        rowLines: 1,
        colLines: 0,
      })

      const result = calculateScoreWithEffects(board, lines, ctx)

      expect(result.relicEffects.get('chain_master')).toBeUndefined()
      expect(result.finalScore).toBe(6)
    })

    it('single_line: 1ライン消去で×3 → B=1×3=3, score=18', () => {
      const board = createBoardWithFilledRow(0)
      const lines: CompletedLines = { rows: [0], columns: [] }
      const ctx = createDefaultRelicContext({
        ownedRelics: ['single_line' as RelicId],
        totalLines: 1,
        rowLines: 1,
        colLines: 0,
      })

      const result = calculateScoreWithEffects(board, lines, ctx)

      expect(result.relicEffects.get('single_line')).toBe(3)
      expect(result.linePoints).toBe(3)
      expect(result.finalScore).toBe(18)
    })

    it('takenoko: 2列消去で×2 → B=2×2=4, score=48', () => {
      // 2列を埋めるボード
      const board = createEmptyBoard().map(row =>
        row.map((cell, x) =>
          x === 0 || x === 1
            ? { filled: true, blockSetId: 1 as BlockSetId, pattern: null, seal: null, chargeValue: 0 } as const
            : cell
        )
      )
      const lines: CompletedLines = { rows: [], columns: [0, 1] }
      const ctx = createDefaultRelicContext({
        ownedRelics: ['takenoko' as RelicId],
        totalLines: 2,
        rowLines: 0,
        colLines: 2,
        completedRows: [],
        completedCols: [0, 1],
      })

      const result = calculateScoreWithEffects(board, lines, ctx)

      expect(result.relicEffects.get('takenoko')).toBe(2)
      expect(result.blockPoints).toBe(12)
      expect(result.linePoints).toBe(4) // 2 × 2
      expect(result.finalScore).toBe(48)
    })

    it('kani: 2行消去で×2 → B=2×2=4, score=48', () => {
      const board = createBoardWithFilledRows([0, 1])
      const lines: CompletedLines = { rows: [0, 1], columns: [] }
      const ctx = createDefaultRelicContext({
        ownedRelics: ['kani' as RelicId],
        totalLines: 2,
        rowLines: 2,
        colLines: 0,
        completedRows: [0, 1],
        completedCols: [],
      })

      const result = calculateScoreWithEffects(board, lines, ctx)

      expect(result.relicEffects.get('kani')).toBe(2)
      expect(result.blockPoints).toBe(12)
      expect(result.linePoints).toBe(4) // 2 × 2
      expect(result.finalScore).toBe(48)
    })

    it('rensha: 累積×2.0 → B=1×2=2, score=12', () => {
      const board = createBoardWithFilledRow(0)
      const lines: CompletedLines = { rows: [0], columns: [] }
      const ctx = createDefaultRelicContext({
        ownedRelics: ['rensha' as RelicId],
        totalLines: 1,
        rowLines: 1,
        colLines: 0,
        relicMultiplierState: {
          ...INITIAL_RELIC_MULTIPLIER_STATE,
          renshaMultiplier: 2.0,
        },
      })

      const result = calculateScoreWithEffects(board, lines, ctx)

      expect(result.relicEffects.get('rensha')).toBe(2)
      expect(result.linePoints).toBe(2)
      expect(result.finalScore).toBe(12)
    })

    it('full_clear: 全消しで×5 → B=1×5=5, score=30', () => {
      const board = createBoardWithFilledRow(0)
      const lines: CompletedLines = { rows: [0], columns: [] }
      const ctx = createDefaultRelicContext({
        ownedRelics: ['full_clear_bonus' as RelicId],
        totalLines: 1,
        rowLines: 1,
        colLines: 0,
        isBoardEmptyAfterClear: true,
      })

      const result = calculateScoreWithEffects(board, lines, ctx)

      expect(result.relicEffects.get('full_clear_bonus')).toBe(5)
      expect(result.linePoints).toBe(5)
      expect(result.finalScore).toBe(30)
    })

    it('size_bonus_3: 3ブロックピースで+baseBlocks → A=12, score=12', () => {
      const board = createBoardWithFilledRow(0)
      const lines: CompletedLines = { rows: [0], columns: [] }
      const ctx = createDefaultRelicContext({
        ownedRelics: ['size_bonus_3' as RelicId],
        totalLines: 1,
        rowLines: 1,
        colLines: 0,
        placedBlockSize: 3,
      })
      const relicOrder: RelicId[] = ['size_bonus_3' as RelicId]

      const result = calculateScoreWithEffects(board, lines, ctx, Math.random, relicOrder)

      expect(result.relicEffects.get('size_bonus_3')).toBe(6)
      expect(result.blockPoints).toBe(12) // 6 + 6(sizeBonus)
      expect(result.finalScore).toBe(12)
    })

    it('timing: hands=6 (6%3=0)で×3 → B=1×3=3, score=18', () => {
      const board = createBoardWithFilledRow(0)
      const lines: CompletedLines = { rows: [0], columns: [] }
      const ctx = createDefaultRelicContext({
        ownedRelics: ['timing' as RelicId],
        totalLines: 1,
        rowLines: 1,
        colLines: 0,
        remainingHands: 6,
      })

      const result = calculateScoreWithEffects(board, lines, ctx)

      expect(result.relicEffects.get('timing')).toBe(3)
      expect(result.linePoints).toBe(3)
      expect(result.finalScore).toBe(18)
    })

    it('timing: hands=5 (5%3≠0)で無効 → score=6', () => {
      const board = createBoardWithFilledRow(0)
      const lines: CompletedLines = { rows: [0], columns: [] }
      const ctx = createDefaultRelicContext({
        ownedRelics: ['timing' as RelicId],
        totalLines: 1,
        rowLines: 1,
        colLines: 0,
        remainingHands: 5,
      })

      const result = calculateScoreWithEffects(board, lines, ctx)

      expect(result.relicEffects.get('timing')).toBeUndefined()
      expect(result.finalScore).toBe(6)
    })

    it('script: row0がマッチで+1ライン → B=1+1=2, score=12', () => {
      const board = createBoardWithFilledRow(0)
      const lines: CompletedLines = { rows: [0], columns: [] }
      const ctx = createDefaultRelicContext({
        ownedRelics: ['script' as RelicId],
        totalLines: 1,
        rowLines: 1,
        colLines: 0,
        completedRows: [0],
        completedCols: [],
        scriptRelicLines: {
          target1: { type: 'row', index: 0 },
          target2: { type: 'row', index: 3 }, // マッチしない
        },
      })
      // relicDisplayOrderにscriptを含める（デフォルト順にscriptがないため）
      const relicOrder: RelicId[] = ['script' as RelicId]

      const result = calculateScoreWithEffects(board, lines, ctx, Math.random, relicOrder)

      expect(result.relicEffects.get('script')).toBe(1)
      expect(result.linePoints).toBe(2) // 1 + 1(script)
      expect(result.finalScore).toBe(12)
    })
  })

  // ========================================
  // 複合効果
  // ========================================
  describe('複合効果', () => {
    it('enhanced+score+chain_master: 2行消去 → A=19, B=3, score=57', () => {
      // 2行消去、row0のcol0にenhanced、col1にscoreシール
      const board = createBoardWithFilledRows([0, 1], {
        '0,0': { pattern: 'enhanced' as PatternId },
        '0,1': { seal: 'score' as SealId },
      })
      const lines: CompletedLines = { rows: [0, 1], columns: [] }
      const ctx = createDefaultRelicContext({
        ownedRelics: ['chain_master' as RelicId],
        totalLines: 2,
        rowLines: 2,
        colLines: 0,
        completedRows: [0, 1],
        completedCols: [],
      })

      const result = calculateScoreWithEffects(board, lines, ctx)

      expect(result.enhancedBonus).toBe(2)
      expect(result.sealScoreBonus).toBe(5)
      expect(result.blockPoints).toBe(19) // 12 + 2(enhanced) + 5(score)
      expect(result.relicEffects.get('chain_master')).toBe(1.5)
      expect(result.linePoints).toBe(3) // 2 × 1.5
      expect(result.finalScore).toBe(57) // 19 × 3
    })

    it('moss+lucky+single_line: 角moss+lucky確定+single_line → score=72', () => {
      // row0: col0にmoss(角で端2辺), col1にlucky
      // A=6, B= 1×2(lucky) + 2(moss) = 4, single_line×3 → B=4×3=12
      // score = 6 × 12 = 72
      const board = createBoardWithFilledRow(0, {
        0: { pattern: 'moss' as PatternId },
        1: { pattern: 'lucky' as PatternId },
      })
      const lines: CompletedLines = { rows: [0], columns: [] }
      const ctx = createDefaultRelicContext({
        ownedRelics: ['single_line' as RelicId],
        totalLines: 1,
        rowLines: 1,
        colLines: 0,
      })

      const result = calculateScoreWithEffects(board, lines, ctx, guaranteedLuck)

      expect(result.mossBonus).toBe(2)
      expect(result.luckyMultiplier).toBe(2)
      expect(result.relicEffects.get('single_line')).toBe(3)
      expect(result.blockPoints).toBe(6)
      expect(result.linePoints).toBe(12) // (1×2 + 2) × 3
      expect(result.finalScore).toBe(72)
    })

    it('single_line+timing: 両方×3 → B=1×3×3=9, score=54', () => {
      const board = createBoardWithFilledRow(0)
      const lines: CompletedLines = { rows: [0], columns: [] }
      const ctx = createDefaultRelicContext({
        ownedRelics: ['single_line' as RelicId, 'timing' as RelicId],
        totalLines: 1,
        rowLines: 1,
        colLines: 0,
        remainingHands: 6, // 6%3=0
      })

      const result = calculateScoreWithEffects(board, lines, ctx)

      expect(result.relicEffects.get('single_line')).toBe(3)
      expect(result.relicEffects.get('timing')).toBe(3)
      expect(result.blockPoints).toBe(6)
      expect(result.linePoints).toBe(9) // 1 × 3 × 3
      expect(result.finalScore).toBe(54)
    })
  })
})

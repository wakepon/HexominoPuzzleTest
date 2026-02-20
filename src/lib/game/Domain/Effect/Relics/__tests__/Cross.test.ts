import { describe, it, expect } from 'vitest'
import { crossRelic } from '../Cross'
import type { RelicContext } from '../RelicModule'

/**
 * テスト用ヘルパー: RelicContextを生成
 */
function createContext(overrides: Partial<RelicContext> = {}): RelicContext {
  return {
    ownedRelics: [],
    totalLines: 0,
    rowLines: 0,
    colLines: 0,
    placedBlockSize: 0,
    isBoardEmptyAfterClear: false,
    completedRows: [],
    completedCols: [],
    scriptRelicLines: null,
    remainingHands: 5,
    patternBlockCount: 0,
    sealBlockCount: 0,
    deckSize: 10,
    boardFilledCount: 0,
    patternAndSealBlockCount: 0,
    distinctPatternTypeCount: 0,
    relicState: null,
    ...overrides,
  }
}

describe('crossRelic', () => {
  // === 定義確認 ===
  describe('definition', () => {
    it('typeがcrossである', () => {
      expect(crossRelic.type).toBe('cross')
    })

    it('scoreEffectがadditiveである', () => {
      expect(crossRelic.scoreEffect).toBe('additive')
    })

    it('定義情報が正しい', () => {
      expect(crossRelic.definition.name).toBe('十字')
      expect(crossRelic.definition.rarity).toBe('rare')
      expect(crossRelic.definition.price).toBe(20)
      expect(crossRelic.definition.icon).toBe('✝️')
    })
  })

  // === checkActivation ===
  describe('checkActivation', () => {
    it('行と列を同時に消した時、交差セル数×30のボーナスが返される', () => {
      const ctx = createContext({
        totalLines: 2, rowLines: 1, colLines: 1,
        completedRows: [0], completedCols: [3],
      })
      const result = crossRelic.checkActivation(ctx)
      expect(result.active).toBe(true)
      expect(result.value).toBe(30)
      expect(result.displayLabel).toBe('ブロック点+30')
    })

    it('行のみ消した場合は発動しない', () => {
      const ctx = createContext({
        totalLines: 1, rowLines: 1, colLines: 0,
        completedRows: [2], completedCols: [],
      })
      const result = crossRelic.checkActivation(ctx)
      expect(result.active).toBe(false)
      expect(result.value).toBe(0)
    })

    it('列のみ消した場合は発動しない', () => {
      const ctx = createContext({
        totalLines: 1, rowLines: 0, colLines: 1,
        completedRows: [], completedCols: [4],
      })
      const result = crossRelic.checkActivation(ctx)
      expect(result.active).toBe(false)
      expect(result.value).toBe(0)
    })

    it('ラインが0の場合は発動しない', () => {
      const ctx = createContext({ totalLines: 0 })
      const result = crossRelic.checkActivation(ctx)
      expect(result.active).toBe(false)
    })

    it('複数行×複数列の交差セル数が正しく計算される', () => {
      const ctx = createContext({
        totalLines: 5, rowLines: 2, colLines: 3,
        completedRows: [0, 5], completedCols: [1, 3, 4],
      })
      const result = crossRelic.checkActivation(ctx)
      expect(result.active).toBe(true)
      expect(result.value).toBe(180)
    })
  })

  // === state ===
  describe('state', () => {
    it('initialState を持たない', () => {
      expect(crossRelic.initialState).toBeUndefined()
    })
    it('updateState を持たない', () => {
      expect(crossRelic.updateState).toBeUndefined()
    })
  })
})


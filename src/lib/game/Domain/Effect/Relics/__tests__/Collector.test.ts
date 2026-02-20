import { describe, it, expect } from 'vitest'
import { collectorRelic, type CollectorState } from '../Collector'
import type { RelicContext, RelicStateEvent } from '../RelicModule'

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

describe('collectorRelic', () => {
  // === 定義確認 ===
  describe('definition', () => {
    it('typeがcollectorである', () => {
      expect(collectorRelic.type).toBe('collector')
    })

    it('scoreEffectがmultiplicativeである', () => {
      expect(collectorRelic.scoreEffect).toBe('multiplicative')
    })

    it('定義情報が正しい', () => {
      expect(collectorRelic.definition.name).toBe('収集家')
      expect(collectorRelic.definition.rarity).toBe('uncommon')
      expect(collectorRelic.definition.price).toBe(15)
      expect(collectorRelic.definition.icon).toBe('🎪')
    })
  })

  // === initialState ===
  describe('initialState', () => {
    it('初期状態を返す', () => {
      const state = collectorRelic.initialState!() as CollectorState
      expect(state.collectedPatterns).toEqual([])
      expect(state.accumulatedBonus).toBe(0)
    })
  })

  // === updateState ===
  describe('updateState', () => {
    it('新しいパターン種類1個でボーナス+0.5', () => {
      const event: RelicStateEvent = {
        type: 'lines_cleared',
        totalLines: 1,
        rowLines: 1,
        colLines: 0,
        patternBlockCount: 2,
        clearedPatternTypes: ['enhanced'],
      }
      const result = collectorRelic.updateState!(null, event) as CollectorState
      expect(result.collectedPatterns).toEqual(['enhanced'])
      expect(result.accumulatedBonus).toBe(0.5)
    })

    it('新しいパターン種類3個でボーナス+1.5', () => {
      const event: RelicStateEvent = {
        type: 'lines_cleared',
        totalLines: 2,
        rowLines: 1,
        colLines: 1,
        patternBlockCount: 5,
        clearedPatternTypes: ['enhanced', 'lucky', 'combo'],
      }
      const result = collectorRelic.updateState!(null, event) as CollectorState
      expect(result.collectedPatterns).toEqual(['enhanced', 'lucky', 'combo'])
      expect(result.accumulatedBonus).toBe(1.5)
    })

    it('既存のパターン種類は加算しない', () => {
      const initial: CollectorState = {
        collectedPatterns: ['enhanced'],
        accumulatedBonus: 0.5,
      }
      const event: RelicStateEvent = {
        type: 'lines_cleared',
        totalLines: 1,
        rowLines: 1,
        colLines: 0,
        patternBlockCount: 2,
        clearedPatternTypes: ['enhanced'],
      }
      const result = collectorRelic.updateState!(initial, event) as CollectorState
      expect(result.collectedPatterns).toEqual(['enhanced'])
      expect(result.accumulatedBonus).toBe(0.5)
    })

    it('既存+新規パターン混在時、新規のみ加算', () => {
      const initial: CollectorState = {
        collectedPatterns: ['enhanced'],
        accumulatedBonus: 0.5,
      }
      const event: RelicStateEvent = {
        type: 'lines_cleared',
        totalLines: 2,
        rowLines: 1,
        colLines: 1,
        patternBlockCount: 4,
        clearedPatternTypes: ['enhanced', 'lucky', 'combo'],
      }
      const result = collectorRelic.updateState!(initial, event) as CollectorState
      expect(result.collectedPatterns).toEqual(['enhanced', 'lucky', 'combo'])
      expect(result.accumulatedBonus).toBe(1.5) // 0.5 + 2 * 0.5
    })

    it('totalLines=0の場合は何もしない', () => {
      const event: RelicStateEvent = {
        type: 'lines_cleared',
        totalLines: 0,
        rowLines: 0,
        colLines: 0,
        patternBlockCount: 0,
        clearedPatternTypes: ['enhanced'],
      }
      const result = collectorRelic.updateState!(null, event) as CollectorState
      expect(result.collectedPatterns).toEqual([])
      expect(result.accumulatedBonus).toBe(0)
    })

    it('clearedPatternTypesが空の場合は何もしない', () => {
      const event: RelicStateEvent = {
        type: 'lines_cleared',
        totalLines: 1,
        rowLines: 1,
        colLines: 0,
        patternBlockCount: 3,
        clearedPatternTypes: [],
      }
      const result = collectorRelic.updateState!(null, event) as CollectorState
      expect(result.collectedPatterns).toEqual([])
      expect(result.accumulatedBonus).toBe(0)
    })

    it('round_startでリセット', () => {
      const initial: CollectorState = {
        collectedPatterns: ['enhanced', 'lucky', 'combo'],
        accumulatedBonus: 1.5,
      }
      const event: RelicStateEvent = { type: 'round_start' }
      const result = collectorRelic.updateState!(initial, event) as CollectorState
      expect(result.collectedPatterns).toEqual([])
      expect(result.accumulatedBonus).toBe(0)
    })

    it('lines_detectedイベントは何もしない', () => {
      const initial: CollectorState = {
        collectedPatterns: ['enhanced'],
        accumulatedBonus: 0.5,
      }
      const event: RelicStateEvent = {
        type: 'lines_detected',
        totalLines: 1,
        rowLines: 1,
        colLines: 0,
      }
      const result = collectorRelic.updateState!(initial, event) as CollectorState
      expect(result).toBe(initial)
    })

    it('hand_consumedイベントは何もしない', () => {
      const initial: CollectorState = {
        collectedPatterns: ['enhanced'],
        accumulatedBonus: 0.5,
      }
      const event: RelicStateEvent = {
        type: 'hand_consumed',
        placedBlockSize: 4,
      }
      const result = collectorRelic.updateState!(initial, event) as CollectorState
      expect(result).toBe(initial)
    })
  })

  // === checkActivation ===
  describe('checkActivation', () => {
    it('ライン消去なしは発動しない', () => {
      const state: CollectorState = {
        collectedPatterns: ['enhanced'],
        accumulatedBonus: 0.5,
      }
      const ctx = createContext({ totalLines: 0, relicState: state })
      const result = collectorRelic.checkActivation(ctx)
      expect(result.active).toBe(false)
      expect(result.value).toBe(1)
      expect(result.displayLabel).toBe('')
    })

    it('ボーナスなしは発動しない', () => {
      const state: CollectorState = {
        collectedPatterns: [],
        accumulatedBonus: 0,
      }
      const ctx = createContext({ totalLines: 1, relicState: state })
      const result = collectorRelic.checkActivation(ctx)
      expect(result.active).toBe(false)
      expect(result.value).toBe(1)
      expect(result.displayLabel).toBe('')
    })

    it('1種類収集で列点x1.5', () => {
      const state: CollectorState = {
        collectedPatterns: ['enhanced'],
        accumulatedBonus: 0.5,
      }
      const ctx = createContext({ totalLines: 1, relicState: state })
      const result = collectorRelic.checkActivation(ctx)
      expect(result.active).toBe(true)
      expect(result.value).toBe(1.5)
      expect(result.displayLabel).toBe('列点×1.5')
    })

    it('3種類収集で列点x2.5', () => {
      const state: CollectorState = {
        collectedPatterns: ['enhanced', 'lucky', 'combo'],
        accumulatedBonus: 1.5,
      }
      const ctx = createContext({ totalLines: 2, relicState: state })
      const result = collectorRelic.checkActivation(ctx)
      expect(result.active).toBe(true)
      expect(result.value).toBe(2.5)
      expect(result.displayLabel).toBe('列点×2.5')
    })

    it('relicState=nullは初期状態扱い', () => {
      const ctx = createContext({ totalLines: 1, relicState: null })
      const result = collectorRelic.checkActivation(ctx)
      expect(result.active).toBe(false)
      expect(result.value).toBe(1)
    })
  })
})

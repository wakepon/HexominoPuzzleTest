import { describe, it, expect } from 'vitest'
import { treasureHunterRelic, TREASURE_HUNTER_GOLD_BONUS } from '../TreasureHunter'
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

describe('treasureHunterRelic', () => {
  // === 定義確認 ===
  describe('definition', () => {
    it('typeがtreasure_hunterである', () => {
      expect(treasureHunterRelic.type).toBe('treasure_hunter')
    })

    it('scoreEffectがnoneである', () => {
      expect(treasureHunterRelic.scoreEffect).toBe('none')
    })

    it('定義情報が正しい', () => {
      expect(treasureHunterRelic.definition.name).toBe('トレジャーハンター')
      expect(treasureHunterRelic.definition.rarity).toBe('common')
      expect(treasureHunterRelic.definition.price).toBe(10)
      expect(treasureHunterRelic.definition.icon).toBe('💎')
    })
  })

  // === checkActivation ===
  describe('checkActivation', () => {
    it('常に非発動を返す', () => {
      const ctx = createContext({ totalLines: 1 })
      const result = treasureHunterRelic.checkActivation(ctx)
      expect(result.active).toBe(false)
      expect(result.value).toBe(0)
      expect(result.displayLabel).toBe('')
    })
  })

  // === 定数確認 ===
  describe('TREASURE_HUNTER_GOLD_BONUS', () => {
    it('ゴールドボーナスが1である', () => {
      expect(TREASURE_HUNTER_GOLD_BONUS).toBe(1)
    })
  })
})

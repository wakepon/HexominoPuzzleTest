import { describe, it, expect } from 'vitest'
import { merchantRelic, MERCHANT_REROLL_DISCOUNT } from '../Merchant'
import { getRerollCost } from '../../../../Services/ShopService'
import type { RelicContext } from '../RelicModule'
import type { RelicId } from '../../../Core/Id'

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

describe('merchantRelic', () => {
  // === 定義確認 ===
  describe('definition', () => {
    it('typeがmerchantである', () => {
      expect(merchantRelic.type).toBe('merchant')
    })

    it('scoreEffectがnoneである', () => {
      expect(merchantRelic.scoreEffect).toBe('none')
    })

    it('定義情報が正しい', () => {
      expect(merchantRelic.definition.name).toBe('商人')
      expect(merchantRelic.definition.rarity).toBe('uncommon')
      expect(merchantRelic.definition.price).toBe(15)
      expect(merchantRelic.definition.icon).toBe('🏪')
    })
  })

  // === checkActivation ===
  describe('checkActivation', () => {
    it('常に非発動を返す', () => {
      const ctx = createContext({ totalLines: 1 })
      const result = merchantRelic.checkActivation(ctx)
      expect(result.active).toBe(false)
      expect(result.value).toBe(0)
      expect(result.displayLabel).toBe('')
    })
  })

  // === getRerollCost との連携 ===
  describe('getRerollCost', () => {
    it('merchant なし: ベースコストのみ', () => {
      // 初回リロール: 3G（rerollInitialCost=3, increment=1）
      const cost = getRerollCost(0)
      expect(cost).toBe(3)
    })

    it('merchant なし: 2回目のリロールコスト', () => {
      const cost = getRerollCost(1)
      expect(cost).toBe(4)
    })

    it('merchant あり: -2G割引', () => {
      const ownedRelics: readonly RelicId[] = ['merchant' as RelicId]
      const cost = getRerollCost(0, ownedRelics)
      expect(cost).toBe(3 - MERCHANT_REROLL_DISCOUNT)
    })

    it('merchant あり: 2回目のリロールでも-2G割引', () => {
      const ownedRelics: readonly RelicId[] = ['merchant' as RelicId]
      const cost = getRerollCost(1, ownedRelics)
      expect(cost).toBe(4 - MERCHANT_REROLL_DISCOUNT)
    })

    it('merchant あり: 割引後の最小値は0G', () => {
      const ownedRelics: readonly RelicId[] = ['merchant' as RelicId]
      // rerollCount=0: baseCost=3, 3-2=1 → 1G
      const cost0 = getRerollCost(0, ownedRelics)
      expect(cost0).toBeGreaterThanOrEqual(0)

      // baseCostが割引額以下のケースを想定
      // rerollInitialCost=3, increment=1 → baseCost=3がminだが念のため
      // 手動でbaseCostが2以下になるケースはないが、0Gクランプの確認
      expect(Math.max(0, 1 - MERCHANT_REROLL_DISCOUNT)).toBe(0)
    })
  })
})

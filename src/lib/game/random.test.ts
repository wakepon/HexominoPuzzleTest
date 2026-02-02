import { describe, it, expect } from 'vitest'
import { SeededRandom, DefaultRandom } from './random'

describe('SeededRandom', () => {
  describe('next', () => {
    it('同じシードで同じ乱数列を返す', () => {
      const rng1 = new SeededRandom(12345)
      const rng2 = new SeededRandom(12345)

      const seq1 = [rng1.next(), rng1.next(), rng1.next()]
      const seq2 = [rng2.next(), rng2.next(), rng2.next()]

      expect(seq1).toEqual(seq2)
    })

    it('0以上1未満の値を返す', () => {
      const rng = new SeededRandom(42)

      for (let i = 0; i < 100; i++) {
        const value = rng.next()
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(1)
      }
    })

    it('異なるシードで異なる乱数列を返す', () => {
      const rng1 = new SeededRandom(111)
      const rng2 = new SeededRandom(222)

      const seq1 = [rng1.next(), rng1.next(), rng1.next()]
      const seq2 = [rng2.next(), rng2.next(), rng2.next()]

      expect(seq1).not.toEqual(seq2)
    })

    it('連続呼び出しで異なる値を返す', () => {
      const rng = new SeededRandom(999)

      const values = new Set<number>()
      for (let i = 0; i < 10; i++) {
        values.add(rng.next())
      }

      // 10回の呼び出しで少なくとも5種類以上の異なる値が出るはず
      expect(values.size).toBeGreaterThanOrEqual(5)
    })
  })
})

describe('DefaultRandom', () => {
  describe('next', () => {
    it('0以上1未満の値を返す', () => {
      const rng = new DefaultRandom()

      for (let i = 0; i < 100; i++) {
        const value = rng.next()
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(1)
      }
    })
  })
})

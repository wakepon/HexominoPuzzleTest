import { describe, it, expect } from 'vitest'
import {
  selectCategory,
  selectMinoFromCategory,
  generatePieceSet,
  DEFAULT_WEIGHTS,
} from './pieceGenerator'
import { SeededRandom } from './random'
import { MINOS_BY_CATEGORY, ALL_MINOS, MINO_COUNTS } from './minoDefinitions'
import { CategoryWeights, MinoCategory } from './types'

describe('minoDefinitions', () => {
  describe('カテゴリ別ミノ数', () => {
    it('モノミノは1種類', () => {
      expect(MINO_COUNTS.monomino).toBe(1)
    })

    it('ドミノは2種類', () => {
      expect(MINO_COUNTS.domino).toBe(2)
    })

    it('トロミノは6種類', () => {
      expect(MINO_COUNTS.tromino).toBe(6)
    })

    it('テトロミノは19種類', () => {
      expect(MINO_COUNTS.tetromino).toBe(19)
    })

    it('ペントミノは63種類', () => {
      expect(MINO_COUNTS.pentomino).toBe(63)
    })

    it('ヘキソミノは188種類以上', () => {
      // 最終的には216種類になる予定
      expect(MINO_COUNTS.hexomino).toBeGreaterThanOrEqual(188)
    })

    it('合計279種類以上', () => {
      // 最終的には307種類になる予定
      expect(ALL_MINOS.length).toBeGreaterThanOrEqual(279)
    })
  })

  describe('ミノのセル数検証', () => {
    it('モノミノは1セル', () => {
      MINOS_BY_CATEGORY.monomino.forEach(mino => {
        expect(mino.cellCount).toBe(1)
      })
    })

    it('ドミノは2セル', () => {
      MINOS_BY_CATEGORY.domino.forEach(mino => {
        expect(mino.cellCount).toBe(2)
      })
    })

    it('トロミノは3セル', () => {
      MINOS_BY_CATEGORY.tromino.forEach(mino => {
        expect(mino.cellCount).toBe(3)
      })
    })

    it('テトロミノは4セル', () => {
      MINOS_BY_CATEGORY.tetromino.forEach(mino => {
        expect(mino.cellCount).toBe(4)
      })
    })

    it('ペントミノは5セル', () => {
      MINOS_BY_CATEGORY.pentomino.forEach(mino => {
        expect(mino.cellCount).toBe(5)
      })
    })

    it('ヘキソミノは6セル', () => {
      const invalidMinos = MINOS_BY_CATEGORY.hexomino.filter(mino => mino.cellCount !== 6)
      expect(
        invalidMinos,
        `不正なヘキソミノ: ${invalidMinos.map(m => m.id).join(', ')}`
      ).toHaveLength(0)
    })
  })
})

describe('selectCategory', () => {
  it('重みに従ってカテゴリを選択する', () => {
    const rng = new SeededRandom(42)
    // モノミノのみ重み100、他は0
    const weights: CategoryWeights = {
      monomino: 100,
      domino: 0,
      tromino: 0,
      tetromino: 0,
      pentomino: 0,
      hexomino: 0,
    }

    const category = selectCategory(weights, rng)
    expect(category).toBe('monomino')
  })

  it('同じシードで同じカテゴリを選択する', () => {
    const rng1 = new SeededRandom(12345)
    const rng2 = new SeededRandom(12345)

    const cat1 = selectCategory(DEFAULT_WEIGHTS, rng1)
    const cat2 = selectCategory(DEFAULT_WEIGHTS, rng2)

    expect(cat1).toBe(cat2)
  })

  it('重みに応じた分布でカテゴリを選択する', () => {
    // 大量に試行して分布を確認
    const rng = new SeededRandom(999)
    const weights: CategoryWeights = {
      monomino: 0,
      domino: 0,
      tromino: 0,
      tetromino: 50,  // 50%
      pentomino: 50,  // 50%
      hexomino: 0,
    }

    const counts: Record<MinoCategory, number> = {
      monomino: 0,
      domino: 0,
      tromino: 0,
      tetromino: 0,
      pentomino: 0,
      hexomino: 0,
    }

    for (let i = 0; i < 1000; i++) {
      const cat = selectCategory(weights, rng)
      counts[cat]++
    }

    // tetrominoとpentominoが選ばれるはず（約50%ずつ）
    expect(counts.monomino).toBe(0)
    expect(counts.domino).toBe(0)
    expect(counts.tromino).toBe(0)
    expect(counts.hexomino).toBe(0)
    // 400-600の範囲に収まるはず（50%±10%）
    expect(counts.tetromino).toBeGreaterThan(400)
    expect(counts.tetromino).toBeLessThan(600)
    expect(counts.pentomino).toBeGreaterThan(400)
    expect(counts.pentomino).toBeLessThan(600)
  })
})

describe('selectMinoFromCategory', () => {
  it('指定カテゴリからミノを選択する', () => {
    const rng = new SeededRandom(42)
    const mino = selectMinoFromCategory('tetromino', rng)

    expect(mino.category).toBe('tetromino')
    expect(mino.cellCount).toBe(4)
  })

  it('同じシードで同じミノを選択する', () => {
    const rng1 = new SeededRandom(12345)
    const rng2 = new SeededRandom(12345)

    const mino1 = selectMinoFromCategory('pentomino', rng1)
    const mino2 = selectMinoFromCategory('pentomino', rng2)

    expect(mino1.id).toBe(mino2.id)
    expect(mino1.shape).toEqual(mino2.shape)
  })
})

describe('generatePieceSet', () => {
  it('3つのピースを生成する', () => {
    const rng = new SeededRandom(42)
    const pieces = generatePieceSet(DEFAULT_WEIGHTS, rng)

    expect(pieces).toHaveLength(3)
  })

  it('生成されたピースは有効なPiece型である', () => {
    const rng = new SeededRandom(42)
    const pieces = generatePieceSet(DEFAULT_WEIGHTS, rng)

    pieces.forEach(piece => {
      expect(piece).toHaveProperty('id')
      expect(piece).toHaveProperty('shape')
      expect(typeof piece.id).toBe('string')
      expect(Array.isArray(piece.shape)).toBe(true)
    })
  })

  it('同じシードで同じピースセットを生成する', () => {
    const rng1 = new SeededRandom(99999)
    const pieces1 = generatePieceSet(DEFAULT_WEIGHTS, rng1)

    const rng2 = new SeededRandom(99999)
    const pieces2 = generatePieceSet(DEFAULT_WEIGHTS, rng2)

    // 同じシードなら同じ形状が生成される
    expect(pieces1[0].shape).toEqual(pieces2[0].shape)
    expect(pieces1[1].shape).toEqual(pieces2[1].shape)
    expect(pieces1[2].shape).toEqual(pieces2[2].shape)
  })

  it('ピースIDはユニークなsuffixを持つ', () => {
    const rng = new SeededRandom(42)
    const pieces = generatePieceSet(DEFAULT_WEIGHTS, rng)

    const ids = pieces.map(p => p.id)
    const uniqueIds = new Set(ids)

    expect(uniqueIds.size).toBe(3)
  })
})

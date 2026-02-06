/**
 * 乱数生成器インターフェース（DI用）
 */
export interface RandomGenerator {
  next(): number  // 0以上1未満の乱数を返す
}

/**
 * シード値対応の乱数生成器（Mulberry32アルゴリズム）
 * 同じシード値で同じ乱数列を生成する
 */
export class SeededRandom implements RandomGenerator {
  private state: number

  constructor(seed: number) {
    this.state = seed
  }

  next(): number {
    // Mulberry32アルゴリズム
    let t = (this.state += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * デフォルトの乱数生成器（Math.randomのラッパー）
 */
export class DefaultRandom implements RandomGenerator {
  next(): number {
    return Math.random()
  }
}

import { CategoryWeights, MinoCategory, MinoDefinition, Piece, RandomGenerator } from './types'
import { MINOS_BY_CATEGORY } from './minoDefinitions'

/**
 * デフォルトのカテゴリ重み
 * ゲームバランスに応じて調整可能
 */
export const DEFAULT_WEIGHTS: CategoryWeights = {
  monomino: 5,
  domino: 10,
  tromino: 20,
  tetromino: 30,
  pentomino: 25,
  hexomino: 10,
}

/**
 * カテゴリの順序（重み計算用）
 */
const CATEGORY_ORDER: MinoCategory[] = [
  'monomino',
  'domino',
  'tromino',
  'tetromino',
  'pentomino',
  'hexomino',
]

/**
 * 重みに従ってカテゴリを選択する
 */
export function selectCategory(weights: CategoryWeights, rng: RandomGenerator): MinoCategory {
  const totalWeight = CATEGORY_ORDER.reduce((sum, cat) => sum + weights[cat], 0)

  if (totalWeight === 0) {
    throw new Error('全ての重みが0です')
  }

  const random = rng.next() * totalWeight
  let cumulative = 0

  for (const category of CATEGORY_ORDER) {
    cumulative += weights[category]
    if (random < cumulative) {
      return category
    }
  }

  // フォールバック（通常到達しない）
  return CATEGORY_ORDER[CATEGORY_ORDER.length - 1]
}

/**
 * 指定カテゴリからランダムにミノを選択する
 */
export function selectMinoFromCategory(category: MinoCategory, rng: RandomGenerator): MinoDefinition {
  const minos = MINOS_BY_CATEGORY[category]

  if (minos.length === 0) {
    throw new Error(`カテゴリ ${category} にミノがありません`)
  }

  const index = Math.floor(rng.next() * minos.length)
  return minos[index]
}

/**
 * ミノ定義からPieceを生成する
 * ユニークIDはタイムスタンプ + 乱数で生成（純粋関数ではないがimmutable）
 */
function minoToPiece(mino: MinoDefinition): Piece {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  return {
    id: `${mino.id}-${uniqueSuffix}`,
    shape: mino.shape,
  }
}

/**
 * 3つのピースセットを生成する
 */
export function generatePieceSet(weights: CategoryWeights, rng: RandomGenerator): Piece[] {
  const pieces: Piece[] = []

  for (let i = 0; i < 3; i++) {
    const category = selectCategory(weights, rng)
    const mino = selectMinoFromCategory(category, rng)
    const piece = minoToPiece(mino)
    pieces.push(piece)
  }

  return pieces
}


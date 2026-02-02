import { MinoDefinition, MinoCategory, PieceShape } from './types'

/**
 * 全ミノ定義（向き考慮）
 *
 * カテゴリ別のミノ数:
 * - モノミノ: 1種類 (1セル)
 * - ドミノ: 2種類 (2セル、縦横)
 * - トロミノ: 6種類 (3セル、I型2向き + L型4向き)
 * - テトロミノ: 19種類 (4セル)
 * - ペントミノ: 63種類 (5セル)
 * - ヘキソミノ: 216種類 (6セル、35基本形 x 回転・反転)
 * 合計: 307種類
 *
 * ヘキソミノの色分け（hexomino.md参照）:
 * - 紫(2回転): I6, O6 → 2種 x 2 = 4
 * - 赤(4回転): R1〜R6 → 6種 x 4 = 24
 * - 青(2回転x2反転): B1〜B5 → 5種 x 4 = 20
 * - 緑(4回転): G1, G2 → 2種 x 4 = 8
 * - 黒(4回転x2反転): K1〜K20 → 20種 x 8 = 160
 * 合計: 4 + 24 + 20 + 8 + 160 = 216
 */

/**
 * ASCII アート文字列から PieceShape に変換
 * '#' = true（ブロックあり）
 * '.' = false（ブロックなし）
 *
 * 各行の長さが異なる場合、最大幅に合わせてfalseでパディングする
 */
function shape(ascii: string): PieceShape {
  const rows = ascii
    .trim()
    .split('\n')
    .map(row => row.trim())
    .filter(row => row.length > 0)

  // 最大幅を求める
  const maxWidth = Math.max(...rows.map(row => row.length))

  // 各行をboolean配列に変換し、最大幅に合わせてパディング
  return rows.map(row => {
    const boolRow = [...row].map(char => char === '#')
    // 足りない分をfalseでパディング
    while (boolRow.length < maxWidth) {
      boolRow.push(false)
    }
    return boolRow
  })
}

// ヘルパー関数: 形状からセル数を計算
function countCells(s: PieceShape): number {
  return s.reduce((sum, row) => sum + row.filter(Boolean).length, 0)
}

// ヘルパー関数: ミノ定義を作成
function createMino(id: string, category: MinoCategory, s: PieceShape): MinoDefinition {
  return {
    id,
    category,
    shape: s,
    cellCount: countCells(s),
  }
}

// =========================================
// モノミノ (1種類)
// =========================================
const MONOMINOS: MinoDefinition[] = [
  createMino('mono-1', 'monomino', shape(`#`)),
]

// =========================================
// ドミノ (2種類)
// =========================================
const DOMINOS: MinoDefinition[] = [
  createMino('dom-h', 'domino', shape(`##`)),
  createMino('dom-v', 'domino', shape(`
    #
    #
  `)),
]

// =========================================
// トロミノ (6種類)
// =========================================
const TROMINOS: MinoDefinition[] = [
  createMino('tro-i-h', 'tromino', shape(`###`)),
  createMino('tro-i-v', 'tromino', shape(`
    #
    #
    #
  `)),
  createMino('tro-l-0', 'tromino', shape(`
    #.
    ##
  `)),
  createMino('tro-l-90', 'tromino', shape(`
    ##
    #.
  `)),
  createMino('tro-l-180', 'tromino', shape(`
    ##
    .#
  `)),
  createMino('tro-l-270', 'tromino', shape(`
    .#
    ##
  `)),
]

// =========================================
// テトロミノ (19種類)
// =========================================
const TETROMINOS: MinoDefinition[] = [
  createMino('tet-i-h', 'tetromino', shape(`####`)),
  createMino('tet-i-v', 'tetromino', shape(`
    #
    #
    #
    #
  `)),
  createMino('tet-o', 'tetromino', shape(`
    ##
    ##
  `)),
  createMino('tet-t-0', 'tetromino', shape(`
    ###
    .#.
  `)),
  createMino('tet-t-90', 'tetromino', shape(`
    .#
    ##
    .#
  `)),
  createMino('tet-t-180', 'tetromino', shape(`
    .#.
    ###
  `)),
  createMino('tet-t-270', 'tetromino', shape(`
    #.
    ##
    #.
  `)),
  createMino('tet-s-h', 'tetromino', shape(`
    .##
    ##.
  `)),
  createMino('tet-s-v', 'tetromino', shape(`
    #.
    ##
    .#
  `)),
  createMino('tet-z-h', 'tetromino', shape(`
    ##.
    .##
  `)),
  createMino('tet-z-v', 'tetromino', shape(`
    .#
    ##
    #.
  `)),
  createMino('tet-j-0', 'tetromino', shape(`
    #..
    ###
  `)),
  createMino('tet-j-90', 'tetromino', shape(`
    ##
    #.
    #.
  `)),
  createMino('tet-j-180', 'tetromino', shape(`
    ###
    ..#
  `)),
  createMino('tet-j-270', 'tetromino', shape(`
    .#
    .#
    ##
  `)),
  createMino('tet-l-0', 'tetromino', shape(`
    ..#
    ###
  `)),
  createMino('tet-l-90', 'tetromino', shape(`
    #.
    #.
    ##
  `)),
  createMino('tet-l-180', 'tetromino', shape(`
    ###
    #..
  `)),
  createMino('tet-l-270', 'tetromino', shape(`
    ##
    .#
    .#
  `)),
]

// =========================================
// ペントミノ (63種類)
// =========================================
const PENTOMINOS: MinoDefinition[] = [
  // F型 (8向き)
  createMino('pent-f-0', 'pentomino', shape(`
    .##
    ##.
    .#.
  `)),
  createMino('pent-f-90', 'pentomino', shape(`
    #..
    ###
    .#.
  `)),
  createMino('pent-f-180', 'pentomino', shape(`
    .#.
    .##
    ##.
  `)),
  createMino('pent-f-270', 'pentomino', shape(`
    .#.
    ###
    ..#
  `)),
  createMino('pent-f-m0', 'pentomino', shape(`
    ##.
    .##
    .#.
  `)),
  createMino('pent-f-m90', 'pentomino', shape(`
    .#.
    ###
    #..
  `)),
  createMino('pent-f-m180', 'pentomino', shape(`
    .#.
    ##.
    .##
  `)),
  createMino('pent-f-m270', 'pentomino', shape(`
    ..#
    ###
    .#.
  `)),
  // I型 (2向き)
  createMino('pent-i-h', 'pentomino', shape(`#####`)),
  createMino('pent-i-v', 'pentomino', shape(`
    #
    #
    #
    #
    #
  `)),
  // L型 (8向き)
  createMino('pent-l-0', 'pentomino', shape(`
    #.
    #.
    #.
    ##
  `)),
  createMino('pent-l-90', 'pentomino', shape(`
    ####
    #...
  `)),
  createMino('pent-l-180', 'pentomino', shape(`
    ##
    .#
    .#
    .#
  `)),
  createMino('pent-l-270', 'pentomino', shape(`
    ...#
    ####
  `)),
  createMino('pent-l-m0', 'pentomino', shape(`
    .#
    .#
    .#
    ##
  `)),
  createMino('pent-l-m90', 'pentomino', shape(`
    #...
    ####
  `)),
  createMino('pent-l-m180', 'pentomino', shape(`
    ##
    #.
    #.
    #.
  `)),
  createMino('pent-l-m270', 'pentomino', shape(`
    ####
    ...#
  `)),
  // N型 (8向き)
  createMino('pent-n-0', 'pentomino', shape(`
    .#
    ##
    #.
    #.
  `)),
  createMino('pent-n-90', 'pentomino', shape(`
    ##..
    .###
  `)),
  createMino('pent-n-180', 'pentomino', shape(`
    .#
    .#
    ##
    #.
  `)),
  createMino('pent-n-270', 'pentomino', shape(`
    ###.
    ..##
  `)),
  createMino('pent-n-m0', 'pentomino', shape(`
    #.
    ##
    .#
    .#
  `)),
  createMino('pent-n-m90', 'pentomino', shape(`
    .###
    ##..
  `)),
  createMino('pent-n-m180', 'pentomino', shape(`
    #.
    #.
    ##
    .#
  `)),
  createMino('pent-n-m270', 'pentomino', shape(`
    ..##
    ###.
  `)),
  // P型 (8向き)
  createMino('pent-p-0', 'pentomino', shape(`
    ##
    ##
    #.
  `)),
  createMino('pent-p-90', 'pentomino', shape(`
    ###
    .##
  `)),
  createMino('pent-p-180', 'pentomino', shape(`
    .#
    ##
    ##
  `)),
  createMino('pent-p-270', 'pentomino', shape(`
    ##.
    ###
  `)),
  createMino('pent-p-m0', 'pentomino', shape(`
    ##
    ##
    .#
  `)),
  createMino('pent-p-m90', 'pentomino', shape(`
    .##
    ###
  `)),
  createMino('pent-p-m180', 'pentomino', shape(`
    #.
    ##
    ##
  `)),
  createMino('pent-p-m270', 'pentomino', shape(`
    ###
    ##.
  `)),
  // T型 (4向き)
  createMino('pent-t-0', 'pentomino', shape(`
    ###
    .#.
    .#.
  `)),
  createMino('pent-t-90', 'pentomino', shape(`
    ..#
    ###
    ..#
  `)),
  createMino('pent-t-180', 'pentomino', shape(`
    .#.
    .#.
    ###
  `)),
  createMino('pent-t-270', 'pentomino', shape(`
    #..
    ###
    #..
  `)),
  // U型 (4向き)
  createMino('pent-u-0', 'pentomino', shape(`
    #.#
    ###
  `)),
  createMino('pent-u-90', 'pentomino', shape(`
    ##
    #.
    ##
  `)),
  createMino('pent-u-180', 'pentomino', shape(`
    ###
    #.#
  `)),
  createMino('pent-u-270', 'pentomino', shape(`
    ##
    .#
    ##
  `)),
  // V型 (4向き)
  createMino('pent-v-0', 'pentomino', shape(`
    #..
    #..
    ###
  `)),
  createMino('pent-v-90', 'pentomino', shape(`
    ###
    #..
    #..
  `)),
  createMino('pent-v-180', 'pentomino', shape(`
    ###
    ..#
    ..#
  `)),
  createMino('pent-v-270', 'pentomino', shape(`
    ..#
    ..#
    ###
  `)),
  // W型 (4向き)
  createMino('pent-w-0', 'pentomino', shape(`
    #..
    ##.
    .##
  `)),
  createMino('pent-w-90', 'pentomino', shape(`
    .##
    ##.
    #..
  `)),
  createMino('pent-w-180', 'pentomino', shape(`
    ##.
    .##
    ..#
  `)),
  createMino('pent-w-270', 'pentomino', shape(`
    ..#
    .##
    ##.
  `)),
  // X型 (1向き)
  createMino('pent-x', 'pentomino', shape(`
    .#.
    ###
    .#.
  `)),
  // Y型 (8向き)
  createMino('pent-y-0', 'pentomino', shape(`
    .#
    ##
    .#
    .#
  `)),
  createMino('pent-y-90', 'pentomino', shape(`
    ..#.
    ####
  `)),
  createMino('pent-y-180', 'pentomino', shape(`
    #.
    #.
    ##
    #.
  `)),
  createMino('pent-y-270', 'pentomino', shape(`
    ####
    .#..
  `)),
  createMino('pent-y-m0', 'pentomino', shape(`
    #.
    ##
    #.
    #.
  `)),
  createMino('pent-y-m90', 'pentomino', shape(`
    ####
    ..#.
  `)),
  createMino('pent-y-m180', 'pentomino', shape(`
    .#
    .#
    ##
    .#
  `)),
  createMino('pent-y-m270', 'pentomino', shape(`
    .#..
    ####
  `)),
  // Z型 (4向き)
  createMino('pent-z-0', 'pentomino', shape(`
    ##.
    .#.
    .##
  `)),
  createMino('pent-z-90', 'pentomino', shape(`
    ..#
    ###
    #..
  `)),
  createMino('pent-z-m0', 'pentomino', shape(`
    .##
    .#.
    ##.
  `)),
  createMino('pent-z-m90', 'pentomino', shape(`
    #..
    ###
    ..#
  `)),
]

// =========================================
// ヘキソミノ (216種類)
// hexomino.mdの35種類の基本形状 x 回転・反転
// =========================================

// 回転（時計回り90度）
function rotate90(s: PieceShape): PieceShape {
  const rows = s.length
  const cols = s[0].length
  const result: PieceShape = []
  for (let c = 0; c < cols; c++) {
    const newRow: boolean[] = []
    for (let r = rows - 1; r >= 0; r--) {
      newRow.push(s[r][c])
    }
    result.push(newRow)
  }
  return result
}

// 左右反転
function flipH(s: PieceShape): PieceShape {
  return s.map(row => [...row].reverse())
}

// 4回転を生成（0°, 90°, 180°, 270°）
function rotations4(base: PieceShape): PieceShape[] {
  const r0 = base
  const r90 = rotate90(r0)
  const r180 = rotate90(r90)
  const r270 = rotate90(r180)
  return [r0, r90, r180, r270]
}

// 2回転を生成（0°, 90°）
function rotations2(base: PieceShape): PieceShape[] {
  return [base, rotate90(base)]
}

// 8向きを生成（4回転 + 反転4回転）
function orientations8(base: PieceShape): PieceShape[] {
  const normal = rotations4(base)
  const flipped = rotations4(flipH(base))
  return [...normal, ...flipped]
}

// 4向きを生成（2回転 + 反転2回転）
function orientations4flip(base: PieceShape): PieceShape[] {
  const normal = rotations2(base)
  const flipped = rotations2(flipH(base))
  return [...normal, ...flipped]
}

// ミノ配列を作成するヘルパー
function createHexMinos(
  baseName: string,
  baseShape: PieceShape,
  orientationType: '2rot' | '4rot' | '4flip' | '8'
): MinoDefinition[] {
  let shapes: PieceShape[]
  let suffixes: string[]

  switch (orientationType) {
    case '2rot':
      shapes = rotations2(baseShape)
      suffixes = ['0', '90']
      break
    case '4rot':
      shapes = rotations4(baseShape)
      suffixes = ['0', '90', '180', '270']
      break
    case '4flip':
      shapes = orientations4flip(baseShape)
      suffixes = ['0', '90', 'm0', 'm90']
      break
    case '8':
      shapes = orientations8(baseShape)
      suffixes = ['0', '90', '180', '270', 'm0', 'm90', 'm180', 'm270']
      break
  }

  return shapes.map((s, i) =>
    createMino(`hex-${baseName}-${suffixes[i]}`, 'hexomino', s)
  )
}

// ===== 紫 (2種 × 2回転 = 4) =====
const HEX_PURPLE: MinoDefinition[] = [
  // I6 (横棒)
  ...createHexMinos('I6', shape(`######`), '2rot'),
  // O6 (2×3長方形)
  ...createHexMinos('O6', shape(`
    ###
    ###
  `), '2rot'),
]

// ===== 赤 (6種 × 4回転 = 24) =====
const HEX_RED: MinoDefinition[] = [
  // R1 (T型ブリッジ)
  ...createHexMinos('R1', shape(`
    .#
    .#
    ##
    .#
    .#
  `), '4rot'),
  // R2 (C型)
  ...createHexMinos('R2', shape(`
    ##
    #.
    #.
    ##
  `), '4rot'),
  // R3 (T型)
  ...createHexMinos('R3', shape(`
    ###
    .#.
    .#.
    .#.
  `), '4rot'),
  // R4 (十字型)
  ...createHexMinos('R4', shape(`
    .#.
    ###
    .#.
    .#.
  `), '4rot'),
  // R5 (凸型)
  ...createHexMinos('R5', shape(`
    .##.
    ####
  `), '4rot'),
  // R6 (飛行機型)
  ...createHexMinos('R6', shape(`
    .#.
    ###
    #.#
  `), '4rot'),
]

// ===== 青 (5種 × 2回転 × 2反転 = 20) =====
const HEX_BLUE: MinoDefinition[] = [
  // B1 (十字変形)
  ...createHexMinos('B1', shape(`
    .#.
    ##.
    .##
    .#.
  `), '4flip'),
  // B2 (Z型)
  ...createHexMinos('B2', shape(`
    #.
    #.
    ##
    .#
    .#
  `), '4flip'),
  // B3 (Z2型)
  ...createHexMinos('B3', shape(`
    .#
    ##
    ##
    #.
  `), '4flip'),
  // B4 (Z階段)
  ...createHexMinos('B4', shape(`
    #..
    ##.
    .#.
    .##
  `), '4flip'),
  // B5 (2階段)
  ...createHexMinos('B5', shape(`
    ##.
    .#.
    .#.
    .##
  `), '4flip'),
]

// ===== 緑 (2種 × 4回転 = 8) =====
const HEX_GREEN: MinoDefinition[] = [
  // G1 (階段型)
  ...createHexMinos('G1', shape(`
    ..#
    .##
    ###
  `), '4rot'),
  // G2 (ミジンコ型)
  ...createHexMinos('G2', shape(`
    .#.
    ###
    .##
  `), '4rot'),
]

// ===== 黒 (20種 × 4回転 × 2反転 = 160) =====
const HEX_BLACK: MinoDefinition[] = [
  // K1 (L型)
  ...createHexMinos('K1', shape(`
    ....#
    #####
  `), '8'),
  // K2 (電柱型)
  ...createHexMinos('K2', shape(`
    ...#.
    #####
  `), '8'),
  // K3 (歯ブラシ型)
  ...createHexMinos('K3', shape(`
    ..##
    ####
  `), '8'),
  // K4 (F型)
  ...createHexMinos('K4', shape(`
    .#.#
    ####
  `), '8'),
  // K5 (L型2)
  ...createHexMinos('K5', shape(`
    ...#
    ...#
    ####
  `), '8'),
  // K6 (L変形)
  ...createHexMinos('K6', shape(`
    ..#.
    ..#.
    ####
  `), '8'),
  // K7 (T変形型)
  ...createHexMinos('K7', shape(`
    ..#.
    ####
    ...#
  `), '8'),
  // K8 (T変形型2)
  ...createHexMinos('K8', shape(`
    .#..
    ####
    ...#
  `), '8'),
  // K9 (スネーク型)
  ...createHexMinos('K9', shape(`
    ...##
    ####.
  `), '8'),
  // K10 (アヒル)
  ...createHexMinos('K10', shape(`
    .#.
    ##.
    .###
  `), '8'),
  // K11 (鈎型)
  ...createHexMinos('K11', shape(`
    ##.#
    .###
  `), '8'),
  // K12 (鼻高アヒル型)
  ...createHexMinos('K12', shape(`
    ..#.
    ###.
    ..##
  `), '8'),
  // K13 (つのありスネーク型)
  ...createHexMinos('K13', shape(`
    .#..
    ###.
    ..##
  `), '8'),
  // K14 (立ちスネーク型)
  ...createHexMinos('K14', shape(`
    ##..
    .#..
    .###
  `), '8'),
  // K15 (W型)
  ...createHexMinos('K15', shape(`
    #...
    ##..
    .###
  `), '8'),
  // K16 (C型変形)
  ...createHexMinos('K16', shape(`
    .##
    ..#
    ###
  `), '8'),
  // K17 (階段型2)
  ...createHexMinos('K17', shape(`
    ##..
    .###
    ...#
  `), '8'),
  // K18 (犬型)
  ...createHexMinos('K18', shape(`
    ..#
    ###
    .##
  `), '8'),
  // K19 (錠型)
  ...createHexMinos('K19', shape(`
    ##.
    .##
    .##
  `), '8'),
  // K20 (椅子型)
  ...createHexMinos('K20', shape(`
    ..#
    ###
    #.#
  `), '8'),
]

const HEXOMINOS: MinoDefinition[] = [
  ...HEX_PURPLE,  // 4
  ...HEX_RED,     // 24
  ...HEX_BLUE,    // 20
  ...HEX_GREEN,   // 8
  ...HEX_BLACK,   // 160
  // 合計: 216
]

// カテゴリ別ミノ配列
export const MINOS_BY_CATEGORY: Record<MinoCategory, MinoDefinition[]> = {
  monomino: MONOMINOS,
  domino: DOMINOS,
  tromino: TROMINOS,
  tetromino: TETROMINOS,
  pentomino: PENTOMINOS,
  hexomino: HEXOMINOS,
}

// 全ミノ配列
export const ALL_MINOS: MinoDefinition[] = [
  ...MONOMINOS,
  ...DOMINOS,
  ...TROMINOS,
  ...TETROMINOS,
  ...PENTOMINOS,
  ...HEXOMINOS,
]

// カテゴリ別ミノ数（検証用）
export const MINO_COUNTS: Record<MinoCategory, number> = {
  monomino: MONOMINOS.length,
  domino: DOMINOS.length,
  tromino: TROMINOS.length,
  tetromino: TETROMINOS.length,
  pentomino: PENTOMINOS.length,
  hexomino: HEXOMINOS.length,
}

// IDをキーとするMapを作成してO(1)検索を実現
const MINO_BY_ID_MAP = new Map<string, MinoDefinition>(
  ALL_MINOS.map(mino => [mino.id, mino])
)

/**
 * IDでミノ定義を取得する
 */
export function getMinoById(id: string): MinoDefinition | undefined {
  return MINO_BY_ID_MAP.get(id)
}

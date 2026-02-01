import { MinoDefinition, MinoCategory, PieceShape } from './types'

/**
 * 全307種類のミノ定義（向き考慮）
 *
 * カテゴリ別のミノ数:
 * - モノミノ: 1種類 (1セル)
 * - ドミノ: 2種類 (2セル、縦横)
 * - トロミノ: 6種類 (3セル、I型2向き + L型4向き)
 * - テトロミノ: 19種類 (4セル)
 * - ペントミノ: 63種類 (5セル)
 * - ヘキソミノ: 216種類 (6セル)
 * 合計: 307種類
 */

/**
 * ASCII アート文字列から PieceShape に変換
 * '#' = true（ブロックあり）
 * '.' = false（ブロックなし）
 */
function shape(ascii: string): PieceShape {
  return ascii
    .trim()
    .split('\n')
    .map(row => row.trim())
    .filter(row => row.length > 0)
    .map(row => [...row].map(char => char === '#'))
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
  // 横
  createMino('dom-h', 'domino', shape(`##`)),
  // 縦
  createMino('dom-v', 'domino', shape(`
    #
    #
  `)),
]

// =========================================
// トロミノ (6種類)
// =========================================
const TROMINOS: MinoDefinition[] = [
  // I型 (2向き)
  createMino('tro-i-h', 'tromino', shape(`###`)),
  createMino('tro-i-v', 'tromino', shape(`
    #
    #
    #
  `)),
  // L型 (4向き)
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
  // I型 (2向き)
  createMino('tet-i-h', 'tetromino', shape(`####`)),
  createMino('tet-i-v', 'tetromino', shape(`
    #
    #
    #
    #
  `)),
  // O型 (1向き)
  createMino('tet-o', 'tetromino', shape(`
    ##
    ##
  `)),
  // T型 (4向き)
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
  // S型 (2向き)
  createMino('tet-s-h', 'tetromino', shape(`
    .##
    ##.
  `)),
  createMino('tet-s-v', 'tetromino', shape(`
    #.
    ##
    .#
  `)),
  // Z型 (2向き)
  createMino('tet-z-h', 'tetromino', shape(`
    ##.
    .##
  `)),
  createMino('tet-z-v', 'tetromino', shape(`
    .#
    ##
    #.
  `)),
  // J型 (4向き)
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
  // L型 (4向き)
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
// 12種類の形状 x 回転・反転
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
    ##.
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
// 35種類の形状 x 回転・反転
// =========================================
const HEXOMINOS: MinoDefinition[] = [
  // ===== 1. I型 (2向き) =====
  createMino('hex-i-h', 'hexomino', shape(`######`)),
  createMino('hex-i-v', 'hexomino', shape(`
    #
    #
    #
    #
    #
    #
  `)),

  // ===== 2. 2x3長方形型 (2向き) =====
  createMino('hex-rect-0', 'hexomino', shape(`
    ###
    ###
  `)),
  createMino('hex-rect-90', 'hexomino', shape(`
    ##
    ##
    ##
  `)),

  // ===== 3. L5型 (8向き) =====
  createMino('hex-l5-0', 'hexomino', shape(`
    #.
    #.
    #.
    #.
    ##
  `)),
  createMino('hex-l5-90', 'hexomino', shape(`
    #####
    #....
  `)),
  createMino('hex-l5-180', 'hexomino', shape(`
    ##
    .#
    .#
    .#
    .#
  `)),
  createMino('hex-l5-270', 'hexomino', shape(`
    ....#
    #####
  `)),
  createMino('hex-l5-m0', 'hexomino', shape(`
    .#
    .#
    .#
    .#
    ##
  `)),
  createMino('hex-l5-m90', 'hexomino', shape(`
    #....
    #####
  `)),
  createMino('hex-l5-m180', 'hexomino', shape(`
    ##
    #.
    #.
    #.
    #.
  `)),
  createMino('hex-l5-m270', 'hexomino', shape(`
    #####
    ....#
  `)),

  // ===== 4. J5型 (8向き) =====
  createMino('hex-j5-0', 'hexomino', shape(`
    #.
    #.
    #.
    ##
    #.
  `)),
  createMino('hex-j5-90', 'hexomino', shape(`
    #####
    .#...
  `)),
  createMino('hex-j5-180', 'hexomino', shape(`
    .#
    ##
    .#
    .#
    .#
  `)),
  createMino('hex-j5-270', 'hexomino', shape(`
    ..#..
    #####
  `)),
  createMino('hex-j5-m0', 'hexomino', shape(`
    .#
    .#
    .#
    ##
    .#
  `)),
  createMino('hex-j5-m90', 'hexomino', shape(`
    .#...
    #####
  `)),
  createMino('hex-j5-m180', 'hexomino', shape(`
    #.
    ##
    #.
    #.
    #.
  `)),
  createMino('hex-j5-m270', 'hexomino', shape(`
    #####
    ..#..
  `)),

  // ===== 5. T5型 (4向き) =====
  createMino('hex-t5-0', 'hexomino', shape(`
    #####
    ..#..
  `)),
  createMino('hex-t5-90', 'hexomino', shape(`
    .#
    .#
    ##
    .#
    .#
  `)),
  createMino('hex-t5-180', 'hexomino', shape(`
    ..#..
    #####
  `)),
  createMino('hex-t5-270', 'hexomino', shape(`
    #.
    #.
    ##
    #.
    #.
  `)),

  // ===== 6. Y5型 (8向き) =====
  createMino('hex-y5-0', 'hexomino', shape(`
    #####
    .#...
  `)),
  createMino('hex-y5-90', 'hexomino', shape(`
    .#
    ##
    .#
    .#
    .#
  `)),
  createMino('hex-y5-180', 'hexomino', shape(`
    ...#.
    #####
  `)),
  createMino('hex-y5-270', 'hexomino', shape(`
    #.
    #.
    #.
    ##
    #.
  `)),
  createMino('hex-y5-m0', 'hexomino', shape(`
    .#...
    #####
  `)),
  createMino('hex-y5-m90', 'hexomino', shape(`
    #.
    ##
    #.
    #.
    #.
  `)),
  createMino('hex-y5-m180', 'hexomino', shape(`
    #####
    ...#.
  `)),
  createMino('hex-y5-m270', 'hexomino', shape(`
    .#
    .#
    .#
    ##
    .#
  `)),

  // ===== 7. S4型 (4向き) =====
  createMino('hex-s4-0', 'hexomino', shape(`
    .##
    .#.
    ##.
    #..
  `)),
  createMino('hex-s4-90', 'hexomino', shape(`
    ##..
    .#..
    .###
  `)),
  createMino('hex-s4-180', 'hexomino', shape(`
    ..#
    .##
    .#.
    ##.
  `)),
  createMino('hex-s4-270', 'hexomino', shape(`
    ###.
    ..#.
    ..##
  `)),

  // ===== 8. Z4型 (4向き) =====
  createMino('hex-z4-0', 'hexomino', shape(`
    ##.
    .#.
    .##
    ..#
  `)),
  createMino('hex-z4-90', 'hexomino', shape(`
    ..##
    ..#.
    ###.
  `)),
  createMino('hex-z4-180', 'hexomino', shape(`
    #..
    ##.
    .#.
    .##
  `)),
  createMino('hex-z4-270', 'hexomino', shape(`
    .###
    .#..
    ##..
  `)),

  // ===== 9. N4型 (8向き) =====
  createMino('hex-n4-0', 'hexomino', shape(`
    .#
    .#
    ##
    #.
    #.
  `)),
  createMino('hex-n4-90', 'hexomino', shape(`
    ###..
    ..###
  `)),
  createMino('hex-n4-180', 'hexomino', shape(`
    .#
    .#
    ##
    #.
    #.
  `)),
  createMino('hex-n4-270', 'hexomino', shape(`
    ###..
    ..###
  `)),
  createMino('hex-n4-m0', 'hexomino', shape(`
    #.
    #.
    ##
    .#
    .#
  `)),
  createMino('hex-n4-m90', 'hexomino', shape(`
    ..###
    ###..
  `)),
  createMino('hex-n4-m180', 'hexomino', shape(`
    #.
    #.
    ##
    .#
    .#
  `)),
  createMino('hex-n4-m270', 'hexomino', shape(`
    ..###
    ###..
  `)),

  // ===== 10. W4型 (4向き) =====
  createMino('hex-w4-0', 'hexomino', shape(`
    #..
    ##.
    .##
    ..#
  `)),
  createMino('hex-w4-90', 'hexomino', shape(`
    ..##
    .##.
    ##..
  `)),
  createMino('hex-w4-180', 'hexomino', shape(`
    #..
    ##.
    .##
    ..#
  `)),
  createMino('hex-w4-270', 'hexomino', shape(`
    ..##
    .##.
    ##..
  `)),

  // ===== 11. P5型 (8向き) =====
  createMino('hex-p5-0', 'hexomino', shape(`
    ##
    ##
    #.
    #.
  `)),
  createMino('hex-p5-90', 'hexomino', shape(`
    ####
    ..##
  `)),
  createMino('hex-p5-180', 'hexomino', shape(`
    .#
    .#
    ##
    ##
  `)),
  createMino('hex-p5-270', 'hexomino', shape(`
    ##..
    ####
  `)),
  createMino('hex-p5-m0', 'hexomino', shape(`
    ##
    ##
    .#
    .#
  `)),
  createMino('hex-p5-m90', 'hexomino', shape(`
    ..##
    ####
  `)),
  createMino('hex-p5-m180', 'hexomino', shape(`
    #.
    #.
    ##
    ##
  `)),
  createMino('hex-p5-m270', 'hexomino', shape(`
    ####
    ##..
  `)),

  // ===== 12. Q5型 (8向き) =====
  createMino('hex-q5-0', 'hexomino', shape(`
    ##
    ##
    #.
    #.
  `)),
  createMino('hex-q5-90', 'hexomino', shape(`
    ####
    ..##
  `)),
  createMino('hex-q5-180', 'hexomino', shape(`
    .#
    .#
    ##
    ##
  `)),
  createMino('hex-q5-270', 'hexomino', shape(`
    ##..
    ####
  `)),
  createMino('hex-q5-m0', 'hexomino', shape(`
    ##
    ##
    .#
    .#
  `)),
  createMino('hex-q5-m90', 'hexomino', shape(`
    ..##
    ####
  `)),
  createMino('hex-q5-m180', 'hexomino', shape(`
    #.
    #.
    ##
    ##
  `)),
  createMino('hex-q5-m270', 'hexomino', shape(`
    ####
    ##..
  `)),

  // ===== 13. U6型 (4向き) - コの字型6セル =====
  createMino('hex-u6-0', 'hexomino', shape(`
    ##
    #.
    ##
    #.
  `)),
  createMino('hex-u6-90', 'hexomino', shape(`
    ####
    #..#
  `)),
  createMino('hex-u6-180', 'hexomino', shape(`
    .#
    ##
    .#
    ##
  `)),
  createMino('hex-u6-270', 'hexomino', shape(`
    #..#
    ####
  `)),

  // ===== 14. C型 (4向き) - C字型6セル =====
  createMino('hex-c-0', 'hexomino', shape(`
    ##
    #.
    #.
    ##
  `)),
  createMino('hex-c-90', 'hexomino', shape(`
    ####
    #..#
  `)),
  createMino('hex-c-180', 'hexomino', shape(`
    ##
    .#
    .#
    ##
  `)),
  createMino('hex-c-270', 'hexomino', shape(`
    #..#
    ####
  `)),

  // ===== 15. O5型 (1向き) =====
  createMino('hex-o5', 'hexomino', shape(`
    .##
    ##.
    ##.
  `)),

  // ===== 16. 階段型A (4向き) =====
  createMino('hex-stair-a-0', 'hexomino', shape(`
    #..
    ##.
    .##
    ..#
  `)),
  createMino('hex-stair-a-90', 'hexomino', shape(`
    ..##
    ###.
    #...
  `)),
  createMino('hex-stair-a-180', 'hexomino', shape(`
    #..
    ##.
    .##
    ..#
  `)),
  createMino('hex-stair-a-270', 'hexomino', shape(`
    ...#
    .###
    ##..
  `)),

  // ===== 17. 階段型B (4向き) =====
  createMino('hex-stair-b-0', 'hexomino', shape(`
    ..#
    .##
    ##.
    #..
  `)),
  createMino('hex-stair-b-90', 'hexomino', shape(`
    #...
    ###.
    ..##
  `)),
  createMino('hex-stair-b-180', 'hexomino', shape(`
    ..#
    .##
    ##.
    #..
  `)),
  createMino('hex-stair-b-270', 'hexomino', shape(`
    ##..
    .###
    ...#
  `)),

  // ===== 18. F5型 (8向き) =====
  createMino('hex-f5-0', 'hexomino', shape(`
    .##
    ##.
    .#.
    .#.
  `)),
  createMino('hex-f5-90', 'hexomino', shape(`
    #...
    ####
    .#..
  `)),
  createMino('hex-f5-180', 'hexomino', shape(`
    .#.
    .#.
    .##
    ##.
  `)),
  createMino('hex-f5-270', 'hexomino', shape(`
    ..#.
    ####
    ...#
  `)),
  createMino('hex-f5-m0', 'hexomino', shape(`
    ##.
    .##
    .#.
    .#.
  `)),
  createMino('hex-f5-m90', 'hexomino', shape(`
    .#..
    ####
    #...
  `)),
  createMino('hex-f5-m180', 'hexomino', shape(`
    .#.
    .#.
    ##.
    .##
  `)),
  createMino('hex-f5-m270', 'hexomino', shape(`
    ...#
    ####
    ..#.
  `)),

  // ===== 19. V5型 (4向き) =====
  createMino('hex-v5-0', 'hexomino', shape(`
    #..
    #..
    #..
    ###
  `)),
  createMino('hex-v5-90', 'hexomino', shape(`
    ####
    #...
    #...
  `)),
  createMino('hex-v5-180', 'hexomino', shape(`
    ###
    ..#
    ..#
    ..#
  `)),
  createMino('hex-v5-270', 'hexomino', shape(`
    ..#
    ..#
    ####
  `)),

  // ===== 20. H型 (2向き) =====
  createMino('hex-h-0', 'hexomino', shape(`
    #.#
    ###
    #..
  `)),
  createMino('hex-h-90', 'hexomino', shape(`
    ###
    .#.
    .##
  `)),

  // ===== 21. 十字5型 (4向き) =====
  createMino('hex-cross5-0', 'hexomino', shape(`
    .#.
    ###
    .#.
    .#.
  `)),
  createMino('hex-cross5-90', 'hexomino', shape(`
    .#..
    ####
    .#..
  `)),
  createMino('hex-cross5-180', 'hexomino', shape(`
    .#.
    .#.
    ###
    .#.
  `)),
  createMino('hex-cross5-270', 'hexomino', shape(`
    ..#.
    ####
    ..#.
  `)),

  // ===== 22. 十字6型 (1向き) =====
  createMino('hex-cross6', 'hexomino', shape(`
    .#.
    ###
    .#.
    .#.
  `)),

  // ===== 23. E型 (8向き) =====
  createMino('hex-e-0', 'hexomino', shape(`
    #.
    ##
    #.
    ##
  `)),
  createMino('hex-e-90', 'hexomino', shape(`
    ####
    #.#.
  `)),
  createMino('hex-e-180', 'hexomino', shape(`
    ##
    .#
    ##
    .#
  `)),
  createMino('hex-e-270', 'hexomino', shape(`
    .#.#
    ####
  `)),
  createMino('hex-e-m0', 'hexomino', shape(`
    .#
    ##
    .#
    ##
  `)),
  createMino('hex-e-m90', 'hexomino', shape(`
    #.#.
    ####
  `)),
  createMino('hex-e-m180', 'hexomino', shape(`
    ##
    #.
    ##
    #.
  `)),
  createMino('hex-e-m270', 'hexomino', shape(`
    ####
    .#.#
  `)),

  // ===== 24. T6型 (4向き) =====
  createMino('hex-t6-0', 'hexomino', shape(`
    ###
    .#.
    .#.
    .#.
  `)),
  createMino('hex-t6-90', 'hexomino', shape(`
    ...#
    ####
    ...#
  `)),
  createMino('hex-t6-180', 'hexomino', shape(`
    .#.
    .#.
    .#.
    ###
  `)),
  createMino('hex-t6-270', 'hexomino', shape(`
    #...
    ####
    #...
  `)),

  // ===== 25. 2x2+2型 (8向き) =====
  createMino('hex-sq2-0', 'hexomino', shape(`
    ##.
    ##.
    .##
  `)),
  createMino('hex-sq2-90', 'hexomino', shape(`
    .##
    ###
    #..
  `)),
  createMino('hex-sq2-180', 'hexomino', shape(`
    ##.
    .##
    .##
  `)),
  createMino('hex-sq2-270', 'hexomino', shape(`
    ..#
    ###
    ##.
  `)),
  createMino('hex-sq2-m0', 'hexomino', shape(`
    .##
    .##
    ##.
  `)),
  createMino('hex-sq2-m90', 'hexomino', shape(`
    #..
    ###
    .##
  `)),
  createMino('hex-sq2-m180', 'hexomino', shape(`
    .##
    ##.
    ##.
  `)),
  createMino('hex-sq2-m270', 'hexomino', shape(`
    ##.
    ###
    ..#
  `)),

  // ===== 26. 3+3型 (4向き) =====
  createMino('hex-33-0', 'hexomino', shape(`
    ###
    ...
    ###
  `)),
  createMino('hex-33-90', 'hexomino', shape(`
    #.#
    #.#
    #.#
  `)),
  createMino('hex-33-h0', 'hexomino', shape(`
    ###.
    .###
  `)),
  createMino('hex-33-h90', 'hexomino', shape(`
    .#
    ##
    #.
    ##
  `)),

  // ===== 27. Y6型 (8向き) =====
  createMino('hex-y6-0', 'hexomino', shape(`
    .#.
    ###
    .#.
    .#.
  `)),
  createMino('hex-y6-90', 'hexomino', shape(`
    ..#.
    ####
    ..#.
  `)),
  createMino('hex-y6-180', 'hexomino', shape(`
    .#.
    .#.
    ###
    .#.
  `)),
  createMino('hex-y6-270', 'hexomino', shape(`
    .#..
    ####
    .#..
  `)),
  createMino('hex-y6-m0', 'hexomino', shape(`
    .#.
    ##.
    .##
    .#.
  `)),
  createMino('hex-y6-m90', 'hexomino', shape(`
    .#..
    ####
    ..#.
  `)),
  createMino('hex-y6-m180', 'hexomino', shape(`
    .#.
    ##.
    .##
    .#.
  `)),
  createMino('hex-y6-m270', 'hexomino', shape(`
    ..#.
    ####
    .#..
  `)),

  // ===== 28. K型 (8向き) =====
  createMino('hex-k-0', 'hexomino', shape(`
    #..
    ##.
    ###
  `)),
  createMino('hex-k-90', 'hexomino', shape(`
    ###
    ##.
    #..
  `)),
  createMino('hex-k-180', 'hexomino', shape(`
    ###
    .##
    ..#
  `)),
  createMino('hex-k-270', 'hexomino', shape(`
    ..#
    .##
    ###
  `)),
  createMino('hex-k-m0', 'hexomino', shape(`
    ..#
    .##
    ###
  `)),
  createMino('hex-k-m90', 'hexomino', shape(`
    #..
    ##.
    ###
  `)),
  createMino('hex-k-m180', 'hexomino', shape(`
    ###
    ##.
    #..
  `)),
  createMino('hex-k-m270', 'hexomino', shape(`
    ###
    .##
    ..#
  `)),

  // ===== 29. A型 (4向き) =====
  createMino('hex-a-0', 'hexomino', shape(`
    .#.
    ###
    #.#
  `)),
  createMino('hex-a-90', 'hexomino', shape(`
    ##.
    .##
    ##.
  `)),
  createMino('hex-a-180', 'hexomino', shape(`
    #.#
    ###
    .#.
  `)),
  createMino('hex-a-270', 'hexomino', shape(`
    .##
    ##.
    .##
  `)),

  // ===== 30. ボート型 (8向き) =====
  createMino('hex-boat-0', 'hexomino', shape(`
    ###
    #.#
    #..
  `)),
  createMino('hex-boat-90', 'hexomino', shape(`
    ###
    #..
    #.#
  `)),
  createMino('hex-boat-180', 'hexomino', shape(`
    ..#
    #.#
    ###
  `)),
  createMino('hex-boat-270', 'hexomino', shape(`
    #.#
    ..#
    ###
  `)),
  createMino('hex-boat-m0', 'hexomino', shape(`
    ###
    #.#
    ..#
  `)),
  createMino('hex-boat-m90', 'hexomino', shape(`
    #.#
    #..
    ###
  `)),
  createMino('hex-boat-m180', 'hexomino', shape(`
    #..
    #.#
    ###
  `)),
  createMino('hex-boat-m270', 'hexomino', shape(`
    ###
    ..#
    #.#
  `)),

  // ===== 31. ハンマー型 (8向き) =====
  createMino('hex-hammer-0', 'hexomino', shape(`
    ###
    .#.
    ##.
  `)),
  createMino('hex-hammer-90', 'hexomino', shape(`
    #.#
    ###
    ..#
  `)),
  createMino('hex-hammer-180', 'hexomino', shape(`
    .##
    .#.
    ###
  `)),
  createMino('hex-hammer-270', 'hexomino', shape(`
    #..
    ###
    #.#
  `)),
  createMino('hex-hammer-m0', 'hexomino', shape(`
    ###
    .#.
    .##
  `)),
  createMino('hex-hammer-m90', 'hexomino', shape(`
    ..#
    ###
    #.#
  `)),
  createMino('hex-hammer-m180', 'hexomino', shape(`
    ##.
    .#.
    ###
  `)),
  createMino('hex-hammer-m270', 'hexomino', shape(`
    #.#
    ###
    #..
  `)),

  // ===== 32. フック型 (8向き) =====
  createMino('hex-hook-0', 'hexomino', shape(`
    ##.
    .#.
    .##
    ..#
  `)),
  createMino('hex-hook-90', 'hexomino', shape(`
    ..##
    ###.
    #...
  `)),
  createMino('hex-hook-180', 'hexomino', shape(`
    #..
    ##.
    .#.
    .##
  `)),
  createMino('hex-hook-270', 'hexomino', shape(`
    ...#
    .###
    ##..
  `)),
  createMino('hex-hook-m0', 'hexomino', shape(`
    .##
    .#.
    ##.
    #..
  `)),
  createMino('hex-hook-m90', 'hexomino', shape(`
    #...
    ###.
    ..##
  `)),
  createMino('hex-hook-m180', 'hexomino', shape(`
    ..#
    .##
    .#.
    ##.
  `)),
  createMino('hex-hook-m270', 'hexomino', shape(`
    ##..
    .###
    ...#
  `)),

  // ===== 33. J6型 (8向き) =====
  createMino('hex-j6-0', 'hexomino', shape(`
    #.
    ##
    .#
    .#
    .#
  `)),
  createMino('hex-j6-90', 'hexomino', shape(`
    ..###
    ###..
  `)),
  createMino('hex-j6-180', 'hexomino', shape(`
    #.
    #.
    #.
    ##
    .#
  `)),
  createMino('hex-j6-270', 'hexomino', shape(`
    ..###
    ###..
  `)),
  createMino('hex-j6-m0', 'hexomino', shape(`
    .#
    ##
    #.
    #.
    #.
  `)),
  createMino('hex-j6-m90', 'hexomino', shape(`
    ###..
    ..###
  `)),
  createMino('hex-j6-m180', 'hexomino', shape(`
    .#
    .#
    .#
    ##
    #.
  `)),
  createMino('hex-j6-m270', 'hexomino', shape(`
    ###..
    ..###
  `)),

  // ===== 34. S6型 (4向き) =====
  createMino('hex-s6-0', 'hexomino', shape(`
    .###
    ###.
  `)),
  createMino('hex-s6-90', 'hexomino', shape(`
    #.
    #.
    ##
    .#
    .#
  `)),
  createMino('hex-s6-180', 'hexomino', shape(`
    .###
    ###.
  `)),
  createMino('hex-s6-270', 'hexomino', shape(`
    #.
    #.
    ##
    .#
    .#
  `)),

  // ===== 35. Z6型 (4向き) =====
  createMino('hex-z6-0', 'hexomino', shape(`
    ###.
    .###
  `)),
  createMino('hex-z6-90', 'hexomino', shape(`
    .#
    .#
    ##
    #.
    #.
  `)),
  createMino('hex-z6-180', 'hexomino', shape(`
    ###.
    .###
  `)),
  createMino('hex-z6-270', 'hexomino', shape(`
    .#
    .#
    ##
    #.
    #.
  `)),
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

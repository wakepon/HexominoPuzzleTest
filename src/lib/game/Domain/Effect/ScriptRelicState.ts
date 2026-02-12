/**
 * 台本レリックの指定ライン状態型 & 抽選ロジック
 */

import { GRID_SIZE } from '../../Data/Constants'

/**
 * 指定ラインの種類（行 or 列）
 */
export type ScriptLineTarget =
  | { readonly type: 'row'; readonly index: number }
  | { readonly type: 'col'; readonly index: number }

/**
 * 台本レリックが指定する2本のライン
 */
export interface ScriptRelicLines {
  readonly target1: ScriptLineTarget
  readonly target2: ScriptLineTarget
}

/**
 * 12本（行6+列6）からランダムに異なる2本を選択
 */
export function generateScriptLines(rng: () => number): ScriptRelicLines {
  // 行0-5 → index 0-5, 列0-5 → index 6-11
  const totalLines = GRID_SIZE * 2
  const first = Math.floor(rng() * totalLines)
  let second = Math.floor(rng() * (totalLines - 1))
  if (second >= first) second++

  return {
    target1: indexToTarget(first),
    target2: indexToTarget(second),
  }
}

/**
 * 連番インデックスをScriptLineTargetに変換
 */
function indexToTarget(index: number): ScriptLineTarget {
  if (index < GRID_SIZE) {
    return { type: 'row', index }
  }
  return { type: 'col', index: index - GRID_SIZE }
}

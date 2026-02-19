/**
 * 台本
 * ラウンド開始時に指定ラインが2本出現。揃えた際の列数+1、2本同時で+2
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

const LINE_BONUS_SINGLE = 1
const LINE_BONUS_DOUBLE = 2

export const scriptRelic: RelicModule = {
  type: 'script',
  definition: {
    name: '台本',
    description: 'ラウンド開始時に指定ラインが2本出現。揃えた際の列数+1、2本同時で+2',
    rarity: 'uncommon',
    price: 15,
    icon: '📜',
  },
  scoreEffect: 'line_additive',

  checkActivation(ctx: RelicContext): RelicActivation {
    if (!ctx.scriptRelicLines || ctx.totalLines === 0) {
      return { active: false, value: 0, displayLabel: '' }
    }

    let matchCount = 0
    const isCompleted = (target: { type: 'row' | 'col'; index: number }): boolean => {
      if (target.type === 'row') return ctx.completedRows.includes(target.index)
      return ctx.completedCols.includes(target.index)
    }
    if (isCompleted(ctx.scriptRelicLines.target1)) matchCount++
    if (isCompleted(ctx.scriptRelicLines.target2)) matchCount++

    if (matchCount === 0) {
      return { active: false, value: 0, displayLabel: '' }
    }

    const bonus = matchCount === 2 ? LINE_BONUS_DOUBLE : LINE_BONUS_SINGLE
    return {
      active: true,
      value: bonus,
      displayLabel: `+${bonus}列`,
    }
  },
}

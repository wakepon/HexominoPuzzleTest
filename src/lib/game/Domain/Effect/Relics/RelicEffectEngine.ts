/**
 * レリックエフェクトエンジン（レジストリベース）
 *
 * 個々のレリックのロジックを知らず、レジストリのモジュールを汎用的に呼び出す。
 * 旧RelicEffectHandler/PatternEffectHandlerの橋渡し役。
 */

import type { RelicId } from '../../Core/Id'
import type { RelicContext, RelicActivation } from './RelicModule'
import type { RelicMultiplierState } from '../RelicState'
import type { ScriptRelicLines } from '../ScriptRelicState'
import { getRelicModule } from './RelicRegistry'
import { extractRelicState, extractCopyRelicState } from './RelicStateDispatcher'

// ============================================================
// エフェクト評価
// ============================================================

/**
 * 全所持レリックの発動判定を実行する
 *
 * @returns 各レリックの発動結果（relicId → RelicActivation）
 */
export function evaluateRelicEffects(
  ownedRelics: readonly RelicId[],
  baseContext: {
    readonly totalLines: number
    readonly rowLines: number
    readonly colLines: number
    readonly placedBlockSize: number
    readonly isBoardEmptyAfterClear: boolean
    readonly completedRows: readonly number[]
    readonly completedCols: readonly number[]
    readonly scriptRelicLines: ScriptRelicLines | null
    readonly remainingHands: number
    readonly patternBlockCount: number
    readonly sealBlockCount: number
  },
  relicMultiplierState: RelicMultiplierState
): ReadonlyMap<string, RelicActivation> {
  const results = new Map<string, RelicActivation>()

  for (const relicId of ownedRelics) {
    const module = getRelicModule(relicId)
    if (!module) continue

    const relicState = extractRelicState(relicId as string, relicMultiplierState)

    const ctx: RelicContext = {
      ...baseContext,
      ownedRelics,
      relicState,
    }

    results.set(relicId as string, module.checkActivation(ctx))
  }

  return results
}

/**
 * コピーレリックの効果を評価する
 *
 * 対象レリックのモジュールを呼び出し、コピーの効果値を算出する。
 * コピーレリック自身の累積状態を使用する（連射、のびのび系等）
 */
export function evaluateCopyRelicEffect(
  copyTargetRelicId: string | null,
  baseContext: {
    readonly ownedRelics: readonly RelicId[]
    readonly totalLines: number
    readonly rowLines: number
    readonly colLines: number
    readonly placedBlockSize: number
    readonly isBoardEmptyAfterClear: boolean
    readonly completedRows: readonly number[]
    readonly completedCols: readonly number[]
    readonly scriptRelicLines: ScriptRelicLines | null
    readonly remainingHands: number
    readonly patternBlockCount: number
    readonly sealBlockCount: number
  },
  relicMultiplierState: RelicMultiplierState
): { multiplier: number; bonus: number; lineBonus: number } {
  if (!copyTargetRelicId) return { multiplier: 1, bonus: 0, lineBonus: 0 }

  const targetModule = getRelicModule(copyTargetRelicId)
  if (!targetModule) return { multiplier: 1, bonus: 0, lineBonus: 0 }

  // コピーレリック自身の独立カウンターから状態を取得
  const copyState = relicMultiplierState.copyRelicState
  const relicState = copyState
    ? extractCopyRelicState(copyTargetRelicId, copyState)
    : null

  const ctx: RelicContext = {
    ...baseContext,
    relicState,
  }

  const activation = targetModule.checkActivation(ctx)
  if (!activation.active) return { multiplier: 1, bonus: 0, lineBonus: 0 }

  switch (targetModule.scoreEffect) {
    case 'multiplicative':
      return { multiplier: activation.value, bonus: 0, lineBonus: 0 }
    case 'additive':
      return { multiplier: 1, bonus: activation.value, lineBonus: 0 }
    case 'line_additive':
      return { multiplier: 1, bonus: 0, lineBonus: activation.value }
    default:
      return { multiplier: 1, bonus: 0, lineBonus: 0 }
  }
}

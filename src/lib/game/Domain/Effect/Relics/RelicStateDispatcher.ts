/**
 * レリック状態ディスパッチャー
 *
 * GameReducerから個別レリックのロジックを切り離し、
 * モジュールのupdateState/hookを汎用的に呼び出す。
 *
 * Phase 6: RelicMultiplierState ↔ per-relic state のbridge経由で動作。
 * Phase 7: per-relic state Mapに完全移行予定。
 */

import type { RelicId } from '../../Core/Id'
import type { RelicMultiplierState, CopyRelicState } from '../RelicState'
import type { RelicStateEvent, RelicHookContext, RelicHookResult } from './RelicModule'
import { getRelicModule } from './RelicRegistry'

// ============================================================
// Bridge: Legacy RelicMultiplierState ↔ per-relic state
// ============================================================

/**
 * RelicMultiplierStateから指定レリックの個別状態を取り出す
 *
 * 既知のstatefulレリック（rensha, nobi_takenoko, nobi_kani, bandaid）は
 * 旧フラット構造から該当フィールドを抽出する。
 * 未知のレリックはnullを返す（将来のper-relic mapで解決）。
 */
export function extractRelicState(
  relicId: string,
  legacy: RelicMultiplierState
): unknown {
  switch (relicId) {
    case 'rensha':
      return { multiplier: legacy.renshaMultiplier }
    case 'nobi_takenoko':
      return { multiplier: legacy.nobiTakenokoMultiplier }
    case 'nobi_kani':
      return { multiplier: legacy.nobiKaniMultiplier }
    case 'bandaid':
      return { counter: legacy.bandaidCounter, shouldTrigger: false }
    case 'anchor':
      return { hasClearedInRound: legacy.anchorHasClearedInRound }
    default:
      return null
  }
}

/**
 * per-relic stateをRelicMultiplierStateに書き戻す
 */
function applyRelicState(
  relicId: string,
  legacy: RelicMultiplierState,
  newState: unknown
): RelicMultiplierState {
  if (!newState) return legacy
  switch (relicId) {
    case 'rensha':
      return { ...legacy, renshaMultiplier: (newState as { multiplier: number }).multiplier }
    case 'nobi_takenoko':
      return { ...legacy, nobiTakenokoMultiplier: (newState as { multiplier: number }).multiplier }
    case 'nobi_kani':
      return { ...legacy, nobiKaniMultiplier: (newState as { multiplier: number }).multiplier }
    case 'bandaid':
      return { ...legacy, bandaidCounter: (newState as { counter: number }).counter }
    case 'anchor':
      return { ...legacy, anchorHasClearedInRound: (newState as { hasClearedInRound: boolean }).hasClearedInRound }
    default:
      return legacy
  }
}

/**
 * CopyRelicStateから対象レリックの個別状態を取り出す
 */
export function extractCopyRelicState(
  targetRelicId: string,
  copyState: CopyRelicState
): unknown {
  switch (targetRelicId) {
    case 'rensha':
      return { multiplier: copyState.renshaMultiplier }
    case 'nobi_takenoko':
      return { multiplier: copyState.nobiTakenokoMultiplier }
    case 'nobi_kani':
      return { multiplier: copyState.nobiKaniMultiplier }
    case 'bandaid':
      return { counter: copyState.bandaidCounter, shouldTrigger: false }
    case 'anchor':
      return { hasClearedInRound: copyState.anchorHasClearedInRound }
    default:
      return null
  }
}

/**
 * per-relic stateをCopyRelicStateに書き戻す
 */
function applyCopyRelicState(
  targetRelicId: string,
  copyState: CopyRelicState,
  newState: unknown
): CopyRelicState {
  if (!newState) return copyState
  switch (targetRelicId) {
    case 'rensha':
      return { ...copyState, renshaMultiplier: (newState as { multiplier: number }).multiplier }
    case 'nobi_takenoko':
      return { ...copyState, nobiTakenokoMultiplier: (newState as { multiplier: number }).multiplier }
    case 'nobi_kani':
      return { ...copyState, nobiKaniMultiplier: (newState as { multiplier: number }).multiplier }
    case 'bandaid':
      return { ...copyState, bandaidCounter: (newState as { counter: number }).counter }
    case 'anchor':
      return { ...copyState, anchorHasClearedInRound: (newState as { hasClearedInRound: boolean }).hasClearedInRound }
    default:
      return copyState
  }
}

// ============================================================
// 汎用ディスパッチャー
// ============================================================

/**
 * 全所持レリックの状態をイベントで更新する
 *
 * 各レリックモジュールのupdateState()を呼び出し、結果をRelicMultiplierStateに反映。
 * コピーレリックの独立カウンターは、メインループ後に別パスで更新する。
 * これにより、ownedRelicsの順序に依存しない安定した動作を保証する。
 */
export function dispatchRelicStateEvent(
  ownedRelics: readonly RelicId[],
  currentState: RelicMultiplierState,
  event: RelicStateEvent
): RelicMultiplierState {
  let state = currentState

  // パス1: 全レリックのメイン状態を更新
  for (const relicId of ownedRelics) {
    if ((relicId as string) === 'copy') continue

    const module = getRelicModule(relicId)
    if (!module?.updateState) continue

    const relicState = extractRelicState(relicId as string, state)
    const newRelicState = module.updateState(relicState, event)
    state = applyRelicState(relicId as string, state, newRelicState)
  }

  // パス2: コピーレリックの独立カウンターを同期更新
  if (state.copyRelicState) {
    const targetId = state.copyRelicState.targetRelicId
    if (targetId) {
      const targetModule = getRelicModule(targetId)
      if (targetModule?.updateState) {
        const copyRelicState = extractCopyRelicState(targetId, state.copyRelicState)
        const newCopyState = targetModule.updateState(copyRelicState, event)
        state = {
          ...state,
          copyRelicState: applyCopyRelicState(targetId, state.copyRelicState, newCopyState),
        }
      }
    }
  }

  return state
}

/**
 * 全所持レリックのonPiecePlacedフックを実行する
 *
 * @returns 更新後の状態と、発生したフック効果の配列
 */
export function dispatchOnPiecePlaced(
  ownedRelics: readonly RelicId[],
  currentState: RelicMultiplierState,
  hookContext: Omit<RelicHookContext, 'relicState'>
): { state: RelicMultiplierState; effects: RelicHookResult[] } {
  let state = currentState
  const effects: RelicHookResult[] = []

  for (const relicId of ownedRelics) {
    const module = getRelicModule(relicId)
    if (!module?.onPiecePlaced) continue

    const relicState = extractRelicState(relicId as string, state)
    const ctx: RelicHookContext = { ...hookContext, relicState }
    const result = module.onPiecePlaced(ctx)

    if (result) {
      effects.push(result)
      if (result.newRelicState !== undefined) {
        state = applyRelicState(relicId as string, state, result.newRelicState)
      }
    }
  }

  return { state, effects }
}

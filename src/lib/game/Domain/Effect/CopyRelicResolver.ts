/**
 * コピーレリックの対象解決ロジック
 *
 * コピーレリックは、レリック表示順で1つ上のレリックの効果をコピーする。
 * 最上位に配置された場合や、対象がcopyレリックの場合は無効（グレーアウト）。
 */

import type { RelicId } from '../Core/Id'

const COPY_RELIC_ID = 'copy' as RelicId

/**
 * コピーレリックのコピー対象を解決
 * @param relicDisplayOrder レリック表示順
 * @returns コピー対象のRelicId（無効な場合はnull）
 */
export function resolveCopyTarget(
  relicDisplayOrder: readonly RelicId[]
): RelicId | null {
  const copyIndex = relicDisplayOrder.indexOf(COPY_RELIC_ID)
  if (copyIndex <= 0) return null

  const targetId = relicDisplayOrder[copyIndex - 1]
  if (targetId === COPY_RELIC_ID) return null

  return targetId
}

/**
 * コピーレリックが非アクティブか判定
 */
export function isCopyRelicInactive(
  relicDisplayOrder: readonly RelicId[]
): boolean {
  if (!relicDisplayOrder.includes(COPY_RELIC_ID)) return false
  return resolveCopyTarget(relicDisplayOrder) === null
}

/**
 * コピーレリックの状態リセットが必要か判定
 * 並べ替え前後でコピー対象が変わった場合にリセット
 */
export function shouldResetCopyState(
  oldOrder: readonly RelicId[],
  newOrder: readonly RelicId[]
): boolean {
  const oldTarget = resolveCopyTarget(oldOrder)
  const newTarget = resolveCopyTarget(newOrder)
  return oldTarget !== newTarget
}

/**
 * レリックレジストリ
 *
 * 全RelicModuleを集約し、型安全な検索APIを提供する。
 * レリックの追加・削除はこのファイルへのimport追加・削除で完結する。
 */

import type { RelicId } from '../../Core/Id'
import type { RelicModule } from './RelicModule'
import type { RelicRarity } from '../Relic'

// ============================================================
// レジストリ内部状態
// ============================================================

const registry = new Map<string, RelicModule>()

// ============================================================
// 登録API
// ============================================================

/**
 * レリックモジュールをレジストリに登録する
 * 重複登録はエラー
 */
export function registerRelic(module: RelicModule): void {
  if (registry.has(module.type)) {
    throw new Error(`レリック '${module.type}' は既に登録されています`)
  }
  registry.set(module.type, module)
}

/**
 * 複数のレリックモジュールを一括登録する
 */
export function registerRelics(modules: readonly RelicModule[]): void {
  for (const module of modules) {
    registerRelic(module)
  }
}

// ============================================================
// 検索API
// ============================================================

/**
 * RelicIdからRelicModuleを取得する
 * 未登録の場合はundefinedを返す
 */
export function getRelicModule(relicId: RelicId | string): RelicModule | undefined {
  return registry.get(relicId as string)
}

/**
 * 全登録済みレリックモジュールを返す
 */
export function getAllRelicModules(): ReadonlyMap<string, RelicModule> {
  return registry
}

/**
 * 登録済みの全レリックtype一覧を返す
 */
export function getAllRelicTypes(): readonly string[] {
  return Array.from(registry.keys())
}

/**
 * 登録済みレリック数を返す
 */
export function getRelicCount(): number {
  return registry.size
}

// ============================================================
// 互換性API（既存コードからの移行用）
// ============================================================

/**
 * 既存のRELIC_DEFINITIONSと同等の形式でRelicDefinitionを返す
 * 既存コードとの互換性を保つための橋渡し関数
 */
export function getRelicDefinitionFromRegistry(relicId: RelicId | string): {
  readonly id: RelicId
  readonly type: string
  readonly name: string
  readonly description: string
  readonly rarity: RelicRarity
  readonly price: number
  readonly icon: string
} | undefined {
  const module = registry.get(relicId as string)
  if (!module) return undefined
  return {
    id: module.type as RelicId,
    type: module.type,
    ...module.definition,
  }
}

// ============================================================
// テスト・デバッグ用
// ============================================================

/**
 * レジストリをクリアする（テスト用）
 */
export function clearRelicRegistry(): void {
  registry.clear()
}

/**
 * レリックモジュールの登録情報をダンプする（デバッグ用）
 */
export function dumpRelicRegistry(): readonly {
  type: string
  name: string
  scoreEffect: string
  hasState: boolean
  hooks: string[]
}[] {
  return Array.from(registry.values()).map(m => ({
    type: m.type,
    name: m.definition.name,
    scoreEffect: m.scoreEffect,
    hasState: m.initialState !== undefined,
    hooks: [
      ...(m.onPiecePlaced ? ['onPiecePlaced'] : []),
      ...(m.onRoundStart ? ['onRoundStart'] : []),
    ],
  }))
}

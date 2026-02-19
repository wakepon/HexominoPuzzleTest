---
description: NewRelicPlanから1個のレリックを実装する。仕様確認→計画→実装→テスト→レビューの一連のワークフロー。git-worktreeでの並列実行を想定。
---

# Add Relic コマンド

Spec/NewRelicPlan.md から **1個のレリック** を実装するワークフロー。

## 使用方法

`/add-relic [レリック名]`

例: `/add-relic anchor`, `/add-relic piggybank`

## 引数

$ARGUMENTS: 実装対象のレリック名（英語、NewRelicPlan.md に記載のID）

## アーキテクチャ概要

レリックシステムは **モジュールベース** のアーキテクチャ。
各レリックは1ファイル = 1モジュール (`RelicModule` インターフェース) として実装し、
レジストリに登録するだけでエンジン・ハンドラ・レンダラーが自動的に処理する。

```
Domain/Effect/Relics/
├── RelicModule.ts         # インターフェース定義（変更不要）
├── RelicRegistry.ts       # レジストリ（変更不要）
├── RelicEffectEngine.ts   # エフェクト評価エンジン（変更不要）
├── RelicStateDispatcher.ts # 状態ブリッジ（statefulレリックのみ変更）
├── index.ts               # ★ 登録エントリポイント（全レリックで変更）
├── Takenoko.ts            # 例: 乗算系（stateless）
├── Rensha.ts              # 例: 乗算系（stateful）
├── Bandaid.ts             # 例: Reducerフック系
└── NewRelic.ts            # ★ 新規作成
```

## git-worktree 並列実行について

このスキルは worktree で並列に実行される可能性がある。

**コンフリクト頻出ファイル:**
- `Domain/Effect/Relic.ts` - RelicType union, RELIC_DEFINITIONS
- `Domain/Effect/Relics/index.ts` - import文, allModules配列
- `Domain/Effect/RelicState.ts` - RelicMultiplierState, CopyRelicState（stateful系のみ）
- `Domain/Effect/Relics/RelicStateDispatcher.ts` - extractRelicState, applyRelicState（stateful系のみ）

**コンフリクト軽減策:**
- union type, オブジェクトリテラル, import文, allModules への追加は **末尾に追記** する
- テストは `describe('レリック名')` ブロックで囲み、ファイル末尾に追加する
- 1レリック=1コミットにまとめる

## ワークフロー

### Step 1: 仕様確認
1. `Spec/NewRelicPlan.md` から対象レリックの仕様を読む
2. 以下を特定する:
   - `scoreEffect` の分類: `multiplicative` / `additive` / `line_additive` / `none`
   - 発動条件（`RelicContext` のどのフィールドを使うか）
   - 累積状態が必要か（`initialState` / `updateState` が必要か）
   - Reducerフックが必要か（`onPiecePlaced` / `onRoundStart`）
   - `RelicContext` に新しいフィールドが必要か

### Step 2: 計画（planner Agent）
1. **planner** Agent を呼び出して具体的な変更箇所を特定
2. レリックの種類に応じた実装パスを選択:

#### パスA: statelessスコア系（大多数のレリック）
変更ファイルが最小。新規モジュール + 登録 + 型定義のみ。
```
Relics/NewRelic.ts（新規） → Relics/index.ts → Relic.ts
```
例: takenoko, kani, chain_master, single_line, full_clear_bonus, timing, size_bonus_*
例（新規）: anchor, compass, crown, stamp, featherweight, heavyweight, meteor, symmetry

#### パスB: statefulスコア系（累積状態を持つ）
パスAに加え、状態ブリッジの更新が必要。
```
Relics/NewRelic.ts（新規） → Relics/index.ts → Relic.ts
→ RelicState.ts → Relics/RelicStateDispatcher.ts
```
例: rensha, nobi_takenoko, nobi_kani
例（新規）: snowball, muscle, gardener, collector, wave

#### パスC: Reducerフック系（スコア外の特殊効果）
パスA/Bに加え、GameReducerでのフック呼び出しが必要。
```
Relics/NewRelic.ts（新規） → Relics/index.ts → Relic.ts
→ GameReducer.ts（既存フック呼び出しで対応できるか確認）
```
例: bandaid（inject_piece）, volcano（force clear）, hand_stock
例（新規）: extra_draw, recycler

#### パスD: 経済系（スコアに無関係、ゴールド操作）
モジュールは `scoreEffect: 'none'` で作成し、Reducer処理で効果を実装。
```
Relics/NewRelic.ts（新規） → Relics/index.ts → Relic.ts
→ GameReducer.ts（ラウンドクリア/ショップ処理）
```
例（新規）: piggybank, investor, merchant, midas

#### パスE: RelicContext拡張が必要な場合
新しい判定条件にRelicContextのフィールドが足りない場合。
```
Relics/NewRelic.ts（新規） → Relics/index.ts → Relic.ts
→ Relics/RelicModule.ts（RelicContext拡張）
→ Domain/Effect/PatternEffectHandler.ts（コンテキスト構築箇所）
```

### Step 3: 実装

以下の順序で変更を行う:

#### 3-1. モジュールファイル作成（全パス共通・最重要）

`src/lib/game/Domain/Effect/Relics/NewRelic.ts` を新規作成。
既存レリックのパターンに合わせて実装する。

**statelessスコア系のテンプレート** (パスA):
```typescript
/**
 * レリック名（日本語）
 * 効果の説明
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

export const newRelicRelic: RelicModule = {
  type: 'new_relic',
  definition: {
    name: 'レリック名',
    description: '効果の説明',
    rarity: 'common',  // common | uncommon | rare | epic
    price: 10,          // 10G | 15G | 20G | 25G
    icon: '🆕',
  },
  scoreEffect: 'multiplicative',  // multiplicative | additive | line_additive | none

  checkActivation(ctx: RelicContext): RelicActivation {
    const active = /* 発動条件 */ ctx.totalLines > 0
    const value = active ? /* 効果値 */ 2 : 1  // 乗算系は1、加算系は0がデフォルト
    return {
      active,
      value,
      displayLabel: active ? `列点×${value}` : '',
    }
  },
}
```

**statefulスコア系のテンプレート** (パスB):
```typescript
/**
 * レリック名（日本語）
 * 効果の説明
 */

import type { RelicModule, RelicContext, RelicActivation, RelicStateEvent } from './RelicModule'

export interface NewRelicState {
  readonly multiplier: number
}

const INITIAL_STATE: NewRelicState = { multiplier: 1.0 }

export const newRelicRelic: RelicModule = {
  type: 'new_relic',
  definition: { name: '...', description: '...', rarity: '...', price: 0, icon: '...' },
  scoreEffect: 'multiplicative',

  checkActivation(ctx: RelicContext): RelicActivation {
    const state = (ctx.relicState as NewRelicState | null) ?? INITIAL_STATE
    const active = ctx.totalLines > 0
    return {
      active,
      value: active ? state.multiplier : 1,
      displayLabel: active ? `列点×${state.multiplier}` : '',
    }
  },

  initialState: (): NewRelicState => INITIAL_STATE,

  updateState(state: unknown, event: RelicStateEvent): NewRelicState {
    const s = (state as NewRelicState | null) ?? INITIAL_STATE
    switch (event.type) {
      case 'lines_cleared':
        return { multiplier: s.multiplier + 1 }
      case 'round_start':
        return INITIAL_STATE
      default:
        return s
    }
  },
}
```

**Reducerフック系のテンプレート** (パスC):
```typescript
/**
 * レリック名（日本語）
 * 効果の説明
 */

import type {
  RelicModule, RelicContext, RelicActivation,
  RelicStateEvent, RelicHookContext, RelicHookResult,
} from './RelicModule'

export const newRelicRelic: RelicModule = {
  type: 'new_relic',
  definition: { name: '...', description: '...', rarity: '...', price: 0, icon: '...' },
  scoreEffect: 'none',

  checkActivation(_ctx: RelicContext): RelicActivation {
    return { active: false, value: 0, displayLabel: '' }
  },

  // 必要に応じて initialState / updateState を実装

  onPiecePlaced(ctx: RelicHookContext): RelicHookResult {
    // 効果判定 → null（発動なし）または { type: 'inject_piece' | 'update_state', newRelicState }
    return null
  },
}
```

#### 3-2. レジストリ登録

**`Domain/Effect/Relics/index.ts`**:
- import文を末尾に追加
- `allModules` 配列の末尾に追加

```typescript
// --- 個別レリックの import ---（末尾に追加）
import { newRelicRelic } from './NewRelic'

const allModules: readonly RelicModule[] = [
  // ...既存レリック
  newRelicRelic,  // 末尾に追加
]
```

#### 3-3. 型定義・マスターデータ

**`Domain/Effect/Relic.ts`**:
- `RelicType` union に型を追加（末尾）
- `RELIC_DEFINITIONS` にマスターデータ追加（末尾、モジュールのdefinitionと同じ内容）

```typescript
export type RelicType =
  | // ...既存
  | 'new_relic'      // レリック名（末尾に追加）

export const RELIC_DEFINITIONS: Record<RelicType, RelicDefinition> = {
  // ...既存
  new_relic: {
    id: 'new_relic' as RelicId,
    type: 'new_relic',
    name: '...',
    description: '...',
    rarity: '...',
    price: 0,
    icon: '...',
  },
}
```

#### 3-4. 状態ブリッジ（stateful系のみ、パスB）

**`Domain/Effect/RelicState.ts`**:
- `RelicMultiplierState` にフィールド追加
- `INITIAL_RELIC_MULTIPLIER_STATE` にデフォルト値追加
- `CopyRelicState` にフィールド追加（コピーレリック対応）
- `createInitialCopyRelicState` にデフォルト値追加

**`Domain/Effect/Relics/RelicStateDispatcher.ts`**:
- `extractRelicState()` の switch に case 追加
- `applyRelicState()` の switch に case 追加
- `extractCopyRelicState()` の switch に case 追加
- `applyCopyRelicState()` の switch に case 追加

#### 3-5. RelicContext拡張（パスEのみ）

**`Domain/Effect/Relics/RelicModule.ts`**:
- `RelicContext` に新フィールド追加

**`Domain/Effect/PatternEffectHandler.ts`**:
- `evaluateRelicEffects()` 呼び出し時のコンテキスト構築を更新

#### 3-6. Reducer処理（パスC/Dのみ）

**`State/Reducers/GameReducer.ts`**:
- 経済系: ラウンドクリア/ショップ処理に効果追加
- フック系: 既存の `dispatchOnPiecePlaced()` で自動処理されるか確認
  - 新しい `RelicHookResult.type` が必要な場合は Reducer の処理を追加

### Step 4: ビルド確認
```bash
npx tsc --noEmit && npx vitest run
```

### Step 5: コードレビュー
**code-reviewer** Agent でレビュー

## チェックリスト

### 全レリック共通
- [ ] `Relics/NewRelic.ts` モジュール作成
- [ ] `Relics/index.ts` に import + allModules 追加
- [ ] `Relic.ts` の `RelicType` union に追加
- [ ] `Relic.ts` の `RELIC_DEFINITIONS` に追加
- [ ] ビルド通過 (`npx tsc --noEmit`)
- [ ] テスト通過 (`npx vitest run`)

### stateful系のみ（パスB）
- [ ] `RelicState.ts` の `RelicMultiplierState` にフィールド追加
- [ ] `RelicState.ts` の `INITIAL_RELIC_MULTIPLIER_STATE` にデフォルト値追加
- [ ] `RelicState.ts` の `CopyRelicState` にフィールド追加
- [ ] `RelicState.ts` の `createInitialCopyRelicState` にデフォルト値追加
- [ ] `RelicStateDispatcher.ts` の全4関数に case 追加

### Reducerフック/経済系のみ（パスC/D）
- [ ] `GameReducer.ts` に効果処理追加

### RelicContext拡張が必要な場合（パスE）
- [ ] `RelicModule.ts` の `RelicContext` にフィールド追加
- [ ] `PatternEffectHandler.ts` のコンテキスト構築を更新

## 参考: 既存レリックの実装パターン

| パターン | 例 | scoreEffect | state | hook |
|---------|-----|------------|-------|------|
| stateless乗算 | Takenoko, ChainMaster, SingleLine, Timing | multiplicative | なし | なし |
| stateless加算 | SizeBonusFactory | additive | なし | なし |
| stateful乗算 | Rensha, NobiTakenoko, NobiKani | multiplicative | あり | なし |
| ライン加算 | Script | line_additive | あり | なし |
| Reducerフック | Bandaid, Volcano | none | あり | onPiecePlaced |
| UI効果 | HandStock | none | なし | なし |
| コピー | Copy | 対象依存 | あり | なし |

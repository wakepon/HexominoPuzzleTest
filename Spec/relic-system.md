# レリックシステム

## 概要

恒久的なパッシブ効果を持つアイテムシステム。ショップでゴールドを消費して購入し、複数所持可能。ゲームオーバー時に全てリセットされる。

各レリックの詳細は [relic-list.md](./relic-list.md) を参照。
護符システムは [amulet-system.md](./amulet-system.md) を参照。

## アーキテクチャ概要

レリックシステムはモジュール化されたプラグイン構造を採用しており、レリックの追加・削除が容易に行える設計となっている。

### 主要コンポーネント

```
RelicModule (個別レリック)
    ↓ 登録
RelicRegistry (レジストリ)
    ↓ 検索
RelicEffectEngine (効果エンジン)
    ↓ 発動判定・効果計算
PatternEffectHandler (スコア計算統合)
    ↓ 最終スコア
GameReducer (状態管理)
```

#### RelicModule (個別レリック)

各レリックは1ファイル1モジュールとして実装され、以下のインターフェースを満たす。

```typescript
interface RelicModule {
  type: string                      // レリックID
  definition: RelicModuleDefinition // 表示名・説明・レアリティ等
  scoreEffect: ScoreEffectType      // 効果の分類（乗算/加算/ライン加算/なし）
  checkActivation(ctx): RelicActivation  // 発動判定と効果値計算
  initialState?(): unknown          // 累積状態の初期値（オプション）
  updateState?(state, event): unknown // 状態更新（オプション）
  onPiecePlaced?(ctx): RelicHookResult // Reducerフック（オプション）
  onRoundStart?(ctx): RelicHookResult  // ラウンド開始フック（オプション）
}
```

**ScoreEffectType:**
- `multiplicative`: 列点(B)に乗算（例: 連鎖の達人 ×1.5）
- `additive`: ブロック点(A)に加算（例: サイズボーナス +消去ブロック数）
- `line_additive`: ライン数に加算（例: 台本 +1列）
- `none`: スコアに直接影響しない（例: 手札ストック、火山）

#### RelicRegistry (レジストリ)

全RelicModuleを集約し、型安全な検索APIを提供する。

```typescript
registerRelic(module: RelicModule): void
getRelicModule(relicId: RelicId): RelicModule | undefined
getAllRelicModules(): ReadonlyMap<string, RelicModule>
```

レリックの追加・削除は `src/lib/game/Domain/Effect/Relics/index.ts` の `allModules` 配列を変更するだけで完結する。

#### RelicEffectEngine (効果エンジン)

個々のレリックのロジックを知らず、レジストリのモジュールを汎用的に呼び出す。

```typescript
evaluateRelicEffects(
  ownedRelics: readonly RelicId[],
  baseContext: { totalLines, rowLines, colLines, ... },
  relicMultiplierState: RelicMultiplierState
): ReadonlyMap<string, RelicActivation>
```

各レリックの `checkActivation()` を呼び出し、発動したものだけを返す。

#### RelicStateDispatcher (状態ディスパッチャー)

GameReducerから個別レリックのロジックを切り離し、モジュールの `updateState()` や `onPiecePlaced()` を汎用的に呼び出す。

```typescript
dispatchRelicStateEvent(
  ownedRelics: readonly RelicId[],
  currentState: RelicMultiplierState,
  event: RelicStateEvent
): RelicMultiplierState

dispatchOnPiecePlaced(
  ownedRelics: readonly RelicId[],
  currentState: RelicMultiplierState,
  hookContext: RelicHookContext
): { state: RelicMultiplierState; effects: RelicHookResult[] }
```

**RelicStateEvent:**
- `lines_detected`: ライン完成検出直後（スコア計算前）
- `lines_cleared`: スコア計算後
- `hand_consumed`: 手札消費時
- `round_start`: ラウンド開始時

### レリックの実装パターン

#### パターン1: 条件発動型（stateless）

条件を満たした時のみ効果を発揮するレリック。状態を持たない。

```typescript
// 例: 連鎖の達人（複数ライン同時消しで列点×1.5）
export const chainMasterRelic: RelicModule = {
  type: 'chain_master',
  definition: { name: '連鎖の達人', ... },
  scoreEffect: 'multiplicative',
  checkActivation(ctx: RelicContext): RelicActivation {
    const active = ctx.totalLines >= 2
    return {
      active,
      value: active ? 1.5 : 1,
      displayLabel: active ? '列点×1.5' : '',
    }
  },
}
```

#### パターン2: 累積型（stateful）

ライン消去ごとに効果が累積するレリック。`initialState()` と `updateState()` を実装。

```typescript
// 例: 連射（ライン揃うたびに列点+1、揃わないとリセット）
export const renshaRelic: RelicModule = {
  type: 'rensha',
  definition: { name: '連射', ... },
  scoreEffect: 'multiplicative',
  checkActivation(ctx: RelicContext): RelicActivation {
    const state = (ctx.relicState as RenshaState) ?? { multiplier: 1.0 }
    const active = ctx.totalLines > 0
    return {
      active,
      value: active ? state.multiplier : 1,
      displayLabel: active ? `列点×${state.multiplier}` : '',
    }
  },
  initialState: () => ({ multiplier: 1.0 }),
  updateState(state: unknown, event: RelicStateEvent) {
    const s = (state as RenshaState) ?? { multiplier: 1.0 }
    switch (event.type) {
      case 'lines_cleared':
        return event.totalLines === 0
          ? { multiplier: 1.0 }
          : { multiplier: s.multiplier + 1 }
      case 'round_start':
        return { multiplier: 1.0 }
      default:
        return s
    }
  },
}
```

#### パターン3: Reducerフック型

ピース配置時やラウンド開始時に特殊処理を行うレリック。`onPiecePlaced()` や `onRoundStart()` を実装。

```typescript
// 例: 絆創膏（3ハンド消費ごとにノーハンド付きモノミノが手札に追加）
export const bandaidRelic: RelicModule = {
  type: 'bandaid',
  definition: { name: '絆創膏', ... },
  scoreEffect: 'none',
  checkActivation(_ctx): RelicActivation {
    return { active: false, value: 0, displayLabel: '' }
  },
  initialState: () => ({ counter: 0, shouldTrigger: false }),
  updateState(state: unknown, event: RelicStateEvent) {
    const s = (state as BandaidState) ?? { counter: 0, shouldTrigger: false }
    switch (event.type) {
      case 'hand_consumed':
        const newCounter = s.counter + 1
        return newCounter >= 3
          ? { counter: 0, shouldTrigger: true }
          : { counter: newCounter, shouldTrigger: false }
      case 'round_start':
        return { counter: 0, shouldTrigger: false }
      default:
        return { ...s, shouldTrigger: false }
    }
  },
  onPiecePlaced(ctx: RelicHookContext): RelicHookResult {
    const state = (ctx.relicState as BandaidState) ?? { counter: 0, shouldTrigger: false }
    if (state.shouldTrigger && ctx.remainingHands > 0) {
      return {
        type: 'inject_piece',
        newRelicState: { ...state, shouldTrigger: false },
      }
    }
    return null
  },
}
```

#### パターン4: ファクトリ型

同じ構造で対象サイズだけが異なるレリック。ファクトリ関数で生成。

```typescript
// 例: サイズボーナス（1〜6サイズ）
export function createSizeBonusRelic(size: number): RelicModule {
  return {
    type: `size_bonus_${size}`,
    definition: { name: `${size}サイズボーナス`, ... },
    scoreEffect: 'additive',
    checkActivation(ctx: RelicContext): RelicActivation {
      const active = ctx.totalLines > 0 && ctx.placedBlockSize === size
      return {
        active,
        value: active ? 1 : 0, // 仮値（実際は消去ブロック数に上書き）
        displayLabel: active ? '+ブロック点' : '',
      }
    },
  }
}
```

## レリックの基本仕様

### 獲得方法

- ショップでゴールドを消費して購入
- 1つのレリックは1回のみ購入可能（すでに所持しているものはショップに表示されない）

### 所持上限

- **最大5枠**
- 5枠を超えてレリックを購入する場合、既存のレリックを1つ売却する必要がある
- レリックの並び順はドラッグ&ドロップで変更可能（コピーレリック等の位置が重要）

> ※現状は所持上限なし。5枠制限は未実装。

### 売却

| 項目 | 仕様 |
|---|---|
| 売却タイミング | ショップフェーズ中にいつでも |
| 売却価格 | 購入価格の半額（端数切り捨て） |
| 入れ替え | 6個目を購入しようとした場合、売却するレリックを選択 → 売却後に購入 |

> ※レリック売却は未実装。

### 効果適用

- 所持している間、常に効果が適用される
- 特定条件を満たした時にのみ発動するタイプと、ライン消去ごとに累積するタイプがある

### リセット条件

- ゲームオーバー時に全てのレリックがリセットされる

## レアリティ

| レアリティ | 日本語名 | 出現頻度 | 価格帯 | 出現重み |
|------------|----------|----------|--------|----------|
| common | コモン | 高い | 1〜6G | 70% |
| uncommon | アンコモン | 普通 | 5〜8G | 25% |
| rare | レア | 低い | 8〜10G | 5% |
| epic | エピック | 非常に低い | 10〜12G | 0.3% |

> ※価格帯は調整予定。

## スコア計算の適用順序（A×B方式）

最終スコアは **ブロック点(A) × 列点(B)** で計算される。

```
ブロック点(A):
  totalBlocks
  + 加算レリック（size_bonus_*, anchor, crown, stamp, compass, featherweight, heavyweight,
                 cross, twin, minimalist, alchemist, furnace, copyBonus）
    → relicDisplayOrder順に適用

列点(B):
  linesCleared × luckyMultiplier + buffPulsationBonus
  + ライン加算レリック（script, gambler, copyLineBonus）
  × 乗算レリック（chain_master, full_clear_bonus, single_line, takenoko, kani,
                 rensha, nobi_takenoko, nobi_kani, timing, meteor, symmetry,
                 crescent, last_stand, first_strike, patience, muscle, collector,
                 overload, orchestra, copyMultiplier）
    → relicDisplayOrder順に適用（切り捨てなし）

最終スコア = Math.floor(A × B)
```

詳細は [game-mechanics.md](./game-mechanics.md) を参照。

### レリック効果の適用順序

レリック効果は `relicDisplayOrder`（プレイヤーが並べ替えた表示順）に従って適用される。

1. **加算系レリック**: ブロック点(A)に順次加算
2. **ライン加算系レリック**: 列点(B)にライン数を加算
3. **乗算系レリック**: 列点(B)に順次乗算（切り捨てなし）

各乗算ステップでは切り捨てなしで列点(B)に乗算される。最終的に `Math.floor(A × B)` で切り捨てが行われる。

### コピーレリックの適用タイミング

コピーレリックは `relicDisplayOrder` 内でコピー対象レリックの**直後**に効果を適用する。

- 対象が加算系 → ブロック点(A)に加算
- 対象がライン加算系 → 列点(B)にライン数を加算
- 対象が乗算系 → 列点(B)に乗算

コピーレリックは独立した累積カウンターを持ち、対象レリックとは別に状態を管理する。

#### コピー対象の解決ルール

- `relicDisplayOrder` で1つ上（index - 1）のレリックをコピー
- 最上位に配置された場合や対象がcopyレリックの場合は無効（グレーアウト）
- レリック並べ替え時に対象が変わった場合、コピーの累積状態はリセットされる

## プレイヤー状態でのレリック管理

```typescript
interface PlayerState {
  ownedRelics: readonly RelicId[]       // 所持レリックID一覧
  relicDisplayOrder: readonly RelicId[] // 表示順・効果適用順
}
```

- `ownedRelics` と `relicDisplayOrder` は常に同じ要素を保持する
- レリック購入時: 両配列の末尾に追加
- レリック削除時（デバッグ用）: 両配列から除去
- ゲームオーバー時: `resetPlayerState` で両配列をクリア

## レリック状態管理

### RelicMultiplierState

累積型レリックの状態を一元管理する構造体。

```typescript
interface RelicMultiplierState {
  nobiTakenokoMultiplier: number       // のびのびタケノコ倍率
  nobiKaniMultiplier: number           // のびのびカニ倍率
  renshaMultiplier: number             // 連射倍率
  bandaidCounter: number               // 絆創膏カウンター（0〜2）
  anchorHasClearedInRound: boolean     // アンカー: ラウンド中消去済みか
  firstStrikeHasClearedInRound: boolean // 先制攻撃: ラウンド中消去済みか
  patienceConsecutiveNonClearHands: number // 忍耐: 連続非消去ハンド数
  patienceIsCharged: boolean           // 忍耐: チャージ済みか
  snowballBonus: number                // 雪だるま: 累積ブロック点ボーナス
  muscleAccumulatedBonus: number       // 筋肉: 累積列点ボーナス
  gardenerAccumulatedBonus: number     // 庭師: 累積ブロック点ボーナス
  collectorCollectedPatterns: readonly string[] // 収集家: 収集済みパターン
  collectorAccumulatedBonus: number    // 収集家: 累積列点ボーナス
  recyclerUsesRemaining: number        // リサイクラー: 残り使用回数
  twinLastPlacedBlockSize: number      // 双子: 直前配置ブロック数
  copyRelicState: CopyRelicState | null // コピーレリック独立カウンター
}
```

### CopyRelicState

コピーレリックは独立した累積カウンターを持ち、対象レリックの状態を独自に管理する。

```typescript
interface CopyRelicState {
  targetRelicId: RelicId | null       // コピー対象レリックID
  bandaidCounter: number
  renshaMultiplier: number
  nobiTakenokoMultiplier: number
  nobiKaniMultiplier: number
  anchorHasClearedInRound: boolean
  firstStrikeHasClearedInRound: boolean
  patienceConsecutiveNonClearHands: number
  patienceIsCharged: boolean
  snowballBonus: number
  muscleAccumulatedBonus: number
  gardenerAccumulatedBonus: number
  collectorCollectedPatterns: readonly string[]
  collectorAccumulatedBonus: number
  twinLastPlacedBlockSize: number
}
```

### 状態更新の流れ

```
ユーザー操作（ピース配置）
  ↓
GameReducer: BOARD/PLACE_PIECE
  ↓
dispatchRelicStateEvent({ type: 'hand_consumed', placedBlockSize })
  → 全所持レリックのupdateState()呼び出し（例: bandaidのカウンター+1）
  ↓
dispatchOnPiecePlaced(hookContext)
  → 全所持レリックのonPiecePlaced()呼び出し（例: bandaidのピース注入）
  ↓
ライン完成検出
  ↓
dispatchRelicStateEvent({ type: 'lines_detected', totalLines, rowLines, colLines })
  → スコア計算前の状態更新（例: のびのび系の倍率更新）
  ↓
PatternEffectHandler: calculateScoreBreakdown()
  → evaluateRelicEffects() → 各レリックのcheckActivation()呼び出し
  → スコア計算
  ↓
dispatchRelicStateEvent({ type: 'lines_cleared', totalLines, patternBlockCount, ... })
  → スコア計算後の状態更新（例: 連射の倍率更新、雪だるまのボーナス累積）
```

## ショップでのレリック販売ルール

`ShopService.ts` の `generateRelicShopItems` 関数が担当する。

- 全レリックから未所持のもののみを対象とする
- 未所持レリックをシャッフルし、最大3件を選択してショップに表示する
- 全レリックを所持済みの場合、レリック商品は表示されない
- 各レリックの価格は `RELIC_DEFINITIONS` に定義された `price` を使用する
- ショップ生成時に全商品（ブロック・レリック含む）の中からランダムに1件がセール対象になる（セール価格は元値から割引）

## レリック一覧（52種）

現在52種のレリックが実装されている。詳細は [relic-list.md](./relic-list.md) を参照。

### レアリティ別分類

| レアリティ | 種類数 | 例 |
|-----------|--------|---|
| common | 13 | サイズボーナス1〜6、タケノコ、カニ、アンカー、軽量級、重量級、トレジャーハンター、金魚 |
| uncommon | 21 | シングルライン、のびのびタケノコ、のびのびカニ、台本、火山、タイミング、王冠、スタンプ、コンパス、三日月、先制攻撃、筋肉、庭師、収集家、商人、ミダス、リサイクラー、双子、ミニマリスト、溶鉱炉、ギャンブラー |
| rare | 14 | 連鎖の達人、連射、絆創膏、流星、ラストスタンド、忍耐、雪だるま、十字、過負荷、錬金術師、オーケストラ、プリズム、道化師 |
| epic | 4 | 手札ストック、コピー、追加ドロー、追加ハンド、アンプリファイア、不死鳥 |

### 効果種別分類

| 効果種別 | 種類数 | 説明 |
|---------|--------|------|
| multiplicative | 20 | 列点(B)に乗算効果 |
| additive | 15 | ブロック点(A)に加算効果 |
| line_additive | 2 | ライン数に加算効果 |
| none | 15 | スコア以外への効果 |

## レリック拡充計画（150種目標）

現在52種 → 150種へ拡充予定。以下のカテゴリで構成する。

| カテゴリ | 説明 | 例 | 目安数 |
|---|---|---|---|
| **加算系** | 条件を満たすとスコアに+N | サイズボーナス、アンカー、王冠 | 25〜35 |
| **乗算系** | 条件を満たすとスコアに×N | 連鎖の達人、シングルライン | 25〜35 |
| **成長系** | 使うほど効果が上がる | 連射、のびのび系、雪だるま | 15〜20 |
| **経済系** | ゴールド獲得に影響 | 商人、トレジャーハンター、金魚 | 15〜20 |
| **デッキ操作系** | 手札やドローに影響 | 追加ドロー、追加ハンド、ストック枠 | 15〜20 |
| **条件変更系** | ゲームルールを変える | ボード拡張、ライン条件変更 | 15〜20 |
| **シナジー系** | 他レリックや特定パターン/シールと連携 | アンプリファイア、プリズム、収集家 | 20〜30 |
| **リスク/リターン系** | 高リスク高リターン | 確率で2倍/0倍、HP制約付き倍率 | 15〜20 |

### 既存レリックの扱い

- 現在の52種のレリックはそのまま残す
- **コピーレリック**: 5枠制限で位置管理がより重要になり、面白さが増す
- **価格の再調整**: 新レアリティ体系に合わせて全レリックの価格を再設定

### 実装フェーズ

段階的に拡充: 52 → 100 → 150種

> ※レリック拡充は進行中。現在52種。

## レリック追加の手順

レジストリベースのモジュール構造により、レリック追加は以下の手順で完結する。

1. `src/lib/game/Domain/Effect/Relics/` 配下に新しいレリックファイルを作成
2. `RelicModule` インターフェースを満たすオブジェクトをexport
3. `src/lib/game/Domain/Effect/Relics/index.ts` の `allModules` 配列に追加
4. `src/lib/game/Domain/Effect/Relic.ts` の `RelicType` と `RELIC_DEFINITIONS` に定義追加

システム側（RelicEffectEngine、RelicStateDispatcher等）の変更は不要。

## 関連ファイル

### コア定義・状態管理

- `src/lib/game/Domain/Effect/Relic.ts` - `RelicType`, `RelicRarity`, `RelicDefinition`, `RELIC_DEFINITIONS`
- `src/lib/game/Domain/Effect/RelicState.ts` - `RelicMultiplierState`, `CopyRelicState`, 初期値定義
- `src/lib/game/Domain/Effect/RelicEffectTypes.ts` - `RelicEffectContext`, `ActivatedRelicInfo`
- `src/lib/game/Domain/Effect/RelicEffectHandler.ts` - 旧API互換レイヤー（hasRelic, getActivatedRelicsFromScoreBreakdown）

### モジュールシステム

- `src/lib/game/Domain/Effect/Relics/RelicModule.ts` - `RelicModule` インターフェース、`ScoreEffectType`、イベント型定義
- `src/lib/game/Domain/Effect/Relics/RelicRegistry.ts` - レジストリ本体（register/get API）
- `src/lib/game/Domain/Effect/Relics/RelicEffectEngine.ts` - 発動判定・効果計算エンジン
- `src/lib/game/Domain/Effect/Relics/RelicStateDispatcher.ts` - 状態更新・フック実行ディスパッチャー
- `src/lib/game/Domain/Effect/Relics/index.ts` - 全レリック登録、`initializeRelicRegistry()`

### 個別レリックモジュール（52ファイル）

- `src/lib/game/Domain/Effect/Relics/ChainMaster.ts` - 連鎖の達人
- `src/lib/game/Domain/Effect/Relics/Rensha.ts` - 連射
- `src/lib/game/Domain/Effect/Relics/SizeBonusFactory.ts` - サイズボーナス1〜6のファクトリ
- `src/lib/game/Domain/Effect/Relics/Bandaid.ts` - 絆創膏
- `src/lib/game/Domain/Effect/Relics/Copy.ts` - コピー
- 他47ファイル

### スコア計算統合

- `src/lib/game/Domain/Effect/PatternEffectHandler.ts` - `calculateScoreBreakdown()`（レリック効果統合）
- `src/lib/game/Domain/Effect/CopyRelicResolver.ts` - コピー対象解決ロジック

### Reducer統合

- `src/lib/game/State/Reducers/GameReducer.ts` - `dispatchRelicStateEvent()`, `dispatchOnPiecePlaced()` 呼び出し
- `src/lib/game/State/Reducers/PlayerReducer.ts` - レリック追加・削除・並べ替え

### ショップ

- `src/lib/game/Services/ShopService.ts` - `generateRelicShopItems()`

## 更新履歴

- 2026-02-20: レリックシステムの大規模リファクタリングを反映。RelicModule, RelicRegistry, RelicEffectEngine, RelicStateDispatcherによるモジュール化を追記。レリック数52種に更新
- 2026-02-19: 護符をamulet-system.mdに分離、各レリック詳細をrelic-list.mdに分離。レリック目標数を150種に変更。レアリティ出現重みを70%/25%/5%/0.3%に変更
- 2026-02-19: レリック定義テーブルのdescriptionをコードに合わせて更新。具体的な価格（10G/15G/20G/25G）を記載。タイミングレリックの判定条件を「残りハンド数が3で割り切れる」に修正
- 2026-02-19: A×B方式スコア計算に基づき更新。full_clear_bonus→乗算レリック（列点×5）、RELIC_EFFECT_VALUES定数値追記、rensha増分+1
- 2026-02-17: コードに基づいて全面書き直し（全レリック一覧・RELIC_EFFECT_VALUES定数・スコア適用順序・コピーレリック・台本・火山・絆創膏・タイミング・状態管理・ショップルールを追加）
- 2026-02-17: レリック中心設計を反映（所持上限5枠、売却機能、レアリティ価格帯、カテゴリ拡充計画、護符システム追加）
- 2026-02-06: 初版作成（JSVersionSpecから移植）

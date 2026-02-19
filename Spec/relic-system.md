# レリックシステム

## 概要

恒久的なパッシブ効果を持つアイテムシステム。ショップでゴールドを消費して購入し、複数所持可能。ゲームオーバー時に全てリセットされる。

各レリックの詳細は [relic-list.md](./relic-list.md) を参照。
護符システムは [amulet-system.md](./amulet-system.md) を参照。

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
  totalBlocks + sealScoreBonus
  + 加算レリック（sizeBonusTotal, copyBonus）（relicDisplayOrder順）
  + comboBonus

列点(B):
  linesCleared × luckyMultiplier + mossBonus
  + 台本レリック加算（scriptLineBonus, copyLineBonus）
  × 乗算レリック（relicDisplayOrder順、切り捨てなし）
    chain_master / single_line / takenoko / kani / nobi_takenoko
    / nobi_kani / rensha / timing / full_clear_bonus
  × copy（コピー対象レリックの直後に適用）

最終スコア = Math.floor(A × B)
```

詳細は [game-mechanics.md](./game-mechanics.md) を参照。

### 乗算レリックの適用順序

乗算レリックは `relicDisplayOrder`（プレイヤーが並べ替えた表示順）に従って適用される。`relicDisplayOrder` が空の場合はデフォルト順序が使用される。

```
デフォルト順序:
chain_master → single_line → takenoko → kani → nobi_takenoko → nobi_kani → rensha → timing
```

各乗算ステップでは切り捨てなしで列点(B)に乗算される。最終的に `Math.floor(A × B)` で切り捨てが行われる。

### コピーレリックの乗算タイミング

コピーレリックは `relicDisplayOrder` 内でコピー対象レリックの**直後**に乗算を適用する。

## プレイヤー状態でのレリック管理

```typescript
interface PlayerState {
  ownedRelics: readonly RelicId[]       // 所持レリックID一覧
  relicDisplayOrder: readonly RelicId[] // 表示順・乗算適用順
}
```

- `ownedRelics` と `relicDisplayOrder` は常に同じ要素を保持する
- レリック購入時: 両配列の末尾に追加
- レリック削除時（デバッグ用）: 両配列から除去
- ゲームオーバー時: `resetPlayerState` で両配列をクリア

## ショップでのレリック販売ルール

`ShopService.ts` の `generateRelicShopItems` 関数が担当する。

- 全レリックから未所持のもののみを対象とする
- 未所持レリックをシャッフルし、最大3件を選択してショップに表示する
- 全レリックを所持済みの場合、レリック商品は表示されない
- 各レリックの価格は `RELIC_DEFINITIONS` に定義された `price` を使用する
- ショップ生成時に全商品（ブロック・レリック含む）の中からランダムに1件がセール対象になる（セール価格は元値から割引）

## レリックのカテゴリ拡充計画（150種）

現在20種 → 150種へ拡充予定。以下のカテゴリで構成する。

| カテゴリ | 説明 | 例 | 目安数 |
|---|---|---|---|
| **加算系** | 条件を満たすとスコアに+N | サイズボーナス、全消しボーナス | 25〜35 |
| **乗算系** | 条件を満たすとスコアに×N | Chain Master、Single Line | 25〜35 |
| **成長系** | 使うほど効果が上がる | 連射、のびのび系 | 15〜20 |
| **経済系** | ゴールド獲得に影響 | 利息UP、売却額UP、ラウンド報酬UP | 15〜20 |
| **デッキ操作系** | 手札やドローに影響 | ドロー+1、ハンド+N、ストック枠 | 15〜20 |
| **条件変更系** | ゲームルールを変える | ボード拡張、ライン条件変更 | 15〜20 |
| **シナジー系** | 他レリックや特定パターン/シールと連携 | パターン依存倍率、シール依存効果 | 20〜30 |
| **リスク/リターン系** | 高リスク高リターン | 確率で2倍/0倍、HP制約付き倍率 | 15〜20 |

### 既存レリックの扱い

- 現在の20種のレリックはそのまま残す
- **コピーレリック**: 5枠制限で位置管理がより重要になり、面白さが増す
- **価格の再調整**: 新レアリティ体系に合わせて全レリックの価格を再設定

### 実装フェーズ

段階的に拡充: 50 → 100 → 150種

> ※レリック拡充は未実装。現在20種。

## 関連ファイル

- `src/lib/game/Domain/Effect/Relic.ts` - レリック定義マスターデータ、`RELIC_EFFECT_VALUES` 定数、`RELIC_DEFINITIONS` 辞書
- `src/lib/game/Domain/Effect/RelicState.ts` - `RelicMultiplierState` 型、累積倍率の更新関数
- `src/lib/game/Domain/Effect/RelicEffectHandler.ts` - 発動判定・スコア計算の純粋関数
- `src/lib/game/Domain/Effect/RelicEffectTypes.ts` - 型定義（コンテキスト・発動状態・計算結果）
- `src/lib/game/Domain/Effect/CopyRelicResolver.ts` - コピー対象決定ロジック
- `src/lib/game/Domain/Effect/ScriptRelicState.ts` - 台本レリックの指定ライン生成
- `src/lib/game/Domain/Effect/PatternEffectHandler.ts` - `calculateScoreBreakdown`（スコア計算全体フロー）
- `src/lib/game/Domain/Player/PlayerState.ts` - プレイヤー状態型（`ownedRelics`, `relicDisplayOrder`）
- `src/lib/game/State/Reducers/PlayerReducer.ts` - レリック追加・削除操作
- `src/lib/game/Services/ShopService.ts` - ショップでのレリック販売ロジック

## 更新履歴

- 2026-02-19: 護符をamulet-system.mdに分離、各レリック詳細をrelic-list.mdに分離。レリック目標数を150種に変更。レアリティ出現重みを70%/25%/5%/0.3%に変更
- 2026-02-19: レリック定義テーブルのdescriptionをコードに合わせて更新。具体的な価格（10G/15G/20G/25G）を記載。タイミングレリックの判定条件を「残りハンド数が3で割り切れる」に修正
- 2026-02-19: A×B方式スコア計算に基づき更新。full_clear_bonus→乗算レリック（列点×5）、RELIC_EFFECT_VALUES定数値追記、rensha増分+1
- 2026-02-17: コードに基づいて全面書き直し（全レリック一覧・RELIC_EFFECT_VALUES定数・スコア適用順序・コピーレリック・台本・火山・絆創膏・タイミング・状態管理・ショップルールを追加）
- 2026-02-17: レリック中心設計を反映（所持上限5枠、売却機能、レアリティ価格帯、カテゴリ拡充計画、護符システム追加）
- 2026-02-06: 初版作成（JSVersionSpecから移植）

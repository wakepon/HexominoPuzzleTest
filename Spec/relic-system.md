# レリックシステム

## 概要

恒久的なパッシブ効果を持つアイテムシステム。ショップでゴールドを消費して購入し、複数所持可能。ゲームオーバー時に全てリセットされる。

## レリックの基本仕様

### 獲得方法

- ショップでゴールドを消費して購入
- 1つのレリックは1回のみ購入可能（すでに所持しているものはショップに表示されない）

### 効果適用

- 所持している間、常に効果が適用される
- 特定条件を満たした時にのみ発動するタイプと、ライン消去ごとに累積するタイプがある

### リセット条件

- ゲームオーバー時に全てのレリックがリセットされる

## レアリティ

| レアリティ | 日本語名 |
|------------|----------|
| common | コモン |
| uncommon | アンコモン |
| rare | レア |
| epic | エピック |

## レリック一覧

| type | name | rarity | price | icon | description |
|------|------|--------|-------|------|-------------|
| `full_clear_bonus` | 全消しボーナス | common | 低価格 | 🏆 | 盤面を全て空にするとスコア加算 |
| `size_bonus_1` | 1サイズボーナス | common | 低価格 | 1️⃣ | 1ブロックのピースでライン消去時にスコア加算 |
| `size_bonus_2` | 2サイズボーナス | common | 低価格 | 2️⃣ | 2ブロックのピースでライン消去時にスコア加算 |
| `size_bonus_3` | 3サイズボーナス | common | 低価格 | 3️⃣ | 3ブロックのピースでライン消去時にスコア加算 |
| `size_bonus_4` | 4サイズボーナス | common | 低価格 | 4️⃣ | 4ブロックのピースでライン消去時にスコア加算 |
| `size_bonus_5` | 5サイズボーナス | common | 低価格 | 5️⃣ | 5ブロックのピースでライン消去時にスコア加算 |
| `size_bonus_6` | 6サイズボーナス | common | 低価格 | 6️⃣ | 6ブロックのピースでライン消去時にスコア加算 |
| `chain_master` | 連鎖の達人 | rare | 中価格 | ⛓️ | 複数行列を同時消しでスコア倍率増加 |
| `single_line` | シングルライン | uncommon | 中価格 | ➖ | 1行または1列のみ消した時、スコア倍率増加 |
| `takenoko` | タケノコ | common | 低価格 | 🎋 | 縦列のみ揃った時、スコア×揃った列数 |
| `kani` | カニ | common | 低価格 | 🦀 | 横列のみ揃った時、スコア×揃った行数 |
| `rensha` | 連射 | rare | 中価格 | 🔫 | ライン消去ごとにスコア倍率が累積加算（消去なしでリセット） |
| `nobi_takenoko` | のびのびタケノコ | uncommon | 中価格 | 🌱 | 縦列のみ揃えるたびに倍率累積加算（横列消去でリセット） |
| `nobi_kani` | のびのびカニ | uncommon | 中価格 | 🦞 | 横列のみ揃えるたびに倍率累積加算（縦列消去でリセット） |
| `hand_stock` | 手札ストック | epic | 高価格 | 📦 | ストック枠が出現し、ブロックを1つ保管可能 |
| `script` | 台本 | uncommon | 中価格 | 📜 | ラウンド開始時に指定ラインが2本出現。揃えるとスコア加算（2本同時でボーナス増加） |
| `volcano` | 火山 | uncommon | 中価格 | 🌋 | ラウンド中にブロックが消えなかった場合、ハンド0で全消去（ブロック数に応じたスコア加算） |
| `bandaid` | 絆創膏 | rare | 中価格 | 🩹 | 一定ハンド消費ごとにノーハンド付きモノミノが手札に追加 |
| `timing` | タイミング | uncommon | 中価格 | ⌛ | 一定ハンドに1回、スコア倍率増加 |
| `copy` | コピー | epic | 高価格 | 🪞 | 1つ上のレリックの効果をコピー |

## RELIC_EFFECT_VALUES（効果値定数）

`src/lib/game/Domain/Effect/Relic.ts` の `RELIC_EFFECT_VALUES` に定義された定数。

| 定数名 | 用途 |
|--------|------|
| `CHAIN_MASTER_MULTIPLIER` | 連鎖の達人の倍率 |
| `SIZE_BONUS_SCORE` | サイズボーナス系の加算スコア |
| `FULL_CLEAR_BONUS` | 全消しボーナスの加算スコア |
| `SINGLE_LINE_MULTIPLIER` | シングルラインの倍率 |
| `RENSHA_INCREMENT` | 連射1回あたりの倍率加算量 |
| `NOBI_INCREMENT` | のびのび系1回あたりの倍率加算量 |
| `SCRIPT_BONUS_SINGLE` | 台本: 指定ライン1本揃い時の加算スコア |
| `SCRIPT_BONUS_DOUBLE` | 台本: 指定ライン2本同時揃い時の加算スコア |
| `VOLCANO_MULTIPLIER` | 火山: 消去ブロック数に掛ける倍率 |
| `BANDAID_TRIGGER_COUNT` | 絆創膏: 発動に必要なハンド消費回数 |
| `TIMING_TRIGGER_COUNT` | タイミング: 発動に必要なハンド消費回数 |
| `TIMING_MULTIPLIER` | タイミングの倍率 |

## レリック効果の発動条件

| type | 発動条件 | 効果種別 |
|------|----------|----------|
| `full_clear_bonus` | ライン消去後に盤面が完全に空 | 加算 |
| `size_bonus_1〜6` | 対応するブロック数のピース配置でライン消去 | 加算 |
| `chain_master` | 消去ライン数が2以上 | 乗算 |
| `single_line` | 消去ライン数がちょうど1 | 乗算 |
| `takenoko` | 縦列のみ消去（行消去なし、列消去1以上） | 乗算（消去列数） |
| `kani` | 横列のみ消去（列消去なし、行消去1以上） | 乗算（消去行数） |
| `rensha` | ライン消去あり | 乗算（累積倍率） |
| `nobi_takenoko` | 縦列のみ消去 | 乗算（累積倍率） |
| `nobi_kani` | 横列のみ消去 | 乗算（累積倍率） |
| `script` | 台本で指定された行/列が揃った | 加算 |
| `timing` | ボーナス待機状態かつライン消去あり | 乗算 |
| `copy` | コピー対象レリックの発動条件に準ずる | 乗算または加算 |

### タケノコ・カニの相互排他性

- `takenoko`（縦列のみ）と `kani`（横列のみ）は同時発動しない
- 縦列と横列が混在する消去では両方とも発動しない

## スコア計算の適用順序

最終スコアは以下の順序で計算される。

```
1. 基本スコア = 総消去ブロック数 × 消去ライン数
2. コンボボーナス（加算）
3. lucky効果（乗算）
4. シールスコアボーナス（加算）
   ↓ ここまでが scoreBeforeRelics
5. 乗算レリック（relicDisplayOrder の並び順に適用、各ステップで切り捨て）
   - chain_master / single_line / takenoko / kani / nobi_takenoko / nobi_kani / rensha / timing
   - copy（コピー対象レリックの直後に適用）
   ↓ ここまでが scoreAfterRelicMultipliers
6. 加算レリック（乗算後に一括加算）
   - sizeBonusTotal（サイズボーナス）
   - fullClearBonus（全消しボーナス）
   - scriptBonus（台本ボーナス）
   - copyBonus（コピー加算ボーナス）
   ↓ 最終スコア (finalScore)
```

### 乗算レリックの適用順序

乗算レリックは `relicDisplayOrder`（プレイヤーが並べ替えた表示順）に従って適用される。`relicDisplayOrder` が空の場合はデフォルト順序が使用される。

```
デフォルト順序:
chain_master → single_line → takenoko → kani → nobi_takenoko → nobi_kani → rensha → timing
```

各乗算ステップでは `Math.floor`（切り捨て）が適用される。

### コピーレリックの乗算タイミング

コピーレリックは `relicDisplayOrder` 内でコピー対象レリックの**直後**に乗算を適用する。

## コピーレリックの仕組み

### 対象決定ロジック

`CopyRelicResolver.ts` の `resolveCopyTarget` 関数が担当する。

- `relicDisplayOrder` 上でコピーレリック（`copy`）の1つ前のレリックがコピー対象となる
- 以下の場合、コピーレリックは無効（グレーアウト）となる:
  - `relicDisplayOrder` の先頭に配置された場合（1つ前のレリックが存在しない）
  - 1つ前のレリックもコピーレリックの場合（コピーの連鎖は不可）

### コピー可能なレリック効果

**乗算系レリック**（倍率をそのままコピー）:
- `chain_master`, `single_line`, `takenoko`, `kani`
- `rensha`, `nobi_takenoko`, `nobi_kani`, `timing`

**加算系レリック**（ボーナス値をそのままコピー）:
- `size_bonus_1〜6`, `full_clear_bonus`, `script`

### コピーレリックの独自カウンター（2スロット目のストック）

コピー対象が累積系レリック（`rensha`, `nobi_takenoko`, `nobi_kani`, `timing`）の場合、コピーレリックは本体とは独立した専用カウンター（`CopyRelicState`）で状態を管理する。

```typescript
interface CopyRelicState {
  targetRelicId: RelicId | null   // コピー対象のレリックID
  timingCounter: number           // コピー用タイミングカウンター
  timingBonusActive: boolean      // コピー用タイミングボーナス待機状態
  bandaidCounter: number          // コピー用絆創膏カウンター
  renshaMultiplier: number        // コピー用連射累積倍率
  nobiTakenokoMultiplier: number  // コピー用のびのびタケノコ累積倍率
  nobiKaniMultiplier: number      // コピー用のびのびカニ累積倍率
}
```

### コピー対象変更時のリセット

`shouldResetCopyState` で `relicDisplayOrder` の並び替え前後でコピー対象が変わった場合、コピーレリックのカウンターがリセットされる。

## 累積倍率系レリックの状態管理

### RelicMultiplierState（全倍率状態）

```typescript
interface RelicMultiplierState {
  nobiTakenokoMultiplier: number  // のびのびタケノコ累積倍率（初期値 1.0）
  nobiKaniMultiplier: number      // のびのびカニ累積倍率（初期値 1.0）
  renshaMultiplier: number        // 連射累積倍率（初期値 1.0）
  bandaidCounter: number          // 絆創膏カウンター（0〜TRIGGER_COUNT-1、発動で0リセット）
  timingCounter: number           // タイミングカウンター
  timingBonusActive: boolean      // タイミングボーナス待機状態
  copyRelicState: CopyRelicState | null  // コピーレリック状態（未所持時はnull）
}
```

全倍率状態はラウンド開始時に `resetAllMultipliers()` でリセットされる。

### 連射（rensha）の状態遷移

- ライン消去あり: 倍率を一定値加算
- ライン消去なし: 倍率を初期値（1.0）にリセット

### のびのびタケノコ（nobi_takenoko）の状態遷移

- 縦列のみ消去: 倍率を一定値加算
- 横列消去あり: 倍率を初期値（1.0）にリセット
- 消去なし: 変化なし

### のびのびカニ（nobi_kani）の状態遷移

- 横列のみ消去: 倍率を一定値加算
- 縦列消去あり: 倍率を初期値（1.0）にリセット
- 消去なし: 変化なし

### 絆創膏（bandaid）の状態遷移

- ハンド消費のたびにカウンターが+1される
- カウンターが閾値（`BANDAID_TRIGGER_COUNT`）に達した時点で発動し、カウンターを0にリセット
- 発動時: ノーハンド付きモノミノが手札に追加される
- `getBandaidCountdown` で発動まであと何ハンドかを取得可能

### タイミング（timing）の状態遷移

- ハンド消費のたびにカウンターが+1される
- カウンターが `TIMING_TRIGGER_COUNT - 1` に達するとボーナス待機状態（`timingBonusActive: true`）になる
- ボーナス待機状態でハンド消費すると: 倍率がスコアに適用され、カウンターと待機状態がリセットされる
- ノーハンドで消費した場合はカウンターが進まず、ボーナス待機状態が維持される
- `getTimingCountdown` で発動まであと何ハンドかを取得可能

## 台本レリック（script）の仕組み

### 指定ライン生成

`ScriptRelicState.ts` の `generateScriptLines` 関数が担当する。

- ラウンド開始時に呼ばれる
- グリッドの全ライン（行と列の合計）からランダムに異なる2本を選択する
- 選択結果は `ScriptRelicLines`（`target1` / `target2`）として保持される

```typescript
interface ScriptRelicLines {
  target1: { type: 'row' | 'col'; index: number }
  target2: { type: 'row' | 'col'; index: number }
}
```

### 発動時のスコア加算

- 指定ライン1本揃い: `SCRIPT_BONUS_SINGLE` を加算
- 指定ライン2本同時揃い: `SCRIPT_BONUS_DOUBLE` を加算

### コピー時の台本ボーナス

コピーレリックが台本をコピーした場合、指定ラインの本数は増加せず、スコアボーナスのみが重複して加算される。

## 火山レリック（volcano）の仕組み

- ラウンド中に一切ブロックが消えなかった場合に発動
- ハンドが0になった時（または残り手札がなくなった時）に全消去を実行
- 消去したブロック数に `VOLCANO_MULTIPLIER` を掛けた値がスコアに加算される

## 手札ストック（hand_stock）の仕組み

- 所持すると手札にストック枠が出現する
- ストック枠にブロックを1つ保管できる
- 保管したブロックは任意のタイミングで取り出して使用可能

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

- 2026-02-17: コードに基づいて全面書き直し（全レリック一覧・RELIC_EFFECT_VALUES定数・スコア適用順序・コピーレリック・台本・火山・絆創膏・タイミング・状態管理・ショップルールを追加）
- 2026-02-06: 初版作成（JSVersionSpecから移植）

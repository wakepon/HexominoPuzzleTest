# レリック一覧・詳細

レリックシステムの概要は [relic-system.md](./relic-system.md) を参照。

## レリック一覧

| type | name | rarity | price | icon | description |
|------|------|--------|-------|------|-------------|
| `full_clear_bonus` | 全消しボーナス | common | 10G | 🏆 | 盤面を全て空にした際に列点×5 |
| `size_bonus_1` | 1サイズボーナス | common | 10G | 1️⃣ | 1ブロックのピースでライン消去時、各ブロック点を+1 |
| `size_bonus_2` | 2サイズボーナス | common | 10G | 2️⃣ | 2ブロックのピースでライン消去時、各ブロック点を+1 |
| `size_bonus_3` | 3サイズボーナス | common | 10G | 3️⃣ | 3ブロックのピースでライン消去時、各ブロック点を+1 |
| `size_bonus_4` | 4サイズボーナス | common | 10G | 4️⃣ | 4ブロックのピースでライン消去時、各ブロック点を+1 |
| `size_bonus_5` | 5サイズボーナス | common | 10G | 5️⃣ | 5ブロックのピースでライン消去時、各ブロック点を+1 |
| `size_bonus_6` | 6サイズボーナス | common | 10G | 6️⃣ | 6ブロックのピースでライン消去時、各ブロック点を+1 |
| `chain_master` | 連鎖の達人 | rare | 20G | ⛓️ | 複数行列を同時消しで列点×1.5 |
| `single_line` | シングルライン | uncommon | 15G | ➖ | 1行または1列のみ消した時、列点×3 |
| `takenoko` | タケノコ | common | 10G | 🎋 | 縦列のみ揃った時、列点×揃った列数 |
| `kani` | カニ | common | 10G | 🦀 | 横列のみ揃った時、列点×揃った行数 |
| `rensha` | 連射 | rare | 20G | 🔫 | ライン揃うたびに列点+1（揃わないとリセット） |
| `nobi_takenoko` | のびのびタケノコ | uncommon | 15G | 🌱 | 縦列のみ揃えるたびに列点+0.5を加える（横列消しでリセット）初期値は列点×1 |
| `nobi_kani` | のびのびカニ | uncommon | 15G | 🦞 | 横列のみ揃えるたびに列点+0.5を加える（縦列消しでリセット）初期値は列点×1 |
| `hand_stock` | 手札ストック | epic | 25G | 📦 | ストック枠が出現し、ブロックを1つ保管可能 |
| `script` | 台本 | uncommon | 15G | 📜 | ラウンド開始時に指定ラインが2本出現。揃えた際の列数+1、2本同時で+2 |
| `volcano` | 火山 | uncommon | 15G | 🌋 | ラウンド中にブロックが消えなかった場合、ハンド0で全消去（ブロック数×フィールド最大列数） |
| `bandaid` | 絆創膏 | rare | 20G | 🩹 | 3ハンド消費ごとにノーハンド付きモノミノが手札に追加 |
| `timing` | タイミング | uncommon | 15G | ⌛ | 残りハンド数が3で割り切れるとき、列点×3 |
| `copy` | コピー | epic | 25G | 🪞 | 1つ上のレリックの効果をコピー |

## RELIC_EFFECT_VALUES（効果値定数）

`src/lib/game/Domain/Effect/Relic.ts` の `RELIC_EFFECT_VALUES` に定義された定数。

| 定数名 | 値 | 用途 |
|--------|-----|------|
| `CHAIN_MASTER_MULTIPLIER` | 1.5 | 連鎖の達人の列倍率 |
| `FULL_CLEAR_MULTIPLIER` | 5 | 全消しボーナスの列倍率 |
| `SINGLE_LINE_MULTIPLIER` | 3 | シングルラインの列倍率 |
| `RENSHA_INCREMENT` | 1 | 連射1回あたりの累積倍率加算量 |
| `NOBI_INCREMENT` | 0.5 | のびのび系1回あたりの累積倍率加算量 |
| `SCRIPT_LINE_BONUS_SINGLE` | 1 | 台本: 指定ライン1本揃い時のライン数加算 |
| `SCRIPT_LINE_BONUS_DOUBLE` | 2 | 台本: 指定ライン2本同時揃い時のライン数加算 |
| `BANDAID_TRIGGER_COUNT` | 3 | 絆創膏: 発動に必要なハンド消費回数 |
| `TIMING_MULTIPLIER` | 3 | タイミングの列倍率 |

## レリック効果の発動条件

| type | 発動条件 | 効果種別 |
|------|----------|----------|
| `full_clear_bonus` | ライン消去後に盤面が完全に空 | 乗算（列点×5） |
| `size_bonus_1〜6` | 対応するブロック数のピース配置でライン消去 | 加算（ブロック点+消去ブロック数） |
| `chain_master` | 消去ライン数が2以上 | 乗算（列点×1.5） |
| `single_line` | 消去ライン数がちょうど1 | 乗算（列点×3） |
| `takenoko` | 縦列のみ消去（行消去なし、列消去1以上） | 乗算（列点×消去列数） |
| `kani` | 横列のみ消去（列消去なし、行消去1以上） | 乗算（列点×消去行数） |
| `rensha` | ライン消去あり | 乗算（列点×累積倍率、+1ずつ増加） |
| `nobi_takenoko` | 縦列のみ消去 | 乗算（列点×累積倍率、+0.5ずつ増加） |
| `nobi_kani` | 横列のみ消去 | 乗算（列点×累積倍率、+0.5ずつ増加） |
| `script` | 台本で指定された行/列が揃った | ライン数加算（+1または+2） |
| `timing` | 残りハンド数が3で割り切れる、かつライン消去あり | 乗算（列点×3） |
| `copy` | コピー対象レリックの発動条件に準ずる | 乗算または加算 |

### タケノコ・カニの相互排他性

- `takenoko`（縦列のみ）と `kani`（横列のみ）は同時発動しない
- 縦列と横列が混在する消去では両方とも発動しない

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
- `size_bonus_1〜6`

※ `full_clear_bonus` は乗算系レリック（列点×5）のため、乗算系としてコピーされる。

**ライン数加算系レリック**（ライン数ボーナスをそのままコピー）:
- `script`

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

- 発動条件: 残りハンド数が3で割り切れる、かつライン消去あり
- 判定は消去時に行われ、残りハンド数（`remainingHands`）が `% 3 === 0` の場合に発動
- 発動時は列点に×3の倍率が適用される

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

### 発動時のライン数加算

- 指定ライン1本揃い: `SCRIPT_LINE_BONUS_SINGLE`（+1）をライン数に加算
- 指定ライン2本同時揃い: `SCRIPT_LINE_BONUS_DOUBLE`（+2）をライン数に加算
- 加算されたライン数は列点(B)の計算に使用される

### コピー時の台本効果

コピーレリックが台本をコピーした場合、指定ラインの本数は増加せず、ライン数加算のみが重複して適用される。

## 火山レリック（volcano）の仕組み

- ラウンド中に一切ブロックが消えなかった場合に発動
- ハンドが0になった時（または残り手札がなくなった時）に全消去を実行
- スコア計算: 消去ブロック数 × `GRID_SIZE`（フィールド最大列数=6）を基本スコアとする
- 他レリックのスコア倍率効果も適用される（全6行+全6列=12ライン消去扱い）
  - 連鎖の達人: totalLines=12 ≥ 2 → 発動（×1.5）
  - 全消しボーナス: 全消去で常に盤面が空 → 発動（×5）
  - タイミング: カウンター次第で発動（×2）
  - シングルライン/タケノコ/カニ: 条件に合致しないため発動しない
  - 台本/サイズボーナス: 無効化（scriptRelicLines=null, placedBlockSize=0）

## 手札ストック（hand_stock）の仕組み

- 所持すると手札にストック枠が出現する
- ストック枠にブロックを1つ保管できる
- 保管したブロックは任意のタイミングで取り出して使用可能

## 関連ファイル

- `src/lib/game/Domain/Effect/Relic.ts` - レリック定義マスターデータ、`RELIC_EFFECT_VALUES` 定数
- `src/lib/game/Domain/Effect/RelicState.ts` - `RelicMultiplierState` 型、累積倍率の更新関数
- `src/lib/game/Domain/Effect/RelicEffectHandler.ts` - 発動判定・スコア計算の純粋関数
- `src/lib/game/Domain/Effect/RelicEffectTypes.ts` - 型定義（コンテキスト・発動状態・計算結果）
- `src/lib/game/Domain/Effect/CopyRelicResolver.ts` - コピー対象決定ロジック
- `src/lib/game/Domain/Effect/ScriptRelicState.ts` - 台本レリックの指定ライン生成

## 更新履歴

- 2026-02-19: relic-system.mdから分離して独立ファイル化

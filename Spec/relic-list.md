# レリック一覧・詳細

レリックシステムの概要は [relic-system.md](./relic-system.md) を参照。

---

## `full_clear_bonus` 全消しボーナス

| 項目 | 内容 |
|------|------|
| icon | 🏆 |
| rarity | common |
| price | 10G |
| 効果 | 盤面を全て空にした際に列点**×5** |
| 発動条件 | ライン消去後に盤面が完全に空 |
| リセット | なし（条件達成ごとに発動） |
| 設計意図 | 全消しという高難度プレイへの大きな報酬。逆転要素 |
| シナジー | volcano（全消去で確定発動）、小ピースで盤面管理 |

---

## `size_bonus_1` 1サイズボーナス

| 項目 | 内容 |
|------|------|
| icon | 1️⃣ |
| rarity | common |
| price | 10G |
| 効果 | **1ブロック**のピースでライン消去時、各ブロック点を**+1** |
| 発動条件 | 1ブロックのピースを配置してライン消去 |
| リセット | なし |
| 設計意図 | モノミノ中心のデッキ構成に方向性を与える |
| シナジー | bandaid（ノーハンド付きモノミノ供給）、消滅の護符（デッキ整理） |

## `size_bonus_2` 2サイズボーナス

| 項目 | 内容 |
|------|------|
| icon | 2️⃣ |
| rarity | common |
| price | 10G |
| 効果 | **2ブロック**のピースでライン消去時、各ブロック点を**+1** |
| 発動条件 | 2ブロックのピースを配置してライン消去 |
| リセット | なし |
| 設計意図 | ドミノ中心のデッキ構成に方向性を与える |
| シナジー | 造形の護符（サイズ調整）、copy（加算効果を倍増） |

## `size_bonus_3` 3サイズボーナス

| 項目 | 内容 |
|------|------|
| icon | 3️⃣ |
| rarity | common |
| price | 10G |
| 効果 | **3ブロック**のピースでライン消去時、各ブロック点を**+1** |
| 発動条件 | 3ブロックのピースを配置してライン消去 |
| リセット | なし |
| 設計意図 | トロミノ中心のデッキ構成に方向性を与える |
| シナジー | 造形の護符（サイズ調整）、copy（加算効果を倍増） |

## `size_bonus_4` 4サイズボーナス

| 項目 | 内容 |
|------|------|
| icon | 4️⃣ |
| rarity | common |
| price | 10G |
| 効果 | **4ブロック**のピースでライン消去時、各ブロック点を**+1** |
| 発動条件 | 4ブロックのピースを配置してライン消去 |
| リセット | なし |
| 設計意図 | テトロミノ中心のデッキ構成に方向性を与える |
| シナジー | 造形の護符（サイズ調整）、copy（加算効果を倍増） |

## `size_bonus_5` 5サイズボーナス

| 項目 | 内容 |
|------|------|
| icon | 5️⃣ |
| rarity | common |
| price | 10G |
| 効果 | **5ブロック**のピースでライン消去時、各ブロック点を**+1** |
| 発動条件 | 5ブロックのピースを配置してライン消去 |
| リセット | なし |
| 設計意図 | ペントミノ中心のデッキ構成に方向性を与える |
| シナジー | 造形の護符（サイズ調整）、copy（加算効果を倍増） |

## `size_bonus_6` 6サイズボーナス

| 項目 | 内容 |
|------|------|
| icon | 6️⃣ |
| rarity | common |
| price | 10G |
| 効果 | **6ブロック**のピースでライン消去時、各ブロック点を**+1** |
| 発動条件 | 6ブロックのピースを配置してライン消去 |
| リセット | なし |
| 設計意図 | ヘキソミノ中心のデッキ構成に方向性を与える。配置難度が高い分の報酬 |
| シナジー | 造形の護符（サイズ調整）、copy（加算効果を倍増） |

---

## `chain_master` 連鎖の達人

| 項目 | 内容 |
|------|------|
| icon | ⛓️ |
| rarity | rare |
| price | 20G |
| 効果 | 複数行列を同時消しで列点**×1.5** |
| 発動条件 | 消去ライン数が2以上 |
| リセット | なし |
| 設計意図 | 同時消しの安定した報酬。計画的な配置を促す |
| シナジー | single_lineと相互排他（戦略の方向性が異なる）、script（複数ライン達成で台本も揃いやすい） |

---

## `single_line` シングルライン

| 項目 | 内容 |
|------|------|
| icon | ➖ |
| rarity | uncommon |
| price | 15G |
| 効果 | 1行または1列のみ消した時、列点**×3** |
| 発動条件 | 消去ライン数がちょうど1 |
| リセット | なし |
| 設計意図 | 1ライン消しという堅実プレイへの高倍率報酬 |
| シナジー | chain_masterと相互排他。rensha（毎ターン1ライン消し戦略）と好相性 |

---

## `takenoko` タケノコ

| 項目 | 内容 |
|------|------|
| icon | 🎋 |
| rarity | common |
| price | 10G |
| 効果 | 縦列のみ揃った時、列点**×揃った列数** |
| 発動条件 | 縦列のみ消去（行消去なし、列消去1以上） |
| リセット | なし |
| 設計意図 | 縦方向特化のビルドを可能にする |
| シナジー | nobi_takenoko（縦列連続でさらに成長）、kaniと相互排他 |

---

## `kani` カニ

| 項目 | 内容 |
|------|------|
| icon | 🦀 |
| rarity | common |
| price | 10G |
| 効果 | 横列のみ揃った時、列点**×揃った行数** |
| 発動条件 | 横列のみ消去（列消去なし、行消去1以上） |
| リセット | なし |
| 設計意図 | 横方向特化のビルドを可能にする |
| シナジー | nobi_kani（横列連続でさらに成長）、takenokoと相互排他 |

> **タケノコ・カニの相互排他性**: 縦列と横列が混在する消去では両方とも発動しない。

---

## `rensha` 連射

| 項目 | 内容 |
|------|------|
| icon | 🔫 |
| rarity | rare |
| price | 20G |
| 効果 | ライン消去のたびに累積倍率が**+1**ずつ増加（列点×累積倍率） |
| 発動条件 | ライン消去あり |
| リセット | 消去なしのハンドで累積倍率が1.0にリセット |
| 設計意図 | 連続消去を報酬化。毎ターン確実にラインを揃える戦略を促す |
| シナジー | single_line（毎ターン1ライン消し）、bandaid（追加ピースで消去機会増加） |

---

## `nobi_takenoko` のびのびタケノコ

| 項目 | 内容 |
|------|------|
| icon | 🌱 |
| rarity | uncommon |
| price | 15G |
| 効果 | 縦列のみ揃えるたびに累積倍率が**+0.5**ずつ増加（初期値×1） |
| 発動条件 | 縦列のみ消去 |
| リセット | 横列消去ありで累積倍率が1.0にリセット |
| 設計意図 | 縦列特化の成長型報酬。縦のみを貫く覚悟を要求 |
| シナジー | takenoko（縦列特化の基本倍率）、copy（成長倍率を独立カウンターで二重取り） |

---

## `nobi_kani` のびのびカニ

| 項目 | 内容 |
|------|------|
| icon | 🦞 |
| rarity | uncommon |
| price | 15G |
| 効果 | 横列のみ揃えるたびに累積倍率が**+0.5**ずつ増加（初期値×1） |
| 発動条件 | 横列のみ消去 |
| リセット | 縦列消去ありで累積倍率が1.0にリセット |
| 設計意図 | 横列特化の成長型報酬。横のみを貫く覚悟を要求 |
| シナジー | kani（横列特化の基本倍率）、copy（成長倍率を独立カウンターで二重取り） |

---

## `hand_stock` 手札ストック

| 項目 | 内容 |
|------|------|
| icon | 📦 |
| rarity | epic |
| price | 25G |
| 効果 | ストック枠が出現し、ピースを**1つ保管可能** |
| 発動条件 | 常時（所持するだけで枠が出現） |
| リセット | なし |
| 設計意図 | 手札管理の自由度を大幅に向上。戦略の幅を広げる汎用レリック |
| シナジー | 全レリックと相性良好（最適なピースを温存できる） |

---

## `script` 台本

| 項目 | 内容 |
|------|------|
| icon | 📜 |
| rarity | uncommon |
| price | 15G |
| 効果 | ラウンド開始時に指定ラインが2本出現。揃えた際の列数**+1**、2本同時で**+2** |
| 発動条件 | 台本で指定された行/列が揃った時 |
| リセット | ラウンドごとに指定ラインが再抽選 |
| 設計意図 | ランダム性のある短期目標を提供。配置計画に変化を与える |
| シナジー | chain_master（複数ライン同時消しで台本ライン達成しやすい）、copy（ライン数加算を二重取り） |

### 台本の詳細仕様

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

- 指定ライン1本揃い: `SCRIPT_LINE_BONUS_SINGLE`（+1）をライン数に加算
- 指定ライン2本同時揃い: `SCRIPT_LINE_BONUS_DOUBLE`（+2）をライン数に加算
- コピー時: 指定ラインの本数は増加せず、ライン数加算のみが重複して適用

---

## `volcano` 火山

| 項目 | 内容 |
|------|------|
| icon | 🌋 |
| rarity | uncommon |
| price | 15G |
| 効果 | ラウンド中にブロックが消えなかった場合、ハンド0で全消去（ブロック数**×**フィールド最大列数） |
| 発動条件 | ラウンド中にライン消去が一切なく、ハンドが0になった時 |
| リセット | ラウンドごと |
| 設計意図 | あえて消さない戦略を可能にするリスク/リターン系。通常プレイと真逆のアプローチ |
| シナジー | full_clear_bonus（火山発動＝全消し確定で×5）、chain_master（12ライン消去扱いで発動） |

### 火山の他レリック連携

- 連鎖の達人: totalLines=12 ≥ 2 → 発動（×1.5）
- 全消しボーナス: 全消去で常に盤面が空 → 発動（×5）
- タイミング: カウンター次第で発動
- シングルライン/タケノコ/カニ: 条件に合致しないため発動しない
- 台本/サイズボーナス: 無効化（scriptRelicLines=null, placedBlockSize=0）

---

## `bandaid` 絆創膏

| 項目 | 内容 |
|------|------|
| icon | 🩹 |
| rarity | rare |
| price | 20G |
| 効果 | **3ハンド**消費ごとにノーハンド付きモノミノが手札に追加 |
| 発動条件 | ハンド消費カウンターが閾値（`BANDAID_TRIGGER_COUNT` = 3）に到達 |
| リセット | 発動時にカウンターが0にリセット |
| 設計意図 | 定期的に追加ピースを供給し、手数の自由度を向上 |
| シナジー | rensha（追加ピースで連続消去維持）、size_bonus_1（モノミノなので1サイズボーナスと好相性） |

---

## `timing` タイミング

| 項目 | 内容 |
|------|------|
| icon | ⌛ |
| rarity | uncommon |
| price | 15G |
| 効果 | 残りハンド数が3で割り切れるとき、列点**×3** |
| 発動条件 | 残りハンド数 % 3 === 0、かつライン消去あり |
| リセット | なし（条件は残りハンド数に依存） |
| 設計意図 | 特定タイミングでの消去に高倍率を付与。計画的なハンド管理を促す |
| シナジー | bandaid（ハンド管理との相性）、copy（独立カウンターで二重取り） |

---

## `copy` コピー

| 項目 | 内容 |
|------|------|
| icon | 🪞 |
| rarity | epic |
| price | 25G |
| 効果 | `relicDisplayOrder`上で**1つ上**のレリックの効果をコピー |
| 発動条件 | コピー対象レリックの発動条件に準ずる |
| リセット | コピー対象変更時（並び替え時）にカウンターリセット |
| 設計意図 | レリックの並び順に意味を持たせる。ビルドの完成度を高めるキーストーン |
| シナジー | 全乗算系レリック（効果を二重化）。位置管理が重要 |

### コピーの詳細仕様

**対象決定ロジック** (`CopyRelicResolver.ts`)
- `relicDisplayOrder` 上で1つ前のレリックがコピー対象
- 以下の場合、無効（グレーアウト）:
  - `relicDisplayOrder` の先頭に配置された場合
  - 1つ前のレリックもコピーの場合（コピー連鎖は不可）

**コピー可能な効果**

| 効果種別 | 対象レリック |
|----------|-------------|
| 乗算系 | chain_master, single_line, takenoko, kani, rensha, nobi_takenoko, nobi_kani, timing, full_clear_bonus |
| 加算系 | size_bonus_1〜6 |
| ライン数加算系 | script |

**独自カウンター** (`CopyRelicState`)

コピー対象が累積系レリック（rensha, nobi_takenoko, nobi_kani, timing）の場合、本体とは独立した専用カウンターで状態を管理する。

```typescript
interface CopyRelicState {
  targetRelicId: RelicId | null
  timingCounter: number
  timingBonusActive: boolean
  bandaidCounter: number
  renshaMultiplier: number
  nobiTakenokoMultiplier: number
  nobiKaniMultiplier: number
}
```

`shouldResetCopyState` で並び替え前後のコピー対象変更を検出し、カウンターをリセットする。

---

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

## 関連ファイル

- `src/lib/game/Domain/Effect/Relic.ts` - レリック定義マスターデータ、`RELIC_EFFECT_VALUES` 定数
- `src/lib/game/Domain/Effect/RelicState.ts` - `RelicMultiplierState` 型、累積倍率の更新関数
- `src/lib/game/Domain/Effect/RelicEffectHandler.ts` - 発動判定・スコア計算の純粋関数
- `src/lib/game/Domain/Effect/RelicEffectTypes.ts` - 型定義（コンテキスト・発動状態・計算結果）
- `src/lib/game/Domain/Effect/CopyRelicResolver.ts` - コピー対象決定ロジック
- `src/lib/game/Domain/Effect/ScriptRelicState.ts` - 台本レリックの指定ライン生成

## 更新履歴

- 2026-02-19: 各レリックを個別テーブル形式（icon/rarity/price/効果/発動条件/リセット/設計意図/シナジー）にリフォーマット
- 2026-02-19: relic-system.mdから分離して独立ファイル化

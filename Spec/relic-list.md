# レリック一覧

レリックシステムの概要は [relic-system.md](./relic-system.md) を参照。

本ファイルは全52種のレリック詳細を記載する。

---

## レリックの構造

各レリックは以下の要素を持つ:

- **name**: レリック名
- **description**: 効果説明
- **rarity**: `common` / `uncommon` / `rare` / `epic`
- **price**: ショップ購入価格（ゴールド）
- **icon**: 表示アイコン
- **scoreEffect**: スコア計算への寄与タイプ
  - `multiplicative`: 列点(B)に乗算
  - `additive`: ブロック点(A)に加算
  - `line_additive`: ライン数に加算
  - `none`: スコアに直接影響しない

---

## 📋 レリック一覧（52種）

### サイズボーナス系（6種）

#### `size_bonus_1` 1サイズボーナス

| 項目 | 内容 |
|------|------|
| icon | 1️⃣ |
| rarity | common |
| price | 10G |
| scoreEffect | additive |
| 効果 | 1ブロックのピースでライン消去時、各ブロック点に加算 |
| 発動条件 | 1ブロックピースを配置してライン消去 |
| 設計意図 | モノミノ中心のデッキ構成に方向性を与える |
| シナジー | bandaid（ノーハンド付きモノミノ供給）、消滅の護符（デッキ整理） |

#### `size_bonus_2` 2サイズボーナス

| 項目 | 内容 |
|------|------|
| icon | 2️⃣ |
| rarity | common |
| price | 10G |
| scoreEffect | additive |
| 効果 | 2ブロックのピースでライン消去時、各ブロック点に加算 |
| 発動条件 | 2ブロックピースを配置してライン消去 |
| 設計意図 | ドミノ中心のデッキ構成に方向性を与える |

#### `size_bonus_3` 3サイズボーナス

| 項目 | 内容 |
|------|------|
| icon | 3️⃣ |
| rarity | common |
| price | 10G |
| scoreEffect | additive |
| 効果 | 3ブロックのピースでライン消去時、各ブロック点に加算 |
| 発動条件 | 3ブロックピースを配置してライン消去 |
| 設計意図 | トロミノ中心のデッキ構成に方向性を与える |

#### `size_bonus_4` 4サイズボーナス

| 項目 | 内容 |
|------|------|
| icon | 4️⃣ |
| rarity | common |
| price | 10G |
| scoreEffect | additive |
| 効果 | 4ブロックのピースでライン消去時、各ブロック点に加算 |
| 発動条件 | 4ブロックピースを配置してライン消去 |
| 設計意図 | テトロミノ中心のデッキ構成に方向性を与える |

#### `size_bonus_5` 5サイズボーナス

| 項目 | 内容 |
|------|------|
| icon | 5️⃣ |
| rarity | common |
| price | 10G |
| scoreEffect | additive |
| 効果 | 5ブロックのピースでライン消去時、各ブロック点に加算 |
| 発動条件 | 5ブロックピースを配置してライン消去 |
| 設計意図 | ペントミノ中心のデッキ構成に方向性を与える |

#### `size_bonus_6` 6サイズボーナス

| 項目 | 内容 |
|------|------|
| icon | 6️⃣ |
| rarity | common |
| price | 10G |
| scoreEffect | additive |
| 効果 | 6ブロックのピースでライン消去時、各ブロック点に加算 |
| 発動条件 | 6ブロックピースを配置してライン消去 |
| 設計意図 | ヘキソミノ中心のデッキ構成。配置難度が高い分の報酬 |

---

### 乗算系（基本倍率）

#### `chain_master` 連鎖の達人

| 項目 | 内容 |
|------|------|
| icon | ⛓️ |
| rarity | rare |
| price | 20G |
| scoreEffect | multiplicative |
| 効果 | 複数行列を同時消しで列点に倍率適用 |
| 発動条件 | 消去ライン数が2以上 |
| 設計意図 | 同時消しの安定した報酬。計画的な配置を促す |
| シナジー | single_lineと相互排他、script（複数ライン達成で台本も揃いやすい） |

#### `full_clear_bonus` 全消しボーナス

| 項目 | 内容 |
|------|------|
| icon | 🏆 |
| rarity | common |
| price | 10G |
| scoreEffect | multiplicative |
| 効果 | 盤面を全て空にした際に列点に倍率適用 |
| 発動条件 | ライン消去後に盤面が完全に空 |
| 設計意図 | 全消しという高難度プレイへの大きな報酬 |
| シナジー | volcano（全消去で確定発動）、小ピースで盤面管理 |

#### `single_line` シングルライン

| 項目 | 内容 |
|------|------|
| icon | ➖ |
| rarity | uncommon |
| price | 15G |
| scoreEffect | multiplicative |
| 効果 | 1行または1列のみ消した時、列点に倍率適用 |
| 発動条件 | 消去ライン数がちょうど1 |
| 設計意図 | 1ライン消しという堅実プレイへの高倍率報酬 |
| シナジー | chain_masterと相互排他、rensha（毎ターン1ライン消し戦略）と好相性 |

#### `takenoko` タケノコ

| 項目 | 内容 |
|------|------|
| icon | 🎋 |
| rarity | common |
| price | 10G |
| scoreEffect | multiplicative |
| 効果 | 縦列のみ揃った時、列点に揃った列数を乗算 |
| 発動条件 | 縦列のみ消去（行消去なし、列消去1以上） |
| 設計意図 | 縦方向特化のビルドを可能にする |
| シナジー | nobi_takenoko（縦列連続でさらに成長）、kaniと相互排他 |

#### `kani` カニ

| 項目 | 内容 |
|------|------|
| icon | 🦀 |
| rarity | common |
| price | 10G |
| scoreEffect | multiplicative |
| 効果 | 横列のみ揃った時、列点に揃った行数を乗算 |
| 発動条件 | 横列のみ消去（列消去なし、行消去1以上） |
| 設計意図 | 横方向特化のビルドを可能にする |
| シナジー | nobi_kani（横列連続でさらに成長）、takenokoと相互排他 |

> **タケノコ・カニの相互排他性**: 縦列と横列が混在する消去では両方とも発動しない。

#### `meteor` 流星

| 項目 | 内容 |
|------|------|
| icon | ☄️ |
| rarity | rare |
| price | 20G |
| scoreEffect | multiplicative |
| 効果 | 3ライン以上同時消しで列点に倍率適用 |
| 発動条件 | 消去ライン数が3以上 |
| 設計意図 | 大量消しに高倍率報酬 |

#### `symmetry` シンメトリー

| 項目 | 内容 |
|------|------|
| icon | ⚖️ |
| rarity | uncommon |
| price | 15G |
| scoreEffect | multiplicative |
| 効果 | 消去した行数と列数が同数の時、列点に倍率適用 |
| 発動条件 | 消去行数 == 消去列数 |
| 設計意図 | バランス重視のプレイスタイルを報酬化 |

#### `crescent` 三日月

| 項目 | 内容 |
|------|------|
| icon | 🌙 |
| rarity | uncommon |
| price | 15G |
| scoreEffect | multiplicative |
| 効果 | 残りハンド数が奇数の時、列点に倍率適用 |
| 発動条件 | 残りハンド数が奇数、かつライン消去あり |
| 設計意図 | 特定タイミングでの消去に高倍率を付与 |

#### `last_stand` ラストスタンド

| 項目 | 内容 |
|------|------|
| icon | 🔥 |
| rarity | rare |
| price | 20G |
| scoreEffect | multiplicative |
| 効果 | 残りハンド数が2以下の時、列点に倍率適用 |
| 発動条件 | 残りハンド数 ≤ 2、かつライン消去あり |
| 設計意図 | 終盤の逆転要素。ピンチをチャンスに変える |

#### `overload` 過負荷

| 項目 | 内容 |
|------|------|
| icon | ⚡ |
| rarity | rare |
| price | 20G |
| scoreEffect | multiplicative |
| 効果 | 盤面の75%以上が埋まっている状態でライン消去すると列点に倍率適用 |
| 発動条件 | 盤面埋まりセル数が総セル数の75%以上（消去前判定） |
| 設計意図 | リスク/リターン系。盤面圧迫を報酬化 |

#### `orchestra` オーケストラ

| 項目 | 内容 |
|------|------|
| icon | 🎵 |
| rarity | uncommon |
| price | 15G |
| scoreEffect | multiplicative |
| 効果 | 1回の消去で3種類以上の異なるパターンが含まれると列点に倍率適用 |
| 発動条件 | 消去セル内の異なるパターン種類数 ≥ 3 |
| 設計意図 | パターン多様性を報酬化 |

---

### 乗算系（累積倍率）

#### `rensha` 連射

| 項目 | 内容 |
|------|------|
| icon | 🔫 |
| rarity | rare |
| price | 20G |
| scoreEffect | multiplicative |
| 効果 | ライン消去のたびに累積倍率が増加（列点×累積倍率） |
| 発動条件 | ライン消去あり |
| リセット | 消去なしのハンドで累積倍率が初期値にリセット |
| 設計意図 | 連続消去を報酬化。毎ターン確実にラインを揃える戦略を促す |
| シナジー | single_line（毎ターン1ライン消し）、bandaid（追加ピースで消去機会増加） |

#### `nobi_takenoko` のびのびタケノコ

| 項目 | 内容 |
|------|------|
| icon | 🌱 |
| rarity | uncommon |
| price | 15G |
| scoreEffect | multiplicative |
| 効果 | 縦列のみ揃えるたびに累積倍率が増加（初期値は×1） |
| 発動条件 | 縦列のみ消去 |
| リセット | 横列消去ありで累積倍率が初期値にリセット |
| 設計意図 | 縦列特化の成長型報酬。縦のみを貫く覚悟を要求 |
| シナジー | takenoko（縦列特化の基本倍率）、copy（成長倍率を独立カウンターで二重取り） |

#### `nobi_kani` のびのびカニ

| 項目 | 内容 |
|------|------|
| icon | 🦞 |
| rarity | uncommon |
| price | 15G |
| scoreEffect | multiplicative |
| 効果 | 横列のみ揃えるたびに累積倍率が増加（初期値は×1） |
| 発動条件 | 横列のみ消去 |
| リセット | 縦列消去ありで累積倍率が初期値にリセット |
| 設計意図 | 横列特化の成長型報酬。横のみを貫く覚悟を要求 |
| シナジー | kani（横列特化の基本倍率）、copy（成長倍率を独立カウンターで二重取り） |

#### `timing` タイミング

| 項目 | 内容 |
|------|------|
| icon | ⌛ |
| rarity | uncommon |
| price | 15G |
| scoreEffect | multiplicative |
| 効果 | 残りハンド数が3で割り切れるとき、列点に倍率適用 |
| 発動条件 | 残りハンド数 % 3 === 0、かつライン消去あり |
| 設計意図 | 特定タイミングでの消去に高倍率を付与。計画的なハンド管理を促す |
| シナジー | bandaid（ハンド管理との相性）、copy（独立カウンターで二重取り） |

#### `first_strike` 先制攻撃

| 項目 | 内容 |
|------|------|
| icon | ⚡ |
| rarity | uncommon |
| price | 15G |
| scoreEffect | multiplicative |
| 効果 | ラウンド中の最初のライン消去で列点に倍率適用 |
| 発動条件 | ラウンド中にまだライン消去していない、かつライン消去あり |
| リセット | ラウンドごと |
| 設計意図 | ラウンド序盤の大消しを促す |

#### `patience` 忍耐

| 項目 | 内容 |
|------|------|
| icon | 🧘 |
| rarity | rare |
| price | 20G |
| scoreEffect | multiplicative |
| 効果 | 連続3回以上消去なしの後の次の消去で列点に倍率適用 |
| 発動条件 | 連続非消去ハンド数が3以上に到達後、チャージ状態で消去 |
| リセット | 発動後、またはラウンドごと |
| 設計意図 | あえて消さない戦略を可能にするリスク/リターン系 |

#### `muscle` 筋肉

| 項目 | 内容 |
|------|------|
| icon | 💪 |
| rarity | uncommon |
| price | 15G |
| scoreEffect | multiplicative |
| 効果 | 4ブロック以上のピースを配置するたびに列点に累積ボーナスを加算（ラウンド中） |
| 発動条件 | 累積ボーナス > 0、かつライン消去あり |
| リセット | ラウンドごと |
| 設計意図 | 大ピース使用を促す累積報酬 |

#### `collector` 収集家

| 項目 | 内容 |
|------|------|
| icon | 🎪 |
| rarity | uncommon |
| price | 15G |
| scoreEffect | multiplicative |
| 効果 | ラウンド中に消去した異なるパターン種類1種につき列点に累積ボーナスを加算 |
| 発動条件 | 累積ボーナス > 0、かつライン消去あり |
| リセット | ラウンドごと |
| 設計意図 | パターン多様性を長期的に報酬化 |

---

### 加算系（ブロック点加算）

#### `anchor` アンカー

| 項目 | 内容 |
|------|------|
| icon | ⚓ |
| rarity | common |
| price | 10G |
| scoreEffect | additive |
| 効果 | ラウンド中の最初のライン消去時、各ブロック点に加算 |
| 発動条件 | ラウンド中にまだライン消去していない、かつライン消去あり |
| リセット | ラウンドごと |
| 設計意図 | 序盤の大消しを促す |

#### `crown` 王冠

| 項目 | 内容 |
|------|------|
| icon | 👑 |
| rarity | uncommon |
| price | 15G |
| scoreEffect | additive |
| 効果 | ライン消去時、消去セルのパターン付きブロック1個につきブロック点に加算 |
| 発動条件 | パターン付きブロック数 > 0 |
| 設計意図 | パターン付きブロックの価値を増幅 |

#### `stamp` スタンプ

| 項目 | 内容 |
|------|------|
| icon | 📬 |
| rarity | uncommon |
| price | 15G |
| scoreEffect | additive |
| 効果 | ライン消去時、消去セルのシール付きブロック1個につきブロック点に加算 |
| 発動条件 | シール付きブロック数 > 0 |
| 設計意図 | シール付きブロックの価値を増幅 |

#### `compass` コンパス

| 項目 | 内容 |
|------|------|
| icon | 🧭 |
| rarity | uncommon |
| price | 15G |
| scoreEffect | additive |
| 効果 | 行と列を同時に消した時、各ブロック点に加算 |
| 発動条件 | 行消去 > 0 かつ 列消去 > 0 |
| 設計意図 | 十字消しを促す |

#### `featherweight` 軽量級

| 項目 | 内容 |
|------|------|
| icon | 🪶 |
| rarity | common |
| price | 10G |
| scoreEffect | additive |
| 効果 | 2ブロック以下のピース配置でライン消去時、各ブロック点に加算 |
| 発動条件 | 配置ブロックサイズ ≤ 2、かつライン消去あり |
| 設計意図 | 小ピースの価値を向上 |

#### `heavyweight` 重量級

| 項目 | 内容 |
|------|------|
| icon | 🏋️ |
| rarity | common |
| price | 10G |
| scoreEffect | additive |
| 効果 | 5ブロック以上のピース配置でライン消去時、各ブロック点に加算 |
| 発動条件 | 配置ブロックサイズ ≥ 5、かつライン消去あり |
| 設計意図 | 大ピースの価値を向上 |

#### `cross` 十字

| 項目 | 内容 |
|------|------|
| icon | ✝️ |
| rarity | rare |
| price | 20G |
| scoreEffect | additive |
| 効果 | 行と列を同時に消した時、交差セルのブロック点に加算 |
| 発動条件 | 行消去 > 0 かつ 列消去 > 0 |
| 設計意図 | 十字消しの交差点に特別な報酬 |

#### `twin` 双子

| 項目 | 内容 |
|------|------|
| icon | 👯 |
| rarity | common |
| price | 10G |
| scoreEffect | additive |
| 効果 | 同サイズのピースを連続配置してライン消去時、ブロック点に加算 |
| 発動条件 | 直前配置ピースと今回配置ピースのサイズが同一、かつライン消去あり |
| 設計意図 | 連続配置パターンを報酬化 |

#### `minimalist` ミニマリスト

| 項目 | 内容 |
|------|------|
| icon | 🔳 |
| rarity | uncommon |
| price | 15G |
| scoreEffect | additive |
| 効果 | デッキ枚数が5枚以下の時、全ブロック点に加算 |
| 発動条件 | デッキサイズ ≤ 5、かつライン消去あり |
| 設計意図 | 小デッキ戦略を報酬化 |

#### `alchemist` 錬金術師

| 項目 | 内容 |
|------|------|
| icon | ⚗️ |
| rarity | rare |
| price | 20G |
| scoreEffect | additive |
| 効果 | パターンとシール両方持ちのブロック消去時、1個につきブロック点に加算 |
| 発動条件 | パターン+シール両方持ちブロック数 > 0 |
| 設計意図 | ハイブリッドブロックに高価値を付与 |

#### `snowball` 雪だるま

| 項目 | 内容 |
|------|------|
| icon | ⛄ |
| rarity | rare |
| price | 20G |
| scoreEffect | additive |
| 効果 | ライン消去ごとにブロック点に累積加算（ラウンドをまたいで永続） |
| 発動条件 | 累積ボーナス > 0、かつライン消去あり |
| リセット | リセットなし（永続） |
| 設計意図 | ゲーム全体を通じた成長要素 |

#### `gardener` 庭師

| 項目 | 内容 |
|------|------|
| icon | 🌻 |
| rarity | uncommon |
| price | 15G |
| scoreEffect | additive |
| 効果 | パターン付きブロックを消すたびにブロック点に累積加算（ラウンド中） |
| 発動条件 | 累積ボーナス > 0、かつライン消去あり |
| リセット | ラウンドごと |
| 設計意図 | パターン消去を累積報酬化 |

#### `furnace` 溶鉱炉

| 項目 | 内容 |
|------|------|
| icon | 🏭 |
| rarity | uncommon |
| price | 15G |
| scoreEffect | additive |
| 効果 | stoneシール付きブロック消去時、1個につきブロック点に加算 |
| 発動条件 | stoneシール付きブロック数 > 0 |
| 設計意図 | stoneシール（通常はデメリット）を報酬化 |

---

### ライン数加算系

#### `script` 台本

| 項目 | 内容 |
|------|------|
| icon | 📜 |
| rarity | uncommon |
| price | 15G |
| scoreEffect | line_additive |
| 効果 | ラウンド開始時に指定ラインが2本出現。揃えた際の列数に加算 |
| 発動条件 | 台本で指定された行/列が揃った時 |
| リセット | ラウンドごとに指定ラインが再抽選 |
| 設計意図 | ランダム性のある短期目標を提供。配置計画に変化を与える |
| シナジー | chain_master（複数ライン同時消しで台本ライン達成しやすい） |

**台本の詳細仕様**

- ラウンド開始時にグリッドの全ライン（行と列の合計）からランダムに異なる2本を選択
- 選択結果は `ScriptRelicLines`（`target1` / `target2`）として保持
- 指定ライン1本揃い: ライン数に加算
- 指定ライン2本同時揃い: ライン数にさらに加算
- コピー時: 指定ラインの本数は増加せず、ライン数加算のみが重複適用

#### `gambler` ギャンブラー

| 項目 | 内容 |
|------|------|
| icon | 🎰 |
| rarity | uncommon |
| price | 15G |
| scoreEffect | line_additive |
| 効果 | ライン消去時、ランダムに列数を加算 |
| 発動条件 | ライン消去あり |
| 設計意図 | ランダム性を報酬化 |

---

### 特殊系（スコア直接影響なし）

#### `hand_stock` 手札ストック

| 項目 | 内容 |
|------|------|
| icon | 📦 |
| rarity | epic |
| price | 25G |
| scoreEffect | none |
| 効果 | ストック枠が出現し、ピースを1つ保管可能 |
| 発動条件 | 常時（所持するだけで枠が出現） |
| 設計意図 | 手札管理の自由度を大幅に向上。戦略の幅を広げる汎用レリック |
| シナジー | 全レリックと相性良好（最適なピースを温存できる） |

#### `copy` コピー

| 項目 | 内容 |
|------|------|
| icon | 🪞 |
| rarity | epic |
| price | 25G |
| scoreEffect | none（コピー対象の効果に準ずる） |
| 効果 | `relicDisplayOrder`上で1つ上のレリックの効果をコピー |
| 発動条件 | コピー対象レリックの発動条件に準ずる |
| リセット | コピー対象変更時（並び替え時）にカウンターリセット |
| 設計意図 | レリックの並び順に意味を持たせる。ビルドの完成度を高めるキーストーン |
| シナジー | 全乗算系レリック（効果を二重化）。位置管理が重要 |

**コピーの詳細仕様**

- `relicDisplayOrder` 上で1つ前のレリックがコピー対象
- 以下の場合、無効（グレーアウト）:
  - `relicDisplayOrder` の先頭に配置された場合
  - 1つ前のレリックもコピーの場合（コピー連鎖は不可）
- コピー対象が累積系レリック（rensha, nobi_takenoko, nobi_kani, timing等）の場合、本体とは独立した専用カウンターで状態を管理

#### `volcano` 火山

| 項目 | 内容 |
|------|------|
| icon | 🌋 |
| rarity | uncommon |
| price | 15G |
| scoreEffect | none（Reducer側で全消去処理） |
| 効果 | ラウンド中にブロックが消えなかった場合、ハンド0で全消去 |
| 発動条件 | ラウンド中にライン消去が一切なく、ハンドが0になった時 |
| リセット | ラウンドごと |
| 設計意図 | あえて消さない戦略を可能にするリスク/リターン系 |
| シナジー | full_clear_bonus（火山発動＝全消し確定）、chain_master（12ライン消去扱い） |

**火山の他レリック連携**

- 連鎖の達人: totalLines=12 ≥ 2 → 発動
- 全消しボーナス: 全消去で常に盤面が空 → 発動
- タイミング: カウンター次第で発動
- シングルライン/タケノコ/カニ: 条件に合致しないため発動しない
- 台本/サイズボーナス: 無効化（scriptRelicLines=null, placedBlockSize=0）

#### `bandaid` 絆創膏

| 項目 | 内容 |
|------|------|
| icon | 🩹 |
| rarity | rare |
| price | 20G |
| scoreEffect | none |
| 効果 | 一定ハンド消費ごとにノーハンド付きモノミノが手札に追加 |
| 発動条件 | ハンド消費カウンターが閾値に到達 |
| リセット | 発動時にカウンターが0にリセット |
| 設計意図 | 定期的に追加ピースを供給し、手数の自由度を向上 |
| シナジー | rensha（追加ピースで連続消去維持）、size_bonus_1（モノミノなので1サイズボーナスと好相性） |

#### `merchant` 商人

| 項目 | 内容 |
|------|------|
| icon | 🏪 |
| rarity | uncommon |
| price | 15G |
| scoreEffect | none |
| 効果 | ショップのリロール費用を減額 |
| 発動条件 | 常時（ショップ処理で適用） |
| 設計意図 | ショップ活用を促す |

#### `treasure_hunter` トレジャーハンター

| 項目 | 内容 |
|------|------|
| icon | 💎 |
| rarity | common |
| price | 10G |
| scoreEffect | none |
| 効果 | ゴールドシール（G）付きブロック消去時、追加でゴールド獲得 |
| 発動条件 | ゴールドシール付きブロック消去時 |
| 設計意図 | ゴールド収集を促す |

#### `midas` ミダス

| 項目 | 内容 |
|------|------|
| icon | ✨ |
| rarity | uncommon |
| price | 15G |
| scoreEffect | none |
| 効果 | 全消し時にゴールド獲得 |
| 発動条件 | 全消し達成時 |
| 設計意図 | 全消し戦略にゴールド報酬を追加 |

#### `extra_draw` 追加ドロー

| 項目 | 内容 |
|------|------|
| icon | 🃏 |
| rarity | epic |
| price | 25G |
| scoreEffect | none |
| 効果 | ドロー枚数が増加 |
| 発動条件 | 常時（DeckServiceで適用） |
| 設計意図 | 手札選択肢を増やす |

#### `extra_hand` 追加ハンド

| 項目 | 内容 |
|------|------|
| icon | ✋ |
| rarity | epic |
| price | 25G |
| scoreEffect | none |
| 効果 | ラウンド中のハンド数が増加 |
| 発動条件 | 常時（RoundServiceで適用） |
| 設計意図 | 行動回数を増やす |

#### `recycler` リサイクラー

| 項目 | 内容 |
|------|------|
| icon | ♻️ |
| rarity | uncommon |
| price | 15G |
| scoreEffect | none |
| 効果 | ラウンド中に手札1枚を入替可能（上限あり） |
| 発動条件 | Reducer側でアクション処理 |
| 設計意図 | 手札事故を軽減 |

#### `amplifier` アンプリファイア

| 項目 | 内容 |
|------|------|
| icon | 🔊 |
| rarity | epic |
| price | 25G |
| scoreEffect | none |
| 効果 | enhancedパターン（★）のブロック点ボーナスを強化 |
| 発動条件 | 常時（PatternEffectHandlerで適用） |
| 設計意図 | enhancedパターンの価値を増幅 |

#### `phoenix` 不死鳥

| 項目 | 内容 |
|------|------|
| icon | 🐦‍🔥 |
| rarity | epic |
| price | 25G |
| scoreEffect | none |
| 効果 | ラウンド失敗時、1度だけラウンドをやり直せる（使用後消滅） |
| 発動条件 | game_over時（Reducer側でインターセプト） |
| 設計意図 | 1度だけの救済措置 |

#### `goldfish` 金魚

| 項目 | 内容 |
|------|------|
| icon | 🐠 |
| rarity | common |
| price | 10G |
| scoreEffect | none |
| 効果 | ラウンドクリア時にスコアが目標の2倍以上で追加ゴールド獲得 |
| 発動条件 | ラウンドクリア時判定 |
| 設計意図 | 高スコア達成を報酬化 |

#### `magnet` 磁石

| 項目 | 内容 |
|------|------|
| icon | 🧲 |
| rarity | uncommon |
| price | 15G |
| scoreEffect | none |
| 効果 | chargeパターン（⚡）の蓄積速度を倍増 |
| 発動条件 | 常時（BoardServiceで適用） |
| 設計意図 | chargeパターンを実用的にする |

#### `prism` プリズム

| 項目 | 内容 |
|------|------|
| icon | 🔻 |
| rarity | rare |
| price | 20G |
| scoreEffect | none |
| 効果 | multiシール（×2）の効果を強化 |
| 発動条件 | 常時（SealEffectHandlerで適用） |
| 設計意図 | multiシールの価値を増幅 |

#### `jester` 道化師

| 項目 | 内容 |
|------|------|
| icon | 🃎 |
| rarity | rare |
| price | 20G |
| scoreEffect | none |
| 効果 | レリック枠が1枠減少する代わりに、ショップで全商品が割引 |
| 発動条件 | 常時（ショップ価格計算で適用） |
| 設計意図 | トレードオフ型。ショップ活用戦略を促す |

---

## 累積状態管理

累積系レリックの状態は `RelicMultiplierState` で一元管理される。

```typescript
interface RelicMultiplierState {
  readonly nobiTakenokoMultiplier: number
  readonly nobiKaniMultiplier: number
  readonly renshaMultiplier: number
  readonly bandaidCounter: number
  readonly anchorHasClearedInRound: boolean
  readonly firstStrikeHasClearedInRound: boolean
  readonly patienceConsecutiveNonClearHands: number
  readonly patienceIsCharged: boolean
  readonly snowballBonus: number
  readonly muscleAccumulatedBonus: number
  readonly gardenerAccumulatedBonus: number
  readonly collectorCollectedPatterns: readonly string[]
  readonly collectorAccumulatedBonus: number
  readonly recyclerUsesRemaining: number
  readonly twinLastPlacedBlockSize: number
  readonly copyRelicState: CopyRelicState | null
}
```

累積倍率はラウンド開始時にリセットされる（snowballは永続）。

---

## 関連ファイル

- `src/lib/game/Domain/Effect/Relic.ts` - レリック定義マスターデータ（RELIC_DEFINITIONS）
- `src/lib/game/Domain/Effect/Relics/index.ts` - レリックモジュール一括登録
- `src/lib/game/Domain/Effect/Relics/RelicModule.ts` - レリックモジュール型定義
- `src/lib/game/Domain/Effect/Relics/RelicRegistry.ts` - レリックレジストリ
- `src/lib/game/Domain/Effect/Relics/*.ts` - 各レリック個別実装（52ファイル）
- `src/lib/game/Domain/Effect/RelicState.ts` - レリック状態型（RelicMultiplierState）
- `src/lib/game/Domain/Effect/Relics/RelicEffectEngine.ts` - レリック効果計算エンジン
- `src/lib/game/Domain/Effect/Relics/RelicStateDispatcher.ts` - レリック状態イベントディスパッチャー

---

## 更新履歴

- 2026-02-20: レリックモジュール化（52種）に対応。個別実装ファイルからコード読み取り、全レリックを統一フォーマットで記載。パラメータ調整対象の値は概要表現に留め、scoreEffectタイプを追加。
- 2026-02-19: 各レリックを個別テーブル形式（icon/rarity/price/効果/発動条件/リセット/設計意図/シナジー）にリフォーマット
- 2026-02-19: relic-system.mdから分離して独立ファイル化

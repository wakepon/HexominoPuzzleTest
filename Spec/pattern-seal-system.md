# パターン・シールシステム

## 概要

ブロックに特殊効果を付与するシステム。パターンはブロックセット全体に効果を付与し、シールは個別のセルに効果を付与する。パターンとシールはショップで購入でき、同一ブロックセットに両方が付与される場合もある。

## パターンシステム

### 概要

- **対象**: ブロックセット全体（全ブロックに同一パターンが適用される）
- **付与方法**: ショップで購入（サイズに応じた確率でランダム付与）
- **効果タイミング**: 消去時に発動するものと、配置時に発動するものがある

### パターン一覧（全9種）

#### 強化ブロック (enhanced)

| 項目 | 値 |
|------|-----|
| type | `enhanced` |
| 名前 | 強化ブロック |
| symbol | ★ |
| isNegative | false |
| 説明 | ブロック点+2 |
| 効果タイミング | 消去時 |

**効果**: 消去対象セルのうち `enhanced` パターンを持つセルごとに、乗算対象ブロック数を加算する。

---

#### ラッキーブロック (lucky)

| 項目 | 値 |
|------|-----|
| type | `lucky` |
| 名前 | ラッキーブロック |
| symbol | ♣ |
| isNegative | false |
| 説明 | このブロックが消えると一定確率でスコア2倍 |
| 効果タイミング | 消去時 |

**効果**: 消去対象に `lucky` パターンのセルが1つでも含まれる場合、一定確率でスコアが2倍になる。当選しなかった場合は倍率1のまま（通常スコア）。

---

#### コンボブロック (combo)

| 項目 | 値 |
|------|-----|
| type | `combo` |
| 名前 | コンボブロック |
| symbol | C |
| isNegative | false |
| 説明 | 連続配置でボーナススコア |
| 効果タイミング | 配置時（スコアへの加算は消去時） |

**効果**: 直前の配置ピースが `combo` パターンを持つ場合、コンボカウントを継続させる。コンボカウントに応じて消去時のスコアボーナスが加算される（1回目=0、2回目以降は回数に応じて増加）。

---

#### オーラブロック (aura)

| 項目 | 値 |
|------|-----|
| type | `aura` |
| 名前 | オーラブロック |
| symbol | ◎ |
| isNegative | false |
| 説明 | 隣接する既存ブロックにバフ付与（消去時+1点） |
| 効果タイミング | 消去時 |

**効果**: 消去対象セルごとに、上下左右に隣接するセルを確認し、別のブロックセットIDを持つ `aura` パターンのセルが1つでも存在すれば乗算対象ブロック数を+1する。1セルあたりの上限は+1（隣接に複数のオーラブロックがあっても+1のまま）。自分と同じブロックセットIDのオーラブロックは対象外（自己強化なし）。

---

#### 苔ブロック (moss)

| 項目 | 値 |
|------|-----|
| type | `moss` |
| 名前 | 苔ブロック |
| symbol | M |
| isNegative | false |
| 説明 | フィールド端と接している辺の数だけスコア加算 |
| 効果タイミング | 消去時 |

**効果**: 消去対象セルのうち `moss` パターンを持つセルごとに、ボード端と接している辺の数だけ乗算対象ブロック数を加算する。上端・下端・左端・右端の各1点で最大+4（角のセルの場合）。

---

#### 羽ブロック (feather)

| 項目 | 値 |
|------|-----|
| type | `feather` |
| 名前 | 羽ブロック |
| symbol | F |
| isNegative | false |
| 説明 | 既にブロックがある場所に重ねて配置できる |
| 効果タイミング | 配置時 |

**効果**: 通常は埋まっているセルへの配置は不可だが、`feather` パターンの場合は `feather` 以外の既存ブロックの上に重ねて配置可能。`feather` ブロックの上に `feather` を重ねることは不可。スコア計算への特別な影響はなく、配置制約の緩和のみが効果。

---

#### ノーハンドブロック (nohand)

| 項目 | 値 |
|------|-----|
| type | `nohand` |
| 名前 | ノーハンドブロック |
| symbol | N |
| isNegative | false |
| 説明 | 配置してもハンドを消費しない |
| 効果タイミング | 配置時 |

**効果**: 配置時にデッキのハンド（残り手数）を消費しない。なお、ゲーム内では特定の条件でシステムによってモノミノに `nohand` パターンが付与されるケースもある。スコア計算への特別な影響はない。

---

#### チャージブロック (charge)

| 項目 | 値 |
|------|-----|
| type | `charge` |
| 名前 | チャージブロック |
| symbol | ⚡ |
| isNegative | false |
| 説明 | 配置後、他のブロックが置かれるたびにスコア+0.5 |
| 効果タイミング | 消去時（蓄積は他ブロック配置のたびに更新） |

**効果**: 詳細は後述のチャージ蓄積メカニクスを参照。

---

#### おじゃまブロック (obstacle)

| 項目 | 値 |
|------|-----|
| type | `obstacle` |
| 名前 | おじゃまブロック |
| symbol | × |
| isNegative | true |
| 説明 | 消去できないブロック |
| 効果タイミング | 常時 |

**効果**: ライン消去判定の対象外。ネガティブパターン（`isNegative: true`）のため、消去可能なセルのフィルタリング時に除外される。ショップには出現しない（`price: 0`、`SHOP_AVAILABLE_PATTERNS` に含まれない）。ボス戦などのゲームシステムによって盤面に配置される。

---

### charge パターンの蓄積メカニクス

チャージブロックはボードに配置された後、他のブロックが置かれるたびに内部の蓄積値（`chargeValue`）が増加する。

**蓄積ルール**:
1. チャージブロックが盤面に配置された時点では `chargeValue = 0`
2. 別のブロックセットのピースが配置されるたびに、盤面上の全 `charge` セルの `chargeValue` に一定値を加算する
3. 加算タイミングは、配置による得点計算が完了した後
4. 配置されたピース自身と同一の `blockSetId` を持つ `charge` セルは対象外（自己カウントなし）

**消去時**:
- 消去対象セルに含まれる全 `charge` セルの `chargeValue` を合計し、乗算対象ブロック数に加算する
- `charge` ブロック自身は基礎ブロック数としてカウントされない（通常ブロックの代わりに `chargeValue` のみが寄与する）

---

### ショップでのパターン出現

パターン付与はブロックセットのサイズ（small / medium / large）によって確率が異なる。

| サイズ | 対象ミノカテゴリ | パターン付与確率 | シール付与確率 |
|--------|----------------|--------------|--------------|
| small | モノミノ/ドミノ/トリミノ | 0%（付与なし） | 0%（付与なし） |
| medium | テトロミノ/ペントミノ | 中確率 | 低確率 |
| large | ペントミノ/ヘキソミノ | 高確率 | 中確率 |

- パターンとシールの付与判定は独立して行われる（両方付与されることもある）
- 付与されるパターン・シールの種類はショップ出現可能なものからランダムに均等選択

**ショップ出現可能パターン**: `enhanced`, `lucky`, `aura`, `moss`, `feather`, `nohand`, `charge`（`obstacle` は除外）

---

## シールシステム

### 概要

- **対象**: ブロックセット内の個別セル（1セルのみ）
- **付与方法**: ショップで購入（サイズに応じた確率でランダム付与）
- **効果タイミング**: 主に消去時に発動

### シール一覧（全6種）

#### ゴールドシール (gold)

| 項目 | 値 |
|------|-----|
| type | `gold` |
| 名前 | ゴールドシール |
| symbol | G |
| preventsClearing | false |
| 説明 | このブロックが消えると+1G |

**効果**: 消去時にゴールドを加算する。スコア計算には影響しない。

---

#### スコアシール (score)

| 項目 | 値 |
|------|-----|
| type | `score` |
| 名前 | スコアシール |
| symbol | +5 |
| preventsClearing | false |
| 説明 | このブロックが消えると+5点 |

**効果**: 消去時にスコアへ一定値を直接加算する。乗算対象のブロック数には影響しない（加算のみ）。

---

#### マルチシール (multi)

| 項目 | 値 |
|------|-----|
| type | `multi` |
| 名前 | マルチシール |
| symbol | ×2 |
| preventsClearing | false |
| 説明 | ライン消し時にこのブロックが2回カウントされる |

**効果**: 消去時に乗算対象ブロック数を+1する（2回カウントになる）。

---

#### 石シール (stone)

| 項目 | 値 |
|------|-----|
| type | `stone` |
| 名前 | 石 |
| symbol | 石 |
| preventsClearing | true |
| 説明 | このブロックは消えない |

**効果**: `preventsClearing: true` のため、ライン消去対象のフィルタリング時に除外される。ライン完成の判定自体は行われるが、そのセルは実際には消去されない。ショップには出現しない（`price: 0`、`SHOP_AVAILABLE_SEALS` に含まれない）。

---

#### アローシール・縦 (arrow_v)

| 項目 | 値 |
|------|-----|
| type | `arrow_v` |
| 名前 | アローシール(縦) |
| symbol | ↕ |
| preventsClearing | false |
| 説明 | 縦ライン消去時に+10/ブロック |

**効果**: 消去時にそのセルが完成した縦列に含まれている場合、スコアの乗算対象ブロック数に一定値を加算する。

---

#### アローシール・横 (arrow_h)

| 項目 | 値 |
|------|-----|
| type | `arrow_h` |
| 名前 | アローシール(横) |
| symbol | ↔ |
| preventsClearing | false |
| 説明 | 横ライン消去時に+10/ブロック |

**効果**: 消去時にそのセルが完成した横行に含まれている場合、スコアの乗算対象ブロック数に一定値を加算する。

---

**ショップ出現可能シール**: `gold`, `score`, `multi`, `arrow_v`, `arrow_h`（`stone` は除外）

---

## 効果適用ロジック

### 消去可能セルのフィルタリング

ライン消去が発生した場合、消去対象セルから以下を除外する:
- `isNegative: true` のパターンを持つセル（`obstacle` など）
- `preventsClearing: true` のシールを持つセル（`stone`）

### スコア計算フロー

```
1. 消去対象セルを収集（filterClearableCells でフィルタリング）
2. パターン効果を計算
   - enhancedBonus: enhanced セルの数 × 加算値
   - auraBonus: 隣接 aura ブロック（別セット）がある消去セルの数
   - mossBonus: moss セルごとのボード端接触辺数の合計
   - chargeBonus: charge セルの chargeValue の合計
3. シール効果を計算（CompletedLinesInfo を使用）
   - multiBonus: multi シール数（+1/個）
   - arrowBonus: arrow_v/arrow_h 条件一致数（+10相当の加算値/個）
   - goldCount: gold シール数（ゴールド加算用）
   - scoreBonus: score シール数 × 固定値（スコア直接加算）
4. 合計ブロック数（乗算対象）を算出
   totalBlocks = baseBlocks
              - chargeBlockCount（charge ブロック自身の基礎分を除外）
              + enhancedBonus
              + auraBonus
              + mossBonus
              + chargeBonus
              + multiBonus
              + arrowBonus
5. 基本スコア: baseScore = totalBlocks × linesCleared
6. コンボボーナス加算: comboBonus（1回目=0、2回目以降は回数増加に応じて増加）
7. lucky 倍率を適用: (baseScore + comboBonus) × luckyMultiplier
8. scoreシールによるスコアを加算: + sealScoreBonus
9. レリック効果を適用（乗算レリックは relicDisplayOrder の順序で適用後、加算レリックを加算）
10. 最終スコアを確定
```

### パターン効果の詳細計算

```
calculatePatternEffects(board, cellsToRemove):
    enhancedBonus = cellsToRemove に pattern==='enhanced' のセル数 × 2
    auraBonus     = cellsToRemove の各セルについて、
                    隣接する別 blockSetId の aura セルが存在すれば +1（1セルあたり上限+1）
    mossBonus     = cellsToRemove に pattern==='moss' のセルの盤面端接触辺数合計
    chargeBonus   = cellsToRemove に pattern==='charge' のセルの chargeValue 合計
```

### シール効果の詳細計算

```
calculateSealEffects(board, cellsToRemove, completedLines):
    goldCount  = seal==='gold'  のセル数
    scoreBonus = seal==='score' のセル数 × 固定値
    multiBonus = seal==='multi' のセル数（+1/個）
    arrowBonus = seal==='arrow_v' かつ completedLines.columns に col が含まれるセル数
               + seal==='arrow_h' かつ completedLines.rows   に row が含まれるセル数
               （各+10相当の加算値）
```

### charge 値の蓄積（ピース配置後）

```
incrementChargeValues(board, excludeBlockSetId):
    board 上の全セルを走査
    cell.filled && cell.pattern==='charge' && cell.blockSetId !== excludeBlockSetId
    の場合: cell.chargeValue += 0.5
```

---

## 関連ファイル

- `src/lib/game/Domain/Effect/Pattern.ts` — パターン定義・マスターデータ (`PATTERN_DEFINITIONS`, `SHOP_AVAILABLE_PATTERNS`)
- `src/lib/game/Domain/Effect/PatternEffectHandler.ts` — パターン効果計算（純粋関数）
- `src/lib/game/Domain/Effect/PatternEffectTypes.ts` — パターン効果型 (`PatternEffectResult`, `ScoreBreakdown`)
- `src/lib/game/Domain/Effect/Seal.ts` — シール定義・マスターデータ (`SEAL_DEFINITIONS`, `SHOP_AVAILABLE_SEALS`)
- `src/lib/game/Domain/Effect/SealEffectHandler.ts` — シール効果計算（純粋関数）
- `src/lib/game/Domain/Effect/SealEffectTypes.ts` — シール効果型 (`SealEffectResult`, `CompletedLinesInfo`)
- `src/lib/game/Services/BoardService.ts` — `incrementChargeValues` (charge 蓄積)
- `src/lib/game/Services/CollisionService.ts` — `canPlacePiece` (feather の重ね置き判定)
- `src/lib/game/Services/ShopService.ts` — ショップ商品生成・パターン/シール付与確率

## 更新履歴

- 2026-02-17: feather・nohand・charge・arrow_v・arrow_h を追加。ショップ出現確率・charge蓄積メカニクス・スコア計算フローを実装に基づき大幅更新
- 2026-02-06: 初版作成（JSVersionSpecから移植）

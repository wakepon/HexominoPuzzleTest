# パターンシステム

## 概要

- **対象**: ブロックセット全体（全ブロックに同一パターンが適用される）
- **付与方法**: ショップで購入（サイズに応じた確率でランダム付与）
- **効果タイミング**: 消去時に発動するものと、配置時に発動するものがある

パターンとシールはブロックに特殊効果を付与するシステム。パターンはブロックセット全体に効果を付与し、シールは個別のセルに効果を付与する。同一ブロックセットに両方が付与される場合もある。シールについては [seal-system.md](./seal-system.md) を参照。

## パターン一覧（全6種）

### 強化ブロック (enhanced)

| 項目 | 値 |
|------|-----|
| type | `enhanced` |
| 名前 | 強化ブロック |
| symbol | ★ |
| isNegative | false |
| 説明 | ブロック点+2 |
| 効果タイミング | 消去時 |

**効果**: 消去対象セルのうち `enhanced` パターンを持つセルごとに、ブロック点(A)を加算する。multiシール付きの場合はパターン効果が2倍になる。

---

### ラッキーブロック (lucky)

| 項目 | 値 |
|------|-----|
| type | `lucky` |
| 名前 | ラッキーブロック |
| symbol | ♣ |
| isNegative | false |
| 説明 | このブロックが消えると10%の確率で列点x2 |
| 効果タイミング | 消去時 |

**効果**: 消去対象に `lucky` パターンのセルが1つでも含まれる場合、一定確率で列点の起点値が2倍になる（luckyMultiplier=2）。当選しなかった場合は倍率1のまま。multiシール付きの場合は複数回抽選が行われる。

---

### 羽ブロック (feather)

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

### ノーハンドブロック (nohand)

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

### チャージブロック (charge)

| 項目 | 値 |
|------|-----|
| type | `charge` |
| 名前 | チャージブロック |
| symbol | ⚡ |
| isNegative | false |
| 説明 | 他のブロックが置かれるたび、このブロックのブロック点+1 |
| 効果タイミング | 消去時（蓄積は他ブロック配置のたびに更新） |

**効果**: 詳細は後述のチャージ蓄積メカニクスを参照。multiシール付きの場合は蓄積値が2倍になる。

---

### おじゃまブロック (obstacle)

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

## charge パターンの蓄積メカニクス

チャージブロックはボードに配置された後、他のブロックが置かれるたびに内部の蓄積値（`chargeValue`）が増加する。

**蓄積ルール**:
1. チャージブロックが盤面に配置された時点では `chargeValue = 0`
2. 別のブロックセットのピースが配置されるたびに、盤面上の全 `charge` セルの `chargeValue` に+1する
3. 加算タイミングは、配置による得点計算が完了した後
4. 配置されたピース自身と同一の `blockSetId` を持つ `charge` セルは対象外（自己カウントなし）

**消去時**:
- 消去対象セルに含まれる全 `charge` セルの `chargeValue` を合計し、乗算対象ブロック数に加算する
- `charge` ブロック自身は基礎ブロック数としてカウントされない（通常ブロックの代わりに `chargeValue` のみが寄与する）
- multiシール付きの場合は蓄積値が2倍になる（`chargeValue × 2`）

---

## ショップでのパターン出現

パターン・シール付与確率はミノサイズに関わらず一律である。

| 商品枠 | 対象ミノカテゴリ | パターン付与確率 | シール付与確率 |
|--------|----------------|--------------|--------------|
| 小中枠 | モノミノ/ドミノ/トリミノ/テトロミノ | 40% | 25% |
| 中大枠 | テトロミノ/ペントミノ/ヘキソミノ | 40% | 25% |

- パターンとシールの付与判定は独立して行われる（両方付与されることもある）
- 付与されるパターンの種類はショップ出現可能なものからランダムに均等選択

**ショップ出現可能パターン**: `enhanced`, `lucky`, `feather`, `nohand`, `charge`（`obstacle` は除外）

---

## パターン効果の計算詳細

```
calculatePatternEffects(board, cellsToRemove):
    enhancedBonus = cellsToRemove に pattern==='enhanced' のセル数 × 基準値（multi付きなら2倍）
    chargeBonus   = cellsToRemove に pattern==='charge' のセルの chargeValue 合計（multi付きなら2倍）
```

### charge 値の蓄積（ピース配置後）

```
incrementChargeValues(board, excludeBlockSetId):
    board 上の全セルを走査
    cell.filled && cell.pattern==='charge' && cell.blockSetId !== excludeBlockSetId
    の場合: cell.chargeValue += 1
```

---

## 消去可能セルのフィルタリング

ライン消去が発生した場合、消去対象セルから以下を除外する:
- `isNegative: true` のパターンを持つセル（`obstacle` など）
- `preventsClearing: true` のシールを持つセル（`stone`）

---

## スコア計算フロー（A×B方式）

最終スコアは `ブロック点(A) × 列点(B)` で計算される。詳細は [game-mechanics.md](./game-mechanics.md) を参照。

```
1. 消去対象セルを収集（filterClearableCells でフィルタリング）
2. パターン効果を計算
   - enhancedBonus: enhanced セル数 × 基準値（multi付きで2倍）→ ブロック点(A)
   - chargeBonus: charge セルの chargeValue 合計（multi付きで2倍）→ ブロック点(A)
3. シール効果を計算
   - multiBonus: multi シール数（+1/個）→ ブロック点(A)
   - goldCount: gold シール数（ゴールド加算用、スコアに影響なし）
4. バフ効果を計算
   - buffEnhancementBonus: 増強バフ効果 → ブロック点(A)
   - buffGoldMineBonus: 金鉱バフ効果 → ゴールド
   - buffPulsationBonus: 脈動バフ効果 → 列点(B)
5. totalBlocks = baseBlocks - chargeBlockCount
              + enhancedBonus + chargeBonus
              + multiBonus + buffEnhancementBonus
6. ブロック点(A) = totalBlocks + 加算レリック
7. 列点(B) = linesCleared × luckyMultiplier + buffPulsationBonus + 台本加算 × 乗算レリック
8. 最終スコア = Math.floor(A × B)
```

---

## 関連ファイル

- `src/lib/game/Domain/Effect/Pattern.ts` — パターン定義・マスターデータ (`PATTERN_DEFINITIONS`, `SHOP_AVAILABLE_PATTERNS`)
- `src/lib/game/Domain/Effect/PatternEffectHandler.ts` — パターン効果計算（純粋関数）
- `src/lib/game/Domain/Effect/PatternEffectTypes.ts` — パターン効果型 (`PatternEffectResult`, `ScoreBreakdown`)
- `src/lib/game/Services/BoardService.ts` — `incrementChargeValues` (charge 蓄積)
- `src/lib/game/Services/CollisionService.ts` — `canPlacePiece` (feather の重ね置き判定)
- `src/lib/game/Services/ShopService.ts` — ショップ商品生成・パターン付与確率

## 更新履歴

- 2026-02-20: `combo`, `aura`, `moss` パターンを削除。全6種に更新。バフ効果をスコア計算フローに追加
- 2026-02-19: pattern-seal-system.md から分離
- 2026-02-19: マルチシールがパターン効果を2倍化する仕様を明記。各パターンのdescriptionをコードに合わせて更新
- 2026-02-19: A×B方式（ブロック点×列点）に基づくスコア計算フロー更新。mossBonus→列点(B)、charge蓄積値+1、enhanced/auraのmultiシール効果追記
- 2026-02-17: feather・nohand・charge を追加。ショップ出現確率・charge蓄積メカニクス・スコア計算フローを実装に基づき大幅更新
- 2026-02-06: 初版作成（JSVersionSpecから移植）

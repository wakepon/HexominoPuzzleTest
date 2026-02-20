# シールシステム

## 概要

- **対象**: ブロックセット内の個別セル（1セルのみ）
- **付与方法**: ショップで購入（サイズに応じた確率でランダム付与）
- **効果タイミング**: 主に消去時に発動

パターンとシールはブロックに特殊効果を付与するシステム。パターンはブロックセット全体に効果を付与し、シールは個別のセルに効果を付与する。同一ブロックセットに両方が付与される場合もある。パターンについては [pattern-system.md](./pattern-system.md) を参照。

## シール一覧（全3種）

### ゴールドシール (gold)

| 項目 | 値 |
|------|-----|
| type | `gold` |
| 名前 | ゴールドシール |
| symbol | G |
| preventsClearing | false |
| 説明 | このブロックが消えると+1G |

**効果**: 消去時にゴールドを加算する。スコア計算には影響しない。

---

### マルチシール (multi)

| 項目 | 値 |
|------|-----|
| type | `multi` |
| 名前 | マルチシール |
| symbol | ×2 |
| preventsClearing | false |
| 説明 | このブロックは2回発動する |

**効果**: 消去時に乗算対象ブロック数を+1する（2回カウントになる）。さらにパターン効果を2倍化する（enhanced, charge の効果量が2倍、luckyは複数回抽選）。

---

### 石シール (stone)

| 項目 | 値 |
|------|-----|
| type | `stone` |
| 名前 | 石 |
| symbol | 石 |
| preventsClearing | true |
| 説明 | このブロックは消えない |

**効果**: `preventsClearing: true` のため、ライン消去対象のフィルタリング時に除外される。ライン完成の判定自体は行われるが、そのセルは実際には消去されない。ショップには出現しない（`price: 0`、`SHOP_AVAILABLE_SEALS` に含まれない）。

---

**ショップ出現可能シール**: `gold`, `multi`（`stone` は除外）

---

## ショップでのシール出現

パターン・シール付与確率はミノサイズに関わらず一律である。

| 商品枠 | 対象ミノカテゴリ | パターン付与確率 | シール付与確率 |
|--------|----------------|--------------|--------------|
| 小中枠 | モノミノ/ドミノ/トリミノ/テトロミノ | 40% | 25% |
| 中大枠 | テトロミノ/ペントミノ/ヘキソミノ | 40% | 25% |

- パターンとシールの付与判定は独立して行われる（両方付与されることもある）
- 付与されるシールの種類はショップ出現可能なものからランダムに均等選択

---

## シール効果の計算詳細

```
calculateSealEffects(board, cellsToRemove, multiSealMultiplier):
    goldCount  = seal==='gold'  のセル数
    multiBonus = seal==='multi' のセル数 × (multiSealMultiplier - 1)
```

※ `multiSealMultiplier` はレリック（prism）の所持により変動する可能性がある

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
   - multiBonus: multi シール数 × (multiSealMultiplier - 1) → ブロック点(A)
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

- `src/lib/game/Domain/Effect/Seal.ts` — シール定義・マスターデータ (`SEAL_DEFINITIONS`, `SHOP_AVAILABLE_SEALS`)
- `src/lib/game/Domain/Effect/SealEffectHandler.ts` — シール効果計算（純粋関数）
- `src/lib/game/Domain/Effect/SealEffectTypes.ts` — シール効果型 (`SealEffectResult`)
- `src/lib/game/Services/ShopService.ts` — ショップ商品生成・シール付与確率

## 更新履歴

- 2026-02-20: `score`, `arrow_v`, `arrow_h` シールを削除。全3種に更新。バフ効果をスコア計算フローに追加。multiSealMultiplierパラメータを追記
- 2026-02-19: pattern-seal-system.md から分離
- 2026-02-19: マルチシールがパターン効果を2倍化する仕様を明記。各シールのdescriptionをコードに合わせて更新
- 2026-02-19: A×B方式（ブロック点×列点）に基づくスコア計算フロー更新
- 2026-02-17: arrow_v・arrow_h を追加。ショップ出現確率・スコア計算フローを実装に基づき大幅更新
- 2026-02-06: 初版作成（JSVersionSpecから移植）

# パターン・シールシステム

## 概要

ブロックに特殊効果を付与するシステム。パターンはブロックセット全体に効果を付与し、シールは個別のセルに効果を付与する。

## パターンシステム

### 概要

- **対象**: ブロックセット全体
- **付与方法**: ショップで購入
- **効果**: 消去時にスコアボーナスなど

### パターン一覧

#### 強化ブロック (enhanced)

| 項目 | 値 |
|------|-----|
| ID | `enhanced` |
| 名前 | 強化ブロック |
| 説明 | このセットのブロックが消えると+2点/ブロック |
| 効果 | 消去時に各ブロックに+2点 |

#### ラッキーブロック (lucky)

| 項目 | 値 |
|------|-----|
| ID | `lucky` |
| 名前 | ラッキーブロック |
| 説明 | このブロックが消えると10%の確率でスコア2倍 |
| 効果 | 消去時に確率でスコア倍化 |

#### コンボブロック (combo)

| 項目 | 値 |
|------|-----|
| ID | `combo` |
| 名前 | コンボブロック |
| 説明 | 連続配置でボーナススコア |
| 効果 | 連続配置時にスコアボーナス |

#### オーラブロック (aura)

| 項目 | 値 |
|------|-----|
| ID | `aura` |
| 名前 | オーラブロック |
| 説明 | 配置時、隣接する既存ブロックにバフ付与（消去時+2点） |
| 効果 | 隣接するオーラブロック（別セット）があるセルは乗算対象ブロック数に+1 |

**オーラ効果の詳細**:
- 上下左右に隣接するセルをチェック
- 自分と同じブロックセットIDのオーラは対象外（自己強化なし）
- 消去時にボーナスブロック数としてカウント

#### 苔ブロック (moss)

| 項目 | 値 |
|------|-----|
| ID | `moss` |
| 名前 | 苔ブロック |
| 説明 | フィールド端と接している辺の数だけスコア加算 |
| 効果 | 消去時に盤面端と接している辺の数だけ乗算対象ブロック数に+1 |

**苔効果の詳細**:
- 上端（row === 0）: +1
- 下端（row === GRID_SIZE-1）: +1
- 左端（col === 0）: +1
- 右端（col === GRID_SIZE-1）: +1
- 最大で+4（角のセル）

## シールシステム

### 概要

- **対象**: 個別セル
- **付与方法**: ショップで購入
- **効果**: 消去時にゴールド獲得、スコアボーナスなど

### シール一覧

#### ゴールドシール (gold)

| 項目 | 値 |
|------|-----|
| ID | `gold` |
| 名前 | ゴールドシール |
| 説明 | このブロックが消えると+1G |
| 効果 | 消去時にゴールド+1 |

#### スコアシール (score)

| 項目 | 値 |
|------|-----|
| ID | `score` |
| 名前 | スコアシール |
| 説明 | このブロックが消えると+5点 |
| 効果 | 消去時にスコア+5（乗算ではなく加算） |

#### マルチシール (multi)

| 項目 | 値 |
|------|-----|
| ID | `multi` |
| 名前 | マルチシール |
| 説明 | ライン消し時にこのブロックが2回カウントされる |
| 効果 | 消去時に2回カウント |

#### 石シール (stone)

| 項目 | 値 |
|------|-----|
| ID | `stone` |
| 名前 | 石 |
| 説明 | このブロックは消えず、スコア計算にもカウントされない |
| 効果 | ライン消去対象から除外される |

## 効果計算

### スコア計算フロー

1. 消去対象セルを収集（石シール・おじゃまブロック除外）
2. パターン効果を計算（enhanced, aura, moss）
3. `totalBlocks = baseBlocks + enhancedBonus + auraBonus + mossBonus`
4. `baseScore = totalBlocks × linesCleared`
5. コンボボーナスを加算: `score = baseScore + comboBonus`
6. lucky効果を判定（10%で2倍）: `score = score × luckyMultiplier`
7. レリック効果を適用（連鎖の達人: ×1.5）
8. シール効果を適用（ゴールド、スコア加算）

### パターン効果計算

```
効果計算(消去対象セル, comboCount) {
    baseBlocks = 消去対象セル数
    enhancedBonus = 0
    auraBonus = 0
    mossBonus = 0

    各消去対象セルについて:
        // enhanced効果
        if (パターン === 'enhanced') {
            enhancedBonus += 2
        }
        // オーラ効果
        if (隣接にオーラブロック(別セット)がある) {
            auraBonus++
        }
        // 苔効果
        if (パターン === 'moss') {
            mossBonus += 盤面端との接触辺数
        }

    // combo効果（連続配置回数でボーナス: 1回目=0, 2回目=+2, 3回目=+4...）
    comboBonus = comboCount > 1 ? (comboCount - 1) * 2 : 0

    // lucky効果（10%の確率で2倍）
    luckyMultiplier = 消去対象にluckyブロックがあり && 10%判定成功 ? 2 : 1

    totalBlocks = baseBlocks + enhancedBonus + auraBonus + mossBonus
    baseScore = totalBlocks × linesCleared
    finalScore = (baseScore + comboBonus) × luckyMultiplier

    return {
        baseBlocks,
        enhancedBonus,
        auraBonus,
        mossBonus,
        totalBlocks,
        comboBonus,
        luckyMultiplier,
        finalScore
    }
}
```

### シール効果計算

```
シール効果計算(消去対象セル) {
    goldCount = 0
    scoreBonus = 0

    各消去対象セルについて:
        if (シール === 'gold') {
            goldCount++
        }
        if (シール === 'score') {
            scoreBonus += 5
        }

    return { goldCount, scoreBonus }
}
```

## 視覚効果

### パターン表示

- ブロックにパターン色を適用
- CSSクラス: `has-pattern`, `pattern-{patternId}`

### シール表示

- セルにシールアイコンを表示
- CSSクラス: `has-seal`, `seal-{sealId}`
- ボード上の表示:
  - ゴールドシール: 「G」
  - スコアシール: 「+5」

### オーラ隣接効果

- オーラブロックに隣接するセルに視覚効果
- CSSクラス: `aura-affected`
- ブロック配置・消去時に動的更新

## ショップでの購入

### パターン付きブロックセット

```
{
    type: 'pattern',
    shape: ブロック形状,
    pattern: { id: 'enhanced', name: '強化ブロック', ... },
    price: サイズに応じて変動,
    name: '強化ブロックセット'
}
```

### シール付きブロックセット

```
{
    type: 'seal',
    shape: ブロック形状,
    seal: { id: 'gold', name: 'ゴールドシール', ... },
    sealPosition: { row: 0, col: 0 },  // シール位置（ランダム）
    price: サイズに応じて変動,
    name: 'ゴールドシールブロック'
}
```

## 関連ファイル

- （実装時に追加）

## 更新履歴

- 2026-02-06: 初版作成（JSVersionSpecから移植）

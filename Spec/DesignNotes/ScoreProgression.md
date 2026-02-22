# 目標スコア進行カーブの再設計

## ステータス: 採用・実装済み

バラトロのスコア進行を参考に、セットベース×タイプ倍率方式に変更。

---

## バラトロのスコア進行（参考）

| Ante | Small (×1.0) | Big (×1.5) | Boss (×2.0) |
|------|-------------|-----------|------------|
| 1    | 300         | 450       | 600        |
| 2    | 800         | 1,200     | 1,600      |
| 3    | 2,000       | 3,000     | 4,000      |
| 4    | 5,000       | 7,500     | 10,000     |
| 5    | 11,000      | 16,500    | 22,000     |
| 6    | 20,000      | 30,000    | 40,000     |
| 7    | 35,000      | 52,500    | 70,000     |
| 8    | 50,000      | 75,000    | 100,000    |

---

## 採用案: セットベース×タイプ倍率

### 計算方式

```
setIndex = floor((round - 1) / 3)
positionInSet = (round - 1) % 3
targetScore = floor(setBaseScores[setIndex] × typeMultipliers[positionInSet])
```

### ベーススコア（手動設定）

| セット | ベース |
|--------|--------|
| 1 | 20 |
| 2 | 50 |
| 3 | 100 |
| 4 | 200 |
| 5 | 500 |
| 6 | 1,000 |
| 7 | 2,000 |
| 8 | 3,000 |

### タイプ倍率

| タイプ | 倍率 |
|--------|------|
| Normal | ×1.0 |
| Elite | ×1.5 |
| Boss | ×2.0 |

### 全ラウンド目標スコア一覧

| R | タイプ | 目標スコア |
|---|--------|-----------|
| 1 | Normal | 20 |
| 2 | Elite | 30 |
| 3 | Boss | 40 |
| 4 | Normal | 50 |
| 5 | Elite | 75 |
| 6 | Boss | 100 |
| 7 | Normal | 100 |
| 8 | Elite | 150 |
| 9 | Boss | 200 |
| 10 | Normal | 200 |
| 11 | Elite | 300 |
| 12 | Boss | 400 |
| 13 | Normal | 500 |
| 14 | Elite | 750 |
| 15 | Boss | 1,000 |
| 16 | Normal | 1,000 |
| 17 | Elite | 1,500 |
| 18 | Boss | 2,000 |
| 19 | Normal | 2,000 |
| 20 | Elite | 3,000 |
| 21 | Boss | 4,000 |
| 22 | Normal | 3,000 |
| 23 | Elite | 4,500 |
| 24 | Boss | 6,000 |

---

## 出典

- [Blinds and Antes - Balatro Wiki](https://balatrowiki.org/w/Blinds_and_Antes)
- [Balatro Antes and Blinds, explained](https://dotesports.com/indies/news/balatro-antes-blinds-explained)

# ミノシステム

## 概要

ゲームで使用されるミノ（ポリオミノ）の定義と生成システムについて説明する。モノミノからヘキソミノまで、全307種類のミノが定義されており、重み付きランダム生成により選択される。

## ミノの分類

### カテゴリ別ミノ数

| カテゴリ | セル数 | 種類数 | 説明 |
|---------|-------|--------|------|
| モノミノ | 1 | 1 | 単一セル |
| ドミノ | 2 | 2 | 縦・横 |
| トロミノ | 3 | 6 | I型2向き + L型4向き |
| テトロミノ | 4 | 19 | I, O, T, S, Z, J, L型の各向き |
| ペントミノ | 5 | 63 | F, I, L, N, P, T, U, V, W, X, Y, Z型の各向き |
| ヘキソミノ | 6 | 216 | 35基本形 × 回転・反転 |

**合計**: 307種類

## ヘキソミノの詳細分類

ヘキソミノは対称性によって5つのグループに分類される:

### 紫グループ (4種)

- I6: 横一列（6セル）
- O6: 2×3長方形

各2回転（0°, 90°）= 2種 × 2 = 4種

### 赤グループ (24種)

4回対称（回転のみで同一形状）:
- R1: T型ブリッジ
- R2: C型
- R3: T型
- R4: 十字型
- R5: 凸型
- R6: 飛行機型

各4回転（0°, 90°, 180°, 270°）= 6種 × 4 = 24種

### 青グループ (20種)

鏡像対称（反転で異なる形状）:
- B1: 十字変形
- B2: Z型
- B3: Z2型
- B4: Z階段
- B5: 2階段

各4向き（2回転 × 2反転）= 5種 × 4 = 20種

### 緑グループ (8種)

4回回転対称（反転で同一形状）:
- G1: 階段型
- G2: ミジンコ型

各4回転（0°, 90°, 180°, 270°）= 2種 × 4 = 8種

### 黒グループ (160種)

完全非対称（回転・反転で全て異なる）:
- K1 ~ K20: 20種類の基本形

各8向き（4回転 × 2反転）= 20種 × 8 = 160種

## ミノ定義フォーマット

### ASCII形式

ミノ形状はASCIIアート形式で定義される:

```typescript
shape(`
  #.#
  ###
  .#.
`)
```

**記法:**
- `#`: ブロックがある位置
- `.`: 空のセル
- 各行の長さが異なる場合、最大幅に合わせて自動パディング

### 形状変換関数

#### rotate90

時計回りに90度回転:
```typescript
function rotate90(s: PieceShape): PieceShape
```

#### flipH

左右反転:
```typescript
function flipH(s: PieceShape): PieceShape
```

#### rotations4

4回転を生成（0°, 90°, 180°, 270°）:
```typescript
function rotations4(base: PieceShape): PieceShape[]
```

#### rotations2

2回転を生成（0°, 90°）:
```typescript
function rotations2(base: PieceShape): PieceShape[]
```

#### orientations8

8向きを生成（4回転 + 反転4回転）:
```typescript
function orientations8(base: PieceShape): PieceShape[]
```

#### orientations4flip

4向きを生成（2回転 + 反転2回転）:
```typescript
function orientations4flip(base: PieceShape): PieceShape[]
```

## ミノ生成システム

### カテゴリ重み

ゲームバランスに応じて各カテゴリの出現確率を調整できる:

```typescript
const DEFAULT_WEIGHTS: CategoryWeights = {
  monomino: 5,
  domino: 10,
  tromino: 20,
  tetromino: 30,
  pentomino: 25,
  hexomino: 10,
}
```

**重みの意味:**
- 数値が大きいほど出現確率が高い
- 相対的な比率で決定される
- 合計値は任意（正規化される）

### 生成フロー

1. **カテゴリ選択**: 重みに基づいてカテゴリをランダム選択
2. **ミノ選択**: 選択されたカテゴリ内からミノをランダム選択
3. **Piece生成**: ミノ定義から `Piece` オブジェクトを生成
4. **ユニークID付与**: タイムスタンプ + 乱数で一意のIDを生成

### 生成アルゴリズム

```typescript
function generatePieceSet(weights: CategoryWeights, rng: RandomGenerator): Piece[] {
  // 3個のピースセットを生成
  for (let i = 0; i < 3; i++) {
    const category = selectCategory(weights, rng)
    const mino = selectMinoFromCategory(category, rng)
    const piece = minoToPiece(mino)
    pieces.push(piece)
  }
}
```

### カテゴリ選択ロジック

重み付きランダム選択（Weighted Random Selection）:

1. 全ての重みの合計を計算
2. 0 ~ 合計値の範囲で乱数を生成
3. 累積重みと比較してカテゴリを決定

```
例: monomino=5, domino=10, tromino=20 の場合
合計=35

乱数  0 ～ 5  → monomino
乱数  5 ～ 15 → domino
乱数 15 ～ 35 → tromino
```

## 乱数生成器

### RandomGenerator インターフェース

```typescript
interface RandomGenerator {
  next(): number  // 0以上1未満の乱数を返す
}
```

### DefaultRandom

本番環境用の乱数生成器:
- `Math.random()` のラッパー
- 非決定的（毎回異なる結果）

### SeededRandom

テスト・再現用の乱数生成器:
- シード値対応
- 同じシード値で同じ乱数列を生成
- Mulberry32アルゴリズムを使用

**用途:**
- 単体テスト
- デバッグ時の再現
- リプレイ機能（将来的な実装）

## データ構造

### MinoDefinition

```typescript
interface MinoDefinition {
  id: string              // 例: "hex-K20-m90"
  category: MinoCategory  // 例: 'hexomino'
  shape: PieceShape       // 2次元配列
  cellCount: number       // セル数
}
```

### CategoryWeights

```typescript
type CategoryWeights = Record<MinoCategory, number>
```

### Piece

ゲーム内で実際に使用されるブロック:

```typescript
interface Piece {
  id: string        // ユニークID（例: "hex-K20-m90-1738406400000-abc123def"）
  shape: PieceShape // MinoDefinitionから継承
}
```

## ミノデータへのアクセス

### カテゴリ別ミノ配列

```typescript
export const MINOS_BY_CATEGORY: Record<MinoCategory, MinoDefinition[]>
```

**使用例:**
```typescript
const tetrominos = MINOS_BY_CATEGORY.tetromino  // 19種類のテトロミノ
```

### 全ミノ配列

```typescript
export const ALL_MINOS: MinoDefinition[]  // 307種類すべて
```

### ミノ数の取得

```typescript
export const MINO_COUNTS: Record<MinoCategory, number>
```

**使用例:**
```typescript
console.log(MINO_COUNTS.hexomino)  // 216
```

## バランス調整

### 重みのチューニング

ゲームバランスに応じて重みを調整:

**初心者向け:**
```typescript
{
  monomino: 15,
  domino: 20,
  tromino: 25,
  tetromino: 25,
  pentomino: 10,
  hexomino: 5,
}
```

**上級者向け:**
```typescript
{
  monomino: 2,
  domino: 5,
  tromino: 10,
  tetromino: 20,
  pentomino: 30,
  hexomino: 33,
}
```

### 動的調整（将来的な実装案）

- プレイヤーのスキルレベルに応じた自動調整
- ゲーム進行度による段階的な難易度上昇
- ボード状況に応じた適応的な重み変更

## パフォーマンス考慮事項

### メモリ効率

- ミノ定義は静的に定義され、1回のみ生成
- 全307種類のメモリフットプリントは小さい（数KB程度）
- `Piece` オブジェクトは形状を共有（参照コピー）

### 生成速度

- カテゴリ選択: O(カテゴリ数) = O(6)
- ミノ選択: O(1)（配列アクセス）
- 3個生成: 非常に高速（1ms未満）

## 関連ファイル

- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/minoDefinitions.ts` - 全ミノ定義と変換関数
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/pieceGenerator.ts` - ミノ生成ロジック
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/random.ts` - 乱数生成器
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/types.ts` - ミノ関連型定義

## 更新履歴

- 2026-02-01: 初版作成（ミノ分類、生成システム、ヘキソミノ詳細分類）

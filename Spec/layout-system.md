# レイアウトシステム

## 概要

画面サイズに応じた動的レイアウト計算システムについて説明する。デスクトップからモバイルまで、あらゆる画面サイズに対応したレスポンシブレイアウトを実現している。

## useCanvasLayout Hook

### 役割

- 画面サイズに基づいたレイアウト計算
- ボード位置とサイズの決定
- スロット位置の計算
- レスポンシブ対応（リサイズ・回転検知）

### 計算タイミング

**初回:**
- Hook初回マウント時に計算実行

**更新:**
- ウィンドウリサイズ（`resize` イベント）
- 画面向き変更（`orientationchange` イベント）

### 戻り値

`CanvasLayout` オブジェクト、または計算中は `null`。

## レイアウト計算フロー

### 1. 画面サイズ取得

```
window.innerWidth
window.innerHeight
```

### 2. 利用可能領域計算

- 水平パディングを除いた幅
- 垂直パディングを除いた高さ

### 3. セルサイズ決定

**制約条件:**
- ボードエリアの高さ比率（`boardAreaRatio`）を考慮
- 高さ制約によるセルサイズ
- 幅制約によるセルサイズ
- 小さい方を採用（`Math.min`）
- 整数に切り捨て（`Math.floor`）

**計算式:**
```typescript
const boardAreaHeight = availableHeight * boardAreaRatio
const maxCellSizeByHeight = boardAreaHeight / GRID_SIZE
const maxCellSizeByWidth = availableWidth / GRID_SIZE
const cellSize = Math.floor(Math.min(maxCellSizeByHeight, maxCellSizeByWidth))
```

### 4. ボードサイズ計算

```
boardSize = GRID_SIZE * cellSize
```

### 5. Canvas全体サイズ決定

- 幅: ボードサイズまたは利用可能幅の大きい方
- 高さ: 利用可能高さ

### 6. ボード位置計算

**水平方向:**
- Canvas中央に配置
- `boardOffsetX = (canvasWidth - boardSize) / 2`

**垂直方向:**
- 上部に配置（パディング分下げる）
- `boardOffsetY = verticalPadding`

### 7. スロットエリア位置計算

ボード下端からパディング分下の位置:
```
slotAreaY = boardOffsetY + boardSize + slotAreaPadding * 2
```

### 8. スロット位置計算

各スロットの位置を個別に計算（詳細は後述）。

## スロット位置計算

### 計算方針

- 各ブロックの実際の幅に応じて配置
- ブロック間に一定の隙間を設ける
- 全体を中央揃え

### ステップ

**1. 初期ブロック取得:**
- `getInitialPieces()` で3種類のブロックを取得

**2. スロットセルサイズ計算:**
```
slotCellSize = cellSize * slotCellSizeRatio
```

**3. 各ブロックの幅を計算:**
- ブロック形状のサイズを取得（`getPieceSize`）
- 幅 = ブロックの列数 × スロットセルサイズ

**4. 全体幅計算:**
```
totalWidth = 各ブロック幅の合計 + 隙間 × (スロット数 - 1)
```

**5. 開始位置計算:**
```
startX = (canvasWidth - totalWidth) / 2
```

**6. 各スロット位置を順次計算:**
```typescript
for (let i = 0; i < SLOT_COUNT; i++) {
  positions.push({ x: currentX, y: slotAreaY })
  currentX += pieceWidths[i] + slotGap
}
```

### 結果

各スロットの左上座標（`Position`）の配列。

## レイアウト定数

定数は `constants.ts` の `LAYOUT` オブジェクトで定義されている:

- `boardPadding`: ボード周りのパディング
- `slotGap`: スロット間の隙間
- `slotAreaPadding`: スロットエリアの上下パディング
- `canvasPaddingHorizontal`: Canvas水平パディング
- `canvasPaddingVertical`: Canvas垂直パディング
- `boardAreaRatio`: ボードエリアの高さ比率
- `slotCellSizeRatio`: スロット内ブロックのサイズ比率

## レスポンシブ動作

### 縦長画面（モバイル縦持ち）

- 幅制約が支配的
- セルサイズは画面幅に基づいて決定
- ボードとスロットが縦に並ぶ

### 横長画面（デスクトップ・モバイル横持ち）

- 高さ制約が支配的（`boardAreaRatio`）
- セルサイズは高さに基づいて決定
- より大きなセルサイズを確保可能

### DPR対応

- レイアウト計算はデバイスピクセル比に依存しない
- Canvas描画時に DPR を適用（`GameCanvas` 側で処理）

## 再計算の最適化

### useCallback

`calculateLayout` 関数を `useCallback` でメモ化:
- 依存配列が空なので、関数参照は常に安定
- イベントリスナーの登録/解除が効率的

### クリーンアップ

`useEffect` のクリーンアップ関数でイベントリスナーを削除:
- メモリリーク防止
- コンポーネントアンマウント時の安全な処理

## レイアウト情報の利用

### 描画システム

- `boardOffsetX`, `boardOffsetY`: ボード描画位置
- `cellSize`: セルサイズ
- `slotPositions`: スロットブロック描画位置

### 座標変換

- `boardOffsetX`, `boardOffsetY`, `cellSize`: スクリーン座標とボード座標の変換に使用

### ドラッグ判定

- `slotPositions`: スロット上でのドラッグ開始判定に使用

## エッジケース処理

### 極小画面

- `Math.floor` で整数に丸めるため、セルサイズは最低1ピクセル
- パディング設定により、極端に小さい画面でも最低限のスペースを確保

### 極大画面

- `Math.max` でCanvas幅を確保
- ボードは中央配置され、左右に余白が生じる

## 関連ファイル

- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/hooks/useCanvasLayout.ts` - レイアウト計算Hook
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/constants.ts` - レイアウト定数
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/pieceDefinitions.ts` - ブロックサイズ取得

## 更新履歴

- 2026-02-01: 初版作成

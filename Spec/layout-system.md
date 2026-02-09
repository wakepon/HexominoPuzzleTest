# レイアウトシステム

## 概要

HD固定レイアウト（1280x720）を採用したレイアウト計算システムについて説明する。左側にステータスパネル、右側にゲームボードとスロットを配置する二分割レイアウトを実現している。

## useCanvasLayout Hook

### 役割

- HD固定レイアウト（1280x720）の計算
- ボード位置とサイズの決定
- スロット位置の動的計算（ピース形状に基づく）
- pieceSlots変更時の再計算対応

### 計算タイミング

**初回:**
- Hook初回マウント時に計算実行

**更新:**
- `pieceSlots`の形状が変化した時（形状キーを比較）
- リサイズイベント（将来拡張用にリスナーは残存）

### 戻り値

`CanvasLayout` オブジェクト、または計算中は `null`。

## レイアウト計算フロー（HD固定レイアウト）

### 1. Canvas サイズ設定

HD固定値を使用:
```typescript
canvasWidth = HD_LAYOUT.canvasWidth  // 1280
canvasHeight = HD_LAYOUT.canvasHeight  // 720
```

### 2. セルサイズ設定

固定値を使用:
```typescript
cellSize = HD_LAYOUT.cellSize  // 70
```

### 3. ボード位置設定

右側パネル内の固定位置:
```typescript
boardOffsetX = HD_LAYOUT.boardOffsetX  // 570
boardOffsetY = HD_LAYOUT.boardOffsetY  // 50
```

### 4. スロットエリア位置設定

ボード下部の固定位置:
```typescript
slotAreaY = HD_LAYOUT.slotAreaY  // 530
```

### 5. スロット位置計算

各スロットの位置を動的に計算（詳細は後述）。

## スロット位置計算

### 計算方針

- 各ブロックの実際の幅に応じて配置
- ブロック間に一定の隙間を設ける
- ボードの中央に揃える（水平方向）

### ステップ

**1. スロットセルサイズ計算:**
```typescript
slotCellSize = cellSize * HD_LAYOUT.slotCellSizeRatio  // 70 * 0.7 = 49
```

**2. 各ブロックの幅を計算:**
- ブロック形状のサイズを取得（`getPieceSize`）
- 幅 = ブロックの列数 × スロットセルサイズ
- 空スロットの場合は1セル分の幅

**3. 全体幅計算:**
```typescript
totalWidth = 各ブロック幅の合計 + HD_LAYOUT.slotGap × (スロット数 - 1)
```

**4. ボード中央位置を基準に開始位置を計算:**
```typescript
boardWidth = 6 * cellSize  // 6x6グリッド
boardCenterX = HD_LAYOUT.boardOffsetX + boardWidth / 2
startX = boardCenterX - totalWidth / 2
```

**5. 各スロット位置を順次計算:**
```typescript
for (let i = 0; i < pieceSlots.length; i++) {
  positions.push({ x: currentX, y: slotAreaY })
  currentX += pieceWidths[i] + HD_LAYOUT.slotGap
}
```

### 結果

各スロットの左上座標（`Position`）の配列。

## レイアウト定数

定数は `Constants.ts` の `HD_LAYOUT` オブジェクトで定義されている:

**固定画面サイズ:**
- `canvasWidth`: 1280
- `canvasHeight`: 720

**パネル分割:**
- `leftPanelWidth`: 左側ステータスパネルの幅
- `rightPanelStartX`: 右側パネルの開始位置

**ボード配置:**
- `boardOffsetX`: ボードのX位置
- `boardOffsetY`: ボードのY位置
- `cellSize`: セルサイズ（70ピクセル）

**スロットエリア:**
- `slotAreaY`: スロットエリアのY位置
- `slotCellSizeRatio`: スロット内ブロックのサイズ比率
- `slotGap`: スロット間の隙間

**ステータスパネル:**
- `statusPadding`: パネル内側パディング
- `statusGroupGap`: グループ間のギャップ
- `statusItemGap`: アイテム間のギャップ

**レリックエリア:**
- `relicAreaX`: レリック置き場のX位置
- `relicAreaY`: レリック置き場のY位置
- `relicAreaWidth`: レリック置き場の幅
- `relicAreaHeight`: レリック置き場の高さ

## 固定レイアウトの特性

### HD固定サイズ

- Canvas解像度は常に1280x720ピクセル
- レスポンシブ計算は行わない
- 画面サイズが異なる場合はブラウザのスケーリングに依存

### パネル分割レイアウト

**左側パネル（380px幅）:**
- ステータス情報表示
- 目標スコア、現在スコア、ゴールド、ラウンド、手札情報

**右側パネル（900px幅）:**
- ゲームボード（6x6グリッド、セルサイズ70px）
- スロットエリア（ボード中央に揃える）
- レリック置き場（ボード左側）

### DPR対応

- レイアウト計算はデバイスピクセル比に依存しない
- Canvas描画時に DPR を適用（`GameCanvas` 側で処理）

## 再計算の最適化

### pieceSlots形状キーによる判定

`pieceSlots`の参照が変わるたびに再計算されないよう、形状のみを比較するキーを生成:
```typescript
const pieceSlotsKey = useMemo(() => {
  return pieceSlots.map(slot => {
    if (!slot.piece) return 'empty'
    return slot.piece.shape
      .map(row => row.map(cell => cell ? '1' : '0').join(''))
      .join('|')
  }).join('_')
}, [pieceSlots])
```

- 形状が同じであれば再計算をスキップ
- スロット位置計算は形状に依存するため、形状が変わった時のみ再計算が必要

### useCallback

`calculateLayout` 関数を `useCallback` でメモ化:
- `stablePieceSlots`に依存
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

### 小さい画面

- ブラウザのスケーリング機能でCanvasが縮小される
- レイアウトは固定のため、計算上の特別な処理は不要

### 大きい画面

- ブラウザのスケーリング機能でCanvasが拡大される
- レイアウトは固定のため、計算上の特別な処理は不要

## 関連ファイル

- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/hooks/useCanvasLayout.ts` - レイアウト計算Hook
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Data/Constants.ts` - レイアウト定数（HD_LAYOUT）
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Services/PieceService.ts` - ブロックサイズ取得（getPieceSize）

## 更新履歴

- 2026-02-01: 初版作成
- 2026-02-09: HD固定レイアウト（1280x720）への変更を反映、pieceSlots形状キー最適化を追加

# データ構造

## 概要

ゲームで使用される主要なデータ型とその構造について説明する。

## 基本型

### Position

2D座標を表す。

```typescript
interface Position {
  x: number
  y: number
}
```

**用途:**
- スクリーン座標（ピクセル単位）
- ボード座標（グリッド単位）
- スロット位置

## ボード関連

### Cell

ボードの1セルの状態を表す。

```typescript
interface Cell {
  filled: boolean
}
```

**プロパティ:**
- `filled`: セルが埋まっているかどうか

### Board

ボード全体を表す2次元配列。

```typescript
type Board = Cell[][]
```

**構造:**
- 6x6のグリッド
- `board[y][x]` でアクセス（y が行、x が列）

## ブロック関連

### PieceShape

ブロックの形状を表す2次元配列。

```typescript
type PieceShape = boolean[][]
```

**構造:**
- `true`: ブロックがある位置
- `false`: 空の位置
- 例: 2x2ブロック
  ```
  [[true, true],
   [true, true]]
  ```

### Piece

ブロックの定義。

```typescript
interface Piece {
  id: string
  shape: PieceShape
}
```

**プロパティ:**
- `id`: ブロックの一意識別子（例: `"piece-1"`）
- `shape`: ブロックの形状

### PieceSlot

画面下部のブロックスロットの状態。

```typescript
interface PieceSlot {
  piece: Piece | null
  position: Position
}
```

**プロパティ:**
- `piece`: スロットに配置されているブロック（配置済みの場合は `null`）
- `position`: スロットの画面上の位置（レイアウト計算で設定）

## ドラッグ関連

### DragState

ドラッグ操作の現在状態。

```typescript
interface DragState {
  isDragging: boolean
  pieceId: string | null
  slotIndex: number | null
  currentPos: Position | null
  startPos: Position | null
  boardPos: Position | null
}
```

**プロパティ:**
- `isDragging`: ドラッグ中かどうか
- `pieceId`: ドラッグ中のブロックID
- `slotIndex`: ドラッグ元のスロットインデックス
- `currentPos`: 現在のドラッグ位置（スクリーン座標）
- `startPos`: ドラッグ開始位置（スクリーン座標）
- `boardPos`: ボード上の位置（グリッド座標、ボード外の場合は `null`）

## ゲーム状態

### GameState

ゲーム全体の状態。

```typescript
interface GameState {
  board: Board
  pieceSlots: PieceSlot[]
  dragState: DragState
}
```

**プロパティ:**
- `board`: ゲームボードの状態
- `pieceSlots`: ブロックスロットの配列（通常3つ）
- `dragState`: ドラッグ操作の状態

## レイアウト関連

### CanvasLayout

Canvas描画に必要なレイアウト情報。

```typescript
interface CanvasLayout {
  canvasWidth: number
  canvasHeight: number
  boardOffsetX: number
  boardOffsetY: number
  cellSize: number
  slotAreaY: number
  slotPositions: Position[]
}
```

**プロパティ:**
- `canvasWidth`: Canvas全体の幅
- `canvasHeight`: Canvas全体の高さ
- `boardOffsetX`: ボード左端のX座標
- `boardOffsetY`: ボード上端のY座標
- `cellSize`: 1セルのサイズ（ピクセル）
- `slotAreaY`: スロットエリアのY座標
- `slotPositions`: 各スロットの位置配列

**計算タイミング:**
- 初回レンダリング時
- ウィンドウリサイズ時
- 画面向き変更時

## アクション型

### GameAction

ゲーム状態を変更するアクション。

```typescript
type GameAction =
  | { type: 'PLACE_PIECE'; slotIndex: number; position: Position }
  | { type: 'START_DRAG'; slotIndex: number; startPos: Position }
  | { type: 'UPDATE_DRAG'; currentPos: Position; boardPos: Position | null }
  | { type: 'END_DRAG' }
  | { type: 'RESET_GAME' }
```

**アクション種類:**
1. `PLACE_PIECE`: ブロックを指定位置に配置
2. `START_DRAG`: ドラッグ開始
3. `UPDATE_DRAG`: ドラッグ中の位置更新
4. `END_DRAG`: ドラッグ終了
5. `RESET_GAME`: ゲームリセット

## データフロー

```
ユーザー操作
  ↓
GameCanvas (イベント処理)
  ↓
GameAction (dispatch)
  ↓
gameReducer (状態遷移)
  ↓
GameState (新しい状態)
  ↓
再レンダリング
```

## Immutability原則

すべてのデータ更新は新しいオブジェクトを作成する:

- `Board` 更新時は全セルをコピー
- `PieceSlot` 配列更新時は `map` で新配列を生成
- `GameState` 更新時はスプレッド演算子で新オブジェクト生成

## 関連ファイル

- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/types.ts` - 型定義
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/boardLogic.ts` - ボード操作
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/hooks/useGame.ts` - 状態管理

## 更新履歴

- 2026-02-01: 初版作成

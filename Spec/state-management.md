# 状態管理

## 概要

React Hooksベースのゲーム状態管理システムについて説明する。Reducerパターンを採用し、Immutableな状態更新を実現している。

## アーキテクチャ

### 状態管理の構成

```
useGame Hook
  └─ useReducer
      ├─ gameReducer (状態遷移ロジック)
      └─ GameState (現在の状態)
```

## 初期状態

### 初期ドラッグ状態

```typescript
{
  isDragging: false,
  pieceId: null,
  slotIndex: null,
  currentPos: null,
  startPos: null,
  boardPos: null,
}
```

### 初期ゲーム状態

- 空のボードを生成（すべてのセルが `filled: false`）
- 初期ブロックセット（3種類）を取得
- 各ブロックをスロットに配置
- ドラッグ状態を初期化

## アクション処理

### START_DRAG

**処理内容:**
1. 指定スロットのブロックを取得
2. ブロックが存在しない場合は状態を変更しない
3. ドラッグ状態を更新:
   - `isDragging: true`
   - ブロックIDとスロットインデックスを記録
   - 開始位置と現在位置を設定

**入力パラメータ:**
- `slotIndex`: ドラッグ元のスロットインデックス
- `startPos`: ドラッグ開始位置

### UPDATE_DRAG

**処理内容:**
1. ドラッグ中でない場合は状態を変更しない
2. ドラッグ状態を更新:
   - 現在位置を更新
   - ボード座標を更新

**入力パラメータ:**
- `currentPos`: 現在のドラッグ位置（スクリーン座標）
- `boardPos`: 変換されたボード座標（範囲外の場合は `null`）

### END_DRAG

**処理内容:**
1. ドラッグ中でない、またはスロットインデックスが無効な場合:
   - ドラッグ状態をクリア
   - その他の状態は変更しない

2. ブロックとボード座標が有効で配置可能な場合:
   - ブロックをボードに配置（新しいボードを生成）
   - スロットからブロックを削除（`piece: null`）
   - ドラッグ状態をクリア

3. 配置不可能な場合:
   - ドラッグ状態のみクリア
   - ブロックは元のスロットに残る

**配置判定:**
- `canPlacePiece` 関数で衝突判定
- ボード範囲内かつ既存ブロックと重複しない場合に配置可能

### PLACE_PIECE

**処理内容:**
1. 指定スロットのブロックを取得
2. ブロックが存在しない場合は状態を変更しない
3. 配置可能性をチェック
4. 配置可能な場合:
   - ブロックをボードに配置
   - スロットからブロックを削除

**入力パラメータ:**
- `slotIndex`: 配置するブロックのスロットインデックス
- `position`: 配置位置（ボード座標）

**用途:**
このアクションは現在の実装では直接使用されていないが、プログラマティックなブロック配置に利用可能。

### RESET_GAME

**処理内容:**
- ゲーム状態を初期状態に戻す
- 新しいボードと初期ブロックセットを生成

## useGame Hook

### 提供機能

**状態:**
- `state`: 現在のゲーム状態

**アクション:**
- `startDrag(slotIndex, startPos)`: ドラッグ開始
- `updateDrag(currentPos, boardPos)`: ドラッグ更新
- `endDrag()`: ドラッグ終了
- `resetGame()`: ゲームリセット

### 使用例

```typescript
const { state, actions } = useGame()

// ドラッグ開始
actions.startDrag(0, { x: 100, y: 200 })

// ドラッグ更新
actions.updateDrag({ x: 150, y: 250 }, { x: 2, y: 3 })

// ドラッグ終了
actions.endDrag()
```

## 状態遷移図（テキスト表現）

```
[待機状態]
  │
  │ START_DRAG
  ↓
[ドラッグ中]
  │
  │ UPDATE_DRAG (複数回)
  ↓
[ドラッグ中（位置更新）]
  │
  │ END_DRAG
  ↓
[配置判定]
  ├─ 配置可能 → ブロック配置 → [待機状態]
  └─ 配置不可 → キャンセル → [待機状態]

[任意の状態]
  │ RESET_GAME
  ↓
[初期状態]
```

## Immutabilityの実装

### ボード更新

```typescript
// 新しいボードを作成（元のボードは変更しない）
const newBoard = board.map(row =>
  row.map(cell => ({ ...cell }))
)
```

### スロット更新

```typescript
// 新しいスロット配列を生成
const newSlots = state.pieceSlots.map((s, i) =>
  i === slotIndex ? { ...s, piece: null } : s
)
```

### 状態更新

```typescript
// スプレッド演算子で新オブジェクト生成
return {
  ...state,
  dragState: {
    ...state.dragState,
    currentPos: action.currentPos,
  },
}
```

## パフォーマンス最適化

### useCallback

すべてのアクション関数は `useCallback` でメモ化されている:
- 不要な再レンダリングを防止
- 子コンポーネントへの安定した参照を提供

### useReducer の初期化

```typescript
useReducer(gameReducer, null, createInitialState)
```

第3引数に初期化関数を渡すことで、初回レンダリング時のみ実行される遅延初期化を実現。

## 関連ファイル

- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/hooks/useGame.ts` - ゲーム状態管理Hook
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/types.ts` - アクション型定義
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/boardLogic.ts` - ボード操作関数
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/collisionDetection.ts` - 配置可能性判定

## 更新履歴

- 2026-02-01: 初版作成

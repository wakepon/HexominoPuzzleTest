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
- 初期デッキを作成・シャッフル
- デッキから3つのミノを引いてスロットに配置
- ドラッグ状態を初期化
- スコアを0に設定
- 消去アニメーション状態を `null` に設定
- ラウンドを1に設定
- ゴールドを初期値に設定
- 目標スコアを計算
- フェーズを `round_progress` に設定（ラウンド進行画面から開始）
- ショップ状態を `null` に設定
- レリック状態を初期化（空のリスト）
- ラウンド情報を計算（セット番号、ラウンドタイプ）
- ボス条件を抽選（新しいセットの場合）

## アクション処理

### UI/START_DRAG

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

**フェーズ制約:**
なし（描画時にplayingフェーズのみドラッグ可能）

### UI/UPDATE_DRAG

**処理内容:**
1. ドラッグ中でない場合は状態を変更しない
2. ドラッグ状態を更新:
   - 現在位置を更新
   - ボード座標を更新

**入力パラメータ:**
- `currentPos`: 現在のドラッグ位置（スクリーン座標）
- `boardPos`: 変換されたボード座標（範囲外の場合は `null`）

### UI/END_DRAG

**処理内容:**
1. ドラッグ中でない、またはスロットインデックスが無効な場合:
   - ドラッグ状態をクリア
   - その他の状態は変更しない

2. playingフェーズでない場合:
   - ドラッグ状態をクリア
   - 配置は行わない

3. ブロックとボード座標が有効で配置可能な場合:
   - ブロックをボードに配置（新しいボードを生成）
   - スロットからブロックを削除（`piece: null`）
   - 残り配置回数を1減少
   - 全スロットが空かつ残り配置回数が0より大きい場合、デッキから新しいミノセットを引く
   - ライン完成を判定（`findCompletedLines`）
   - ラインが完成している場合:
     - 消去アニメーション状態を設定
     - スコアを加算
   - スコアとフェーズを判定:
     - スコアが目標以上なら `round_clear` フェーズに遷移
     - 残り配置回数が0かつ目標未達成なら `game_over` フェーズに遷移
   - ドラッグ状態をクリア

4. 配置不可能な場合:
   - ドラッグ状態のみクリア
   - ブロックは元のスロットに残る

**配置判定:**
- `canPlacePiece` 関数で衝突判定
- ボード範囲内かつ既存ブロックと重複しない場合に配置可能

**スコア計算:**
- 消去されたセル数 × 消去されたライン数

### BOARD/PLACE_PIECE

**処理内容:**
1. 指定スロットのブロックを取得
2. ブロックが存在しない場合は状態を変更しない
3. playingフェーズでない場合は状態を変更しない
4. 配置可能性をチェック
5. 配置可能な場合:
   - ブロックをボードに配置
   - スロットからブロックを削除
   - 残り配置回数を1減少
   - 全スロットが空かつ残り配置回数が0より大きい場合、新しいミノセットを引く
   - フェーズを判定

**入力パラメータ:**
- `slotIndex`: 配置するブロックのスロットインデックス
- `position`: 配置位置（ボード座標）

**用途:**
このアクションは現在の実装では直接使用されていないが、プログラマティックなブロック配置に利用可能。

### ANIMATION/END_CLEAR

**処理内容:**
1. 消去アニメーション状態が存在しない場合は状態を変更しない
2. 消去アニメーション状態が存在する場合:
   - アニメーション対象のセルを実際に消去（`clearLines`）
   - 消去アニメーション状態を `null` に設定

**タイミング:**
- 消去アニメーションが完了した時点で呼び出される
- `clearAnimationRenderer` が進行度100%を検出した時

### GAME/RESET

**処理内容:**
- ゲーム状態を初期状態に戻す
- 新しいボードと初期ブロックセットを生成
- デッキを初期化・シャッフル
- ラウンドを1、ゴールドを初期値にリセット

### ROUND/ADVANCE

**処理内容:**
1. `round_clear` フェーズでのみ実行可能
2. 最終ラウンド（24ラウンド）の場合:
   - ゴールド報酬を加算
   - `game_clear` フェーズに遷移
   - ショップ状態を `null` に設定
3. 最終ラウンドでない場合:
   - ゴールド報酬を加算
   - ショップ状態を生成（3つのアイテム）
   - `shopping` フェーズに遷移

**ゴールド報酬:**
- 残り配置回数がそのままゴールド報酬になる

**タイミング:**
- ラウンドクリア演出が完了した後に自動実行
- タイマーで一定時間後に呼び出される

### SHOP/BUY_ITEM

**処理内容:**
1. `shopping` フェーズでのみ実行可能
2. ショップ状態が存在しない場合は何もしない
3. アイテムインデックスが範囲外の場合は何もしない
4. アイテムが既に購入済みの場合は何もしない
5. ゴールドが不足している場合は何もしない
6. 購入可能な場合:
   - アイテムを購入済みにマーク
   - ゴールドを減額
   - アイテム種類に応じた処理:
     - `block`: Pieceをデッキに追加（`addPieceToDeck`）
       - Pieceからミノ IDを抽出
       - `allMinos` に追加
       - パターン/シールがある場合は `purchasedPieces` に保存
     - `relic`: レリックを所持リストに追加（`addRelic`）

**入力パラメータ:**
- `itemIndex`: 購入するアイテムのインデックス

**購入条件:**
- 所持ゴールド >= アイテム価格
- アイテムが未購入

### SHOP/LEAVE

**処理内容:**
1. `shopping` フェーズでのみ実行可能
2. 次のラウンドの状態を作成（`createNextRoundState`）:
   - ラウンド番号を+1
   - ラウンド情報を生成（ボス条件抽選含む）
   - ボス条件に基づいた配置回数とドロー枚数を取得
   - デッキをシャッフル（`allMinos` を使用、`purchasedPieces` も引き継ぐ）
   - ボス条件「おじゃまブロック」の場合、ランダムな位置に配置
   - スコアを0にリセット
   - 目標スコアを計算
   - `playing` フェーズに遷移
   - ゲームイベント発火（`emitRoundStarted`）
3. プレイヤー状態（ゴールド、レリック）は引き継ぐ

**タイミング:**
- ユーザーが「ショップを出る」ボタンをクリックした時

### ANIMATION/END_RELIC_ACTIVATION

**処理内容:**
1. レリック発動アニメーション状態をクリア

**タイミング:**
- レリック発動アニメーションが完了した時

**注意:**
- 現在の実装では `SHOP/LEAVE` アクションがラウンド進行とラウンド開始の両方の処理を統合している
- `START_ROUND` アクション、`ADD_RELIC` アクション、`CANNOT_PLACE` アクションは将来的な拡張用に定義されているが、現在のReducerでは使用されていない可能性がある

## useGame Hook

### 提供機能

**状態:**
- `state`: 現在のゲーム状態

**アクション:**
- `startDrag(slotIndex, startPos)`: ドラッグ開始
- `updateDrag(currentPos, boardPos)`: ドラッグ更新
- `endDrag()`: ドラッグ終了
- `resetGame()`: ゲームリセット
- `endClearAnimation()`: 消去アニメーション終了
- `advanceRound()`: ラウンド進行（クリア演出後）
- `buyItem(itemIndex)`: ショップアイテム購入
- `leaveShop()`: ショップ退出
- `startRound()`: ラウンド開始
- `cannotPlace()`: 配置不可処理

### 使用例

```typescript
const { state, actions } = useGame()

// ドラッグ開始
actions.startDrag(0, { x: 100, y: 200 })

// ドラッグ更新
actions.updateDrag({ x: 150, y: 250 }, { x: 2, y: 3 })

// ドラッグ終了
actions.endDrag()

// ショップでアイテム購入
actions.buyItem(0)

// ショップ退出
actions.leaveShop()
```

## 状態遷移図（テキスト表現）

```
[ゲーム開始 - round_progress]
  │
  │ START_ROUND
  ↓
[playing]
  │
  │ ミノ配置
  ↓
[配置判定]
  ├─ 配置可能 → ブロック配置 → [ライン判定]
  │                              ├─ ライン完成 → [アニメーション中]
  │                              │                 │
  │                              │                 │ END_CLEAR_ANIMATION
  │                              │                 ↓
  │                              │              [スコア判定]
  │                              │                 ├─ 目標達成 → [round_clear]
  │                              │                 │                │
  │                              │                 │                │ ADVANCE_ROUND
  │                              │                 │                ↓
  │                              │                 │             [フェーズ判定]
  │                              │                 │                ├─ 最終ラウンド → [game_clear]
  │                              │                 │                └─ 通常ラウンド → [shopping]
  │                              │                 │                                    │
  │                              │                 │                                    │ BUY_ITEM (0回以上)
  │                              │                 │                                    │
  │                              │                 │                                    │ LEAVE_SHOP
  │                              │                 │                                    ↓
  │                              │                 │                                 [round_progress]
  │                              │                 │                                    │
  │                              │                 │                                    │ START_ROUND
  │                              │                 │                                    ↓
  │                              │                 │                                 [playing]
  │                              │                 │
  │                              │                 └─ 残り回数0 → [game_over]
  │                              │
  │                              └─ ライン未完成 → [スコア判定]
  │                                                  ├─ 目標達成 → [round_clear] (以下同様)
  │                                                  └─ 残り回数0 → [game_over]
  │
  ├─ 配置不可 → キャンセル → [playing]
  │
  └─ 全ブロック配置不可 → CANNOT_PLACE → [配置カウント判定]
                                             ├─ 上限到達 → [round_clear または game_over]
                                             └─ 継続可能 → 次のドロー → [playing]

[game_over / game_clear]
  │ RESET_GAME
  ↓
[round_progress]
```

## フェーズ別の状態制約

### round_progress

- ラウンド進行画面を表示
- 次のラウンド情報（セット番号、ラウンドタイプ、ボス条件）を表示
- 「ラウンド開始」ボタンで`playing`フェーズへ

### playing

- ミノの配置が可能
- ドラッグ操作が可能
- ライン消去とスコア加算が行われる
- 配置不可検出が行われる

### round_clear

- ユーザー操作は不可
- 一定時間後に自動的に次フェーズへ遷移
- ゴールド報酬が表示される

### shopping

- ミノの配置は不可
- ショップアイテム（ブロックセット、レリック）のクリックで購入
- 「次へ」ボタンで`round_progress`フェーズへ

### game_over

- ミノの配置は不可
- 「リセット」ボタンでゲーム再開のみ可能
- ゴールドとレリックがリセットされる

### game_clear

- ミノの配置は不可
- 「リセット」ボタンでゲーム再開のみ可能

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

### デッキ更新

```typescript
// デッキにミノIDを追加
const newDeck = {
  ...deck,
  cards: [...deck.cards, minoId],
}
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
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/lineLogic.ts` - ライン消去とスコア計算
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/deckLogic.ts` - デッキ管理
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/roundLogic.ts` - ラウンド・ゴールド計算
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/shopLogic.ts` - ショップロジック

## 更新履歴

- 2026-02-01: 初版作成
- 2026-02-01: ライン消去、スコア、アニメーション、ミノ自動生成を追加
- 2026-02-02: デッキシステム、ラウンド制、ADVANCE_ROUND、BUY_ITEM、LEAVE_SHOPアクション、フェーズ遷移を追加
- 2026-02-06: ローグライト要素追加（round_progressフェーズ、START_ROUND/ADD_RELIC/CANNOT_PLACEアクション、レリック状態、ボス条件対応、BUY_ITEM拡張）

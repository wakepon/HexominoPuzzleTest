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
  pattern?: string | null   // パターンID
  seal?: string | null      // シールID
  blockSetId?: number | null // ブロックセットID（オーラ効果判定用）
}
```

**プロパティ:**
- `filled`: セルが埋まっているかどうか
- `pattern`: パターンID（オーラ、苔、おじゃまブロック等）
- `seal`: シールID（ゴールド、スコア、石等）
- `blockSetId`: 配置されたブロックセットの識別子（オーラ効果判定に使用）

### Board

ボード全体を表す2次元配列。

```typescript
type Board = Cell[][]
```

**構造:**
- 6x6のグリッド
- `board[y][x]` でアクセス（y が行、x が列）

## ミノ・ブロック関連

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

### MinoCategory

ミノのカテゴリ（セル数による分類）。

```typescript
type MinoCategory = 'monomino' | 'domino' | 'tromino' | 'tetromino' | 'pentomino' | 'hexomino'
```

### MinoDefinition

ミノの定義。

```typescript
interface MinoDefinition {
  id: string
  category: MinoCategory
  shape: PieceShape
  cellCount: number
}
```

**プロパティ:**
- `id`: ミノの識別子（例: `"hex-K20-m90"`）
- `category`: カテゴリ
- `shape`: ミノの形状
- `cellCount`: セル数

### CategoryWeights

カテゴリ別の重み。

```typescript
type CategoryWeights = Record<MinoCategory, number>
```

**用途:**
ミノ生成時の各カテゴリの出現確率を制御する（現在はデッキベースに移行）。

### Piece

実際にゲーム内で使用されるブロック。

```typescript
interface Piece {
  id: string
  shape: PieceShape
}
```

**プロパティ:**
- `id`: ブロックの一意識別子（タイムスタンプ + 乱数で生成）
- `shape`: ブロックの形状（MinoDefinitionから継承）

### RandomGenerator

乱数生成器インターフェース。

```typescript
interface RandomGenerator {
  next(): number  // 0以上1未満の乱数を返す
}
```

**実装:**
- `DefaultRandom`: `Math.random()` ベース
- `SeededRandom`: シード対応（Mulberry32アルゴリズム）

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

## デッキ関連

### DeckState

デッキの状態。

```typescript
interface DeckState {
  cards: string[]         // デッキに残っているミノIDの配列
  remainingHands: number  // 残りの配置可能回数
}
```

**プロパティ:**
- `cards`: デッキ内のミノIDリスト（シャッフル済み）
- `remainingHands`: 残りの配置可能回数（ラウンド開始時にリセット）

## ショップ関連

### ShopItem

ショップで販売されるアイテム。

```typescript
// 通常ブロック
interface BlockShopItem {
  type: 'block'
  minoId: string         // ミノのID
  price: number          // 価格
  purchased: boolean     // 購入済みフラグ
}

// パターン付きブロック
interface PatternBlockShopItem {
  type: 'pattern'
  shape: PieceShape      // ブロック形状
  pattern: PatternDefinition  // パターン情報
  price: number          // 価格
  purchased: boolean     // 購入済みフラグ
  name: string           // 商品名
}

// シール付きブロック
interface SealBlockShopItem {
  type: 'seal'
  shape: PieceShape      // ブロック形状
  seal: SealDefinition   // シール情報
  sealPosition: Position // シール位置
  price: number          // 価格
  purchased: boolean     // 購入済みフラグ
  name: string           // 商品名
}

// レリック
interface RelicShopItem {
  type: 'relic'
  relic: RelicDefinition // レリック情報
  price: number          // 価格
  purchased: boolean     // 購入済みフラグ
}

type ShopItem = BlockShopItem | PatternBlockShopItem | SealBlockShopItem | RelicShopItem
```

**プロパティ:**
- `type`: アイテムの種類（'block', 'pattern', 'seal', 'relic'）
- `price`: 購入価格
- `purchased`: 購入済みかどうか
- その他: アイテム種類に応じた固有プロパティ

### ShopState

ショップ状態。

```typescript
interface ShopState {
  items: ShopItem[]      // ショップに並んでいるアイテム
}
```

**プロパティ:**
- `items`: 販売中のアイテムリスト（ブロックセット + レリック）

## パターン・シール関連

### PatternDefinition

パターンの定義。

```typescript
interface PatternDefinition {
  id: string             // パターンID（例: 'enhanced', 'aura', 'moss'）
  name: string           // 表示名
  description: string    // 効果説明
}
```

**プロパティ:**
- `id`: パターンの識別子
- `name`: パターンの表示名
- `description`: パターン効果の説明

### SealDefinition

シールの定義。

```typescript
interface SealDefinition {
  id: string             // シールID（例: 'gold', 'score', 'stone'）
  name: string           // 表示名
  description: string    // 効果説明
}
```

**プロパティ:**
- `id`: シールの識別子
- `name`: シールの表示名
- `description`: シール効果の説明

### BlockSetData

拡張形式のブロックデータ。

```typescript
interface BlockSetData {
  shape: PieceShape         // ブロック形状
  pattern?: string | null   // パターンID（nullable）
  seals?: (string | null)[][] // シール配列（形状と同サイズ）
}
```

**プロパティ:**
- `shape`: ブロックの形状
- `pattern`: ブロックセット全体に適用されるパターン
- `seals`: 各セルに適用されるシール（nullはシールなし）

## レリック関連

### RelicDefinition

レリックの定義。

```typescript
interface RelicDefinition {
  id: string             // レリックID
  name: string           // 表示名
  description: string    // 効果説明
  rarity: RelicRarity    // レアリティ
  price: number          // 購入価格
}
```

**プロパティ:**
- `id`: レリックの識別子
- `name`: レリックの表示名
- `description`: レリック効果の説明
- `rarity`: レアリティ（common, rare, epic）
- `price`: ショップでの購入価格

### RelicRarity

レリックのレアリティ。

```typescript
type RelicRarity = 'common' | 'rare' | 'epic'
```

### RelicState

レリック状態。

```typescript
interface RelicState {
  ownedRelics: string[]  // 所持レリックIDのリスト
}
```

**プロパティ:**
- `ownedRelics`: 現在所持しているレリックのIDリスト

### RelicEffects

レリック効果の発動状態。

```typescript
interface RelicEffects {
  chainMasterActive: boolean   // 連鎖の達人が発動
  smallLuckActive: boolean     // 小さな幸運が発動
  fullClearActive: boolean     // 全消しボーナスが発動
}
```

## ラウンド関連

### RoundType

ラウンドのタイプ。

```typescript
type RoundType = 'normal' | 'elite' | 'boss'
```

**タイプ:**
- `normal`: 雑魚ラウンド
- `elite`: エリートラウンド
- `boss`: ボスラウンド

### BossCondition

ボスラウンドの特殊条件。

```typescript
interface BossCondition {
  id: string             // 条件ID
  name: string           // 表示名
  description: string    // 条件説明
}
```

**条件ID:**
- `obstacle`: おじゃまブロック
- `energy_save`: 省エネ（配置数減少）
- `two_cards`: 手札2枚

### RoundInfo

ラウンド情報。

```typescript
interface RoundInfo {
  round: number          // ラウンド番号（1-24）
  setNumber: number      // セット番号
  positionInSet: number  // セット内の位置（0, 1, 2）
  roundType: RoundType   // ラウンドタイプ
  bossCondition?: BossCondition  // ボス条件（ボスラウンドのみ）
}
```

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

## ライン消去関連

### CompletedLines

完成したラインの情報。

```typescript
interface CompletedLines {
  rows: number[]      // 完成した行のインデックス配列
  columns: number[]   // 完成した列のインデックス配列
}
```

### ClearingCell

消去対象のセル座標。

```typescript
interface ClearingCell {
  x: number
  y: number
}
```

### ClearingAnimationState

消去アニメーション状態。

```typescript
interface ClearingAnimationState {
  isAnimating: boolean
  cells: ClearingCell[]        // 消去対象セル
  startTime: number            // アニメーション開始時刻
  duration: number             // アニメーション継続時間（ms）
}
```

## ゲーム状態

### GamePhase

ゲームフェーズ。

```typescript
type GamePhase = 'playing' | 'round_clear' | 'shopping' | 'round_progress' | 'game_over' | 'game_clear'
```

**フェーズ種類:**
- `playing`: 通常のゲームプレイ中
- `round_clear`: ラウンドクリア演出中
- `shopping`: ショップフェーズ
- `round_progress`: ラウンド進行画面（次のラウンド情報表示）
- `game_over`: ゲームオーバー
- `game_clear`: ゲームクリア（最終ラウンドクリア）

### GameState

ゲーム全体の状態。

```typescript
interface GameState {
  board: Board
  pieceSlots: PieceSlot[]
  dragState: DragState
  score: number                               // 現在ラウンドのスコア
  clearingAnimation: ClearingAnimationState | null
  deck: DeckState
  phase: GamePhase
  round: number                               // 現在のラウンド（1-24）
  gold: number                                // 所持ゴールド
  targetScore: number                         // 現在ラウンドの目標スコア
  shopState: ShopState | null                 // ショップ状態（shoppingフェーズでのみ非null）
  relicState: RelicState                      // レリック状態
  roundInfo: RoundInfo                        // ラウンド詳細情報
  bossCondition: BossCondition | null         // 現在セットのボス条件
}
```

**プロパティ:**
- `board`: ゲームボードの状態
- `pieceSlots`: ブロックスロットの配列（通常3つ、ボス条件で2つの場合あり）
- `dragState`: ドラッグ操作の状態
- `score`: 現在ラウンドのスコア（ラウンド開始時にリセット）
- `clearingAnimation`: 消去アニメーション状態（アニメーション中のみ）
- `deck`: デッキ状態
- `phase`: 現在のゲームフェーズ
- `round`: 現在のラウンド番号（1から24）
- `gold`: 所持ゴールド（ラウンド間で持ち越し）
- `targetScore`: 現在ラウンドの目標スコア
- `shopState`: ショップ状態（shoppingフェーズでのみ非null）
- `relicState`: レリック状態（所持レリックのリスト）
- `roundInfo`: ラウンド詳細情報（タイプ、セット番号等）
- `bossCondition`: 現在セットのボス条件（ボスラウンドで適用）

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
  | { type: 'END_CLEAR_ANIMATION' }
  | { type: 'ADVANCE_ROUND' }
  | { type: 'BUY_ITEM'; itemIndex: number }
  | { type: 'LEAVE_SHOP' }
  | { type: 'START_ROUND' }
  | { type: 'ADD_RELIC'; relicId: string }
  | { type: 'CANNOT_PLACE' }
```

**アクション種類:**
1. `PLACE_PIECE`: ブロックを指定位置に配置
2. `START_DRAG`: ドラッグ開始
3. `UPDATE_DRAG`: ドラッグ中の位置更新
4. `END_DRAG`: ドラッグ終了
5. `RESET_GAME`: ゲームリセット
6. `END_CLEAR_ANIMATION`: 消去アニメーション終了
7. `ADVANCE_ROUND`: ラウンド進行（round_clearフェーズから次フェーズへ）
8. `BUY_ITEM`: ショップアイテム購入
9. `LEAVE_SHOP`: ショップ退出（ラウンド進行画面へ）
10. `START_ROUND`: ラウンド開始（ラウンド進行画面から）
11. `ADD_RELIC`: レリック追加
12. `CANNOT_PLACE`: 配置不可処理

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
- `DeckState` 更新時はスプレッド演算子で新オブジェクト生成
- `GameState` 更新時はスプレッド演算子で新オブジェクト生成

## 関連ファイル

- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/types.ts` - 型定義
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/boardLogic.ts` - ボード操作
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/minoDefinitions.ts` - ミノ定義
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/deckLogic.ts` - デッキ管理
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/roundLogic.ts` - ラウンド・ゴールド計算
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/shopLogic.ts` - ショップロジック
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/random.ts` - 乱数生成器
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/hooks/useGame.ts` - 状態管理

## 更新履歴

- 2026-02-01: 初版作成
- 2026-02-01: ミノ関連型、ライン消去関連型、スコア、アニメーション状態を追加
- 2026-02-02: DeckState、GamePhase、ShopItem、ShopState、新アクション型を追加
- 2026-02-06: ローグライト要素追加（Cell拡張、パターン・シール型、レリック型、ラウンド型、ShopItem拡張、GameState拡張、新アクション）

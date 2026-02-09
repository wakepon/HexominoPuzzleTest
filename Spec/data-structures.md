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
  readonly filled: boolean
  readonly blockSetId: BlockSetId | null
  readonly pattern: PatternId | null
  readonly seal: SealId | null
}
```

**プロパティ:**
- `filled`: セルが埋まっているかどうか
- `blockSetId`: 配置されたブロックセットの識別子（オーラ効果判定に使用）
- `pattern`: パターンID（オーラ、苔、おじゃまブロック等）
- `seal`: シールID（ゴールド、スコア、石等）

**不変性:**
すべてのプロパティは `readonly` で定義されている。

### Board

ボード全体を表す不変の2次元配列。

```typescript
type Board = readonly (readonly Cell[])[]
```

**構造:**
- 6x6のグリッド
- `board[row][col]` でアクセス（row が行、col が列）
- `readonly` 型で不変性を保証

**操作関数:**
- `getCell(board, pos)`: セルを取得（範囲外はnull）
- `setCell(board, pos, cell)`: セルを更新（新しいボードを返す）
- `setCells(board, updates)`: 複数セルを一括更新

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
  readonly id: PieceId
  readonly shape: PieceShape
  readonly blockSetId: BlockSetId
  readonly blocks: BlockDataMap
}
```

**プロパティ:**
- `id`: ブロックの一意識別子（`minoId-timestamp-random`形式）
- `shape`: ブロックの形状（MinoDefinitionから継承）
- `blockSetId`: ブロックセットの識別子（オーラ効果判定に使用）
- `blocks`: ブロックデータマップ（パターン・シール情報）

**BlockDataMap:**
位置キー（`{row},{col}`）をキーとした Map 構造:
```typescript
type BlockDataMap = ReadonlyMap<string, BlockData>

interface BlockData {
  readonly pattern: PatternId | null
  readonly seal: SealId | null
}
```

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
  readonly piece: Piece | null
  readonly position: Position
}
```

**プロパティ:**
- `piece`: スロットに配置されているブロック（配置済みの場合は `null`）
- `position`: スロットの画面上の位置（レイアウト計算で設定）

**不変性:**
すべてのプロパティは `readonly` で定義されている。

## デッキ関連

### DeckState

デッキの状態。

```typescript
interface DeckState {
  readonly cards: readonly MinoId[]
  readonly allMinos: readonly MinoId[]
  readonly remainingHands: number
  readonly purchasedPieces: ReadonlyMap<MinoId, Piece>
}
```

**プロパティ:**
- `cards`: デッキに残っているミノIDの配列（山札）
- `allMinos`: 全カードリスト（再シャッフル用、購入したミノも含む）
- `remainingHands`: 残りの配置可能回数（ラウンド開始時にリセット）
- `purchasedPieces`: 購入したPieceの情報マップ（パターン・シール復元用）

**購入したPieceの扱い:**
- ショップで購入したパターン/シール付きPieceは `purchasedPieces` に保存される
- デッキから引く際、`purchasedPieces` に該当するminoIdがあればそのPieceを使用する
- ない場合は通常のPieceを生成する

## ショップ関連

### ShopItem

ショップで販売されるアイテム。

```typescript
// ブロック商品
interface BlockShopItem {
  readonly type: 'block'
  readonly piece: Piece
  readonly price: number
  readonly originalPrice: number
  readonly purchased: boolean
  readonly onSale: boolean
}

// レリック商品
interface RelicShopItem {
  readonly type: 'relic'
  readonly relicId: RelicId
  readonly price: number
  readonly originalPrice: number
  readonly purchased: boolean
  readonly onSale: boolean
}

type ShopItem = BlockShopItem | RelicShopItem
```

**プロパティ:**
- `type`: アイテムの種類（'block' または 'relic'）
- `price`: 実際の販売価格（セール適用後）
- `originalPrice`: 元の価格（セール表示用）
- `purchased`: 購入済みかどうか
- `onSale`: セール中かどうか
- その他: アイテム種類に応じた固有プロパティ

**ブロック商品:**
- Pieceを直接持つ（パターン・シール情報はPiece.blocksに含まれる）
- 価格はセル数 + パターン/シールの付加価値で計算

**レリック商品:**
- RelicIdを持つ
- 価格はレアリティで決定

### ShopState

ショップ状態。

```typescript
interface ShopState {
  readonly items: readonly ShopItem[]
}
```

**プロパティ:**
- `items`: 販売中のアイテムリスト（ブロックセット3種 + レリック最大3種）

**不変性:**
すべてのプロパティは `readonly` で定義されている。

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

### BlockData

ブロック単位の効果データ。

```typescript
interface BlockData {
  readonly pattern: PatternId | null
  readonly seal: SealId | null
}
```

**プロパティ:**
- `pattern`: ブロックセット全体に適用されるパターン
- `seal`: この特定のブロックに適用されるシール

**用途:**
- Piece.blocks（BlockDataMap）の値として使用される
- 配置時にボードのCellに反映される

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

### PlayerState

プレイヤー状態（ゴールドとレリックを管理）。

```typescript
interface PlayerState {
  readonly gold: number
  readonly ownedRelics: readonly RelicId[]
}
```

**プロパティ:**
- `gold`: 所持ゴールド
- `ownedRelics`: 現在所持しているレリックのIDリスト

**不変性:**
すべてのプロパティは `readonly` で定義されている。

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
  readonly round: number
  readonly setNumber: number
  readonly positionInSet: number
  readonly roundType: RoundType
  readonly bossCondition: BossCondition | null
}
```

**プロパティ:**
- `round`: ラウンド番号（1-24）
- `setNumber`: セット番号
- `positionInSet`: セット内の位置（0, 1, 2）
- `roundType`: ラウンドタイプ（normal, elite, boss）
- `bossCondition`: ボス条件（ボスラウンドの場合のみ非null）

**不変性:**
すべてのプロパティは `readonly` で定義されている。

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
  readonly board: Board
  readonly pieceSlots: readonly PieceSlot[]
  readonly deck: DeckState
  readonly dragState: DragState
  readonly clearingAnimation: ClearingAnimationState | null
  readonly relicActivationAnimation: RelicActivationAnimationState | null
  readonly phase: GamePhase
  readonly round: number
  readonly roundInfo: RoundInfo
  readonly score: number
  readonly targetScore: number
  readonly player: PlayerState
  readonly shopState: ShopState | null
  readonly comboCount: number
}
```

**プロパティ:**
- `board`: ゲームボードの状態
- `pieceSlots`: ブロックスロットの配列（通常3つ、ボス条件で2つの場合あり）
- `deck`: デッキ状態
- `dragState`: ドラッグ操作の状態
- `clearingAnimation`: 消去アニメーション状態（アニメーション中のみ）
- `relicActivationAnimation`: レリック発動アニメーション状態
- `phase`: 現在のゲームフェーズ
- `round`: 現在のラウンド番号（1から24）
- `roundInfo`: ラウンド詳細情報（タイプ、セット番号、ボス条件等）
- `score`: 現在ラウンドのスコア（ラウンド開始時にリセット）
- `targetScore`: 現在ラウンドの目標スコア
- `player`: プレイヤー状態（ゴールド、所持レリック）
- `shopState`: ショップ状態（shoppingフェーズでのみ非null）
- `comboCount`: コンボカウント（コンボパターン効果用）

**不変性:**
すべてのプロパティは `readonly` で定義されている。

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

ゲーム状態を変更するアクション。プレフィックス形式で分類されている。

```typescript
// ボードアクション
type BoardAction =
  | { type: 'BOARD/PLACE_PIECE'; slotIndex: number; position: Position }

// UIアクション
type UIAction =
  | { type: 'UI/START_DRAG'; slotIndex: number; startPos: Position }
  | { type: 'UI/UPDATE_DRAG'; currentPos: Position; boardPos: Position | null }
  | { type: 'UI/END_DRAG' }

// ゲームアクション
type GameCoreAction =
  | { type: 'GAME/RESET' }

// アニメーションアクション
type AnimationAction =
  | { type: 'ANIMATION/END_CLEAR' }
  | { type: 'ANIMATION/END_RELIC_ACTIVATION' }

// ラウンドアクション
type RoundAction =
  | { type: 'ROUND/ADVANCE'; probabilityOverride?: ProbabilityOverride }

// ショップアクション
type ShopAction =
  | { type: 'SHOP/BUY_ITEM'; itemIndex: number }
  | { type: 'SHOP/LEAVE' }

type GameAction = BoardAction | UIAction | GameCoreAction | AnimationAction | RoundAction | ShopAction
```

**アクション種類:**
1. `BOARD/PLACE_PIECE`: ブロックを指定位置に配置
2. `UI/START_DRAG`: ドラッグ開始
3. `UI/UPDATE_DRAG`: ドラッグ中の位置更新
4. `UI/END_DRAG`: ドラッグ終了
5. `GAME/RESET`: ゲームリセット
6. `ANIMATION/END_CLEAR`: 消去アニメーション終了
7. `ANIMATION/END_RELIC_ACTIVATION`: レリック発動アニメーション終了
8. `ROUND/ADVANCE`: ラウンド進行（round_clearフェーズから次フェーズへ）
9. `SHOP/BUY_ITEM`: ショップアイテム購入
10. `SHOP/LEAVE`: ショップ退出

**プレフィックスによる分類:**
- `BOARD/`: ボード操作
- `UI/`: UI操作（ドラッグ等）
- `GAME/`: ゲーム全体
- `ANIMATION/`: アニメーション
- `ROUND/`: ラウンド進行
- `SHOP/`: ショップ操作

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

## 新規追加型

### TooltipState

ツールチップ表示状態。

```typescript
interface TooltipState {
  readonly isVisible: boolean
  readonly content: TooltipContent | null
  readonly position: Position | null
}

interface TooltipContent {
  readonly name: string
  readonly description: string
  readonly effects?: readonly string[]
}
```

**プロパティ:**
- `isVisible`: ツールチップが表示中かどうか
- `content`: 表示内容（名前、説明、効果リスト）
- `position`: 表示位置（スクリーン座標）

## 関連ファイル

- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Domain/GameState.ts` - GameState定義
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Domain/Board/` - ボード関連型
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Domain/Piece/` - ピース関連型
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Domain/Deck/` - デッキ関連型
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Domain/Shop/` - ショップ関連型
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Domain/Effect/` - エフェクト関連型（パターン、シール、レリック）
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Domain/Round/` - ラウンド関連型
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Domain/Player/` - プレイヤー関連型
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/State/Actions/GameActions.ts` - アクション型定義
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Data/MinoDefinitions.ts` - ミノ定義
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Services/BoardService.ts` - ボード操作
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Services/DeckService.ts` - デッキ管理
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Services/RoundService.ts` - ラウンド・ゴールド計算
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Services/ShopService.ts` - ショップロジック
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Utils/Random.ts` - 乱数生成器
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/hooks/useGame.ts` - 状態管理

## 更新履歴

- 2026-02-01: 初版作成
- 2026-02-01: ミノ関連型、ライン消去関連型、スコア、アニメーション状態を追加
- 2026-02-02: DeckState、GamePhase、ShopItem、ShopState、新アクション型を追加
- 2026-02-06: ローグライト要素追加（Cell拡張、パターン・シール型、レリック型、ラウンド型、ShopItem拡張、GameState拡張、新アクション）
- 2026-02-09: Domain/Service層への構造変更を反映、readonly型の追加、PlayerState統合、BlockData追加、アクション型プレフィックス化、TooltipState追加

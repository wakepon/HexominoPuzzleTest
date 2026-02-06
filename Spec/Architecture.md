# システムアーキテクチャ設計

## 用語定義

本設計書で使用する主要な用語を定義します。

### 用語の階層構造

```
┌─────────────────────────────────────────────────────────────┐
│  MinoDefinition（マスターデータ）                            │
│  - 形状のテンプレート（307種類）                              │
│  - 静的・不変                                               │
│  例: "T-tetromino", "L-pentomino"                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 生成時に参照
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Piece（ゲーム内インスタンス）                               │
│  - プレイヤーが操作する実体                                  │
│  - 動的に生成される                                         │
│  - パターン・シールを持つことがある                           │
│  例: "強化パターン付きT-tetromino"                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 構成要素
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Block（セル/マス）                                         │
│  - Pieceを構成する最小単位                                   │
│  - 盤面に配置されるとCellになる                              │
│  例: Tetrominoなら4つのBlockで構成                          │
└─────────────────────────────────────────────────────────────┘
```

### 具体例

```
MinoDefinition (tetromino "T")     Piece (ゲーム内)
        ┌───┐                      ┌───┐
        │ ■ │                      │ ★ │  ← 各Blockがパターンを持つ
    ┌───┼───┼───┐              ┌───┼───┼───┐
    │ ■ │ ■ │ ■ │              │ ★ │ ★$│ ★ │  ← 一部のBlockにシール($)
    └───┴───┴───┘              └───┴───┴───┘

    4つのBlock                   4つのBlock
    (形状定義のみ)               (各Blockがパターン/シール情報を持つ)
```

### パターンとシールの持ち方

| 属性 | 付与単位 | データの持ち方 |
|------|----------|----------------|
| **パターン** | Piece全体 | 全Blockが同じパターンを持つ |
| **シール** | Block単位 | 一部のBlockのみがシールを持つ |

```
パターン付きPiece:        シール付きPiece:
┌───┬───┐                ┌───┬───┐
│ ★ │ ★ │ 全Block同じ    │ ■ │ ■$│ 一部Blockのみ
├───┼───┤                ├───┼───┤
│ ★ │ ★ │                │ ■ │ ■ │
└───┴───┘                └───┴───┘
```

### 用語一覧

| 用語 | 説明 | 役割 |
|------|------|------|
| **Mino** | ポリオミノの総称。セル数によって分類される（monomino〜hexomino） | 分類名 |
| **MinoDefinition** | ミノの静的定義（形状テンプレート）。307種類存在 | マスターデータ |
| **MinoId** | MinoDefinitionを識別するID | 識別子 |
| **Piece** | ゲーム内で操作するミノのインスタンス。パターン・シールを持てる | ゲームオブジェクト |
| **PieceId** | Pieceを識別する一意のID | 識別子 |
| **Block** | Pieceを構成する最小単位（1マス） | 構成要素 |
| **BlockData** | Block単位のデータ（パターン・シール情報） | データ構造 |
| **BlockDataMap** | Piece内の全BlockのBlockDataを管理するMap | データ構造 |
| **BlockSetId** | 同一Pieceに属するBlockを識別するID | グループ識別子 |
| **Cell** | 盤面上の1マス。Blockが配置された状態を表す | 盤面状態 |
| **Board** | 6×6のCellで構成される盤面 | ゲーム領域 |

### MinoCategory（ミノのカテゴリ）

| カテゴリ | セル数 | 種類数 |
|----------|--------|--------|
| monomino | 1 | 1 |
| domino | 2 | 1 |
| tromino | 3 | 2 |
| tetromino | 4 | 7 |
| pentomino | 5 | 18 |
| hexomino | 6 | 60 |

※ 回転・反転を含めると307種類

### コード上の関係

```typescript
// MinoDefinition: 静的な形状テンプレート（マスターデータ）
interface MinoDefinition {
  id: MinoId              // "T-tetromino"
  category: MinoCategory  // "tetromino"
  shape: PieceShape       // [[false,true,false], [true,true,true]]
  cellCount: number       // 4
}

// BlockData: Block単位のデータ（パターン・シール情報）
interface BlockData {
  pattern: PatternId | null  // パターン（Piece全体で同じ値）
  seal: SealId | null        // シール（一部Blockのみ）
}

// Piece: ゲーム内インスタンス（プレイヤーが操作）
interface Piece {
  id: PieceId                 // 一意のID
  blockSetId: BlockSetId      // 同一ピースのBlock識別用
  shape: PieceShape           // MinoDefinitionから継承
  blocks: BlockDataMap        // Block単位でパターン・シール情報を持つ
}

// BlockDataMap: "row,col" → BlockData
type BlockDataMap = ReadonlyMap<string, BlockData>

// Cell: 盤面上のマス（Blockが配置された状態）
interface Cell {
  filled: boolean
  blockSetId: BlockSetId  // どのPieceから来たか
  pattern: PatternId      // パターン情報（Blockから継承）
  seal: SealId            // シール情報（Blockから継承）
}
```

### BlockSetIdの役割

`BlockSetId` は同じPieceから配置されたBlockを識別します。

**使用例：オーラブロックの効果判定**
- オーラブロックは「隣接する**別セット**のBlock」にバフを付与
- `blockSetId` が異なるかどうかで判定

```typescript
// オーラ効果の判定
if (neighbor.blockSetId !== currentCell.blockSetId) {
  // 別セットなので効果適用
  applyAuraBonus()
}
```

---

## 1. 設計の全体像

### アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                        │
│  (GameCanvas, ShopUI, RelicPanel, etc.)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     useGame Hook                            │
│  (Reducerの統合、アクションのディスパッチ)                    │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  BoardReducer   │ │  DeckReducer    │ │  PlayerReducer  │
│  (盤面操作)      │ │  (デッキ管理)    │ │  (ゴールド/レリック)│
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Event System                            │
│  (GameEvent → EventBus → EffectHandlers)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Pure Game Logic                         │
│  (boardLogic, lineLogic, scoreCalculator, etc.)            │
└─────────────────────────────────────────────────────────────┘
```

### 設計方針

| 項目 | 方針 |
|------|------|
| 設計優先度 | 保守性重視 |
| ローグライト要素 | 即時設計に組み込み |
| 状態管理 | ドメイン別Reducer分割 |
| エフェクト計算 | イベントシステム |

---

## 2. ドメインモデル（Interface/Type定義）

### 2.1 コアドメイン型

```typescript
// =============================================================================
// src/lib/game/Domain/Core/Position.ts
// =============================================================================

/**
 * 2D座標（不変）
 */
export interface Position {
  readonly x: number
  readonly y: number
}

/**
 * 行列座標（ボード用）
 */
export interface GridPosition {
  readonly row: number
  readonly col: number
}

// =============================================================================
// src/lib/game/Domain/Core/Id.ts
// =============================================================================

/**
 * ブランド型を使った型安全なID
 */
export type PieceId = string & { readonly __brand: 'PieceId' }
export type MinoId = string & { readonly __brand: 'MinoId' }
export type BlockSetId = number & { readonly __brand: 'BlockSetId' }
export type RelicId = string & { readonly __brand: 'RelicId' }
export type PatternId = string & { readonly __brand: 'PatternId' }
export type SealId = string & { readonly __brand: 'SealId' }

// ID生成ユーティリティ
export const createPieceId = (base: string, timestamp: number, random: string): PieceId =>
  `${base}-${timestamp}-${random}` as PieceId

export const createBlockSetId = (): BlockSetId =>
  Date.now() as BlockSetId
```

### 2.2 ピース・ミノ関連

```typescript
// =============================================================================
// src/lib/game/Domain/Piece/PieceShape.ts
// =============================================================================

/**
 * ブロックの形状（不変の2次元配列）
 */
export type PieceShape = readonly (readonly boolean[])[]

/**
 * 形状のサイズを取得
 */
export interface ShapeSize {
  readonly rows: number
  readonly cols: number
}

export const getShapeSize = (shape: PieceShape): ShapeSize => ({
  rows: shape.length,
  cols: Math.max(...shape.map(row => row.length))
})

/**
 * 形状内のセル数を取得
 */
export const getCellCount = (shape: PieceShape): number =>
  shape.reduce((sum, row) => sum + row.filter(Boolean).length, 0)

// =============================================================================
// src/lib/game/Domain/Piece/MinoCategory.ts
// =============================================================================

export type MinoCategory =
  | 'monomino'
  | 'domino'
  | 'tromino'
  | 'tetromino'
  | 'pentomino'
  | 'hexomino'

export const MINO_CATEGORY_CELL_COUNT: Record<MinoCategory, number> = {
  monomino: 1,
  domino: 2,
  tromino: 3,
  tetromino: 4,
  pentomino: 5,
  hexomino: 6,
}

// =============================================================================
// src/lib/game/Domain/Piece/MinoDefinition.ts
// =============================================================================

/**
 * ミノの静的定義（マスターデータ）
 */
export interface MinoDefinition {
  readonly id: MinoId
  readonly category: MinoCategory
  readonly shape: PieceShape
  readonly cellCount: number
}

// =============================================================================
// src/lib/game/Domain/Piece/BlockData.ts
// =============================================================================

import { PatternId, SealId } from '../Effect/EffectTypes'

/**
 * Block単位のデータ
 *
 * - pattern: パターン（Piece全体で同じ値が設定される）
 * - seal: シール（一部のBlockのみに設定される）
 */
export interface BlockData {
  readonly pattern: PatternId | null
  readonly seal: SealId | null
}

/**
 * BlockDataの配置マップ
 * キー: "row,col" 形式の文字列
 */
export type BlockDataMap = ReadonlyMap<string, BlockData>

/**
 * BlockDataMapのユーティリティ
 */
export const BlockDataMapUtils = {
  create: (): BlockDataMap => new Map(),

  /**
   * 全Blockに同じパターンを設定（Piece生成時に使用）
   */
  createWithPattern: (
    shape: PieceShape,
    pattern: PatternId
  ): BlockDataMap => {
    const map = new Map<string, BlockData>()
    shape.forEach((row, rowIdx) => {
      row.forEach((filled, colIdx) => {
        if (filled) {
          map.set(`${rowIdx},${colIdx}`, { pattern, seal: null })
        }
      })
    })
    return map
  },

  /**
   * 特定のBlockにシールを設定
   */
  setSeal: (
    map: BlockDataMap,
    row: number,
    col: number,
    seal: SealId
  ): BlockDataMap => {
    const key = `${row},${col}`
    const existing = map.get(key)
    if (!existing) return map

    const newMap = new Map(map)
    newMap.set(key, { ...existing, seal })
    return newMap
  },

  get: (map: BlockDataMap, row: number, col: number): BlockData | undefined =>
    map.get(`${row},${col}`),

  has: (map: BlockDataMap, row: number, col: number): boolean =>
    map.has(`${row},${col}`),
}

// =============================================================================
// src/lib/game/Domain/Piece/Piece.ts
// =============================================================================

/**
 * ゲーム内で使用されるピース（ブロックセット）
 *
 * 不変オブジェクトとして設計
 * - 各BlockがBlockDataを持つ（パターン・シール情報）
 * - パターンはPiece全体で同じ値が設定される
 * - シールは一部のBlockのみに設定される
 */
export interface Piece {
  readonly id: PieceId
  readonly blockSetId: BlockSetId
  readonly shape: PieceShape
  readonly blocks: BlockDataMap
}
```

### 2.3 パターン・シール・レリック

```typescript
// =============================================================================
// src/lib/game/Domain/Effect/Pattern.ts
// =============================================================================

/**
 * パターンの種類
 */
export type PatternType =
  | 'enhanced'  // 強化ブロック
  | 'lucky'     // ラッキーブロック
  | 'combo'     // コンボブロック
  | 'aura'      // オーラブロック
  | 'moss'      // 苔ブロック
  | 'obstacle'  // おじゃまブロック（ボス条件）

/**
 * パターン定義
 */
export interface PatternDefinition {
  readonly id: PatternId
  readonly type: PatternType
  readonly name: string
  readonly description: string
  readonly isNegative: boolean  // おじゃまブロック等
}

/**
 * パターン定義マスターデータ
 */
export const PATTERN_DEFINITIONS: Record<PatternType, PatternDefinition> = {
  enhanced: {
    id: 'enhanced' as PatternId,
    type: 'enhanced',
    name: '強化ブロック',
    description: 'このセットのブロックが消えると+2点/ブロック',
    isNegative: false,
  },
  lucky: {
    id: 'lucky' as PatternId,
    type: 'lucky',
    name: 'ラッキーブロック',
    description: '配置時に10%の確率でスコア2倍',
    isNegative: false,
  },
  combo: {
    id: 'combo' as PatternId,
    type: 'combo',
    name: 'コンボブロック',
    description: '連続配置でボーナススコア',
    isNegative: false,
  },
  aura: {
    id: 'aura' as PatternId,
    type: 'aura',
    name: 'オーラブロック',
    description: '隣接する既存ブロックにバフ付与（消去時+1点）',
    isNegative: false,
  },
  moss: {
    id: 'moss' as PatternId,
    type: 'moss',
    name: '苔ブロック',
    description: 'フィールド端と接している辺の数だけスコア加算',
    isNegative: false,
  },
  obstacle: {
    id: 'obstacle' as PatternId,
    type: 'obstacle',
    name: 'おじゃまブロック',
    description: '消去できないブロック',
    isNegative: true,
  },
}

// =============================================================================
// src/lib/game/Domain/Effect/Seal.ts
// =============================================================================

/**
 * シールの種類
 */
export type SealType =
  | 'gold'   // ゴールドシール
  | 'score'  // スコアシール
  | 'multi'  // マルチシール
  | 'stone'  // 石シール

/**
 * シール定義
 */
export interface SealDefinition {
  readonly id: SealId
  readonly type: SealType
  readonly name: string
  readonly description: string
  readonly preventsClearing: boolean  // 消去を防ぐか
}

/**
 * シール定義マスターデータ
 */
export const SEAL_DEFINITIONS: Record<SealType, SealDefinition> = {
  gold: {
    id: 'gold' as SealId,
    type: 'gold',
    name: 'ゴールドシール',
    description: 'このブロックが消えると+1G',
    preventsClearing: false,
  },
  score: {
    id: 'score' as SealId,
    type: 'score',
    name: 'スコアシール',
    description: 'このブロックが消えると+5点',
    preventsClearing: false,
  },
  multi: {
    id: 'multi' as SealId,
    type: 'multi',
    name: 'マルチシール',
    description: 'ライン消し時にこのブロックが2回カウントされる',
    preventsClearing: false,
  },
  stone: {
    id: 'stone' as SealId,
    type: 'stone',
    name: '石',
    description: 'このブロックは消えない',
    preventsClearing: true,
  },
}

// =============================================================================
// src/lib/game/Domain/Effect/Relic.ts
// =============================================================================

/**
 * レリックのレアリティ
 */
export type RelicRarity = 'common' | 'uncommon' | 'rare' | 'epic'

/**
 * レリックの種類
 */
export type RelicType =
  | 'full_clear_bonus'  // 全消しボーナス
  | 'small_luck'        // 小さな幸運
  | 'chain_master'      // 連鎖の達人

/**
 * レリック定義
 */
export interface RelicDefinition {
  readonly id: RelicId
  readonly type: RelicType
  readonly name: string
  readonly description: string
  readonly rarity: RelicRarity
  readonly price: number
}

/**
 * レリック定義マスターデータ
 */
export const RELIC_DEFINITIONS: Record<RelicType, RelicDefinition> = {
  full_clear_bonus: {
    id: 'full_clear_bonus' as RelicId,
    type: 'full_clear_bonus',
    name: '全消しボーナス',
    description: '盤面を全て空にするとスコア+20',
    rarity: 'common',
    price: 15,
  },
  small_luck: {
    id: 'small_luck' as RelicId,
    type: 'small_luck',
    name: '小さな幸運',
    description: '3ブロックのピースでライン消去時+20点',
    rarity: 'common',
    price: 15,
  },
  chain_master: {
    id: 'chain_master' as RelicId,
    type: 'chain_master',
    name: '連鎖の達人',
    description: '複数行列を同時消しでスコア×1.5',
    rarity: 'rare',
    price: 30,
  },
}
```

### 2.4 ボード関連

```typescript
// =============================================================================
// src/lib/game/Domain/Board/Cell.ts
// =============================================================================

/**
 * セルの状態
 */
export interface Cell {
  readonly filled: boolean
  readonly blockSetId: BlockSetId | null
  readonly pattern: PatternId | null
  readonly seal: SealId | null
}

/**
 * 空のセルを作成
 */
export const createEmptyCell = (): Cell => ({
  filled: false,
  blockSetId: null,
  pattern: null,
  seal: null,
})

/**
 * 埋まったセルを作成
 */
export const createFilledCell = (
  blockSetId: BlockSetId,
  pattern: PatternId | null = null,
  seal: SealId | null = null
): Cell => ({
  filled: true,
  blockSetId,
  pattern,
  seal,
})

// =============================================================================
// src/lib/game/Domain/Board/Board.ts
// =============================================================================

/**
 * ボード（不変の2次元配列）
 */
export type Board = readonly (readonly Cell[])[]

/**
 * ボードサイズ
 */
export const GRID_SIZE = 6

/**
 * 空のボードを作成
 */
export const createEmptyBoard = (): Board =>
  Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => createEmptyCell())
  )

/**
 * セルを取得（範囲外はnull）
 */
export const getCell = (board: Board, pos: GridPosition): Cell | null => {
  if (pos.row < 0 || pos.row >= GRID_SIZE || pos.col < 0 || pos.col >= GRID_SIZE) {
    return null
  }
  return board[pos.row][pos.col]
}

/**
 * セルを更新（新しいボードを返す）
 */
export const setCell = (board: Board, pos: GridPosition, cell: Cell): Board =>
  board.map((row, r) =>
    r === pos.row
      ? row.map((c, col) => (col === pos.col ? cell : c))
      : row
  )

/**
 * 複数セルを一括更新
 */
export const setCells = (
  board: Board,
  updates: ReadonlyArray<{ pos: GridPosition; cell: Cell }>
): Board => {
  const updateMap = new Map(
    updates.map(u => [`${u.pos.row},${u.pos.col}`, u.cell])
  )

  return board.map((row, r) =>
    row.map((cell, c) => {
      const key = `${r},${c}`
      return updateMap.get(key) ?? cell
    })
  )
}
```

### 2.5 ラウンド・ゲーム進行

```typescript
// =============================================================================
// src/lib/game/Domain/Round/RoundTypes.ts
// =============================================================================

/**
 * ラウンドタイプ
 */
export type RoundType = 'normal' | 'elite' | 'boss'

/**
 * ボス条件タイプ
 */
export type BossConditionType =
  | 'obstacle'     // おじゃまブロック
  | 'energy_save'  // 省エネ
  | 'two_cards'    // 手札2枚

/**
 * ボス条件定義
 */
export interface BossCondition {
  readonly id: BossConditionType
  readonly name: string
  readonly description: string
}

/**
 * ボス条件マスターデータ
 */
export const BOSS_CONDITIONS: Record<BossConditionType, BossCondition> = {
  obstacle: {
    id: 'obstacle',
    name: 'おじゃまブロック',
    description: 'ランダムな1マスが埋まっている（消去不可）',
  },
  energy_save: {
    id: 'energy_save',
    name: '省エネ',
    description: '配置可能数が減少',
  },
  two_cards: {
    id: 'two_cards',
    name: '手札2枚',
    description: '手札が2枚になる',
  },
}

/**
 * ラウンド情報
 */
export interface RoundInfo {
  readonly round: number           // 1-24
  readonly setNumber: number       // セット番号
  readonly positionInSet: number   // セット内位置 (0, 1, 2)
  readonly roundType: RoundType
  readonly bossCondition: BossCondition | null
}

/**
 * ラウンド番号からラウンド情報を計算
 */
export const calculateRoundInfo = (
  round: number,
  bossCondition: BossCondition | null
): RoundInfo => {
  const setNumber = Math.floor((round - 1) / 3) + 1
  const positionInSet = (round - 1) % 3
  const roundTypes: RoundType[] = ['normal', 'elite', 'boss']

  return {
    round,
    setNumber,
    positionInSet,
    roundType: roundTypes[positionInSet],
    bossCondition: positionInSet === 2 ? bossCondition : null,
  }
}

// =============================================================================
// src/lib/game/Domain/Round/GamePhase.ts
// =============================================================================

/**
 * ゲームフェーズ
 */
export type GamePhase =
  | 'round_progress'  // ラウンド進行画面
  | 'playing'         // プレイ中
  | 'round_clear'     // ラウンドクリア演出
  | 'shopping'        // ショップ
  | 'game_over'       // ゲームオーバー
  | 'game_clear'      // ゲームクリア

/**
 * フェーズ遷移の妥当性をチェック
 */
export const isValidPhaseTransition = (from: GamePhase, to: GamePhase): boolean => {
  const validTransitions: Record<GamePhase, GamePhase[]> = {
    round_progress: ['playing'],
    playing: ['round_clear', 'game_over'],
    round_clear: ['shopping', 'game_clear'],
    shopping: ['round_progress'],
    game_over: ['round_progress'],
    game_clear: ['round_progress'],
  }

  return validTransitions[from].includes(to)
}
```

### 2.6 プレイヤー状態

```typescript
// =============================================================================
// src/lib/game/Domain/Player/PlayerState.ts
// =============================================================================

/**
 * プレイヤー状態
 */
export interface PlayerState {
  readonly gold: number
  readonly ownedRelics: readonly RelicId[]
}

/**
 * 初期プレイヤー状態
 */
export const createInitialPlayerState = (): PlayerState => ({
  gold: 0,
  ownedRelics: [],
})

/**
 * レリック所持判定
 */
export const hasRelic = (state: PlayerState, relicId: RelicId): boolean =>
  state.ownedRelics.includes(relicId)
```

### 2.7 デッキ状態

```typescript
// =============================================================================
// src/lib/game/Domain/Deck/DeckState.ts
// =============================================================================

/**
 * デッキ状態
 */
export interface DeckState {
  readonly drawPile: readonly MinoId[]       // 山札
  readonly allCards: readonly MinoId[]       // 全カード（再シャッフル用）
  readonly remainingPlacements: number       // 残り配置回数
}

/**
 * 手札状態
 */
export interface HandState {
  readonly pieces: readonly (Piece | null)[]  // 手札のピース（通常3枚）
  readonly maxHandSize: number                // 最大手札枚数
}

/**
 * 初期デッキ状態を作成
 */
export const createInitialDeckState = (
  initialCards: readonly MinoId[],
  remainingPlacements: number
): DeckState => ({
  drawPile: [...initialCards],
  allCards: [...initialCards],
  remainingPlacements,
})
```

### 2.8 ショップ状態

```typescript
// =============================================================================
// src/lib/game/Domain/Shop/ShopTypes.ts
// =============================================================================

/**
 * ブロック商品
 *
 * - Pieceを直接持つ（パターン・シール情報はPiece.blocksに含まれる）
 * - 価格はPieceから自動計算される
 */
export interface BlockShopItem {
  readonly type: 'block'
  readonly piece: Piece
  readonly purchased: boolean
  readonly onSale: boolean  // セール中フラグ
}

/**
 * レリック商品
 */
export interface RelicShopItem {
  readonly type: 'relic'
  readonly relicId: RelicId
  readonly purchased: boolean
  readonly onSale: boolean  // セール中フラグ
}

/**
 * ショップ商品（判別可能なUnion型）
 */
export type ShopItem = BlockShopItem | RelicShopItem

/**
 * ショップ状態
 */
export interface ShopState {
  readonly items: readonly ShopItem[]
}

// =============================================================================
// src/lib/game/Services/ShopPriceCalculator.ts
// =============================================================================

import { Piece } from '../Domain/Piece/Piece'
import { BlockDataMapUtils } from '../Domain/Piece/BlockData'
import { PATTERN_DEFINITIONS } from '../Domain/Effect/Pattern'
import { SEAL_DEFINITIONS } from '../Domain/Effect/Seal'
import { RELIC_DEFINITIONS, RelicType } from '../Domain/Effect/Relic'
import { ShopItem, BlockShopItem, RelicShopItem } from '../Domain/Shop/ShopTypes'

/**
 * 価格計算の定数
 */
export const PRICE_CONFIG = {
  /** Block数に応じた基本価格 */
  BASE_PRICE_PER_BLOCK: 2,

  /** パターン別追加価格 */
  PATTERN_PRICES: {
    enhanced: 5,
    lucky: 4,
    combo: 4,
    aura: 6,
    moss: 3,
    obstacle: 0,  // マイナス効果なので無料
  } as const,

  /** シール別追加価格 */
  SEAL_PRICES: {
    gold: 3,
    score: 4,
    multi: 5,
    stone: 0,  // マイナス効果なので無料
  } as const,

  /** セール時の割引率 */
  SALE_DISCOUNT: 0.7,
} as const

/**
 * ショップ価格計算サービス
 */
export const ShopPriceCalculator = {
  /**
   * Pieceの価格を計算
   */
  calculatePiecePrice(piece: Piece): number {
    // 基本価格: Block数 × 単価
    const blockCount = piece.shape.reduce(
      (sum, row) => sum + row.filter(Boolean).length,
      0
    )
    let price = blockCount * PRICE_CONFIG.BASE_PRICE_PER_BLOCK

    // パターン・シール追加価格
    piece.blocks.forEach((blockData) => {
      if (blockData.pattern) {
        const patternPrice = PRICE_CONFIG.PATTERN_PRICES[blockData.pattern as keyof typeof PRICE_CONFIG.PATTERN_PRICES]
        if (patternPrice) {
          price += patternPrice
        }
      }
      if (blockData.seal) {
        const sealPrice = PRICE_CONFIG.SEAL_PRICES[blockData.seal as keyof typeof PRICE_CONFIG.SEAL_PRICES]
        if (sealPrice) {
          price += sealPrice
        }
      }
    })

    return price
  },

  /**
   * レリックの価格を計算
   */
  calculateRelicPrice(relicType: RelicType): number {
    return RELIC_DEFINITIONS[relicType].price
  },

  /**
   * ショップ商品の最終価格を計算（セール適用後）
   */
  calculateFinalPrice(item: ShopItem): number {
    let basePrice: number

    if (item.type === 'block') {
      basePrice = this.calculatePiecePrice(item.piece)
    } else {
      basePrice = RELIC_DEFINITIONS[item.relicId as RelicType]?.price ?? 0
    }

    // セール適用
    if (item.onSale) {
      return Math.floor(basePrice * PRICE_CONFIG.SALE_DISCOUNT)
    }

    return basePrice
  },

  /**
   * 購入可能かどうかを判定
   */
  canPurchase(item: ShopItem, gold: number): boolean {
    if (item.purchased) return false
    return gold >= this.calculateFinalPrice(item)
  },
}
```

### 2.9 統合ゲーム状態

```typescript
// =============================================================================
// src/lib/game/Domain/GameState.ts
// =============================================================================

/**
 * ゲーム全体の状態（不変）
 */
export interface GameState {
  // ボード関連
  readonly board: Board
  readonly hand: HandState
  readonly deck: DeckState

  // プレイヤー関連
  readonly player: PlayerState

  // ラウンド関連
  readonly roundInfo: RoundInfo
  readonly phase: GamePhase
  readonly score: number
  readonly targetScore: number

  // ショップ関連
  readonly shop: ShopState | null

  // UI関連
  readonly drag: DragState
  readonly animation: ClearingAnimationState | null
}

// =============================================================================
// src/lib/game/Domain/Input/DragState.ts
// =============================================================================

/**
 * ドラッグ状態
 */
export interface DragState {
  readonly isDragging: boolean
  readonly pieceId: PieceId | null
  readonly slotIndex: number | null
  readonly currentPos: Position | null
  readonly startPos: Position | null
  readonly boardPos: Position | null
}

/**
 * 初期ドラッグ状態
 */
export const createInitialDragState = (): DragState => ({
  isDragging: false,
  pieceId: null,
  slotIndex: null,
  currentPos: null,
  startPos: null,
  boardPos: null,
})

// =============================================================================
// src/lib/game/Domain/Animation/AnimationState.ts
// =============================================================================

/**
 * 消去対象セル
 */
export interface ClearingCell extends GridPosition {}

/**
 * 消去アニメーション状態
 */
export interface ClearingAnimationState {
  readonly isAnimating: boolean
  readonly cells: readonly ClearingCell[]
  readonly startTime: number
  readonly duration: number
}
```

---

## 3. イベントシステム設計

### 3.1 イベント型定義

```typescript
// =============================================================================
// src/lib/game/Events/GameEvent.ts
// =============================================================================

/**
 * ゲームイベントの基底型
 */
interface BaseEvent {
  readonly timestamp: number
}

/**
 * ピース配置イベント
 */
export interface PiecePlacedEvent extends BaseEvent {
  readonly type: 'PIECE_PLACED'
  readonly piece: Piece
  readonly position: GridPosition
  readonly board: Board  // 配置後のボード状態
}

/**
 * ライン完成イベント
 */
export interface LinesCompletedEvent extends BaseEvent {
  readonly type: 'LINES_COMPLETED'
  readonly rows: readonly number[]
  readonly cols: readonly number[]
  readonly cells: readonly ClearingCellInfo[]
}

/**
 * 消去対象セル情報（エフェクト計算用）
 */
export interface ClearingCellInfo {
  readonly position: GridPosition
  readonly cell: Cell
}

/**
 * ライン消去完了イベント（アニメーション後）
 */
export interface LinesClearedEvent extends BaseEvent {
  readonly type: 'LINES_CLEARED'
  readonly clearedCells: readonly ClearingCellInfo[]
  readonly isBoardEmpty: boolean
}

/**
 * スコア計算完了イベント
 */
export interface ScoreCalculatedEvent extends BaseEvent {
  readonly type: 'SCORE_CALCULATED'
  readonly baseScore: number
  readonly bonuses: readonly ScoreBonus[]
  readonly totalScore: number
}

/**
 * スコアボーナス情報
 */
export interface ScoreBonus {
  readonly source: string  // 'aura' | 'moss' | 'relic:chain_master' など
  readonly amount: number
  readonly multiplier?: number
}

/**
 * ゴールド獲得イベント
 */
export interface GoldGainedEvent extends BaseEvent {
  readonly type: 'GOLD_GAINED'
  readonly amount: number
  readonly source: string  // 'round_clear' | 'seal:gold' など
}

/**
 * ラウンドクリアイベント
 */
export interface RoundClearedEvent extends BaseEvent {
  readonly type: 'ROUND_CLEARED'
  readonly roundInfo: RoundInfo
  readonly finalScore: number
  readonly goldReward: number
}

/**
 * ラウンド開始イベント
 */
export interface RoundStartedEvent extends BaseEvent {
  readonly type: 'ROUND_STARTED'
  readonly roundInfo: RoundInfo
  readonly targetScore: number
}

/**
 * レリック効果発動イベント
 */
export interface RelicTriggeredEvent extends BaseEvent {
  readonly type: 'RELIC_TRIGGERED'
  readonly relicId: RelicId
  readonly effect: string
  readonly value: number
}

/**
 * 全ゲームイベント（判別可能なUnion型）
 */
export type GameEvent =
  | PiecePlacedEvent
  | LinesCompletedEvent
  | LinesClearedEvent
  | ScoreCalculatedEvent
  | GoldGainedEvent
  | RoundClearedEvent
  | RoundStartedEvent
  | RelicTriggeredEvent
```

### 3.2 イベントバス

```typescript
// =============================================================================
// src/lib/game/Events/EventBus.ts
// =============================================================================

/**
 * イベントハンドラ型
 */
export type EventHandler<T extends GameEvent> = (event: T) => void

/**
 * イベントハンドラ登録情報
 */
interface HandlerEntry {
  readonly eventType: GameEvent['type']
  readonly handler: EventHandler<any>
  readonly priority: number
}

/**
 * イベントバス（シングルトンではなく、インスタンスとして使用）
 */
export class EventBus {
  private handlers: HandlerEntry[] = []
  private eventLog: GameEvent[] = []
  private readonly maxLogSize: number

  constructor(maxLogSize: number = 100) {
    this.maxLogSize = maxLogSize
  }

  /**
   * イベントハンドラを登録
   */
  on<T extends GameEvent>(
    eventType: T['type'],
    handler: EventHandler<T>,
    priority: number = 0
  ): () => void {
    const entry: HandlerEntry = { eventType, handler, priority }
    this.handlers.push(entry)

    // 優先度でソート（高い順）
    this.handlers.sort((a, b) => b.priority - a.priority)

    // 登録解除関数を返す
    return () => {
      const index = this.handlers.indexOf(entry)
      if (index > -1) {
        this.handlers.splice(index, 1)
      }
    }
  }

  /**
   * イベントを発火
   */
  emit<T extends GameEvent>(event: T): void {
    // ログに追加
    this.eventLog.push(event)
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift()
    }

    // ハンドラを実行
    for (const entry of this.handlers) {
      if (entry.eventType === event.type) {
        entry.handler(event)
      }
    }
  }

  /**
   * イベントログを取得（デバッグ用）
   */
  getEventLog(): readonly GameEvent[] {
    return [...this.eventLog]
  }

  /**
   * 全ハンドラを解除
   */
  clear(): void {
    this.handlers = []
    this.eventLog = []
  }
}

/**
 * イベントバスのファクトリ
 */
export const createEventBus = (): EventBus => new EventBus()
```

### 3.3 エフェクトハンドラ

```typescript
// =============================================================================
// src/lib/game/Events/EffectHandlers/PatternEffectHandler.ts
// =============================================================================

/**
 * パターン効果計算結果
 */
export interface PatternEffectResult {
  readonly auraBonus: number
  readonly mossBonus: number
  readonly enhancedBonus: number
}

/**
 * パターン効果ハンドラ
 */
export class PatternEffectHandler {
  constructor(private eventBus: EventBus) {}

  /**
   * イベントリスナーを登録
   */
  register(): () => void {
    return this.eventBus.on('LINES_COMPLETED', this.handleLinesCompleted.bind(this), 10)
  }

  /**
   * パターン効果を計算（純粋関数として公開）
   */
  static calculateEffects(
    cells: readonly ClearingCellInfo[],
    board: Board
  ): PatternEffectResult {
    let auraBonus = 0
    let mossBonus = 0
    let enhancedBonus = 0

    for (const cellInfo of cells) {
      const { position, cell } = cellInfo

      // オーラ効果: 隣接するオーラブロック（別セット）があれば+1
      auraBonus += this.calculateAuraBonus(position, cell, board)

      // 苔効果: 盤面端との接触辺数
      if (cell.pattern === ('moss' as PatternId)) {
        mossBonus += this.calculateMossBonus(position)
      }

      // 強化効果: +2/ブロック
      if (cell.pattern === ('enhanced' as PatternId)) {
        enhancedBonus += 2
      }
    }

    return { auraBonus, mossBonus, enhancedBonus }
  }
}

// =============================================================================
// src/lib/game/Events/EffectHandlers/SealEffectHandler.ts
// =============================================================================

/**
 * シール効果計算結果
 */
export interface SealEffectResult {
  readonly goldGain: number
  readonly scoreBonus: number
  readonly multiCount: number
}

/**
 * シール効果ハンドラ（純粋関数）
 */
export const SealEffectHandler = {
  /**
   * シール効果を計算
   */
  calculateEffects(cells: readonly ClearingCellInfo[]): SealEffectResult {
    let goldGain = 0
    let scoreBonus = 0
    let multiCount = 0

    for (const { cell } of cells) {
      switch (cell.seal) {
        case 'gold' as SealId:
          goldGain++
          break
        case 'score' as SealId:
          scoreBonus += 5
          break
        case 'multi' as SealId:
          multiCount++
          break
      }
    }

    return { goldGain, scoreBonus, multiCount }
  },
}

// =============================================================================
// src/lib/game/Events/EffectHandlers/RelicEffectHandler.ts
// =============================================================================

/**
 * レリック効果計算結果
 */
export interface RelicEffectResult {
  readonly chainMasterActive: boolean
  readonly smallLuckActive: boolean
  readonly fullClearActive: boolean
  readonly scoreMultiplier: number
  readonly scoreBonus: number
}

/**
 * レリック効果計算の入力
 */
export interface RelicEffectInput {
  readonly player: PlayerState
  readonly linesCleared: number
  readonly placedBlockSize: number
  readonly isBoardEmpty: boolean
}

/**
 * レリック効果ハンドラ（純粋関数）
 */
export const RelicEffectHandler = {
  /**
   * レリック効果を計算
   */
  calculateEffects(input: RelicEffectInput): RelicEffectResult {
    const { player, linesCleared, placedBlockSize, isBoardEmpty } = input

    const chainMasterActive =
      hasRelic(player, 'chain_master' as RelicId) && linesCleared >= 2
    const smallLuckActive =
      hasRelic(player, 'small_luck' as RelicId) && placedBlockSize === 3 && linesCleared > 0
    const fullClearActive =
      hasRelic(player, 'full_clear_bonus' as RelicId) && isBoardEmpty

    return {
      chainMasterActive,
      smallLuckActive,
      fullClearActive,
      scoreMultiplier: chainMasterActive ? 1.5 : 1,
      scoreBonus: (smallLuckActive ? 20 : 0) + (fullClearActive ? 20 : 0),
    }
  },
}
```

### 3.4 スコア計算サービス

```typescript
// =============================================================================
// src/lib/game/Services/ScoreCalculator.ts
// =============================================================================

/**
 * スコア計算結果
 */
export interface ScoreCalculationResult {
  readonly baseBlocks: number
  readonly linesCleared: number
  readonly patternEffects: PatternEffectResult
  readonly sealEffects: SealEffectResult
  readonly relicEffects: RelicEffectResult
  readonly bonuses: ScoreBonus[]
  readonly totalScore: number
  readonly goldGain: number
}

/**
 * スコア計算入力
 */
export interface ScoreCalculationInput {
  readonly cells: readonly ClearingCellInfo[]
  readonly rows: readonly number[]
  readonly cols: readonly number[]
  readonly board: Board
  readonly player: PlayerState
  readonly placedBlockSize: number
  readonly isBoardEmpty: boolean
}

/**
 * スコア計算サービス（純粋関数）
 */
export const ScoreCalculator = {
  /**
   * スコアを計算
   */
  calculate(input: ScoreCalculationInput): ScoreCalculationResult {
    const {
      cells,
      rows,
      cols,
      board,
      player,
      placedBlockSize,
      isBoardEmpty,
    } = input

    // 基本値
    const baseBlocks = cells.length
    const linesCleared = rows.length + cols.length

    // パターン効果
    const patternEffects = PatternEffectHandler.calculateEffects(cells, board)

    // シール効果
    const sealEffects = SealEffectHandler.calculateEffects(cells)

    // レリック効果
    const relicInput: RelicEffectInput = {
      player,
      linesCleared,
      placedBlockSize,
      isBoardEmpty,
    }
    const relicEffects = RelicEffectHandler.calculateEffects(relicInput)

    // ボーナス一覧を作成
    const bonuses: ScoreBonus[] = []

    if (patternEffects.auraBonus > 0) {
      bonuses.push({ source: 'pattern:aura', amount: patternEffects.auraBonus })
    }
    if (patternEffects.mossBonus > 0) {
      bonuses.push({ source: 'pattern:moss', amount: patternEffects.mossBonus })
    }
    if (patternEffects.enhancedBonus > 0) {
      bonuses.push({ source: 'pattern:enhanced', amount: patternEffects.enhancedBonus })
    }
    if (sealEffects.scoreBonus > 0) {
      bonuses.push({ source: 'seal:score', amount: sealEffects.scoreBonus })
    }
    if (relicEffects.chainMasterActive) {
      bonuses.push({ source: 'relic:chain_master', amount: 0, multiplier: 1.5 })
    }
    if (relicEffects.smallLuckActive) {
      bonuses.push({ source: 'relic:small_luck', amount: 20 })
    }
    if (relicEffects.fullClearActive) {
      bonuses.push({ source: 'relic:full_clear_bonus', amount: 20 })
    }

    // スコア計算
    // 基本: (消去ブロック数 + パターンボーナス + マルチカウント) × ライン数
    const blockTotal =
      baseBlocks +
      patternEffects.auraBonus +
      patternEffects.mossBonus +
      patternEffects.enhancedBonus +
      sealEffects.multiCount

    let score = blockTotal * linesCleared

    // レリック倍率
    score = Math.floor(score * relicEffects.scoreMultiplier)

    // 加算ボーナス
    score += sealEffects.scoreBonus
    score += relicEffects.scoreBonus

    return {
      baseBlocks,
      linesCleared,
      patternEffects,
      sealEffects,
      relicEffects,
      bonuses,
      totalScore: score,
      goldGain: sealEffects.goldGain,
    }
  },
}
```

---

## 4. ドメイン別Reducer設計

### 4.1 アクション定義

```typescript
// =============================================================================
// src/lib/game/State/Actions/BoardActions.ts
// =============================================================================

export type BoardAction =
  | { type: 'BOARD/PLACE_PIECE'; piece: Piece; position: GridPosition }
  | { type: 'BOARD/CLEAR_LINES'; rows: number[]; cols: number[] }
  | { type: 'BOARD/RESET' }
  | { type: 'BOARD/PLACE_OBSTACLE'; position: GridPosition }

// =============================================================================
// src/lib/game/State/Actions/DeckActions.ts
// =============================================================================

export type DeckAction =
  | { type: 'DECK/DRAW'; count: number }
  | { type: 'DECK/ADD_CARD'; minoId: MinoId }
  | { type: 'DECK/REMOVE_FROM_HAND'; slotIndex: number }
  | { type: 'DECK/SET_HAND'; pieces: (Piece | null)[] }
  | { type: 'DECK/DECREMENT_PLACEMENTS' }
  | { type: 'DECK/RESET'; remainingPlacements: number }
  | { type: 'DECK/SHUFFLE' }

// =============================================================================
// src/lib/game/State/Actions/PlayerActions.ts
// =============================================================================

export type PlayerAction =
  | { type: 'PLAYER/ADD_GOLD'; amount: number }
  | { type: 'PLAYER/SPEND_GOLD'; amount: number }
  | { type: 'PLAYER/ADD_RELIC'; relicId: RelicId }
  | { type: 'PLAYER/RESET' }

// =============================================================================
// src/lib/game/State/Actions/RoundActions.ts
// =============================================================================

export type RoundAction =
  | { type: 'ROUND/ADVANCE' }
  | { type: 'ROUND/SET_PHASE'; phase: GamePhase }
  | { type: 'ROUND/ADD_SCORE'; amount: number }
  | { type: 'ROUND/SET_TARGET_SCORE'; score: number }
  | { type: 'ROUND/SET_BOSS_CONDITION'; condition: BossCondition | null }
  | { type: 'ROUND/RESET' }

// =============================================================================
// src/lib/game/State/Actions/ShopActions.ts
// =============================================================================

export type ShopAction =
  | { type: 'SHOP/OPEN'; items: ShopItem[] }
  | { type: 'SHOP/PURCHASE'; itemIndex: number }
  | { type: 'SHOP/CLOSE' }

// =============================================================================
// src/lib/game/State/Actions/UIActions.ts
// =============================================================================

export type UIAction =
  | { type: 'UI/START_DRAG'; slotIndex: number; startPos: Position }
  | { type: 'UI/UPDATE_DRAG'; currentPos: Position; boardPos: Position | null }
  | { type: 'UI/END_DRAG' }
  | { type: 'UI/START_ANIMATION'; animation: ClearingAnimationState }
  | { type: 'UI/END_ANIMATION' }

// =============================================================================
// src/lib/game/State/Actions/index.ts
// =============================================================================

/**
 * 全アクション型
 */
export type GameAction =
  | BoardAction
  | DeckAction
  | PlayerAction
  | RoundAction
  | ShopAction
  | UIAction
  | { type: 'GAME/RESET' }
```

### 4.2 Reducer責務

| Reducer | 責務 | 管理する状態 |
|---------|------|-------------|
| BoardReducer | 盤面操作 | `board` |
| DeckReducer | デッキ・手札管理 | `deck`, `hand` |
| PlayerReducer | プレイヤーリソース | `gold`, `ownedRelics` |
| RoundReducer | ラウンド進行 | `roundInfo`, `phase`, `score`, `targetScore` |
| ShopReducer | ショップ状態 | `shop` |
| UIReducer | UI状態 | `drag`, `animation` |

### 4.3 統合Reducer

```typescript
// =============================================================================
// src/lib/game/State/Reducers/RootReducer.ts
// =============================================================================

/**
 * ルートReducer
 *
 * 各ドメインReducerに処理を委譲する
 */
export const rootReducer = (state: GameState, action: GameAction): GameState => {
  // ゲームリセット
  if (action.type === 'GAME/RESET') {
    return createInitialGameState()
  }

  // アクションタイプのプレフィックスで分岐
  const prefix = action.type.split('/')[0]

  switch (prefix) {
    case 'BOARD':
      return {
        ...state,
        board: boardReducer(state.board, action as BoardAction),
      }

    case 'DECK':
      const deckResult = deckReducer(
        { deck: state.deck, hand: state.hand },
        action as DeckAction
      )
      return {
        ...state,
        deck: deckResult.deck,
        hand: deckResult.hand,
      }

    case 'PLAYER':
      return {
        ...state,
        player: playerReducer(state.player, action as PlayerAction),
      }

    case 'ROUND':
      const roundResult = roundReducer(
        {
          roundInfo: state.roundInfo,
          phase: state.phase,
          score: state.score,
          targetScore: state.targetScore,
          bossCondition: state.roundInfo.bossCondition,
        },
        action as RoundAction
      )
      return {
        ...state,
        roundInfo: roundResult.roundInfo,
        phase: roundResult.phase,
        score: roundResult.score,
        targetScore: roundResult.targetScore,
      }

    case 'SHOP':
      return {
        ...state,
        shop: shopReducer(state.shop, action as ShopAction),
      }

    case 'UI':
      const uiResult = uiReducer(
        { drag: state.drag, animation: state.animation },
        action as UIAction
      )
      return {
        ...state,
        drag: uiResult.drag,
        animation: uiResult.animation,
      }

    default:
      return state
  }
}
```

---

## 5. ディレクトリ構造

```
src/
├── lib/
│   └── game/
│       ├── Domain/                    # ドメインモデル（型定義）
│       │   ├── Core/
│       │   │   ├── Position.ts        # Position, GridPosition
│       │   │   └── Id.ts              # 型安全なID定義
│       │   ├── Piece/
│       │   │   ├── PieceShape.ts      # PieceShape, ユーティリティ
│       │   │   ├── MinoCategory.ts    # MinoCategory
│       │   │   ├── MinoDefinition.ts  # MinoDefinition
│       │   │   ├── BlockData.ts       # BlockData, BlockDataMap
│       │   │   └── Piece.ts           # Piece
│       │   ├── Effect/
│       │   │   ├── EffectTypes.ts     # 共通エフェクト型
│       │   │   ├── Pattern.ts         # PatternDefinition
│       │   │   ├── Seal.ts            # SealDefinition
│       │   │   └── Relic.ts           # RelicDefinition
│       │   ├── Board/
│       │   │   ├── Cell.ts            # Cell
│       │   │   └── Board.ts           # Board, ユーティリティ
│       │   ├── Deck/
│       │   │   └── DeckState.ts       # DeckState, HandState
│       │   ├── Player/
│       │   │   └── PlayerState.ts     # PlayerState
│       │   ├── Round/
│       │   │   ├── RoundTypes.ts      # RoundType, BossCondition
│       │   │   └── GamePhase.ts       # GamePhase
│       │   ├── Shop/
│       │   │   └── ShopTypes.ts       # ShopItem, ShopState
│       │   ├── Input/
│       │   │   └── DragState.ts       # DragState
│       │   ├── Animation/
│       │   │   └── AnimationState.ts  # ClearingAnimationState
│       │   ├── GameState.ts           # 統合GameState
│       │   └── index.ts               # 公開API
│       │
│       ├── Events/                    # イベントシステム
│       │   ├── GameEvent.ts           # イベント型定義
│       │   ├── EventBus.ts            # EventBus
│       │   ├── EffectHandlers/
│       │   │   ├── PatternEffectHandler.ts
│       │   │   ├── SealEffectHandler.ts
│       │   │   └── RelicEffectHandler.ts
│       │   └── index.ts
│       │
│       ├── State/                     # 状態管理
│       │   ├── Actions/
│       │   │   ├── BoardActions.ts
│       │   │   ├── DeckActions.ts
│       │   │   ├── PlayerActions.ts
│       │   │   ├── RoundActions.ts
│       │   │   ├── ShopActions.ts
│       │   │   ├── UIActions.ts
│       │   │   └── index.ts
│       │   ├── Reducers/
│       │   │   ├── BoardReducer.ts
│       │   │   ├── DeckReducer.ts
│       │   │   ├── PlayerReducer.ts
│       │   │   ├── RoundReducer.ts
│       │   │   ├── ShopReducer.ts
│       │   │   ├── UIReducer.ts
│       │   │   └── RootReducer.ts
│       │   ├── InitialState.ts
│       │   └── index.ts
│       │
│       ├── Services/                  # ビジネスロジック
│       │   ├── ScoreCalculator.ts
│       │   ├── LineDetector.ts
│       │   ├── CollisionDetector.ts
│       │   ├── DeckService.ts
│       │   ├── ShopService.ts
│       │   ├── ShopPriceCalculator.ts  # 価格自動計算
│       │   └── index.ts
│       │
│       ├── Data/                      # マスターデータ
│       │   ├── MinoDefinitions.ts     # 全307種類のミノ定義
│       │   └── Constants.ts           # ゲーム定数
│       │
│       └── Utils/                     # ユーティリティ
│           ├── Random.ts              # 乱数生成器
│           └── ShapeTransform.ts      # 形状変換関数
│
├── hooks/
│   ├── useGame.ts                     # メインゲームhook
│   ├── useGameEvents.ts               # イベントバス連携
│   └── useCanvasLayout.ts             # レイアウト計算
│
└── components/
    ├── GameContainer.tsx
    ├── GameCanvas.tsx
    ├── Shop/
    │   ├── ShopOverlay.tsx
    │   └── ShopItemCard.tsx
    ├── UI/
    │   ├── RelicPanel.tsx
    │   ├── ScoreDisplay.tsx
    │   └── RoundInfo.tsx
    └── renderer/
        ├── boardRenderer.ts
        ├── pieceRenderer.ts
        ├── previewRenderer.ts
        ├── cellRenderer.ts
        ├── clearAnimationRenderer.ts
        └── scoreRenderer.ts
```

---

## 6. トレードオフ分析

### 設計上の決定事項

| 決定 | Pros | Cons | 代替案 |
|------|------|------|--------|
| ブランド型ID | 型安全、誤用防止 | 若干冗長 | 単純なstring |
| Immutableデータ | 予測可能、デバッグ容易 | コピーコスト | Immerライブラリ |
| ドメイン別Reducer | 責務明確、テスト容易 | ファイル数増加 | 単一Reducer |
| イベントシステム | 疎結合、拡張容易 | 複雑度上昇 | 直接呼び出し |
| 純粋関数計算 | テスト容易、再利用可能 | 状態渡しが必要 | クラスメソッド |

### 今後の拡張ポイント

1. **新しいパターン/シール追加**: `PATTERN_DEFINITIONS`/`SEAL_DEFINITIONS`に定義追加、対応するEffectHandlerを実装
2. **新しいレリック追加**: `RELIC_DEFINITIONS`に定義追加、`RelicEffectHandler`に条件追加
3. **ボス条件追加**: `BOSS_CONDITIONS`に定義追加、ラウンド開始処理で適用
4. **新イベント追加**: `GameEvent`にUnion追加、必要なハンドラを実装

---

## 7. 設計のメリット

- **保守性**: 各ドメインが独立しており、変更の影響範囲が限定される
- **拡張性**: イベントシステムにより新機能追加が容易
- **テスト容易性**: 純粋関数ベースでユニットテストが書きやすい
- **型安全性**: ブランド型とUnion型により実行時エラーを防止

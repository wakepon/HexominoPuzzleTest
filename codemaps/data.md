# データモデル詳細

## ID型（ブランド型）
```typescript
// src/lib/game/Domain/Core/Id.ts
type PieceId = string & { __brand?: 'PieceId' }
type MinoId = string & { __brand?: 'MinoId' }
type BlockSetId = number & { __brand?: 'BlockSetId' }
type RelicId = string & { __brand?: 'RelicId' }
type PatternId = string & { __brand?: 'PatternId' }
type SealId = string & { __brand?: 'SealId' }
```

## ゲーム状態（GameState）
```typescript
// src/lib/game/Domain/GameState.ts
interface GameState {
  board: Board                                    // 6x6グリッド
  pieceSlots: readonly PieceSlot[]                // 手札スロット
  deck: DeckState                                 // デッキ状態
  dragState: DragState                            // ドラッグ中の状態
  clearingAnimation: ClearingAnimationState | null
  relicActivationAnimation: RelicActivationAnimationState | null
  scoreAnimation: ScoreAnimationState | null
  phase: GamePhase                                // 現在フェーズ
  pendingPhase: GamePhase | null                  // 遷移先フェーズ
  round: number
  roundInfo: RoundInfo
  score: number
  targetScore: number
  player: PlayerState                             // ゴールド、レリック、護符
  shopState: ShopState | null
  relicMultiplierState: RelicMultiplierState       // レリック倍率の累積
  scriptRelicLines: ScriptRelicLines | null        // 台本指定ライン
  volcanoEligible: boolean                         // 火山発動可能フラグ
  deckViewOpen: boolean
  amuletModal: AmuletModalState | null
}
```

## 主要型定義

### Board / Cell
```typescript
type Board = readonly (readonly Cell[])[]   // 6x6
const GRID_SIZE = 6

interface Cell {
  filled: boolean
  blockSetId: BlockSetId | null
  pattern: PatternId | null
  seal: SealId | null
  chargeValue: number
}
```

### Piece
```typescript
interface Piece {
  id: PieceId
  shape: PieceShape          // boolean[][]
  blockSetId: BlockSetId
  blocks: BlockDataMap       // Map<string, BlockData>
}

interface BlockData {
  pattern: PatternId | null
  seal: SealId | null
}
```

### PlayerState
```typescript
interface PlayerState {
  gold: number
  earnedGold: number
  ownedRelics: readonly RelicId[]
  relicDisplayOrder: readonly RelicId[]  // 表示順（コピーレリック用）
  amuletStock: readonly Amulet[]         // 最大2個
}
```

### DeckState
```typescript
interface DeckState {
  drawPile: readonly string[]      // 山札（MinoId）
  discardPile: readonly string[]   // 捨て札
  allCards: readonly string[]      // 全カード
  remainingHands: number
  stockPiece: Piece | null         // ストック枠1
  stockPiece2: Piece | null        // ストック枠2（コピー用）
}

interface PieceSlot {
  piece: Piece | null
  used: boolean
}
```

### GamePhase
```typescript
type GamePhase =
  | 'round_progress'  // ラウンド進行画面
  | 'playing'         // プレイ中
  | 'round_clear'     // ラウンドクリア演出
  | 'shopping'        // ショップ
  | 'game_over'       // ゲームオーバー
  | 'game_clear'      // ゲームクリア

// 遷移: round_progress → playing → round_clear → shopping → round_progress → ...
//        playing → game_over
//        round_clear → game_clear
```

### RoundInfo
```typescript
interface RoundInfo {
  round: number
  type: RoundType              // 'normal' | 'elite' | 'boss'
  bossCondition: BossCondition | null
}

type BossCondition = 'obstacle'  // おじゃまブロック配置
```

## Effect全種別

### Pattern（ブロック効果）- 9種
| PatternType | 名前 | 記号 | 効果 |
|------------|------|------|------|
| enhanced | 強化ブロック | ★ | ブロック点+2 |
| lucky | ラッキーブロック | ♣ | 10%で列点×2 |
| combo | コンボブロック | C | 同時消去ボーナス |
| aura | オーラブロック | ◎ | 隣接ブロック点+1 |
| moss | 苔ブロック | M | 端接触で列点+1 |
| feather | 羽ブロック | F | 重ね配置可能 |
| nohand | ノーハンドブロック | N | ハンド消費なし |
| charge | チャージブロック | ⚡ | 配置ごとにブロック点+1蓄積 |
| obstacle | おじゃまブロック | × | 消去不可（ボス条件） |

### Seal（シール効果）- 6種
| SealType | 名前 | 記号 | 効果 |
|----------|------|------|------|
| gold | ゴールドシール | G | 消去時+1G |
| score | スコアシール | +5 | ブロック点+5 |
| multi | マルチシール | ×2 | 2回発動 |
| stone | 石 | 石 | 消去不可 |
| arrow_v | アローシール(縦) | ↕ | 縦消去時ブロック点+10 |
| arrow_h | アローシール(横) | ↔ | 横消去時ブロック点+10 |

### Relic（レリック）- 20種
| RelicType | 名前 | レアリティ | 価格 | 効果概要 |
|-----------|------|----------|------|---------|
| full_clear_bonus | 全消しボーナス | common | 10 | 全消し時列点×5 |
| size_bonus_1~6 | Nサイズボーナス | common | 10 | Nブロックピース消去時ブロック点+1 |
| chain_master | 連鎖の達人 | rare | 20 | 複数行列同時消しで列点×1.5 |
| single_line | シングルライン | uncommon | 15 | 1行/列のみ消去で列点×3 |
| takenoko | タケノコ | common | 10 | 縦列のみ消去で列点×列数 |
| kani | カニ | common | 10 | 横列のみ消去で列点×行数 |
| rensha | 連射 | rare | 20 | 連続消去で列点+1蓄積（リセットあり） |
| nobi_takenoko | のびのびタケノコ | uncommon | 15 | 縦のみ消去で列点+0.5蓄積 |
| nobi_kani | のびのびカニ | uncommon | 15 | 横のみ消去で列点+0.5蓄積 |
| hand_stock | 手札ストック | epic | 25 | ストック枠出現 |
| script | 台本 | uncommon | 15 | 指定ライン揃えで列数+1/+2 |
| volcano | 火山 | uncommon | 15 | 未消去時全消去（ブロック数×最大列数） |
| bandaid | 絆創膏 | rare | 20 | 3ハンドごとにノーハンドモノミノ追加 |
| timing | タイミング | uncommon | 15 | 残ハンド数÷3で列点×3 |
| copy | コピー | epic | 25 | 1つ上のレリック効果をコピー |

### Amulet（護符）- 4種
| AmuletType | 名前 | 価格帯 | 効果 |
|-----------|------|--------|------|
| sculpt | 彫刻 | 8-12 | ピース形状編集 |
| pattern_add | パターン付与 | 6-10 | ランダムパターン付与 |
| seal_add | シール付与 | 5-9 | ランダムシール付与 |
| vanish | 消去 | 4-7 | デッキからピース削除 |

## ScoreBreakdown（スコア内訳）
```typescript
interface ScoreBreakdown {
  baseBlocks: number              // 基本ブロック数
  linesCleared: number            // 消去ライン数
  enhancedBonus: number           // 強化パターンボーナス
  auraBonus: number               // オーラボーナス
  chargeBonus: number             // チャージボーナス
  luckyMultiplier: number         // ラッキー倍率
  comboBonus: number              // コンボボーナス
  mossBonus: number               // 苔ボーナス
  sealScoreBonus: number          // スコアシールボーナス
  multiBonus: number              // マルチシールボーナス
  arrowBonus: number              // アローシールボーナス
  // レリック系
  chainMasterMultiplier: number
  singleLineMultiplier: number
  takenokoMultiplier: number
  kaniMultiplier: number
  renshaMultiplier: number
  nobiTakenokoMultiplier: number
  nobiKaniMultiplier: number
  fullClearMultiplier: number
  timingMultiplier: number
  sizeBonusTotal: number
  sizeBonusRelicId: RelicId | null
  scriptLineBonus: number
  copyTargetRelicId: RelicId | null
  copyBonus: number
  copyMultiplier: number
  copyLineBonus: number
  finalScore: number
}
```

## GameAction 全種別

### BOARD/ - ボード操作
- `BOARD/PLACE_PIECE` { slotIndex, position }

### UI/ - UI操作
- `UI/START_DRAG` { slotIndex, startPos }
- `UI/START_DRAG_FROM_STOCK` { startPos }
- `UI/START_DRAG_FROM_STOCK2` { startPos }
- `UI/UPDATE_DRAG` { currentPos, boardPos }
- `UI/END_DRAG`
- `UI/OPEN_DECK_VIEW` / `UI/CLOSE_DECK_VIEW`

### GAME/ - ゲーム全体
- `GAME/RESET`

### ANIMATION/ - アニメーション
- `ANIMATION/END_CLEAR`
- `ANIMATION/END_RELIC_ACTIVATION`
- `ANIMATION/ADVANCE_SCORE_STEP`
- `ANIMATION/END_SCORE`
- `ANIMATION/SET_FAST_FORWARD` { isFastForward }

### PHASE/ - フェーズ遷移
- `PHASE/APPLY_PENDING`

### ROUND/ - ラウンド
- `ROUND/ADVANCE` { probabilityOverride? }
- `ROUND/SHOW_PROGRESS`
- `ROUND/START`

### SHOP/ - ショップ
- `SHOP/BUY_ITEM` { itemIndex }
- `SHOP/LEAVE`
- `SHOP/REROLL`
- `SHOP/START_SELL_MODE` / `SHOP/CANCEL_SELL_MODE`
- `SHOP/SELL_RELIC` { relicIndex }

### STOCK/ - ストック
- `STOCK/MOVE_TO_STOCK` / `STOCK/MOVE_FROM_STOCK` / `STOCK/SWAP`
- `STOCK/MOVE_TO_STOCK2` / `STOCK/MOVE_FROM_STOCK2` / `STOCK/SWAP2`

### RELIC/ - レリック
- `RELIC/REORDER` { fromIndex, toIndex }

### AMULET/ - 護符
- `AMULET/USE` { amuletIndex }
- `AMULET/SELECT_PIECE` { minoId }
- `AMULET/CONFIRM` / `AMULET/CANCEL`
- `AMULET/SELL` { amuletIndex }
- `AMULET/SCULPT_TOGGLE_BLOCK` { row, col }

### DEBUG/ - デバッグ
- `DEBUG/ADD_RELIC` / `DEBUG/REMOVE_RELIC` { relicType }
- `DEBUG/ADD_GOLD` / `DEBUG/ADD_SCORE` { amount }
- `DEBUG/ADD_AMULET` { amuletType }
- `DEBUG/REMOVE_AMULET` { amuletIndex }

## ミノカテゴリ
| カテゴリ | セル数 | 種類数（向き込み） |
|---------|-------|-----------------|
| monomino | 1 | 1 |
| domino | 2 | 2 |
| tromino | 3 | 6 |
| tetromino | 4 | 19 |
| pentomino | 5 | 63 |
| hexomino | 6 | 216 |
| **合計** | | **307** |

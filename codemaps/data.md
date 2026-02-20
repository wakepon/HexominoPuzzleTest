# データモデル詳細
<!-- Updated: 2026-02-20T2 -->

## ID型（ブランド型）
```typescript
// src/lib/game/Domain/Core/Id.ts
type PieceId = string & { __brand?: 'PieceId' }
type MinoId = string & { __brand?: 'MinoId' }
type BlockSetId = number & { __brand?: 'BlockSetId' }
type RelicId = string & { __brand?: 'RelicId' }
type PatternId = string & { __brand?: 'PatternId' }
type SealId = string & { __brand?: 'SealId' }
type BlessingId = string & { __brand?: 'BlessingId' }
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
  relicMultiplierState: RelicMultiplierState       // レリック累積状態
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
  buff: BuffType | null           // バフ（永続効果、消去後もセルに残る）
  buffLevel: number               // バフレベル
  blockBlessing: BlessingId | null // 配置時の加護（消去時にバフへ変換される一時フィールド）
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
  blessing: BlessingId | null     // ピース上の加護（消去時にセルにバフとして刻まれる）
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
  cards: readonly MinoId[]                        // 山札（残りカード）
  allMinos: readonly MinoId[]                     // 全カード（再シャッフル用）
  remainingHands: number                          // 残り配置回数
  purchasedPieces: ReadonlyMap<MinoId, Piece>     // 購入Piece情報（パターン/シール復元用）
  stockSlot: Piece | null                         // ストック枠（hand_stockレリック用）
  stockSlot2: Piece | null                        // ストック枠2（コピーレリック用）
}

interface PieceSlot {
  piece: Piece | null
  position: Position              // スロットの画面上の位置
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

### RoundInfo / BossCondition
```typescript
interface RoundInfo {
  round: number
  type: RoundType              // 'normal' | 'elite' | 'boss'
  bossCondition: BossCondition | null
}

type BossConditionType = 'obstacle' | 'energy_save' | 'two_cards'

interface BossCondition {
  id: BossConditionType
  name: string
  description: string
}
// obstacle: おじゃまブロック4マス配置
// energy_save: 配置可能数25%減少
// two_cards: 手札2枚になる
```

## Effect全種別

### Pattern（ブロック効果）- 6種
| PatternType | 名前 | 記号 | 効果 |
|------------|------|------|------|
| enhanced | 強化ブロック | ★ | ブロック点+2（amplifier所持時+5） |
| lucky | ラッキーブロック | ♣ | 10%で列点×2 |
| feather | 羽ブロック | F | 重ね配置可能 |
| nohand | ノーハンドブロック | N | ハンド消費なし |
| charge | チャージブロック | ⚡ | 配置ごとにブロック点+1蓄積（magnet所持時+2） |
| obstacle | おじゃまブロック | × | 消去不可（ボス条件） |

### Seal（シール効果）- 3種
| SealType | 名前 | 記号 | 効果 |
|----------|------|------|------|
| gold | ゴールドシール | G | 消去時+1G（treasure_hunter所持時+2G） |
| multi | マルチシール | ×2 | 2回発動（prism所持時×3） |
| stone | 石 | 石 | 消去不可（furnace所持時消去でブロック点+15） |

### Blessing（加護）- 4種（ピース上の効果、消去時にセルにバフとして刻まれる）
| BlessingType | 名前 | 記号 | 効果 |
|-------------|------|------|------|
| power | 力の加護 | 力 | 消滅時にセルに+1増強を付与 |
| gold | 金の加護 | 金 | 消滅時にセルに+1金鉱を付与 |
| chain | 連の加護 | 連 | 消滅時にセルに+1脈動を付与 |
| phase | 透の加護 | 透 | 消滅時に25%の確率でセルに透過を付与 |

### Buff（バフ）- 4種（セル上の永続効果、消去後もセルに残る）
| BuffType | 名前 | 記号 | 効果 | 上限LV |
|----------|------|------|------|--------|
| enhancement | 増強 | 増 | ブロック点+0.5×LV | ∞ |
| gold_mine | 金鉱 | 鉱 | LV/4確率で1G | 4 |
| pulsation | 脈動 | 脈 | ライン点+0.2×LV | ∞ |
| phase | 透過 | 透 | 重ね配置可能 | 1 |

### Relic（レリック）- 45種（サイズボーナス6種 + 個別39種）

#### スコア系: 加算（additive） - ブロック点(A)に加算
| RelicType | 名前 | レアリティ | 価格 | 効果概要 |
|-----------|------|----------|------|---------|
| size_bonus_1~6 | Nサイズボーナス | common | 10 | Nブロックピース消去時ブロック点+1 |
| anchor | アンカー | common | 10 | ラウンド最初の消去時ブロック点+5 |
| featherweight | 軽量級 | common | 10 | 2ブロック以下配置で消去時ブロック点+4 |
| heavyweight | 重量級 | common | 10 | 5ブロック以上配置で消去時ブロック点+3 |
| twin | 双子 | common | 10 | 同サイズ連続配置で消去時ブロック点+4 |
| crown | 王冠 | uncommon | 15 | パターン付きブロック1個につきブロック点+2 |
| stamp | スタンプ | uncommon | 15 | シール付きブロック1個につきブロック点+5 |
| compass | コンパス | uncommon | 15 | 行列同時消去時ブロック点+3 |
| gardener | 庭師 | uncommon | 15 | パターンブロック消去ごとにブロック点+0.2累積（ラウンド中） |
| minimalist | ミニマリスト | uncommon | 15 | デッキ5枚以下でブロック点+5 |
| furnace | 溶鉱炉 | uncommon | 15 | stoneシール消去時1個につきブロック点+15 |
| cross | 十字 | rare | 20 | 行列同時消去時、交差セルのブロック点+30 |
| alchemist | 錬金術師 | rare | 20 | パターン+シール両方持ちブロック1個につきブロック点+10 |
| snowball | 雪だるま | rare | 20 | 消去ごとにブロック点+0.5累積（永続） |

#### スコア系: 乗算（multiplicative） - 列点(B)に乗算
| RelicType | 名前 | レアリティ | 価格 | 効果概要 |
|-----------|------|----------|------|---------|
| full_clear_bonus | 全消しボーナス | common | 10 | 全消し時列点×5 |
| chain_master | 連鎖の達人 | rare | 20 | 複数行列同時消しで列点×1.5 |
| single_line | シングルライン | uncommon | 15 | 1行/列のみ消去で列点×3 |
| takenoko | タケノコ | common | 10 | 縦列のみ消去で列点×列数 |
| kani | カニ | common | 10 | 横列のみ消去で列点×行数 |
| rensha | 連射 | rare | 20 | 連続消去で列点+1蓄積（リセットあり） |
| nobi_takenoko | のびのびタケノコ | uncommon | 15 | 縦のみ消去で列点+0.5蓄積 |
| nobi_kani | のびのびカニ | uncommon | 15 | 横のみ消去で列点+0.5蓄積 |
| timing | タイミング | uncommon | 15 | 残ハンド数÷3で列点×3 |
| meteor | 流星 | rare | 20 | 3ライン以上同時消しで列点×2 |
| symmetry | シンメトリー | uncommon | 15 | 消去行数と列数が同数で列点×2 |
| crescent | 三日月 | uncommon | 15 | 残ハンド奇数で列点×1.5 |
| last_stand | ラストスタンド | rare | 20 | 残ハンド2以下で列点×4 |
| first_strike | 先制攻撃 | uncommon | 15 | ラウンド最初の消去で列点×2.5 |
| patience | 忍耐 | rare | 20 | 連続3回非消去後の次の消去で列点×3 |
| muscle | 筋肉 | uncommon | 15 | 4ブロック以上配置ごとに列点+0.3累積（ラウンド中） |
| collector | 収集家 | uncommon | 15 | 異なるパターン種類1種につき列点+0.5累積 |
| overload | 過負荷 | rare | 20 | 盤面75%以上で列点×2 |
| orchestra | オーケストラ | uncommon | 15 | 3種以上のパターンで列点×2 |

#### スコア系: ライン加算（line_additive） - ライン数に加算
| RelicType | 名前 | レアリティ | 価格 | 効果概要 |
|-----------|------|----------|------|---------|
| script | 台本 | uncommon | 15 | 指定ライン揃えで列数+1/+2 |
| gambler | ギャンブラー | uncommon | 15 | 消去時ランダムに列数+0~3 |

#### 非スコア系（none） - ゲームメカニクスに影響
| RelicType | 名前 | レアリティ | 価格 | 効果概要 |
|-----------|------|----------|------|---------|
| hand_stock | 手札ストック | epic | 25 | ストック枠出現 |
| copy | コピー | epic | 25 | 1つ上のレリック効果をコピー |
| bandaid | 絆創膏 | rare | 20 | 3ハンドごとにノーハンドモノミノ追加 |
| volcano | 火山 | uncommon | 15 | 未消去時全消去（ブロック数×最大列数） |
| merchant | 商人 | uncommon | 15 | リロール費用-2G |
| recycler | リサイクラー | uncommon | 15 | ラウンド中3回まで手札1枚入替可能 |
| treasure_hunter | トレジャーハンター | common | 10 | ゴールドシール消去時追加+1G |
| midas | ミダス | uncommon | 15 | 全消し時+5G |
| goldfish | 金魚 | common | 10 | スコアが目標2倍以上で+3G |
| extra_draw | 追加ドロー | epic | 25 | ドロー枚数+1 |
| extra_hand | 追加ハンド | epic | 25 | ハンド数+2 |
| phoenix | 不死鳥 | epic | 25 | ラウンド失敗時1度だけやり直し（消滅） |
| amplifier | アンプリファイア | epic | 25 | enhanced(★)ボーナスを+2→+5に強化 |
| magnet | 磁石 | uncommon | 15 | charge(⚡)蓄積速度2倍 |
| prism | プリズム | rare | 20 | multiシール(×2)を×3に強化 |
| jester | 道化師 | rare | 20 | レリック枠-1、ショップ全商品30%OFF |

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
  // パターン・シール効果（レリック非依存）
  baseBlocks: number              // 基本消去ブロック数
  enhancedBonus: number           // enhanced効果
  multiBonus: number              // multiシール効果（追加ブロック数）
  chargeBonus: number             // charge効果による追加ブロック数
  totalBlocks: number             // 合計ブロック数（乗算対象）
  linesCleared: number            // 消去ライン数
  baseScore: number               // 基本スコア（totalBlocks × linesCleared）
  luckyMultiplier: number         // lucky倍率（1 or 2）
  goldCount: number               // goldシール数（スコア外、Reducerで使用）

  // レリック効果（動的マップ）
  relicEffects: ReadonlyMap<string, number>  // relicId → 効果値
  sizeBonusRelicId: string | null            // 発動サイズボーナスID
  copyTargetRelicId: string | null           // コピー対象ID
  relicBonusTotal: number                    // レリック加算合計

  // バフ効果
  buffEnhancementBonus: number    // 増強バフボーナス（ブロック点加算）
  buffGoldMineBonus: number       // 金鉱バフゴールド（スコア外）
  buffPulsationBonus: number      // 脈動バフボーナス（列点加算）

  // 最終計算値
  blockPoints: number             // ブロック点(A): パターン+シール+加算レリック+増強バフ
  linePoints: number              // 列点(B): ライン数×lucky×乗算レリック+脈動バフ
  finalScore: number              // Math.floor(A × B)
}
```

### relicEffectsの解釈（ScoreEffectType別）
| ScoreEffectType | Mapの値の意味 | 例 |
|----------------|-------------|---|
| multiplicative | 列点(B)の乗算倍率 | chain_master→1.5 |
| additive | ブロック点(A)への加算 | size_bonus_3→消去ブロック数 |
| line_additive | ライン数への加算 | script→1 or 2, gambler→0~3 |

## RelicModule（レリックモジュールインターフェース）
```typescript
// src/lib/game/Domain/Effect/Relics/RelicModule.ts
interface RelicModule {
  type: string                              // レリックID
  definition: RelicModuleDefinition         // 名前、説明、レアリティ等
  scoreEffect: ScoreEffectType              // 'multiplicative'|'additive'|'line_additive'|'none'
  checkActivation(ctx: RelicContext): RelicActivation  // 発動判定+効果値
  initialState?: () => unknown              // 累積状態の初期値
  updateState?: (state, event) => unknown   // イベントに応じた状態更新
  onPiecePlaced?: (ctx) => RelicHookResult  // ピース配置後フック
  onRoundStart?: (ctx) => RelicHookResult   // ラウンド開始フック
}

interface RelicContext {
  ownedRelics: readonly RelicId[]
  totalLines, rowLines, colLines: number
  placedBlockSize: number
  isBoardEmptyAfterClear: boolean
  completedRows: readonly number[]
  completedCols: readonly number[]
  scriptRelicLines: ScriptRelicLines | null
  remainingHands: number
  patternBlockCount: number           // 消去セル内パターン付きブロック数
  sealBlockCount: number              // 消去セル内シール付きブロック数
  deckSize: number                    // デッキ全カード枚数
  boardFilledCount: number            // 盤面の埋まっているセル数
  patternAndSealBlockCount: number    // パターン+シール両方持ちブロック数
  distinctPatternTypeCount: number    // 異なるパターン種類数
  stoneBlockCount?: number            // stoneシール付きブロック数
  relicState: unknown                 // レリック自身の累積状態
}

type RelicStateEvent =
  | { type: 'lines_detected'; totalLines; rowLines; colLines }
  | { type: 'lines_cleared'; totalLines; rowLines; colLines; patternBlockCount; clearedPatternTypes }
  | { type: 'hand_consumed'; placedBlockSize }
  | { type: 'round_start' }
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
- `RELIC/RECYCLE_PIECE` { slotIndex }

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
- `DEBUG/ADD_RANDOM_EFFECTS`

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

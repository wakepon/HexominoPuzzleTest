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
  readonly chargeValue: number
  readonly buff: BuffType | null
  readonly buffLevel: number
  readonly blockBlessing: BlessingId | null
}
```

**プロパティ:**
- `filled`: セルが埋まっているかどうか
- `blockSetId`: 配置されたブロックセットの識別子
- `pattern`: パターンID（強化、ラッキー、羽、ノーハンド、チャージ、おじゃまブロック）
- `seal`: シールID（ゴールド、マルチ、石）
- `chargeValue`: チャージパターンの蓄積値
- `buff`: バフの種類（増強、金鉱、脈動、透過）
- `buffLevel`: バフのレベル
- `blockBlessing`: ブロック配置時の加護（消去時にバフとして刻まれる一時フィールド）

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

## デッキ関連

### DeckState

デッキの状態。

```typescript
interface DeckState {
  readonly cards: readonly MinoId[]
  readonly allMinos: readonly MinoId[]
  readonly remainingHands: number
  readonly purchasedPieces: ReadonlyMap<MinoId, Piece>
  readonly stockSlot: Piece | null
  readonly stockSlot2: Piece | null
}
```

**プロパティ:**
- `cards`: デッキに残っているミノIDの配列（山札）
- `allMinos`: 全カードリスト（再シャッフル用、購入したミノも含む）
- `remainingHands`: 残りの配置可能回数（ラウンド開始時にリセット）
- `purchasedPieces`: 購入したPieceの情報マップ（パターン・シール復元用）
- `stockSlot`: ストック枠（hand_stockレリック用）
- `stockSlot2`: ストック枠2（コピーレリックでhand_stockをコピー時に使用）

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

// 護符商品
interface AmuletShopItem {
  readonly type: 'amulet'
  readonly amuletId: AmuletId
  readonly amuletType: AmuletType
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly price: number
  readonly originalPrice: number
  readonly purchased: boolean
  readonly onSale: boolean
}

type ShopItem = BlockShopItem | RelicShopItem | AmuletShopItem
```

### ShopState

ショップ状態。

```typescript
interface ShopState {
  readonly items: readonly ShopItem[]
  readonly rerollCount: number
  readonly sellMode: boolean
  readonly pendingPurchaseIndex: number | null
}
```

**プロパティ:**
- `items`: 販売中のアイテムリスト（ブロック + レリック + 護符）
- `rerollCount`: リロール回数（コスト計算用）
- `sellMode`: 売却モード中かどうか
- `pendingPurchaseIndex`: 入れ替え購入時の保留商品インデックス

## パターン・シール・加護関連

### PatternType

パターンの種類。

```typescript
type PatternType =
  | 'enhanced'   // 強化ブロック（ブロック点+2）
  | 'lucky'      // ラッキーブロック（確率で列点×2）
  | 'feather'    // 羽ブロック（重ね配置可能）
  | 'nohand'     // ノーハンドブロック（配置してもハンド消費しない）
  | 'charge'     // チャージブロック（他ブロック配置でブロック点蓄積）
  | 'obstacle'   // おじゃまブロック（消去不可、ボス条件）
```

### PatternDefinition

パターンの定義。

```typescript
interface PatternDefinition {
  readonly id: PatternId
  readonly type: PatternType
  readonly name: string
  readonly description: string
  readonly symbol: string
  readonly isNegative: boolean
  readonly price: number
}
```

### SealType

シールの種類。

```typescript
type SealType =
  | 'gold'   // ゴールドシール（消去時+1G）
  | 'multi'  // マルチシール（2回発動）
  | 'stone'  // 石（消去不可）
```

### SealDefinition

シールの定義。

```typescript
interface SealDefinition {
  readonly id: SealId
  readonly type: SealType
  readonly name: string
  readonly description: string
  readonly symbol: string
  readonly preventsClearing: boolean
  readonly price: number
}
```

### BlessingType

加護の種類。

```typescript
type BlessingType =
  | 'power'  // 力の加護（消滅時にセルに+1増強を付与）
  | 'gold'   // 金の加護（消滅時にセルに+1金鉱を付与）
  | 'chain'  // 連の加護（消滅時にセルに+1脈動を付与）
  | 'phase'  // 透の加護（消滅時に確率でセルに透過を付与）
```

### BlessingDefinition

加護の定義。

```typescript
interface BlessingDefinition {
  readonly id: BlessingId
  readonly type: BlessingType
  readonly name: string
  readonly description: string
  readonly symbol: string
  readonly maxLevel: number
  readonly price: number
}
```

**加護とバフの関係:**
- 加護はピース（ブロック）上に付与される
- ブロック消去時、加護がセルにバフとして刻まれる
- バフは消去後もセルに残り続ける永続効果

### BuffType

バフの種類。

```typescript
type BuffType =
  | 'enhancement'  // 増強（ブロック点+0.5xLv）
  | 'gold_mine'    // 金鉱（Lv/4確率で1G）
  | 'pulsation'    // 脈動（ライン点+0.2xLv）
  | 'phase'        // 透過（重ね配置可能）
```

### BuffDefinition

バフの定義。

```typescript
interface BuffDefinition {
  readonly type: BuffType
  readonly name: string
  readonly description: string
  readonly symbol: string
  readonly maxLevel: number
}
```

**加護とバフのマッピング:**
- 力の加護 → 増強バフ
- 金の加護 → 金鉱バフ
- 連の加護 → 脈動バフ
- 透の加護 → 透過バフ

### BlockData

ブロック単位の効果データ。

```typescript
interface BlockData {
  readonly pattern: PatternId | null
  readonly seal: SealId | null
  readonly blessing: BlessingId | null
}
```

**プロパティ:**
- `pattern`: パターンID（Piece全体で同じ値が設定される）
- `seal`: シールID（一部のBlockのみに設定される）
- `blessing`: 加護ID（一部のBlockのみに設定される、消去時にセルにバフとして刻まれる）

**用途:**
- Piece.blocks（BlockDataMap）の値として使用される
- 配置時にボードのCellに反映される

## レリック関連

### RelicType

レリックの種類。52種のレリックが定義されている。

```typescript
type RelicType =
  | 'full_clear_bonus'  // 全消しボーナス
  | 'size_bonus_1' | 'size_bonus_2' | 'size_bonus_3'
  | 'size_bonus_4' | 'size_bonus_5' | 'size_bonus_6'  // サイズボーナス
  | 'chain_master'      // 連鎖の達人
  | 'single_line'       // シングルライン
  | 'takenoko'          // タケノコ
  | 'kani'              // カニ
  | 'rensha'            // 連射
  | 'nobi_takenoko'     // のびのびタケノコ
  | 'nobi_kani'         // のびのびカニ
  | 'hand_stock'        // 手札ストック
  | 'script'            // 台本
  | 'volcano'           // 火山
  | 'bandaid'           // 絆創膏
  | 'timing'            // タイミング
  | 'copy'              // コピー
  | 'anchor'            // アンカー
  | 'crown'             // 王冠
  | 'stamp'             // スタンプ
  | 'compass'           // コンパス
  | 'featherweight'     // 軽量級
  | 'heavyweight'       // 重量級
  | 'meteor'            // 流星
  | 'symmetry'          // シンメトリー
  | 'crescent'          // 三日月
  | 'last_stand'        // ラストスタンド
  | 'first_strike'      // 先制攻撃
  | 'patience'          // 忍耐
  | 'snowball'          // 雪だるま
  | 'muscle'            // 筋肉
  | 'gardener'          // 庭師
  | 'collector'         // 収集家
  | 'merchant'          // 商人
  | 'treasure_hunter'   // トレジャーハンター
  | 'cross'             // 十字
  | 'midas'             // ミダス
  | 'extra_draw'        // 追加ドロー
  | 'extra_hand'        // 追加ハンド
  | 'recycler'          // リサイクラー
  | 'twin'              // 双子
  | 'minimalist'        // ミニマリスト
  | 'overload'          // 過負荷
  | 'alchemist'         // 錬金術師
  | 'orchestra'         // オーケストラ
  | 'amplifier'         // アンプリファイア
  | 'gambler'           // ギャンブラー
  | 'phoenix'           // 不死鳥
  | 'goldfish'          // 金魚
  | 'magnet'            // 磁石
  | 'prism'             // プリズム
  | 'furnace'           // 溶鉱炉
  | 'jester'            // 道化師
```

### RelicDefinition

レリックの定義。

```typescript
interface RelicDefinition {
  readonly id: RelicId
  readonly type: RelicType
  readonly name: string
  readonly description: string
  readonly rarity: RelicRarity
  readonly price: number
  readonly icon: string
}
```

### RelicRarity

レリックのレアリティ。

```typescript
type RelicRarity = 'common' | 'uncommon' | 'rare' | 'epic'
```

### PlayerState

プレイヤー状態（ゴールドとレリックを管理）。

```typescript
interface PlayerState {
  readonly gold: number
  readonly earnedGold: number
  readonly ownedRelics: readonly RelicId[]         // 最大5枠（変更予定）
  readonly relicDisplayOrder: readonly RelicId[]   // 最大5枠（変更予定）
  readonly amuletStock: readonly Amulet[]          // 護符ストック（最大2個、追加予定）
}
```

**プロパティ:**
- `gold`: 現在の所持ゴールド
- `earnedGold`: ゲーム開始から獲得した累計ゴールド（リザルト表示用）
- `ownedRelics`: 現在所持しているレリックのIDリスト（所持上限5枠予定）
- `relicDisplayOrder`: レリックの表示順（UIでの並び順管理用、乗算適用順）
- `amuletStock`: 護符のストック（最大2個、追加予定）

> ※現状は `ownedRelics` に所持上限なし。`amuletStock` は未実装。

### RelicMultiplierState

倍率系・状態系レリックの状態を一元管理する。

```typescript
interface RelicMultiplierState {
  readonly nobiTakenokoMultiplier: number           // のびのびタケノコ倍率
  readonly nobiKaniMultiplier: number               // のびのびカニ倍率
  readonly renshaMultiplier: number                 // 連射倍率
  readonly bandaidCounter: number                   // 絆創膏カウンター
  readonly anchorHasClearedInRound: boolean         // アンカー: ラウンド中に消去済みか
  readonly firstStrikeHasClearedInRound: boolean    // 先制攻撃: ラウンド中に消去済みか
  readonly patienceConsecutiveNonClearHands: number // 忍耐: 連続非消去ハンド数
  readonly patienceIsCharged: boolean               // 忍耐: チャージ済みか
  readonly snowballBonus: number                    // 雪だるま: 累積ブロック点ボーナス
  readonly muscleAccumulatedBonus: number           // 筋肉: 累積列点ボーナス
  readonly gardenerAccumulatedBonus: number         // 庭師: 累積ブロック点ボーナス
  readonly collectorCollectedPatterns: readonly string[]  // 収集家: 収集済みパターン種類
  readonly collectorAccumulatedBonus: number              // 収集家: 累積列点ボーナス
  readonly recyclerUsesRemaining: number            // リサイクラー: 残り使用回数
  readonly twinLastPlacedBlockSize: number          // 双子: 直前配置ブロック数
  readonly copyRelicState: CopyRelicState | null    // コピーレリック状態（未所持時はnull）
}
```

**更新タイミング:**
- ライン消去時に連射・のびのび系の倍率を更新
- ハンド消費時に絆創膏カウンターを更新
- 各レリックの条件に応じてフラグ・カウンターを更新
- ラウンド開始時に一部をリセット（雪だるまは永続）

### CopyRelicState

コピーレリック専用の状態（独立カウンター管理）。

```typescript
interface CopyRelicState {
  readonly targetRelicId: RelicId | null
  readonly bandaidCounter: number
  readonly renshaMultiplier: number
  readonly nobiTakenokoMultiplier: number
  readonly nobiKaniMultiplier: number
  readonly anchorHasClearedInRound: boolean
  readonly firstStrikeHasClearedInRound: boolean
  readonly patienceConsecutiveNonClearHands: number
  readonly patienceIsCharged: boolean
  readonly snowballBonus: number
  readonly muscleAccumulatedBonus: number
  readonly gardenerAccumulatedBonus: number
  readonly collectorCollectedPatterns: readonly string[]
  readonly collectorAccumulatedBonus: number
  readonly twinLastPlacedBlockSize: number
}
```

**プロパティ:**
- `targetRelicId`: コピー対象のレリックID（未設定時はnull）
- その他: コピー先のレリック動作をシミュレートするための独立カウンター群

## 護符関連

### AmuletType

護符の種類。

```typescript
type AmuletType =
  | 'sculpt'       // 形状編集: ピースのブロックを追加/削除
  | 'pattern_add'  // パターン追加: ランダムなパターンを付与
  | 'seal_add'     // シール追加: ランダムなシールを付与
  | 'vanish'       // 消去: デッキからピースを削除
```

### Amulet

護符のインスタンス。

```typescript
interface Amulet {
  readonly id: AmuletId
  readonly type: AmuletType
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly price: number  // 購入時の価格（売却額計算用）
}
```

### AmuletDefinition

護符の定義。

```typescript
interface AmuletDefinition {
  readonly id: AmuletId
  readonly type: AmuletType
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly minPrice: number
  readonly maxPrice: number
}
```

**護符の最大ストック数:**
- 最大2個まで保持可能

### AmuletModalState

護符使用時のモーダル状態。

```typescript
interface AmuletModalState {
  readonly amuletType: AmuletType
  readonly amuletIndex: number
  readonly step: AmuletModalStep
  readonly selectedMinoId: MinoId | null
  readonly editingShape: PieceShape | null
}

type AmuletModalStep = 'select_piece' | 'sculpt_edit'
```

**プロパティ:**
- `amuletType`: 使用中の護符の種類
- `amuletIndex`: 使用中の護符のストック内インデックス
- `step`: 現在のステップ（ピース選択 or 形状編集）
- `selectedMinoId`: 選択されたミノID（sculpt_edit時）
- `editingShape`: 編集中の形状（sculpt_edit時）

## 台本レリック関連

### ScriptLineTarget

台本レリックが指定するラインの種類（行または列）。

```typescript
type ScriptLineTarget =
  | { readonly type: 'row'; readonly index: number }
  | { readonly type: 'col'; readonly index: number }
```

### ScriptRelicLines

台本レリックが指定する2本のライン。

```typescript
interface ScriptRelicLines {
  readonly target1: ScriptLineTarget
  readonly target2: ScriptLineTarget
}
```

**用途:**
- ゲーム状態 `scriptRelicLines` に格納され、スコア計算で参照される
- 台本レリックが所持されている場合、指定した2本のラインを揃えるとボーナス

## ライン消去関連

### CompletedLines

完成したラインの情報。

```typescript
interface CompletedLines {
  rows: number[]
  columns: number[]
}
```

### ClearingCell

消去対象のセル座標。

```typescript
interface ClearingCell {
  readonly x: number
  readonly y: number
  // 新しいコード用エイリアス
  readonly row: number
  readonly col: number
  // 順次消去用（オプショナル）
  readonly delay?: number
  readonly pattern?: PatternId | null
  readonly seal?: SealId | null
  readonly chargeValue?: number
  readonly blockBlessing?: BlessingId | null
}
```

**注意:** `x`/`y` は後方互換性のために保持。新しいコードでは `row`/`col` を使用推奨。

**オプショナルプロパティ:**
- `delay`: 順次消去時の遅延時間
- `pattern`, `seal`, `chargeValue`, `blockBlessing`: セル情報（アニメーション表示用）

### ClearingAnimationState

消去アニメーション状態。

```typescript
interface ClearingAnimationState {
  readonly isAnimating: boolean
  readonly cells: readonly ClearingCell[]
  readonly startTime: number
  readonly duration: number
  readonly perCellDuration: number
}
```

**プロパティ:**
- `duration`: 全体の所要時間（スタガード込み）
- `perCellDuration`: 各セルのアニメーション時間

## スコア計算・レリック効果・アニメーション関連

スコア計算・レリック効果・アニメーション関連の型定義は分割ファイルを参照。

- [data-structures-effect-types.md](./data-structures-effect-types.md) - スコア計算型（PatternEffectResult, ScoreBreakdown等）、レリック効果型（RelicEffectContext, RelicEffectResult等）、アニメーション型（ScoreAnimationState, FormulaStep等）

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
  id: string
  name: string
  description: string
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
  // ボード関連
  readonly board: Board
  readonly pieceSlots: readonly PieceSlot[]
  readonly deck: DeckState

  // UI関連
  readonly dragState: DragState
  readonly clearingAnimation: ClearingAnimationState | null
  readonly relicActivationAnimation: RelicActivationAnimationState | null
  readonly scoreAnimation: ScoreAnimationState | null

  // ラウンド関連
  readonly phase: GamePhase
  readonly pendingPhase: GamePhase | null
  readonly round: number
  readonly roundInfo: RoundInfo
  readonly score: number
  readonly targetScore: number

  // プレイヤー関連
  readonly player: PlayerState

  // ショップ関連
  readonly shopState: ShopState | null

  // レリック倍率状態
  readonly relicMultiplierState: RelicMultiplierState

  // 台本レリック指定ライン
  readonly scriptRelicLines: ScriptRelicLines | null

  // 火山レリック発動可能フラグ
  readonly volcanoEligible: boolean

  // UI状態
  readonly deckViewOpen: boolean
  readonly amuletModal: AmuletModalState | null
}
```

**プロパティ:**
- `board`: ゲームボードの状態
- `pieceSlots`: ブロックスロットの配列（通常3つ、ボス条件で2つの場合あり）
- `deck`: デッキ状態
- `dragState`: ドラッグ操作の状態
- `clearingAnimation`: 消去アニメーション状態（アニメーション中のみ非null）
- `relicActivationAnimation`: レリック発動アニメーション状態
- `scoreAnimation`: スコア計算式アニメーション状態（アニメーション中のみ非null）
- `phase`: 現在のゲームフェーズ
- `pendingPhase`: 保留中のフェーズ（アニメーション完了後に遷移するフェーズ）
- `round`: 現在のラウンド番号（1から24）
- `roundInfo`: ラウンド詳細情報（タイプ、セット番号、ボス条件等）
- `score`: 現在ラウンドのスコア（ラウンド開始時にリセット）
- `targetScore`: 現在ラウンドの目標スコア
- `player`: プレイヤー状態（ゴールド、所持レリック、護符ストック）
- `shopState`: ショップ状態（shoppingフェーズでのみ非null）
- `relicMultiplierState`: 倍率系・状態系レリックの累積状態
- `scriptRelicLines`: 台本レリックが指定した2本のライン（所持時のみ非null）
- `volcanoEligible`: 火山レリックの発動条件（ラウンド中にライン消去がなければtrue）
- `deckViewOpen`: デッキビューが開かれているかどうか
- `amuletModal`: 護符モーダル状態（護符使用中のみ非null）

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

**アクション一覧:**

| アクション | 説明 |
|---|---|
| `BOARD/PLACE_PIECE` | ブロックを指定位置に配置 |
| `UI/START_DRAG` | ドラッグ開始 |
| `UI/UPDATE_DRAG` | ドラッグ中の位置更新 |
| `UI/END_DRAG` | ドラッグ終了 |
| `GAME/RESET` | ゲームリセット |
| `ANIMATION/END_CLEAR` | 消去アニメーション終了 |
| `ANIMATION/END_RELIC_ACTIVATION` | レリック発動アニメーション終了 |
| `ROUND/ADVANCE` | ラウンド進行（round_clearフェーズから次フェーズへ） |
| `SHOP/BUY_ITEM` | ショップアイテム購入 |
| `SHOP/LEAVE` | ショップ退出 |

**プレフィックスによる分類:**
- `BOARD/`: ボード操作
- `UI/`: UI操作（ドラッグ等）
- `GAME/`: ゲーム全体
- `ANIMATION/`: アニメーション
- `ROUND/`: ラウンド進行
- `SHOP/`: ショップ操作

## 型の関連図

```
GameState
├── Board (Cell[][]）
│   └── Cell
│       ├── pattern: PatternId | null
│       ├── seal: SealId | null
│       ├── buff: BuffType | null
│       ├── buffLevel: number
│       └── blockBlessing: BlessingId | null
├── PieceSlot[] → Piece → BlockDataMap (BlockData)
│   └── BlockData
│       ├── pattern: PatternId | null
│       ├── seal: SealId | null
│       └── blessing: BlessingId | null
├── DeckState
│   ├── cards: MinoId[]
│   ├── purchasedPieces: Map<MinoId, Piece>
│   ├── stockSlot: Piece | null
│   └── stockSlot2: Piece | null
├── PlayerState
│   ├── gold, earnedGold
│   ├── ownedRelics: RelicId[]
│   ├── relicDisplayOrder: RelicId[]
│   └── amuletStock: Amulet[]  // 最大2個
├── RelicMultiplierState (52種レリックの状態管理)
│   └── copyRelicState: CopyRelicState | null
├── scriptRelicLines: ScriptRelicLines | null
│   ├── target1: ScriptLineTarget
│   └── target2: ScriptLineTarget
├── DragState
├── ClearingAnimationState | null
├── RelicActivationAnimationState | null
│   └── activatedRelics: ActivatedRelicInfo[]
├── ScoreAnimationState | null
│   └── steps: FormulaStep[]
├── ShopState | null
│   └── items: ShopItem[] (BlockShopItem | RelicShopItem | AmuletShopItem)
└── amuletModal: AmuletModalState | null
```

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

## UI関連型

### TooltipState

ツールチップ表示状態。

```typescript
interface TooltipState {
  readonly visible: boolean
  readonly x: number
  readonly y: number
  readonly effects: readonly EffectInfo[]
}

interface EffectInfo {
  readonly name: string
  readonly description: string
  readonly rarity?: RelicRarity
}
```

### DebugSettings

デバッグ設定（ショップでのパターン/シール/加護付与確率を調整）。

```typescript
interface DebugSettings {
  readonly patternProbability: number    // パターン付与確率 (0-100%)
  readonly sealProbability: number       // シール付与確率 (0-100%)
  readonly blessingProbability: number   // 加護付与確率 (0-100%)
}
```

## 関連ファイル

- `src/lib/game/Domain/GameState.ts` - GameState定義
- `src/lib/game/Domain/Board/Cell.ts` - Cell型定義
- `src/lib/game/Domain/Piece/BlockData.ts` - BlockData型定義
- `src/lib/game/Domain/Deck/DeckState.ts` - デッキ関連型
- `src/lib/game/Domain/Shop/ShopTypes.ts` - ショップ関連型
- `src/lib/game/Domain/Effect/Pattern.ts` - パターン定義
- `src/lib/game/Domain/Effect/Seal.ts` - シール定義
- `src/lib/game/Domain/Effect/Blessing.ts` - 加護定義
- `src/lib/game/Domain/Effect/Buff.ts` - バフ定義
- `src/lib/game/Domain/Effect/Relic.ts` - レリック定義（52種）
- `src/lib/game/Domain/Effect/RelicState.ts` - レリック状態型（RelicMultiplierState, CopyRelicState）
- `src/lib/game/Domain/Effect/Amulet.ts` - 護符定義
- `src/lib/game/Domain/Effect/AmuletModalState.ts` - 護符モーダル状態型
- `src/lib/game/Domain/Effect/RelicEffectTypes.ts` - レリック効果型
- `src/lib/game/Domain/Effect/PatternEffectTypes.ts` - パターン・スコア計算型
- `src/lib/game/Domain/Effect/SealEffectTypes.ts` - シール効果型
- `src/lib/game/Domain/Effect/ScriptRelicState.ts` - 台本レリック状態型
- `src/lib/game/Domain/Round/` - ラウンド関連型
- `src/lib/game/Domain/Player/PlayerState.ts` - プレイヤー関連型
- `src/lib/game/Domain/Animation/AnimationState.ts` - アニメーション状態型
- `src/lib/game/Domain/Animation/ScoreAnimationState.ts` - スコアアニメーション状態型
- `src/lib/game/Domain/Tooltip/TooltipState.ts` - ツールチップ状態型
- `src/lib/game/Domain/Debug/DebugSettings.ts` - デバッグ設定型
- `src/lib/game/State/Actions/GameActions.ts` - アクション型定義
- `src/lib/game/Data/MinoDefinitions.ts` - ミノ定義

## 更新履歴

- 2026-02-01: 初版作成
- 2026-02-01: ミノ関連型、ライン消去関連型、スコア、アニメーション状態を追加
- 2026-02-02: DeckState、GamePhase、ShopItem、ShopState、新アクション型を追加
- 2026-02-06: ローグライト要素追加（Cell拡張、パターン・シール型、レリック型、ラウンド型、ShopItem拡張、GameState拡張、新アクション）
- 2026-02-09: Domain/Service層への構造変更を反映、readonly型の追加、PlayerState統合、BlockData追加、アクション型プレフィックス化、TooltipState追加
- 2026-02-17: レリック中心設計を反映（RelicRarity uncommon追加、PlayerState所持上限・amuletStock追加、AmuletShopItem追加、護符関連型追加、型の関連図更新）
- 2026-02-17: コードベースに合わせて更新
  - GameState: scoreAnimation, pendingPhase, volcanoEligible, deckViewOpen, scriptRelicLines, relicMultiplierState を追加
  - DeckState: stockSlot, stockSlot2 を追加
  - PlayerState: earnedGold, relicDisplayOrder を追加
  - ClearingCell: row/col エイリアスを追加
  - 新規型を追加: RelicMultiplierState, CopyRelicState, ScriptRelicLines, ScriptLineTarget
  - 型の関連図を追加
  - 効果計算型（PatternEffectResult, ScoreBreakdown, RelicEffectResult, ScoreAnimationState等）を data-structures-effect-types.md に分割
- 2026-02-20: 加護・バフシステム追加とレリック拡充を反映
  - Cell: chargeValue, buff, buffLevel, blockBlessing を追加
  - BlockData: blessing プロパティを追加
  - パターン・シール型を大幅に更新（PatternType, SealType, 削除されたパターン/シールを反映）
  - 加護・バフ関連型を追加（BlessingType, BlessingDefinition, BuffType, BuffDefinition）
  - RelicType を52種に拡充（40種以上の新レリック追加）
  - RelicMultiplierState を拡張（新レリック用のカウンター・フラグ追加）
  - CopyRelicState を拡張（コピー対象レリック用の独立カウンター追加）
  - 護符関連型を実装（AmuletType, Amulet, AmuletDefinition, AmuletModalState）
  - AmuletShopItem を実装
  - ShopState: rerollCount, sellMode, pendingPurchaseIndex を追加
  - GameState: amuletModal を追加
  - ClearingCell: 順次消去用オプショナルプロパティを追加
  - ClearingAnimationState: perCellDuration を追加
  - TooltipState を更新（EffectInfo型を追加）
  - DebugSettings を追加
  - 型の関連図を更新

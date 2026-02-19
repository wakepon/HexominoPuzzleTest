# データ構造 - 効果計算型

## 概要

スコア計算・パターン・シール・レリック効果に関するデータ型の定義。
ゲームの基本型については [data-structures.md](./data-structures.md) を参照。

## スコア計算関連

### PatternEffectResult

パターン効果計算の結果。

```typescript
interface PatternEffectResult {
  readonly enhancedBonus: number  // enhanced効果による追加ブロック数
  readonly auraBonus: number      // aura効果による追加ブロック数
  readonly mossBonus: number      // moss効果による追加ブロック数
  readonly chargeBonus: number    // charge効果による追加ブロック数
}
```

### SealEffectResult

シール効果計算の結果。

```typescript
interface SealEffectResult {
  readonly goldCount: number    // ゴールドシールの数
  readonly scoreBonus: number   // スコアシールによる加算
  readonly multiBonus: number   // マルチシールによる追加ブロック数
  readonly arrowBonus: number   // アローシールによる追加ブロック数
}
```

### CompletedLinesInfo

完成したラインの情報（アローシール判定用）。

```typescript
interface CompletedLinesInfo {
  readonly rows: readonly number[]
  readonly columns: readonly number[]
}
```

### ComboState

コンボ状態。

```typescript
interface ComboState {
  readonly count: number
  readonly lastPatternWasCombo: boolean
}
```

### ScoreBreakdown

スコア計算の詳細内訳。スコア計算後にReducerで使用される。

```typescript
interface ScoreBreakdown {
  readonly baseBlocks: number          // 基本消去ブロック数
  readonly enhancedBonus: number       // enhanced効果
  readonly auraBonus: number           // aura効果
  readonly mossBonus: number           // moss効果
  readonly multiBonus: number          // multiシール効果（追加ブロック数）
  readonly arrowBonus: number          // アローシール効果
  readonly chargeBonus: number         // charge効果による追加ブロック数
  readonly totalBlocks: number         // 合計ブロック数（乗算対象）
  readonly linesCleared: number        // 消去ライン数
  readonly baseScore: number           // 基本スコア（totalBlocks × linesCleared）
  readonly comboBonus: number          // comboボーナス
  readonly luckyMultiplier: number     // lucky倍率
  readonly sealScoreBonus: number      // scoreシールによる加算
  readonly goldCount: number           // goldシール数（スコアには影響しない）
  readonly chainMasterMultiplier: number
  readonly sizeBonusTotal: number
  readonly sizeBonusRelicId: RelicId | null
  readonly fullClearMultiplier: number   // 全消し倍率（1 or 5）
  readonly relicBonusTotal: number
  readonly singleLineMultiplier: number
  readonly takenokoMultiplier: number
  readonly kaniMultiplier: number
  readonly renshaMultiplier: number        // 連射倍率（累積、初期1.0、+1ずつ増加）
  readonly nobiTakenokoMultiplier: number  // のびのびタケノコ倍率（累積、初期1.0、+0.5ずつ増加）
  readonly nobiKaniMultiplier: number      // のびのびカニ倍率（累積、初期1.0、+0.5ずつ増加）
  readonly scriptLineBonus: number         // 台本ライン数ボーナス（0, 1, or 2）
  readonly timingMultiplier: number        // タイミング倍率（1 or 3）
  readonly copyTargetRelicId: RelicId | null
  readonly copyMultiplier: number
  readonly copyBonus: number
  readonly copyLineBonus: number           // コピーによるライン数加算（台本コピー時、0, 1, or 2）
  readonly blockPoints: number             // ブロック点(A): パターン+シール+加算レリック+コンボ
  readonly linePoints: number              // 列点(B): ライン数×lucky+moss×乗算レリック
  readonly finalScore: number              // 最終スコア = Math.floor(A × B)
}
```

**主なプロパティ:**
- `baseBlocks`: 基本消去ブロック数
- `totalBlocks`: 合計ブロック数（乗算対象）
- `linesCleared`: 消去ライン数
- `scriptLineBonus`: 台本レリック効果によるライン数加算
- `copyLineBonus`: コピーレリックによるライン数加算
- `baseScore`: 基本スコア（totalBlocks × (linesCleared + scriptLineBonus + copyLineBonus)）
- `finalScore`: 最終スコア
- `goldCount`: ゴールドシール数（スコアには影響せず、ゴールド獲得計算に使用）

## レリック効果関連

### RelicEffectContext

レリック効果計算に必要なコンテキスト。

```typescript
interface RelicEffectContext {
  readonly ownedRelics: readonly RelicId[]
  readonly totalLines: number
  readonly rowLines: number
  readonly colLines: number
  readonly placedBlockSize: number
  readonly isBoardEmptyAfterClear: boolean
  readonly relicMultiplierState: RelicMultiplierState
  readonly completedRows: readonly number[]
  readonly completedCols: readonly number[]
  readonly scriptRelicLines: ScriptRelicLines | null
  readonly copyRelicState?: CopyRelicState | null
  readonly remainingHands: number              // 残りハンド数（タイミングレリック判定用）
}
```

**プロパティ:**
- `ownedRelics`: 所持レリックIDリスト
- `totalLines`: 消去ライン数合計
- `rowLines`: 消去した行数
- `colLines`: 消去した列数
- `placedBlockSize`: 配置したピースのブロック数
- `isBoardEmptyAfterClear`: 消去後に盤面が空かどうか（全消し判定）
- `relicMultiplierState`: 現在の倍率状態
- `completedRows`/`completedCols`: 揃った行・列のインデックス（台本レリック判定用）
- `scriptRelicLines`: 台本レリックが指定した2本のライン
- `copyRelicState`: コピーレリック状態（オプショナル）

### RelicActivationState

各レリックの発動状態（スコア計算・アニメーション表示用）。

```typescript
interface RelicActivationState {
  readonly chainMasterActive: boolean         // 連鎖の達人
  readonly sizeBonusActiveRelicId: RelicId | null  // サイズボーナス発動レリックID
  readonly fullClearActive: boolean           // 全消しボーナス

  // シングルライン
  readonly singleLineActive: boolean
  // タケノコ
  readonly takenokoActive: boolean
  readonly takenokoCols: number
  // カニ
  readonly kaniActive: boolean
  readonly kaniRows: number
  // 連射
  readonly renshaActive: boolean
  readonly renshaMultiplier: number
  // のびのびタケノコ
  readonly nobiTakenokoActive: boolean
  readonly nobiTakenokoMultiplier: number
  // のびのびカニ
  readonly nobiKaniActive: boolean
  readonly nobiKaniMultiplier: number
  // 台本
  readonly scriptActive: boolean
  readonly scriptMatchCount: number           // マッチした本数（0, 1, 2）
  // タイミング
  readonly timingActive: boolean
  readonly timingMultiplier: number
}
```

### RelicEffectResult

レリック効果の計算結果。

```typescript
interface RelicEffectResult {
  readonly activations: RelicActivationState
  readonly chainMasterMultiplier: number
  readonly sizeBonusTotal: number
  readonly fullClearMultiplier: number         // 全消し倍率（1 or 5）
  readonly totalRelicBonus: number            // 加算ボーナス合計
  readonly singleLineMultiplier: number    // シングルライン倍率（1 or 3）
  readonly takenokoMultiplier: number      // タケノコ倍率（消去列数、発動時は1以上）
  readonly kaniMultiplier: number          // カニ倍率（消去行数、発動時は1以上）
  readonly renshaMultiplier: number        // 連射倍率（累積、初期1.0、+1ずつ増加）
  readonly nobiTakenokoMultiplier: number  // のびのびタケノコ倍率（累積、初期1.0、+0.5ずつ増加）
  readonly nobiKaniMultiplier: number      // のびのびカニ倍率（累積、初期1.0、+0.5ずつ増加）
  readonly scriptLineBonus: number         // 台本ライン数ボーナス（0, 1, or 2）
  readonly timingMultiplier: number        // タイミング倍率（1 or 3）
  readonly copyTargetRelicId: RelicId | null // コピー対象のレリックID
  readonly copyMultiplier: number          // コピーによる乗算倍率（1=無効）
  readonly copyBonus: number               // コピーによる加算ボーナス（0=無効）
  readonly copyLineBonus: number           // コピーによるライン数加算（台本コピー時、0, 1, or 2）
}
```

### ActivatedRelicInfo

発動したレリック情報（エフェクト表示用）。

```typescript
interface ActivatedRelicInfo {
  readonly relicId: RelicId
  readonly bonusValue: number | string  // "+20" or "×1.5"
}
```

## アニメーション関連

### RelicActivationAnimationState

レリック発動アニメーション状態。

```typescript
interface RelicActivationAnimationState {
  readonly isAnimating: boolean
  readonly activatedRelics: readonly ActivatedRelicInfo[]
  readonly startTime: number
  readonly duration: number
}
```

### FormulaStepType

スコアアニメーション式ステップの種類。

```typescript
type FormulaStepType =
  | 'base'        // 基本式: (ブロック数 × ライン数)
  | 'seal'        // シール効果（multi/score）
  | 'pattern'     // パターン効果（enhanced/aura/moss/combo/lucky）
  | 'relic'       // レリック効果
  | 'simplified'  // 簡潔化された式
  | 'result'      // 最終結果表示
```

### FormulaStep

スコアアニメーション式の1ステップ。

```typescript
interface FormulaStep {
  readonly type: FormulaStepType
  readonly label: string            // 効果名（例: "マルチシール", "連鎖の達人"）
  readonly formula: string          // 現時点の式文字列
  readonly relicId: RelicId | null  // レリックステップの場合のID
}
```

### ScoreAnimationState

スコアアニメーション状態。

```typescript
interface ScoreAnimationState {
  readonly isAnimating: boolean
  readonly steps: readonly FormulaStep[]
  readonly currentStepIndex: number
  readonly stepStartTime: number
  readonly stepDuration: number
  readonly isFastForward: boolean
  readonly highlightedRelicId: RelicId | null
  readonly finalScore: number
  readonly scoreGain: number
  readonly startingScore: number
  readonly isCountingUp: boolean
  readonly countStartTime: number
}
```

**プロパティ:**
- `steps`: 式の各ステップ（効果ごとに式が変化する）
- `currentStepIndex`: 現在表示中のステップ番号
- `isFastForward`: 早送りモード中かどうか
- `highlightedRelicId`: 現在ハイライト表示するレリックID
- `scoreGain`: 今回の配置で獲得したスコア
- `startingScore`: アニメーション開始前のスコア

## 関連ファイル

- `src/lib/game/Domain/Effect/PatternEffectTypes.ts` - パターン・スコア計算型
- `src/lib/game/Domain/Effect/SealEffectTypes.ts` - シール効果型
- `src/lib/game/Domain/Effect/RelicEffectTypes.ts` - レリック効果型
- `src/lib/game/Domain/Animation/AnimationState.ts` - アニメーション状態型
- `src/lib/game/Domain/Animation/ScoreAnimationState.ts` - スコアアニメーション状態型

## 更新履歴

- 2026-02-19: RelicEffectResultの各倍率プロパティにコメント追加（初期値、増分、発動条件を明記）。タイミング倍率（1 or 3）を追記
- 2026-02-19: ScoreBreakdown型に `blockPoints`/`linePoints` 追加、`fullClearBonus` → `fullClearMultiplier` に修正。RelicEffectResult型も同様に修正。RelicEffectContextに `remainingHands` 追加
- 2026-02-18: ScoreBreakdown型とRelicEffectResult型に `scriptLineBonus` と `copyLineBonus` を追加（台本レリック効果のライン数加算方式への変更に対応）
- 2026-02-17: data-structures.md から分割して新規作成

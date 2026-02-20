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
  readonly chargeBonus: number    // charge効果による追加ブロック数
}
```

**削除されたプロパティ:**
- `auraBonus`: auraパターン削除に伴い削除
- `mossBonus`: mossパターン削除に伴い削除

### SealEffectResult

シール効果計算の結果。

```typescript
interface SealEffectResult {
  readonly goldCount: number   // ゴールドシールの数（+1G/個）
  readonly multiBonus: number  // マルチシールによる追加ブロック数
}
```

**削除されたプロパティ:**
- `scoreBonus`: scoreシール削除に伴い削除
- `arrowBonus`: arrow_v/arrow_hシール削除に伴い削除

### CompletedLinesInfo

完成したラインの情報（削除済み）。

> ※arrow_v/arrow_hシール削除に伴い、CompletedLinesInfo型も削除されました。

### ComboState

コンボ状態（削除済み）。

> ※comboパターンが削除されたため、ComboState型も削除されました。

### ScoreBreakdown

スコア計算の詳細内訳。スコア計算後にReducerで使用される。

```typescript
interface ScoreBreakdown {
  // === パターン・シール効果（レリック非依存） ===
  readonly baseBlocks: number       // 基本消去ブロック数
  readonly enhancedBonus: number    // enhanced効果
  readonly multiBonus: number       // multiシール効果（追加ブロック数）
  readonly chargeBonus: number      // charge効果による追加ブロック数
  readonly totalBlocks: number      // 合計ブロック数（乗算対象）
  readonly linesCleared: number     // 消去ライン数
  readonly baseScore: number        // 基本スコア（totalBlocks × linesCleared）
  readonly luckyMultiplier: number  // lucky倍率（1 or 2）
  readonly goldCount: number        // goldシール数（スコアには影響しないがReducerで使用）

  // === レリック効果（動的マップ） ===
  readonly relicEffects: ReadonlyMap<string, number>

  /** 発動したサイズボーナスレリックID（size_bonus_1〜6のどれか） */
  readonly sizeBonusRelicId: string | null

  /** コピー対象のレリックID */
  readonly copyTargetRelicId: string | null

  /** レリック加算ボーナス合計（サイズボーナス + コピー加算） */
  readonly relicBonusTotal: number

  // === バフ効果 ===
  readonly buffEnhancementBonus: number   // 増強バフボーナス
  readonly buffGoldMineBonus: number      // 金鉱バフゴールド
  readonly buffPulsationBonus: number     // 脈動バフボーナス

  // === 最終計算値 ===
  readonly blockPoints: number  // ブロック点(A): パターン+シール+加算レリック+増強バフ
  readonly linePoints: number   // 列点(B): ライン数×lucky×乗算レリック+脈動バフ
  readonly finalScore: number   // 最終スコア = Math.floor(A × B)
}
```

**主要な変更点:**
- レリック効果は動的な `relicEffects` マップで管理（52種のレリックに対応）
- バフ効果を追加（増強、金鉱、脈動）
- 削除されたパターン/シール効果のプロパティを削除（aura, moss, combo, score, arrow）
- レリック個別プロパティ（chainMasterMultiplier等）は削除され、relicEffectsに統合

**relicEffectsマップ:**
- key: relicId（string） またはコピーレリックの場合は 'copy'
- value: 乗算レリック→倍率, 加算レリック→加算値, ライン加算→ライン数

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
  readonly remainingHands: number
  readonly patternBlockCount: number
  readonly sealBlockCount: number
  readonly deckSize: number
  readonly boardFilledCount: number
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
- `remainingHands`: 残りハンド数（タイミング・三日月・ラストスタンド等で使用）
- `patternBlockCount`: 消去セル内のパターン付きブロック数（王冠レリック用）
- `sealBlockCount`: 消去セル内のシール付きブロック数（スタンプレリック用）
- `deckSize`: デッキの全カード枚数（ミニマリストレリック用）
- `boardFilledCount`: 盤面の埋まっているセル数（過負荷レリック用、消去前）

### RelicActivationState

各レリックの発動状態（削除済み）。

> ※新しいスコア計算システムでは、個別のRelicActivationState型は使用されず、動的に処理されます。

### RelicEffectResult

レリック効果の計算結果（削除済み）。

> ※新しいスコア計算システムでは、レリック効果は `ScoreBreakdown.relicEffects` マップで動的に管理されます。個別のRelicEffectResult型は使用されません。

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
  | 'seal'        // シール効果（multi）
  | 'pattern'     // パターン効果（enhanced/lucky/charge）
  | 'buff'        // バフ効果（増強/金鉱/脈動）
  | 'relic'       // レリック効果
  | 'simplified'  // 簡潔化された式
  | 'result'      // 最終結果表示
```

**変更点:**
- `buff` タイプを追加（増強、金鉱、脈動バフ用）
- パターンの記載を更新（aura, moss, comboは削除済み）
- シールの記載を更新（scoreは削除済み）

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
- `src/lib/game/Domain/Effect/Buff.ts` - バフ定義
- `src/lib/game/Domain/Animation/AnimationState.ts` - アニメーション状態型
- `src/lib/game/Domain/Animation/ScoreAnimationState.ts` - スコアアニメーション状態型

## 更新履歴

- 2026-02-19: RelicEffectResultの各倍率プロパティにコメント追加（初期値、増分、発動条件を明記）。タイミング倍率（1 or 3）を追記
- 2026-02-19: ScoreBreakdown型に `blockPoints`/`linePoints` 追加、`fullClearBonus` → `fullClearMultiplier` に修正。RelicEffectResult型も同様に修正。RelicEffectContextに `remainingHands` 追加
- 2026-02-18: ScoreBreakdown型とRelicEffectResult型に `scriptLineBonus` と `copyLineBonus` を追加（台本レリック効果のライン数加算方式への変更に対応）
- 2026-02-17: data-structures.md から分割して新規作成
- 2026-02-20: 加護・バフシステム追加とレリック拡充を反映
  - PatternEffectResult: auraBonus, mossBonus を削除
  - SealEffectResult: scoreBonus, arrowBonus を削除
  - CompletedLinesInfo: 削除（arrowシール廃止に伴い不要）
  - ComboState: 削除（comboパターン廃止に伴い不要）
  - ScoreBreakdown: 大幅に変更
    - 削除されたパターン/シール効果のプロパティを削除
    - レリック効果を動的な `relicEffects` マップに統合（52種対応）
    - バフ効果を追加（buffEnhancementBonus, buffGoldMineBonus, buffPulsationBonus）
  - RelicEffectContext: patternBlockCount, sealBlockCount, deckSize, boardFilledCount を追加（新レリック対応）
  - RelicActivationState, RelicEffectResult: 削除（動的処理に移行）
  - FormulaStepType: buff タイプを追加

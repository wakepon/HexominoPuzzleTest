---
description: NewRelicPlanから1個のレリックを実装する。仕様確認→計画→実装→テスト→レビューの一連のワークフロー。git-worktreeでの並列実行を想定。
---

# Add Relic コマンド

Spec/NewRelicPlan.md から **1個のレリック** を実装するワークフロー。

## 使用方法

`/add-relic [レリック名]`

例: `/add-relic anchor`, `/add-relic piggybank`

## 引数

$ARGUMENTS: 実装対象のレリック名（英語、NewRelicPlan.md に記載のID）

## git-worktree 並列実行について

このスキルは worktree で並列に実行される可能性がある。
以下のファイルは **全レリックで共通に変更される** ため、マージ時にコンフリクトが発生する:

**コンフリクト頻出ファイル:**
- `Domain/Effect/Relic.ts` - RelicType union, RELIC_DEFINITIONS, RELIC_EFFECT_VALUES
- `Domain/Effect/RelicEffectTypes.ts` - RelicActivationState, RelicEffectResult
- `Domain/Effect/RelicEffectHandler.ts` - checkRelicActivations, calculateRelicEffects 等
- `Domain/Effect/PatternEffectHandler.ts` - calculateScoreBreakdown, DEFAULT_RELIC_EFFECTS
- `Domain/Effect/PatternEffectTypes.ts` - ScoreBreakdown
- `Services/LineService.ts` - calculateScoreWithEffects のゼロ値
- `Tests/ScoreWithEffects.test.ts` - テスト追加

**コンフリクト軽減策:**
- union type, オブジェクトリテラルへの追加は **末尾に追記** する
- テストは `describe('レリック名')` ブロックで囲み、ファイル末尾に追加する
- 1レリック=1コミットにまとめる

## ワークフロー

### Step 1: 仕様確認
1. `Spec/NewRelicPlan.md` から対象レリックの仕様を読む
2. 以下を特定する:
   - 効果の種類（加算/乗算/経済/デッキ/成長/条件変更/UI）
   - 発動条件
   - リセットタイミング（ラウンド/ゲーム/なし）
   - 必要な状態管理（RelicMultiplierState への追加が必要か）
   - RelicEffectContext への追加フィールドが必要か

### Step 2: 計画（planner Agent）
1. **planner** Agent を呼び出して具体的な変更箇所を特定
2. レリックの種類に応じた実装パスを選択:

#### パスA: スコア加算系（ブロック点+N）
```
Relic.ts → RelicEffectTypes.ts → RelicEffectHandler.ts
→ PatternEffectHandler.ts → PatternEffectTypes.ts → LineService.ts
```
例: size_bonus_*, featherweight, heavyweight, crown, stamp, anchor, twin

#### パスB: スコア乗算系（列点×N）
```
Relic.ts → RelicEffectTypes.ts → RelicEffectHandler.ts
→ PatternEffectHandler.ts → PatternEffectTypes.ts → LineService.ts
```
例: chain_master, meteor, symmetry, crescent, last_stand, first_strike, overload

#### パスC: 成長系（蓄積 → スコア反映）
```
Relic.ts → RelicState.ts → RelicEffectTypes.ts → RelicEffectHandler.ts
→ PatternEffectHandler.ts → GameReducer.ts
```
例: snowball, muscle, gardener, collector, wave, tetris_rule

#### パスD: 経済系（ゴールド操作、スコア計算に無関係）
```
Relic.ts → GameReducer.ts（ラウンドクリア/ショップ処理）
```
例: piggybank, investor, merchant, treasure_hunter, midas, goldfish

#### パスE: デッキ/ルール操作系
```
Relic.ts → GameReducer.ts → DeckService.ts / 各所
```
例: extra_draw, extra_hand, recycler, minimalist

### Step 3: 実装
以下の順序で変更を行う（各ファイルの変更は末尾追記を優先）:

1. **`Domain/Effect/Relic.ts`**
   - `RelicType` union に型を追加（末尾）
   - `RELIC_EFFECT_VALUES` に定数追加（末尾）
   - `RELIC_DEFINITIONS` にマスターデータ追加（末尾）

2. **`Domain/Effect/RelicEffectTypes.ts`**（スコア系のみ）
   - `RelicEffectContext` にフィールド追加（必要な場合のみ）
   - `RelicActivationState` に発動状態追加（末尾）
   - `RelicEffectResult` に結果フィールド追加（末尾）

3. **`Domain/Effect/RelicEffectHandler.ts`**（スコア系のみ）
   - `checkRelicActivations()` に判定追加
   - `calculateRelicEffects()` に効果計算追加
   - `getActivatedRelics()` に表示情報追加
   - `getActivatedRelicsFromScoreBreakdown()` に表示情報追加
   - コピーレリック関数に対応追加（乗算系: `getCopyMultiplierForTarget`, 加算系: `getCopyBonusForTarget`）

4. **`Domain/Effect/PatternEffectHandler.ts`**（スコア系のみ）
   - `DEFAULT_RELIC_EFFECTS` にデフォルト値追加
   - 乗算系: `isMultiplicativeRelicId()` に追加、`relicMultiplierMap` に追加
   - 加算系: `blockPoints` 計算に追加
   - `calculateScoreBreakdown()` の return に新フィールド追加

5. **`Domain/Effect/PatternEffectTypes.ts`**（スコア系のみ）
   - `ScoreBreakdown` に新フィールド追加（末尾）

6. **`Domain/Effect/RelicState.ts`**（成長系のみ）
   - `RelicMultiplierState` にフィールド追加
   - `INITIAL_RELIC_MULTIPLIER_STATE` にデフォルト値追加
   - 更新関数を追加
   - `resetAllMultipliers()` にリセット処理追加（ラウンドリセット系のみ）

7. **`Services/LineService.ts`**（スコア系のみ）
   - `calculateScoreWithEffects()` のゼロ値初期化に追加

8. **`Domain/Effect/index.ts`**
   - 新しいexport追加（必要な場合）

9. **`State/Reducers/GameReducer.ts`**（経済系/デッキ系/成長系のみ）
   - 該当するアクション処理に効果を追加

10. **`Domain/Animation/FormulaBuilder.ts`**（スコア系のみ、後回し可）
    - スコア式表示に対応

### Step 4: テスト追加
1. `Tests/ScoreWithEffects.test.ts` にテストを追加（スコア計算系のみ）
   - 基本的な発動ケース
   - 発動条件を満たさないケース
   - 可能であれば複合効果テスト（既存レリックとの組み合わせ）
2. テスト実行: `npx vitest run`

### Step 5: ビルド確認
```bash
npx tsc --noEmit && npx vitest run
```

### Step 6: コードレビュー
**code-reviewer** Agent でレビュー

## チェックリスト

- [ ] `RelicType` に追加
- [ ] `RELIC_DEFINITIONS` に定義追加
- [ ] `RELIC_EFFECT_VALUES` に定数追加（スコア系）
- [ ] `RelicActivationState` に発動状態追加（スコア系）
- [ ] `RelicEffectResult` に結果追加（スコア系）
- [ ] `checkRelicActivations()` に判定追加（スコア系）
- [ ] `calculateRelicEffects()` に効果計算追加（スコア系）
- [ ] `calculateScoreBreakdown()` でA×B計算に反映（スコア系）
- [ ] `ScoreBreakdown` にフィールド追加（スコア系）
- [ ] `getActivatedRelics()` に表示情報追加（スコア系）
- [ ] `getActivatedRelicsFromScoreBreakdown()` に表示情報追加（スコア系）
- [ ] コピーレリック対応（スコア系）
- [ ] `DEFAULT_RELIC_EFFECTS` にデフォルト値追加（スコア系）
- [ ] `LineService` のゼロ値初期化（スコア系）
- [ ] テスト追加（スコア計算系）
- [ ] ビルド通過
- [ ] テスト通過

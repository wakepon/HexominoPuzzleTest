# 実装計画: 未実装機能

本ドキュメントは、`UnimplementedFeatures.md` に記載された未実装機能の実装計画です。

**作成日**: 2026-02-09

---

## 概要

UI画面（ラウンド進行画面、デッキ一覧画面）を先に実装し、その後7種類のレリックをgit worktreeで並列実装する。レリック倍率状態は専用ファイルで管理し、各レリック実装を独立させる。

## フェーズ構成

| フェーズ | 内容 | 推定工数 |
|---------|------|----------|
| 0 | 共通基盤整備（レリック拡張準備） | 小 |
| 1 | UI画面実装 | 中 |
| 2 | レリック並列実装（7種類） | 大 |

---

## フェーズ 0: 共通基盤整備

### 目的
レリック並列実装に必要な共通基盤を先に整備し、ブランチ間の競合を最小化する。

### ステップ 0-1: レリック状態管理ファイルの作成

**File**: `src/lib/game/Domain/Effect/RelicState.ts` (新規)

```typescript
/**
 * レリック状態管理
 * 倍率系レリックの状態を一元管理
 */

export interface RelicMultiplierState {
  readonly nobiTakenokoMultiplier: number  // のびのびタケノコ倍率
  readonly nobiKaniMultiplier: number      // のびのびカニ倍率
  readonly renshaMultiplier: number        // 連射倍率
}

export const INITIAL_RELIC_MULTIPLIER_STATE: RelicMultiplierState = {
  nobiTakenokoMultiplier: 1.0,
  nobiKaniMultiplier: 1.0,
  renshaMultiplier: 1.0,
}

// 倍率更新関数（各レリック実装時に追加）
```

### ステップ 0-2: RelicEffectContext の拡張

**File**: `src/lib/game/Domain/Effect/RelicEffectTypes.ts`

- Action: `rowLines` と `colLines` を追加（タケノコ/カニ系に必要）
- Action: `relicMultiplierState` を追加

```typescript
export interface RelicEffectContext {
  readonly ownedRelics: readonly RelicId[]
  readonly totalLines: number
  readonly rowLines: number           // 追加: 消去した行数
  readonly colLines: number           // 追加: 消去した列数
  readonly placedBlockSize: number
  readonly isBoardEmptyAfterClear: boolean
  readonly relicMultiplierState: RelicMultiplierState  // 追加
}
```

### ステップ 0-3: RelicType の拡張

**File**: `src/lib/game/Domain/Effect/Relic.ts`

- Action: 7種類の新レリックIDを `RelicType` に追加
- Action: `RELIC_DEFINITIONS` に7種類の定義を追加
- Action: `RELIC_EFFECT_VALUES` に新しい定数を追加

### ステップ 0-4: GameState への RelicMultiplierState 統合

**File**: `src/lib/game/Domain/GameState.ts`

- Action: `relicMultiplierState: RelicMultiplierState` を追加

**File**: `src/lib/game/State/InitialState.ts`

- Action: 初期状態に `INITIAL_RELIC_MULTIPLIER_STATE` を設定

### ステップ 0-5: ストック枠の状態を DeckState に追加

**File**: `src/lib/game/Domain/Deck/DeckState.ts`

- Action: `stockSlot: Piece | null` を追加

### 成功基準（フェーズ 0）
- [ ] ビルドが成功する
- [ ] 既存のテストがパスする
- [ ] 新しい型定義がエクスポートされている

---

## フェーズ 1: UI画面実装

### 1-A: ラウンド進行画面（round-progress-screen）

#### ステップ 1-A-1: GamePhase の拡張

**File**: `src/lib/game/Domain/Round/GamePhase.ts`

- Action: `'round_progress'` を GamePhase に追加

#### ステップ 1-A-2: ラウンド進行画面レンダラー作成

**File**: `src/components/renderer/RoundProgressRenderer.ts` (新規)

- 機能:
  - セット番号の表示
  - 3つのラウンドカード（雑魚、エリート、ボス）の描画
  - 各ラウンドの状態表示（クリア済み/現在/未到達）
  - ボス条件の表示
  - 「ラウンド開始」ボタン

#### ステップ 1-A-3: GameReducer にアクション追加

**File**: `src/lib/game/State/Actions/GameActions.ts`

- Action: `ROUND/SHOW_PROGRESS` と `ROUND/START` アクションを追加

**File**: `src/lib/game/State/Reducers/GameReducer.ts`

- Action: 新アクションのハンドラーを追加

### 1-B: デッキ一覧画面（deck-view-screen）

#### ステップ 1-B-1: モーダル状態の追加

**File**: `src/lib/game/Domain/GameState.ts`

- Action: `deckViewOpen: boolean` を追加

#### ステップ 1-B-2: デッキ一覧レンダラー作成

**File**: `src/components/renderer/DeckViewRenderer.ts` (新規)

- 機能:
  - 山札のブロック一覧表示（サイズ順）
  - 使用中のブロック表示（グレーアウト）
  - 閉じるボタン

#### ステップ 1-B-3: デッキボタンの追加

**File**: `src/components/renderer/HeaderRenderer.ts` (既存または新規)

- Action: ヘッダーに「デッキ」ボタンを追加
- Action: ボタンクリック時のアクションをディスパッチ

### 成功基準（フェーズ 1）
- [ ] ラウンド進行画面が表示される
- [ ] ラウンド開始ボタンで playing フェーズに遷移する
- [ ] デッキボタンでデッキ一覧が表示される
- [ ] デッキ一覧を閉じることができる

---

## フェーズ 2: レリック並列実装

### 並列実装の設計方針

各レリックは以下のファイルのみを変更し、競合を最小化する：

| ファイル | 変更タイプ | 競合リスク |
|----------|------------|------------|
| `Relic.ts` | 定義追加 | 低（末尾追加） |
| `RelicEffectHandler.ts` | 判定ロジック追加 | 中 |
| `RelicEffectTypes.ts` | 型拡張 | 低 |
| `GameReducer.ts` | 倍率更新ロジック | 中 |

**競合回避戦略**:
- フェーズ0で共通基盤を整備済み
- 各レリックは独自の判定関数を作成
- マージ時は `RelicEffectHandler.ts` の順序に注意

---

### 2-A: single_line（シングルライン）

**ブランチ名**: `feature/relic-single-line`

**効果**: 1行または1列のみ消した時、スコアが3倍

#### 変更ファイル

1. **`Relic.ts`**: 定義追加（フェーズ0で完了済み）

2. **`RelicEffectTypes.ts`**:
   - `RelicActivationState` に `singleLineActive: boolean` 追加

3. **`RelicEffectHandler.ts`**:
   ```typescript
   // checkRelicActivations内に追加
   singleLineActive: hasRelic(ownedRelics, 'single_line') && totalLines === 1
   ```

4. **`PatternEffectHandler.ts`** (スコア計算):
   - `singleLineMultiplier` を計算に適用（×3）

#### 成功基準
- [ ] 1ライン消去時にスコアが3倍になる
- [ ] 2ライン以上消去時は効果なし

---

### 2-B: takenoko（タケノコ）

**ブランチ名**: `feature/relic-takenoko`

**効果**: 縦列のみ揃った時、スコアが揃った列数倍

#### 変更ファイル

1. **`RelicEffectTypes.ts`**:
   - `RelicActivationState` に `takenokoActive: boolean`, `takenokoCols: number` 追加

2. **`RelicEffectHandler.ts`**:
   ```typescript
   // 発動条件: rowLines === 0 && colLines >= 1
   takenokoActive: hasRelic(ownedRelics, 'takenoko') && rowLines === 0 && colLines >= 1,
   takenokoCols: colLines
   ```

3. **`PatternEffectHandler.ts`**:
   - `takenokoMultiplier` を計算に適用（×列数）

#### 成功基準
- [ ] 縦列のみ1本消去でスコア×1
- [ ] 縦列のみ2本消去でスコア×2
- [ ] 横列が含まれると効果なし

---

### 2-C: kani（カニ）

**ブランチ名**: `feature/relic-kani`

**効果**: 横列のみ揃った時、スコアが揃った行数倍

#### 変更ファイル

1. **`RelicEffectTypes.ts`**:
   - `RelicActivationState` に `kaniActive: boolean`, `kaniRows: number` 追加

2. **`RelicEffectHandler.ts`**:
   ```typescript
   // 発動条件: colLines === 0 && rowLines >= 1
   kaniActive: hasRelic(ownedRelics, 'kani') && colLines === 0 && rowLines >= 1,
   kaniRows: rowLines
   ```

3. **`PatternEffectHandler.ts`**:
   - `kaniMultiplier` を計算に適用（×行数）

#### 成功基準
- [ ] 横列のみ1本消去でスコア×1
- [ ] 横列のみ2本消去でスコア×2
- [ ] 縦列が含まれると効果なし

---

### 2-D: rensha（連射）

**ブランチ名**: `feature/relic-rensha`

**効果**: ライン揃うたびにスコア倍率+0.5（揃わないとリセット）

#### 変更ファイル

1. **`RelicState.ts`**:
   - `updateRenshaMultiplier(state, linesCleared)` 関数追加

2. **`RelicEffectTypes.ts`**:
   - `RelicActivationState` に `renshaActive: boolean` 追加

3. **`RelicEffectHandler.ts`**:
   ```typescript
   renshaActive: hasRelic(ownedRelics, 'rensha') && totalLines > 0,
   renshaMultiplier: relicMultiplierState.renshaMultiplier
   ```

4. **`GameReducer.ts`**:
   - ピース配置後に倍率を更新
   - ライン消去なしでリセット
   - ラウンド開始時にリセット

#### 成功基準
- [ ] 初回ライン消去で×1.0、2回目で×1.5、3回目で×2.0
- [ ] ライン消去なしで倍率リセット
- [ ] ラウンド開始時に倍率リセット

---

### 2-E: nobi_takenoko（のびのびタケノコ）

**ブランチ名**: `feature/relic-nobi-takenoko`

**効果**: 縦列のみ揃えるたびに倍率+0.5（横列消しでリセット）

#### 変更ファイル

1. **`RelicState.ts`**:
   - `updateNobiTakenokoMultiplier(state, rowLines, colLines)` 関数追加

2. **`RelicEffectTypes.ts`**:
   - `RelicActivationState` に `nobiTakenokoActive: boolean` 追加

3. **`RelicEffectHandler.ts`**:
   ```typescript
   nobiTakenokoActive: hasRelic(ownedRelics, 'nobi_takenoko') && rowLines === 0 && colLines >= 1,
   nobiTakenokoMultiplier: relicMultiplierState.nobiTakenokoMultiplier
   ```

4. **`GameReducer.ts`**:
   - 縦列のみ消去時に +0.5
   - 横列消去時にリセット
   - ラウンド開始時にリセット

#### 成功基準
- [ ] 縦列のみ消去で倍率が累積
- [ ] 横列消去で倍率リセット
- [ ] ツールチップで現在倍率を確認可能

---

### 2-F: nobi_kani（のびのびカニ）

**ブランチ名**: `feature/relic-nobi-kani`

**効果**: 横列のみ揃えるたびに倍率+0.5（縦列消しでリセット）

#### 変更ファイル

1. **`RelicState.ts`**:
   - `updateNobiKaniMultiplier(state, rowLines, colLines)` 関数追加

2. **`RelicEffectTypes.ts`**:
   - `RelicActivationState` に `nobiKaniActive: boolean` 追加

3. **`RelicEffectHandler.ts`**:
   ```typescript
   nobiKaniActive: hasRelic(ownedRelics, 'nobi_kani') && colLines === 0 && rowLines >= 1,
   nobiKaniMultiplier: relicMultiplierState.nobiKaniMultiplier
   ```

4. **`GameReducer.ts`**:
   - 横列のみ消去時に +0.5
   - 縦列消去時にリセット
   - ラウンド開始時にリセット

#### 成功基準
- [ ] 横列のみ消去で倍率が累積
- [ ] 縦列消去で倍率リセット
- [ ] ツールチップで現在倍率を確認可能

---

### 2-G: hand_stock（手札ストック）

**ブランチ名**: `feature/relic-hand-stock`

**効果**: ストック枠が出現し、ブロックを1つ保管可能

#### 変更ファイル

1. **`DeckState.ts`**（フェーズ0で完了済み）

2. **`GameActions.ts`**:
   ```typescript
   | { type: 'STOCK/MOVE_TO_STOCK'; slotIndex: number }
   | { type: 'STOCK/MOVE_FROM_STOCK'; targetSlotIndex: number }
   | { type: 'STOCK/SWAP'; slotIndex: number }
   ```

3. **`GameReducer.ts`**:
   - `STOCK/MOVE_TO_STOCK`: 手札→ストック
   - `STOCK/MOVE_FROM_STOCK`: ストック→手札
   - `STOCK/SWAP`: 手札とストック交換
   - ラウンド開始時にストッククリア

4. **`StockSlotRenderer.ts`** (新規):
   - ストック枠の描画（手札スロットの左に配置）
   - ドラッグ&ドロップ対応
   - hand_stockレリック所持時のみ表示

5. **`InputHandler.ts`**:
   - ストック枠へのドラッグ判定追加
   - ストック枠からのドラッグ開始対応

6. **レイアウト定数**:
   - ストック枠の位置計算追加

#### 成功基準
- [ ] hand_stockレリック所持時のみストック枠が表示される
- [ ] 手札からストックへドラッグ&ドロップできる
- [ ] ストックから手札へドラッグ&ドロップできる
- [ ] 既にストックにある状態で新しいピースを入れるとスワップ
- [ ] ラウンド開始時にストックがクリアされる

---

## リスクと軽減策

### Risk 1: GameReducer.ts の競合
- **説明**: 複数のレリックが同時にGameReducerを変更
- **Mitigation**:
  - フェーズ0で倍率更新の共通関数を作成
  - 各レリックは独自関数を呼び出すだけにする
  - マージ順序を決めておく（rensha → nobi_takenoko → nobi_kani）

### Risk 2: スコア計算順序の複雑化
- **説明**: 仕様の効果適用順序（1〜11）を正確に実装する必要がある
- **Mitigation**:
  - `PatternEffectHandler.ts` に明確なコメントで順序を記載
  - 各倍率を順番に適用する関数を作成

### Risk 3: ストック機能の入力処理
- **説明**: ドラッグ&ドロップの判定ロジックが複雑化
- **Mitigation**:
  - ストック専用のドラッグ状態を追加
  - 既存のドラッグ処理を拡張する形で実装

### Risk 4: StorageService の互換性
- **説明**: GameStateに新フィールド追加でセーブデータが壊れる
- **Mitigation**:
  - マイグレーション処理を追加
  - 新フィールドにはデフォルト値を設定

---

## 実装順序のサマリ

```
main
├── フェーズ 0: 共通基盤整備 ─────────────────────────────────┐
│                                                           │
├── フェーズ 1: UI画面実装 ──────────────────────────────────┤
│   ├── 1-A: ラウンド進行画面                                 │
│   └── 1-B: デッキ一覧画面                                   │
│                                                           │
└── フェーズ 2: レリック並列実装（git worktree）               │
    ├── feature/relic-single-line ─────┐                    │
    ├── feature/relic-takenoko ────────┤                    │
    ├── feature/relic-kani ────────────┤ 並列               │
    ├── feature/relic-rensha ──────────┤                    │
    ├── feature/relic-nobi-takenoko ───┤                    │
    ├── feature/relic-nobi-kani ───────┤                    │
    └── feature/relic-hand-stock ──────┘                    │
                                       │                    │
                                       └── main にマージ ◄──┘
```

---

## 効果適用順序（仕様）

1. 基本スコア計算 `(baseBlocks + auraBonus + mossBonus) × totalLines`
2. 連鎖の達人（×1.5、切り捨て）
3. シングルライン（×3）
4. タケノコ（×縦列数）
5. カニ（×横列数）
6. のびのびタケノコ（×倍率、切り捨て）
7. のびのびカニ（×倍率、切り捨て）
8. 連射（×倍率、切り捨て）
9. スコアアニメーション
10. 小さな幸運（+20）
11. 全消しボーナス（+20）

---

## 成功基準（全体）

- [ ] 7種類のレリックが正しく動作する
- [ ] 効果適用順序が仕様通り
- [ ] ラウンド進行画面が表示される
- [ ] デッキ一覧画面が表示される
- [ ] ストック機能が正しく動作する
- [ ] 既存のテストがパスする
- [ ] セーブ/ロードが正しく動作する

---

## 更新履歴

- 2026-02-09: 初版作成

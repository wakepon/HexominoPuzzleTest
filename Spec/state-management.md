# 状態管理

## 概要

React Hooksベースのゲーム状態管理システムについて説明する。Reducerパターンを採用し、Immutableな状態更新を実現している。

## アーキテクチャ

### 状態管理の構成

```
useGame Hook
  └─ useReducer
      ├─ gameReducer (状態遷移ロジック)
      └─ GameState (現在の状態)
```

## GameState フィールド一覧

`src/lib/game/Domain/GameState.ts` で定義されている全フィールド。

### ボード関連

| フィールド | 型 | 説明 |
|---|---|---|
| `board` | `Board` | 現在のボード状態 |
| `pieceSlots` | `readonly PieceSlot[]` | 手札スロット（ピース一覧） |
| `deck` | `DeckState` | デッキ状態（残りハンド数、ストック含む） |

### UI関連

| フィールド | 型 | 説明 |
|---|---|---|
| `dragState` | `DragState` | ドラッグ操作の状態 |
| `clearingAnimation` | `ClearingAnimationState \| null` | ライン消去アニメーション状態 |
| `relicActivationAnimation` | `RelicActivationAnimationState \| null` | レリック発動アニメーション状態 |
| `scoreAnimation` | `ScoreAnimationState \| null` | スコア計算アニメーション状態 |
| `deckViewOpen` | `boolean` | デッキ一覧オーバーレイの開閉状態 |
| `amuletModal` | `AmuletModalState \| null` | 護符使用モーダルの状態 |

### ラウンド関連

| フィールド | 型 | 説明 |
|---|---|---|
| `phase` | `GamePhase` | 現在のゲームフェーズ |
| `pendingPhase` | `GamePhase \| null` | スコアアニメーション完了後に適用する保留フェーズ |
| `round` | `number` | 現在のラウンド番号 |
| `roundInfo` | `RoundInfo` | ラウンド情報（セット番号、ラウンドタイプ、ボス条件） |
| `score` | `number` | 現在のスコア |
| `targetScore` | `number` | 目標スコア |

### プレイヤー関連

| フィールド | 型 | 説明 |
|---|---|---|
| `player` | `PlayerState` | プレイヤー状態（ゴールド、所持レリック、護符ストック等） |

### ショップ関連

| フィールド | 型 | 説明 |
|---|---|---|
| `shopState` | `ShopState \| null` | ショップ状態（ショップ画面のみ有効） |

### エフェクト関連

| フィールド | 型 | 説明 |
|---|---|---|
| `relicMultiplierState` | `RelicMultiplierState` | 倍率系レリックの状態（連射、のびのびタケノコ/カニ、絆創膏、タイミング、コピー、リサイクラー） |
| `scriptRelicLines` | `ScriptRelicLines \| null` | 台本レリックが指定する2本のライン |
| `volcanoEligible` | `boolean` | 火山レリックの発動可否フラグ（ラウンド中にライン消去がなければ `true`） |

### PlayerState の内部フィールド

| フィールド | 型 | 説明 |
|---|---|---|
| `gold` | `number` | 現在の所持ゴールド |
| `earnedGold` | `number` | 累計獲得ゴールド |
| `ownedRelics` | `readonly RelicId[]` | 所持レリックのID一覧 |
| `relicDisplayOrder` | `readonly RelicId[]` | レリックの表示順序 |
| `amuletStock` | `readonly Amulet[]` | 護符ストック（最大所持数あり） |

### DragState の内部フィールド

| フィールド | 型 | 説明 |
|---|---|---|
| `isDragging` | `boolean` | ドラッグ中かどうか |
| `pieceId` | `PieceId \| null` | ドラッグ中のピースID |
| `slotIndex` | `number \| null` | ドラッグ元のスロットインデックス（手札の場合） |
| `dragSource` | `'hand' \| 'stock' \| 'stock2' \| null` | ドラッグ元の種別 |
| `currentPos` | `Position \| null` | 現在のドラッグ位置（スクリーン座標） |
| `startPos` | `Position \| null` | ドラッグ開始位置 |
| `boardPos` | `Position \| null` | ボード上の位置（グリッド座標） |

### RelicMultiplierState の内部フィールド

| フィールド | 型 | 説明 |
|---|---|---|
| `nobiTakenokoMultiplier` | `number` | のびのびタケノコの現在倍率 |
| `nobiKaniMultiplier` | `number` | のびのびカニの現在倍率 |
| `renshaMultiplier` | `number` | 連射の現在倍率 |
| `bandaidCounter` | `number` | 絆創膏カウンター（一定カウントで発動） |
| `timingCounter` | `number` | タイミングカウンター |
| `timingBonusActive` | `boolean` | タイミングボーナス待機状態かどうか |
| `copyRelicState` | `CopyRelicState \| null` | コピーレリック用の独立カウンター（未所持時は `null`） |
| `recyclerUsesRemaining` | `number` | リサイクラーレリックの残り使用回数 |

### AmuletModalState の内部フィールド

| フィールド | 型 | 説明 |
|---|---|---|
| `amuletType` | `AmuletType` | 使用中の護符の種類（sculpt, pattern_add, seal_add, vanish） |
| `amuletIndex` | `number` | 使用中の護符のストック内インデックス |
| `step` | `AmuletModalStep` | 現在のステップ（select_piece, sculpt_edit） |
| `selectedMinoId` | `MinoId \| null` | 選択されたミノID（sculpt_edit時） |
| `editingShape` | `PieceShape \| null` | 編集中の形状（sculpt_edit時） |

## 初期状態

### 初期ドラッグ状態

```typescript
{
  isDragging: false,
  pieceId: null,
  slotIndex: null,
  dragSource: null,
  currentPos: null,
  startPos: null,
  boardPos: null,
}
```

### 初期ゲーム状態の生成手順

1. 空のボードを生成
2. 初期デッキを作成・シャッフル
3. ボス条件に基づいた配置回数とドロー枚数を取得
4. デッキから指定枚数のピースを引いてスロットに配置
5. ボス条件「おじゃまブロック」の場合、ランダムな位置にブロックを配置
6. スコアを0、コンボカウントを0に設定
7. すべてのアニメーション状態を `null` に設定
8. ラウンドを1に設定
9. ゴールドを初期値に設定
10. 目標スコアを計算
11. フェーズを `round_progress` に設定
12. ショップ状態を `null` に設定
13. レリック倍率状態を初期値に設定（倍率1.0、カウンター0）
14. `scriptRelicLines` を `null` に設定
15. `volcanoEligible` を `true` に設定
16. `deckViewOpen` を `false` に設定
17. `amuletModal` を `null` に設定

### 状態復元

起動時にローカルストレージへの保存データを読み込み、存在すれば状態を復元する。復元に失敗した場合は保存データを削除して新規ゲームを開始する。

## アクション一覧

### UIアクション

#### UI/START_DRAG

手札スロットからのドラッグ開始。

- **入力**: `slotIndex`（スロットインデックス）、`startPos`（開始位置）
- **処理**: 指定スロットにピースがある場合、`dragSource: 'hand'` でドラッグ状態を設定

#### UI/START_DRAG_FROM_STOCK

ストック（第1枠）からのドラッグ開始。

- **入力**: `startPos`（開始位置）
- **処理**: ストックにピースがある場合、`dragSource: 'stock'` でドラッグ状態を設定

#### UI/START_DRAG_FROM_STOCK2

ストック2（第2枠）からのドラッグ開始。

- **入力**: `startPos`（開始位置）
- **処理**: ストック2にピースがある場合、`dragSource: 'stock2'` でドラッグ状態を設定

#### UI/UPDATE_DRAG

ドラッグ中の位置更新。

- **入力**: `currentPos`（現在位置）、`boardPos`（ボード座標。範囲外の場合は `null`）
- **処理**: ドラッグ中でない場合は変更なし

#### UI/END_DRAG

ドラッグ終了。ドラッグ元（手札/ストック/ストック2）に応じた配置処理を行う。

- **処理**:
  - `playing` フェーズかつ有効なボード座標に配置可能な場合: ピースをボードに配置し、`processPiecePlacement` を実行
  - 配置不可の場合: ドラッグ状態のみクリア

#### UI/OPEN_DECK_VIEW

デッキ一覧オーバーレイを開く。

- **制約**: `round_clear`、`game_over`、`game_clear`、`shopping` フェーズでは開けない

#### UI/CLOSE_DECK_VIEW

デッキ一覧オーバーレイを閉じる。

### ボードアクション

#### BOARD/PLACE_PIECE

プログラマティックなピース配置（現在の実装では直接使用されていない）。

- **入力**: `slotIndex`（スロットインデックス）、`position`（配置位置）
- **制約**: `playing` フェーズでのみ有効

### アニメーションアクション

#### ANIMATION/END_CLEAR

ライン消去アニメーション完了。

- **処理**:
  1. 消去対象セルに加護スタンプを実行（確率で加護を付与）
  2. 加護を維持しつつ消去アニメーション対象のセルをボードから実際に消去
  3. `clearingAnimation` を `null` に設定
  4. 配置不可チェックを行い、必要に応じてリドロー
  5. スコアアニメーションがまだ再生中かつフェーズ遷移が必要な場合は `pendingPhase` に保留

#### ANIMATION/END_RELIC_ACTIVATION

レリック発動アニメーション完了。

- **処理**: `relicActivationAnimation` を `null` に設定

#### ANIMATION/ADVANCE_SCORE_STEP

スコアアニメーションのステップを1つ進める。

- **処理**:
  - 次ステップが存在する場合: `currentStepIndex` を+1し、`highlightedRelicId` を更新
  - 全ステップ完了の場合: カウントアップモード（`isCountingUp: true`）に移行

#### ANIMATION/END_SCORE

スコアアニメーション完了。

- **処理**: `scoreAnimation` を `null` に設定

#### ANIMATION/SET_FAST_FORWARD

スコアアニメーションの早送りモード切替。

- **入力**: `isFastForward`（早送りかどうか）
- **処理**: `isFastForward` フラグとステップ表示時間を更新

### フェーズアクション

#### PHASE/APPLY_PENDING

保留フェーズを現在のフェーズに適用する。

- **処理**: `pendingPhase` が存在する場合、`phase` を `pendingPhase` で上書きし、`pendingPhase` を `null` に設定
- **用途**: スコアアニメーション完了後に `round_clear` や `game_over` への遷移を反映する

### ラウンドアクション

#### ROUND/ADVANCE

ラウンドクリア後の次フェーズへの遷移。

- **制約**: `round_clear` フェーズでのみ有効
- **処理**:
  - ゴールド報酬を加算（残りハンド数に応じた基本報酬、利息、goldfishレリックボーナス）
  - 最終ラウンドの場合: `game_clear` に遷移（保存データを削除）
  - それ以外: ショップ状態を生成して `shopping` に遷移（保存データを更新）
- **オプション入力**: `probabilityOverride`（デバッグ用の確率オーバーライド）

#### ROUND/SHOW_PROGRESS

ショップからラウンド進行画面への遷移。

- **制約**: `shopping` フェーズでのみ有効
- **処理**: `phase` を `round_progress` に設定し、`shopState` を `null` に設定

#### ROUND/START

ラウンド進行画面からゲームプレイ開始。

- **制約**: `round_progress` フェーズでのみ有効
- **処理**: `phase` を `playing` に設定（保存データを更新）

### ショップアクション

#### SHOP/BUY_ITEM

ショップアイテムの購入。

- **制約**: `shopping` フェーズでのみ有効
- **入力**: `itemIndex`（購入するアイテムのインデックス）
- **処理**:
  1. 既に購入済みまたはゴールド不足の場合は何もしない
  2. アイテムを購入済みにマーク、ゴールドを減額
  3. ブロックアイテムの場合: ピースをデッキに追加
  4. 護符アイテムの場合: 護符をストックに追加（ストック満杯時は購入不可）
  5. レリックアイテムの場合:
     - 所持上限に達している場合は売却モード（`sellMode: true`）に移行し、`pendingPurchaseIndex` に保留
     - 上限未達の場合は即座にレリックを追加
  6. コピーレリック購入時は `copyRelicState` を初期化
  7. 購入後に保存データを更新

#### SHOP/LEAVE

ショップを退出して次ラウンドへ進む。

- **制約**: `shopping` フェーズでのみ有効
- **処理**: `createNextRoundState` で次ラウンドの状態を生成し、`round_progress` フェーズに遷移（保存データを更新）

#### SHOP/REROLL

ショップの商品を入れ替える（リロール）。

- **制約**: `shopping` フェーズでのみ有効、かつ十分なゴールドが必要
- **処理**: リロールコストを消費し、新しい商品を生成。`rerollCount` を+1

#### SHOP/START_SELL_MODE

レリック売却モードを開始する。

- **制約**: `shopping` フェーズでのみ有効
- **処理**: `sellMode` を `true` に設定

#### SHOP/CANCEL_SELL_MODE

レリック売却モードをキャンセルする。

- **制約**: `shopping` フェーズでのみ有効
- **処理**: `sellMode` を `false` に設定し、`pendingPurchaseIndex` をクリア

#### SHOP/SELL_RELIC

レリックを売却する。

- **制約**: `shopping` フェーズでのみ有効
- **入力**: `relicIndex`（売却するレリックのインデックス）
- **処理**:
  1. レリック定義から価格を取得し、売却額を計算
  2. プレイヤーからレリック削除し、ゴールド加算
  3. hand_stockを売却した場合、ストック枠もクリア
  4. コピーレリック関連の状態更新
  5. `pendingPurchaseIndex` がある場合: 保留していた商品の購入処理を実行
  6. 売却完了後に `sellMode` を `false` に設定

### ストックアクション

すべてのストックアクションは `playing` フェーズでのみ有効。ストック操作はハンド消費（残り配置回数の減少）を行わない。

#### STOCK/MOVE_TO_STOCK

手札のピースをストック（第1枠）に移動。既存のストックがある場合はスワップ。

- **入力**: `slotIndex`（移動元の手札スロット）
- **処理**: 手札が全て空になった場合は自動的にドロー

#### STOCK/MOVE_FROM_STOCK

ストック（第1枠）のピースを空き手札スロットに移動。

- **入力**: `targetSlotIndex`（移動先の手札スロット）
- **処理**: 対象スロットが空でない場合は失敗

#### STOCK/SWAP

手札のピースとストック（第1枠）のピースを交換。

- **入力**: `slotIndex`（手札スロット）
- **処理**: 両方にピースがある場合のみ交換

#### STOCK/MOVE_TO_STOCK2

手札のピースをストック2（第2枠）に移動。既存のストック2がある場合はスワップ。

- **入力**: `slotIndex`（移動元の手札スロット）
- **処理**: 手札が全て空になった場合は自動的にドロー

#### STOCK/MOVE_FROM_STOCK2

ストック2（第2枠）のピースを空き手札スロットに移動。

- **入力**: `targetSlotIndex`（移動先の手札スロット）

#### STOCK/SWAP2

手札のピースとストック2（第2枠）のピースを交換。

- **入力**: `slotIndex`（手札スロット）

### レリックアクション

#### RELIC/REORDER

レリックの表示順序を変更する。

- **入力**: `fromIndex`（移動元インデックス）、`toIndex`（移動先インデックス）
- **処理**: `relicDisplayOrder` を更新。コピーレリック所持時は対象レリックを再解決し、必要に応じて `copyRelicState` をリセット

#### RELIC/RECYCLE_PIECE

リサイクラーレリック効果を発動する。

- **制約**: `playing` フェーズでのみ有効、リサイクラー所持、残り使用回数が1以上
- **入力**: `slotIndex`（対象の手札スロット）
- **処理**:
  1. 対象スロットのピースを捨てる
  2. デッキから新しいピースを1枚ドロー
  3. `recyclerUsesRemaining` を-1

### 護符アクション

#### AMULET/USE

護符を使用してモーダルを開く。

- **制約**: `playing` または `shopping` フェーズでのみ有効
- **入力**: `amuletIndex`（使用する護符のストック内インデックス）
- **処理**: 護符モーダル状態を `select_piece` ステップで初期化

#### AMULET/SELECT_PIECE

ピースを選択して護符効果を適用する。

- **制約**: モーダルが開いており、`select_piece` ステップの場合
- **入力**: `minoId`（対象のミノID）
- **処理**:
  - **sculpt**: `sculpt_edit` ステップに移行し、現在の形状を `editingShape` に設定
  - **vanish**: 即座にデッキから対象ミノを削除し、護符を消費してモーダルを閉じる
  - **pattern_add**: ランダムなパターンを付与し、`purchasedPieces` に記録して護符を消費
  - **seal_add**: ランダムなシールを付与し、`purchasedPieces` に記録して護符を消費

#### AMULET/CONFIRM

sculpt護符の形状編集を確定する。

- **制約**: モーダルが開いており、`sculpt_edit` ステップの場合
- **処理**:
  1. 編集中の形状が連結しているかチェック
  2. ブロックが1つ以上あるかチェック
  3. 形状をピースに適用し、`purchasedPieces` に記録
  4. 護符を消費してモーダルを閉じる

#### AMULET/CANCEL

護符使用モーダルをキャンセルする。

- **処理**: `amuletModal` を `null` に設定

#### AMULET/SELL

護符を売却する。

- **制約**: `shopping` フェーズでのみ有効
- **入力**: `amuletIndex`（売却する護符のインデックス）
- **処理**: 護符をストックから削除し、価格の半額をゴールド加算

#### AMULET/SCULPT_TOGGLE_BLOCK

sculpt護符の形状編集でブロックの有無を切り替える。

- **制約**: モーダルが開いており、`sculpt_edit` ステップの場合
- **入力**: `row`、`col`（対象のグリッド座標）
- **処理**: 指定位置のブロックをトグル（true ↔ false）

### ゲームアクション

#### GAME/RESET

ゲームを完全にリセットする。

- **処理**: 保存データを削除し、新規ゲーム状態を生成

### デバッグアクション

| アクション | 説明 |
|---|---|
| `DEBUG/ADD_RELIC` | レリックを追加（コピーレリックの場合は `copyRelicState` を初期化） |
| `DEBUG/REMOVE_RELIC` | レリックを削除（hand_stockの場合はストックもクリア） |
| `DEBUG/ADD_GOLD` | ゴールドを増減 |
| `DEBUG/ADD_SCORE` | スコアを増減 |
| `DEBUG/ADD_AMULET` | 護符を追加（ストック満杯時は追加不可） |
| `DEBUG/REMOVE_AMULET` | 護符を削除 |
| `DEBUG/ADD_RANDOM_EFFECTS` | 先頭のピースにランダムなパターン・シール・加護を付与 |

## アニメーション状態管理

### ライン消去アニメーション（ClearingAnimationState）

| フィールド | 説明 |
|---|---|
| `isAnimating` | アニメーション中かどうか |
| `cells` | 消去対象セルの一覧（row/col、ディレイ情報を含む） |
| `startTime` | アニメーション開始時刻 |
| `duration` | アニメーション時間 |
| `perCellDuration` | 1セルあたりの消去時間 |

ピース配置時にラインが完成した場合に設定される。`ANIMATION/END_CLEAR` アクションで加護スタンプ→実際のセル消去が行われる。

### レリック発動アニメーション（RelicActivationAnimationState）

| フィールド | 説明 |
|---|---|
| `isAnimating` | アニメーション中かどうか |
| `activatedRelics` | 発動したレリックの情報一覧（ID、ボーナス表示値） |
| `startTime` | アニメーション開始時刻 |
| `duration` | アニメーション時間 |

ライン消去時にレリック効果が発動した場合に設定される。`ANIMATION/END_RELIC_ACTIVATION` アクションでクリアされる。

### スコアアニメーション（ScoreAnimationState）

スコア計算の過程をステップ形式で表示するアニメーション。

| フィールド | 説明 |
|---|---|
| `isAnimating` | アニメーション中かどうか |
| `steps` | 式ステップの一覧（基本式→シール→パターン→レリック→結果の順） |
| `currentStepIndex` | 現在表示中のステップインデックス |
| `stepStartTime` | 現在ステップの開始時刻 |
| `stepDuration` | 1ステップの表示時間 |
| `isFastForward` | 早送りモードかどうか |
| `highlightedRelicId` | 現在ハイライト中のレリックID |
| `finalScore` | 最終スコア |
| `scoreGain` | 今回の獲得スコア |
| `startingScore` | アニメーション開始前のスコア |
| `isCountingUp` | スコアカウントアップ中かどうか |
| `countStartTime` | カウントアップ開始時刻 |

`ANIMATION/ADVANCE_SCORE_STEP` でステップを進め、全ステップ完了後にカウントアップモードに入り、`ANIMATION/END_SCORE` で終了する。

### pendingPhase によるフェーズ遷移の保留

スコアアニメーション中にフェーズ遷移が必要になった場合（`round_clear` や `game_over`）、即時遷移せずに `pendingPhase` に格納して保留する。スコアアニメーションが完了した後に `PHASE/APPLY_PENDING` アクションで実際のフェーズ遷移を行う。

## ピース配置の共通処理（processPiecePlacement）

手札・ストック・ストック2 のいずれかからの配置で共通して実行される処理の概要:

1. ボードにピースを配置
2. nohandパターンの場合はハンド消費をスキップ
3. ハンド消費イベントをディスパッチ（絆創膏カウンター等が更新される）
4. onPiecePlacedフックを実行（絆創膏注入判定等）
5. ハンド消費後のスロット・デッキ状態を計算
6. 完成ラインを検出
7. **ラインあり**:
   - 消去対象セルを取得し、順次消去用にソート＋ディレイ割り当て
   - レリック効果コンテキストを構築してスコアを計算
   - スコアアニメーション、消去アニメーション、レリック発動アニメーションを設定
   - フェーズ遷移が必要かつスコアアニメーションがある場合は `pendingPhase` に保留
   - チャージ値をインクリメント（magnetレリック所持時は+2）
   - `volcanoEligible` を `false` に設定
8. **ラインなし**:
   - レリック状態を更新（rensha リセット等）
   - 配置不可チェックを行い、全ピースが配置不可なら残りハンドを消費してリドロー
   - チャージ値をインクリメント
   - 火山レリック発動条件を確認（`game_over` かつ `volcanoEligible: true` の場合）

## 火山レリック発動処理（tryVolcanoActivation）

ゲームオーバー時に火山レリック所持かつ未発動なら、盤面の全ブロックを消去してスコア加算を行う。

- **条件**: `game_over` フェーズ、火山レリック所持、`volcanoEligible: true`
- **処理**:
  1. 盤面の全filledセルを取得
  2. 全消去として扱い、スコア計算（全行+全列=12ライン扱い）
  3. クリアリングアニメーション、レリック発動アニメーション、スコアアニメーションを設定
  4. ゴールド加算（treasure_hunter, midasの効果も適用）
  5. `volcanoEligible` を `false` に設定

## フェニックスレリック（tryPhoenixRestart）

game_over状態でphoenixレリック所持時、現在のラウンドを最初からやり直す。

- **条件**: `game_over` フェーズ、フェニックスレリック所持
- **処理**:
  1. phoenixレリックを削除
  2. デッキを再シャッフル
  3. ボスレイアウトを再生成
  4. バフをラウンド間で保持
  5. 台本レリック所持時は指定ラインを再抽選
  6. `round_progress` フェーズに遷移

## 状態遷移図

```
[初回起動 / GAME/RESET]
  ↓
[round_progress]
  │ ROUND/START
  ↓
[playing]
  │
  │ ミノ配置（UI/END_DRAG または BOARD/PLACE_PIECE）
  ↓
[配置判定]
  ├─ 配置可能 → ライン判定
  │              ├─ ラインあり → clearingAnimation設定 → [playing または pendingPhase保留]
  │              │                  │ ANIMATION/END_CLEAR
  │              │                  ↓
  │              │              [スコア判定]
  │              │                  ├─ 目標達成 → [round_clear]
  │              │                  │                │ ROUND/ADVANCE
  │              │                  │                ↓
  │              │                  │            ├─ 最終ラウンド → [game_clear]
  │              │                  │            └─ 通常 → [shopping]
  │              │                  │                         │ SHOP/BUY_ITEM (0回以上)
  │              │                  │                         │ SHOP/REROLL (0回以上)
  │              │                  │                         │ SHOP/SELL_RELIC (0回以上)
  │              │                  │                         │ ROUND/SHOW_PROGRESS または SHOP/LEAVE
  │              │                  │                         ↓
  │              │                  │                     [round_progress]
  │              │                  │                         │ ROUND/START
  │              │                  │                         ↓
  │              │                  │                     [playing]
  │              │                  │
  │              │                  └─ 残りハンド0 → [game_over]
  │              │                                       ├─ phoenixあり → tryPhoenixRestart → [round_progress]
  │              │                                       └─ 火山発動 → tryVolcanoActivation → スコア判定
  │              │
  │              └─ ラインなし → [スコア判定（残りハンドのみ確認）]
  │                               ├─ 残りハンド0 → [game_over]
  │                               │                  ├─ phoenixあり → [round_progress]
  │                               │                  └─ 火山発動 → スコア判定
  │                               └─ 継続 → [playing]
  │
  └─ 配置不可 → ドラッグ状態クリア → [playing]

[game_over / game_clear]
  │ GAME/RESET
  ↓
[round_progress]
```

### pendingPhase を含む遷移

```
[playing]（スコアアニメーション再生中）
  │ ANIMATION/END_CLEAR
  ↓ pendingPhase = 'round_clear' (または 'game_over')
[playing]（scoreAnimationが終了するまで保留）
  │ ANIMATION/END_SCORE → PHASE/APPLY_PENDING
  ↓
[round_clear または game_over]
```

## フェーズ別の状態制約

### round_progress

- ラウンド進行画面を表示
- 次のラウンド情報（セット番号、ラウンドタイプ、ボス条件）を表示
- 「ラウンド開始」ボタンで `playing` フェーズへ（`ROUND/START`）
- デッキ一覧オーバーレイは開ける

### playing

- ミノの配置が可能
- ドラッグ操作が可能
- ストック操作が可能
- ライン消去とスコア加算が行われる
- 全ピース配置不可時に自動リドロー
- デッキ一覧オーバーレイは開ける
- 護符使用モーダルは開ける

### round_clear

- ユーザー操作は不可
- 一定時間後に自動的に次フェーズへ遷移（`ROUND/ADVANCE`）
- ゴールド報酬が表示される
- デッキ一覧オーバーレイは開けない

### shopping

- ミノの配置は不可
- ショップアイテムのクリックで購入（`SHOP/BUY_ITEM`）
- リロールが可能（`SHOP/REROLL`）
- レリック売却が可能（`SHOP/SELL_RELIC`）
- 護符売却が可能（`AMULET/SELL`）
- `ROUND/SHOW_PROGRESS`（次ラウンド準備画面に遷移）または `SHOP/LEAVE`（ショップ退出）で次フェーズへ
- デッキ一覧オーバーレイは開けない
- 護符使用モーダルは開ける

### game_over

- ミノの配置は不可
- 「リセット」ボタンでゲーム再開のみ可能（`GAME/RESET`）
- フェニックスレリック所持時は自動的にラウンドリスタート
- デッキ一覧オーバーレイは開けない

### game_clear

- ミノの配置は不可
- 「リセット」ボタンでゲーム再開のみ可能（`GAME/RESET`）
- デッキ一覧オーバーレイは開けない

## 永続化（LocalStorage）

以下のタイミングでゲーム状態がローカルストレージに保存される:

- ショップへの遷移時（`ROUND/ADVANCE`）
- ショップでのアイテム購入後（`SHOP/BUY_ITEM`）
- ショップでのリロール後（`SHOP/REROLL`）
- ショップでの売却モード開始/終了（`SHOP/START_SELL_MODE`, `SHOP/CANCEL_SELL_MODE`, `SHOP/SELL_RELIC`）
- ショップ退出・次ラウンド開始時（`SHOP/LEAVE`）
- ラウンド進行画面移行時（`ROUND/SHOW_PROGRESS`）
- ゲームプレイ開始時（`ROUND/START`）
- 護符使用時（`AMULET/SELECT_PIECE`, `AMULET/CONFIRM`, `AMULET/SELL`）
- デバッグ操作時（`DEBUG/*` アクション）

ゲームクリア時およびリセット時は保存データが削除される。

## Immutabilityの実装

すべての状態更新はスプレッド演算子による新オブジェクト生成で行われ、既存オブジェクトを変更しない。

```typescript
// 状態更新例
return {
  ...state,
  dragState: {
    ...state.dragState,
    currentPos: action.currentPos,
  },
}
```

## useGame Hook

### 提供機能

**状態:**
- `state`: 現在のゲーム状態

**アクション:**
- `startDrag(slotIndex, startPos)`: 手札からのドラッグ開始
- `startDragFromStock(startPos)`: ストックからのドラッグ開始
- `startDragFromStock2(startPos)`: ストック2からのドラッグ開始
- `updateDrag(currentPos, boardPos)`: ドラッグ更新
- `endDrag()`: ドラッグ終了
- `resetGame()`: ゲームリセット
- `endClearAnimation()`: 消去アニメーション終了
- `advanceRound(probabilityOverride?)`: ラウンド進行
- `buyItem(itemIndex)`: ショップアイテム購入
- `leaveShop()`: ショップ退出
- `startRound()`: ラウンド開始
- `showRoundProgress()`: ラウンド進行画面へ遷移
- `advanceScoreStep()`: スコアアニメーションステップ進行
- `endScoreAnimation()`: スコアアニメーション終了
- `setFastForward(isFastForward)`: スコアアニメーション早送り切替
- `applyPendingPhase()`: 保留フェーズの適用
- `moveToStock(slotIndex)`: 手札→ストック移動
- `moveFromStock(targetSlotIndex)`: ストック→手札移動
- `swapStock(slotIndex)`: 手札とストックの交換
- `moveToStock2(slotIndex)`: 手札→ストック2移動
- `moveFromStock2(targetSlotIndex)`: ストック2→手札移動
- `swapStock2(slotIndex)`: 手札とストック2の交換
- `reorderRelic(fromIndex, toIndex)`: レリック表示順序変更
- `recyclePiece(slotIndex)`: リサイクラーレリック発動
- `rerollShop()`: ショップリロール
- `startSellMode()`: 売却モード開始
- `cancelSellMode()`: 売却モードキャンセル
- `sellRelic(relicIndex)`: レリック売却
- `openDeckView()`: デッキ一覧オーバーレイを開く
- `closeDeckView()`: デッキ一覧オーバーレイを閉じる
- `useAmulet(amuletIndex)`: 護符使用
- `selectPieceForAmulet(minoId)`: 護符対象ピース選択
- `confirmAmuletEffect()`: 護符効果確定
- `cancelAmuletModal()`: 護符モーダルキャンセル
- `sellAmulet(amuletIndex)`: 護符売却
- `sculptToggleBlock(row, col)`: sculpt編集でブロックトグル

## パフォーマンス最適化

### useReducer の初期化

```typescript
useReducer(gameReducer, null, createInitialState)
```

第3引数に初期化関数を渡すことで、初回レンダリング時のみ実行される遅延初期化を実現。

## 関連ファイル

- `src/hooks/useGame.ts` - ゲーム状態管理Hook
- `src/lib/game/Domain/GameState.ts` - GameState型定義
- `src/lib/game/State/Actions/GameActions.ts` - 全アクション型定義
- `src/lib/game/State/InitialState.ts` - 初期状態の生成
- `src/lib/game/State/Reducers/GameReducer.ts` - ゲームReducer
- `src/lib/game/State/Reducers/PlayerReducer.ts` - プレイヤー状態の更新処理
- `src/lib/game/Domain/Round/GamePhase.ts` - フェーズ型定義と遷移バリデーション
- `src/lib/game/Domain/Input/DragState.ts` - ドラッグ状態型定義
- `src/lib/game/Domain/Effect/RelicState.ts` - レリック倍率状態管理
- `src/lib/game/Domain/Effect/ScriptRelicState.ts` - 台本レリック状態型定義
- `src/lib/game/Domain/Animation/AnimationState.ts` - 消去・レリック発動アニメーション状態
- `src/lib/game/Domain/Animation/ScoreAnimationState.ts` - スコアアニメーション状態
- `src/lib/game/Domain/Player/PlayerState.ts` - プレイヤー状態型定義
- `src/lib/game/Domain/Effect/AmuletModalState.ts` - 護符モーダル状態型定義
- `src/lib/game/Services/StorageService.ts` - ゲーム状態の永続化

## 更新履歴

- 2026-02-01: 初版作成
- 2026-02-01: ライン消去、スコア、アニメーション、ミノ自動生成を追加
- 2026-02-02: デッキシステム、ラウンド制、ADVANCE_ROUND、BUY_ITEM、LEAVE_SHOPアクション、フェーズ遷移を追加
- 2026-02-06: ローグライト要素追加（round_progressフェーズ、START_ROUND/ADD_RELIC/CANNOT_PLACEアクション、レリック状態、ボス条件対応、BUY_ITEM拡張）
- 2026-02-17: GameStateフィールド全体を最新コードに同期。pendingPhase/volcanoEligible/scriptRelicLines/relicMultiplierState/deckViewOpen/scoreAnimation等を追加。STOCK2系/RELIC/REORDER/PHASE/APPLY_PENDING/ROUND/SHOW_PROGRESS/SHOP/REROLL/DEBUG/UI/OPEN_DECK_VIEW等の新アクションを追加。スコアアニメーションの詳細な状態管理、永続化タイミング、DragSourceフィールドを追記
- 2026-02-20: 護符システム全般を追加（AMULET/*アクション、amuletModal状態、PlayerStateのamuletStock、SHOP/START_SELL_MODE/CANCEL_SELL_MODE/SELL_RELIC、RELIC/RECYCLE_PIECE、DEBUG/ADD_AMULET/REMOVE_AMULET/ADD_RANDOM_EFFECTS）。ANIMATION/END_CLEARに加護スタンプ処理を追記。RelicMultiplierStateにrecyclerUsesRemaining追加。フェニックスレリックによるラウンドリスタート、火山レリック発動処理の詳細を追加

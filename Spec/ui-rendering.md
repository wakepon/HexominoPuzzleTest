# UI・描画システム

## 概要

Canvas APIを使用したゲーム描画システムとユーザーインタラクション処理について説明する。
描画処理は `src/components/renderer/` 配下のレンダラー群に分割されており、`GameCanvas.tsx` が各レンダラーを呼び出して画面を構成する。

## コンポーネント構成

```
GameContainer
  └─ GameCanvas
      ├─ boardRenderer         (ボード・台本マーカー描画)
      ├─ pieceRenderer         (ブロック描画)
      ├─ previewRenderer       (配置プレビュー描画)
      ├─ cellRenderer          (セル描画・パターン・シール)
      ├─ clearAnimationRenderer (消去アニメーション描画)
      ├─ scoreRenderer         (スコア描画)
      ├─ scoreAnimationRenderer (スコアアニメーション・式ステップ描画)
      ├─ statusPanelRenderer   (左側ステータスパネル描画)
      ├─ relicPanelRenderer    (レリックパネル描画)
      ├─ StockSlotRenderer     (ストックスロット描画)
      ├─ relicEffectRenderer   (レリック発動エフェクト描画)
      ├─ tooltipRenderer       (ツールチップ描画)
      ├─ uiRenderer            (残りハンド・ゴールド描画)
      ├─ roundRenderer         (ラウンド情報描画)
      ├─ overlayRenderer       (ラウンドクリア・ゲームオーバー・ゲームクリア)
      ├─ shopRenderer          (ショップ画面描画)
      ├─ DeckViewRenderer      (デッキ一覧画面描画)
      ├─ RoundProgressRenderer (ラウンド進行画面描画)
      └─ debugRenderer         (デバッグウィンドウ描画)
```

## GameContainer

### 役割

- ゲーム全体のコンテナ
- `useGame` と `useCanvasLayout` を統合
- レイアウト計算完了まで「Loading...」を表示

### レンダリング

- 背景色: 木目調（`bg-wood-board`）
- タッチ操作無効化（`touchAction: 'none'`）でブラウザのデフォルト動作を防止
- 画面全体を使用（`min-h-screen`）

## GameCanvas

### 役割

- Canvas要素の管理
- 描画処理の実行
- ユーザー入力（マウス/タッチ）の処理

### Canvas初期化

**DPR対応:**
- デバイスピクセル比（DPR）を取得
- Canvas内部解像度を DPR 倍に設定
- CSSサイズは論理ピクセルで設定

### 描画フロー

**通常時:**
1. 状態またはレイアウト変更時に再描画
2. `useEffect` で自動的にトリガー

**ドラッグ中:**
1. `requestAnimationFrame` でアニメーションループ開始
2. 毎フレーム再描画
3. ドラッグ終了時にループ停止

**アニメーション中:**
1. 消去アニメーション状態が存在する場合、`requestAnimationFrame` でループ
2. アニメーション完了を検出したら `endClearAnimation` を呼び出し

### 描画順序（ゲームプレイ中）

```
1. 背景塗りつぶし
   ↓
2. ステータスパネル（左側）
   ↓
3. スコアアニメーション（式ステップ）
   ↓
4. レリックパネル（左側）
   ↓
5. ストックスロット
   ↓
6. スコア描画
   ↓
7. ラウンド情報
   ↓
8. ボード描画
   ↓
9. 台本レリックマーカー（条件付き）
   ↓
10. 配置プレビュー描画（ドラッグ中のみ）
    ↓
11. スロットのブロック描画（ドラッグ中のブロックを除く）
    ↓
12. ドラッグ中のブロック描画
    ↓
13. 消去アニメーション描画（アニメーション中のみ）
    ↓
14. レリック発動エフェクト（アニメーション中のみ）
    ↓
15. ツールチップ（ホバー中のみ）
    ↓
16. デバッグウィンドウ（デバッグモード時のみ）
```

## ユーザー入力処理

### マウスイベント

- `mousedown` (Canvas上): ドラッグ開始判定
- `mousemove` (Window): ドラッグ位置更新
- `mouseup` (Window): ドロップ処理

### タッチイベント

- `touchstart` (Canvas上): ドラッグ開始判定
- `touchmove` (Window): ドラッグ位置更新
- `touchend` / `touchcancel` (Window): ドロップ処理
- `passive: false` 設定でデフォルトのスクロール動作を防止

### ドラッグ開始判定

1. タッチ/クリック位置を取得
2. その位置にブロックスロット、ストックスロットのどれかがあるか判定
3. スロットが見つかった場合: ドラッグフラグを設定して `onDragStart` を呼び出し

### ドロップ処理

1. ドラッグフラグをクリア
2. `onDragEnd` を呼び出し
3. Reducer側で配置可能性を判定

## 各レンダラーの役割

### boardRenderer

ゲームボードの描画を担当する。

- ボードの背景矩形を木目調で描画
- 各セルを空（タン色）または配置済み（木目調）として描画
- 消去アニメーション中のセルは「空」として描画（アニメーション側で別途描画される）
- `renderScriptMarkers`: 台本レリック発動中に行・列マーカー（三角形）をボード外縁に描画

### pieceRenderer

ブロックの描画を担当する。

- `renderPieceSlots`: ドラッグ中でないスロットのブロックを描画
- `renderDraggingPiece`: ドラッグ中のブロックをカーソル位置の中心に描画（不透明度を落として表示）
- `renderPiece`: Piece（形状 + BlockDataMap）を描画。パターン・シール対応
- `renderPieceShape`: 後方互換用のパターンなし描画（deprecated）

### previewRenderer

ドラッグ中の配置プレビューを描画する。

- 配置可能かどうかを `canPlacePiece` で判定
- 配置可能: 半透明茶色、配置不可: 半透明赤色でボード上に描画
- ドラッグ中かつボード座標が有効な場合のみ描画

### cellRenderer

個別セルの描画ロジックを提供する共通関数群。

- `drawWoodenCell`: パターン・シール対応の木目調セルを描画（パディング・ハイライト・シャドウ付き）
- `drawWoodenCellWithBorder`: 木目調セルに枠線を追加して描画
- `drawWoodenCellSmall`: ショップ等の小サイズ向けセル描画
- `drawSealSymbol`: シール記号をセル右下に描画
- チャージパターンのセルは記号の下に現在チャージ値を表示

### clearAnimationRenderer

ライン消去アニメーションを描画する。

- 回転・上昇・縮小を組み合わせたアニメーション効果
- イージング: ease-out cubic
- 進行度が100%になると完了を返す

### scoreRenderer

現在のラウンドスコアをCanvas上部中央に描画する。

- 表示形式: `Score: {数値}`

### scoreAnimationRenderer

スコア計算の式ステップをアニメーションで表示する。

**表示モード:**

1. **式ステップ表示**: 計算過程（ラベル + 式文字列）をフェードインで順番に表示
   - 通常ステップ: ラベル行 + 式文字列行で表示
   - 最終結果ステップ（type: 'result'）: 大きく金色で表示
2. **カウントアップ表示**: スコアが加算される様子をease-outで数値が増加するアニメーションで表示

**早送りボタン:**
- 式ステップ表示中に早送りボタンが表示される
- 早送り中はボタンが金色強調される
- ボタン領域を `FastForwardButtonArea` として返し、クリック判定に使用

### statusPanelRenderer

左側ステータスパネル全体を描画する。

**表示内容（上から順）:**
- 目標スコア
- 報酬額（Reward XG）
- ラウンドスコアラベル + スコア値
- ゴールド
- ラウンド番号 / 残りハンド数（横並び）
- 絆創膏レリックのカウントダウン（所持時）
- タイミングレリックのカウントダウン（所持時）
- コピーレリック用カウントダウン（所持時）
- デッキボタン

**ラウンドスコアの色分け:**
- ゲームオーバー確定（スコアアニメーション完了後の遅延中）: 青色
- ラウンドクリア確定: 赤色
- 通常時: 白色

`formulaY`（式ステップ描画Y座標）と `deckButtonArea` を返す。

### relicPanelRenderer

所持レリックをボード左側に縦配置で描画する。

**表示内容:**
- レリック置き場のラベルと背景
- 各レリックのアイコン（絵文字）を縦に並べて表示

**視覚的フィードバック:**
- **ハイライト（金色グロー + パルスアニメーション）**: スコアアニメーション中に発動レリックを強調
- **タイミングボーナス（青色グロー）**: タイミングレリックがボーナス発動中
- **コピーリンク（紫色グロー）**: コピーレリックが対象レリックとリンク中
- **グレーアウト（半透明）**: 発動条件を満たさないレリック

**ドラッグ&ドロップ並び替え:**
- ドラッグ中のアイコンはカーソル位置（`currentY`）に追従し、不透明度を下げて表示
- ドロップ先インジケーター（金色背景）でドロップ位置を可視化
- 各アイコンのヒット領域を `RelicIconArea` として返し、ドラッグ&ドロップ判定に使用

### StockSlotRenderer

ストックスロットを描画する。

**ストック1（`renderStockSlot`）:**
- `hand_stock` レリック所持時にのみ `layout.stockSlotPosition` が設定されるため、未設定時は描画しない
- ラベル「ストック」を上部に表示
- ストックにピースがあり、かつそのスロットをドラッグ中でなければピースを描画

**ストック2（`renderStockSlot2`）:**
- コピーレリックで `hand_stock` をコピー中のみ有効
- ストック1の下に配置
- ラベル「ストック2」、枠線は紫色で区別

両関数とも描画後にヒット領域（`bounds`）を返し、クリック判定に使用する。レリック未所持時は `null` を返す。

### relicEffectRenderer

レリック発動時のポップアップエフェクトを描画する。

- 複数レリックが同時発動した場合、縦に並べて表示
- フェードイン→表示→フェードアウトのアニメーション
- 各ポップアップにはレリックアイコン・名前・ボーナス値を表示
- 進行度が100%になると完了を返す

### tooltipRenderer

ホバー時のツールチップを描画する。

- `tooltip.visible` かつ `tooltip.effects` が1件以上ある場合のみ描画
- 複数エフェクトを縦に並べて表示（エフェクト名 + 説明文）
- 日本語テキストの折り返し処理あり
- 画面端（右・下・左・上）での見切れを防ぐよう自動的に表示位置を調整

### uiRenderer

残りハンド数とゴールドをCanvasに描画する。

- `renderRemainingHands`: 残りハンド数と目標スコアを中央に表示
- `renderGold`: ゴールド（`💰 XG`形式）を左上に表示

### roundRenderer

ラウンド情報をCanvas右上に描画する。

- ラウンド番号（`Round X/Y`形式）
- ラウンドタイプ（Elite: 金色、BOSS: 赤色、normal: 表示なし）
- ボスラウンドの場合はボス条件名を表示

### overlayRenderer

ゲーム進行上の全画面オーバーレイを描画する。

- `renderRoundClear`: ラウンドクリア演出（`Round X Clear!` + 報酬内訳）
- `renderGameOver`: ゲームオーバー画面（到達ラウンド・最終スコア・総獲得ゴールド + リトライボタン）
- `renderGameClear`: ゲームクリア画面（全ラウンドクリア・総獲得ゴールド + もう一度ボタン）
- ゲームオーバー・ゲームクリアはリトライ/もう一度ボタンの `ButtonArea` を返す

### shopRenderer

ショップ画面を全画面で描画する。

- ブロック商品（BlockShopItem）とレリック商品（RelicShopItem）を別行に分けて描画
- 各商品ボックスに形状/アイコン・パターン名/シール名・価格を表示
- セール時は元価格に打ち消し線 + セール価格（赤字）+ SALEバッジを表示
- 購入済み商品は「購入済み」表示
- 購入不可（ゴールド不足）時はグレーアウト + 打ち消し線
- ショップリロールボタン（コスト表示付き）と「店を出る」ボタンを中央下に横並び表示
- 各商品エリアのヒット領域 `ShopItemArea` 一覧と各ボタンの `ButtonArea` を返す

### DeckViewRenderer

デッキ一覧画面を全画面で描画する。

- 山札（デッキのカード）と使用中（手札にあるピース）をセクション分けして表示
- 各ミノを小型セルで描画。使用中のミノはグレーアウト表示
- 閉じるボタンの `ButtonArea` を返す

### RoundProgressRenderer

ラウンド開始前の進行画面を全画面で描画する。

- 現在のセット番号を表示
- 同セット内の3ラウンドをカード形式で横並び表示
  - クリア済み: チェックマーク
  - 現在のラウンド: ラウンドタイプ名・番号・ボス条件・目標スコア・報酬額
  - 未解放: 鍵アイコン
- 「ラウンド開始」ボタンの `ButtonArea` を返す

### debugRenderer

デバッグ用ウィンドウをCanvas左上に描画する。デバッグモード時のみ有効。

**表示内容:**
- デッキの残りカード枚数・残りハンド数
- デッキ内のミノ形状一覧（次に出るミノを先頭にハイライト）
- パターン確率・シール確率の表示と +/- 調整ボタン
- レリック一覧グリッド（所持/未所持の切り替えトグル）
- ゴールド調整ボタン（-50 / -10 / +10 / +50）
- スコア調整ボタン（-50 / -10 / +10 / +50）
- セーブデータ削除ボタン

各ボタンの `ButtonArea` と `relicButtons`（`RelicButtonArea[]`）を描画結果として返す。

## セルのビジュアル表現

### パターン対応セル

セルにはパターンが付与される場合があり、パターン別の色セット（ベース・ハイライト・シャドウ）で描画される。パターンが未設定の場合はデフォルトの木目調色を使用する。

パターン記号（絵文字）はセル中央に表示される。チャージパターンの場合は記号の下に現在チャージ値も表示される。

### シール対応セル

シールが付与されたセルはシール記号をセル右下に小さく表示する。背景付きの角丸バッジで描画される。

## スタイル設定

描画スタイルは `src/lib/game/Data/Constants.ts` に定数として集約されている。主な定数:

- `COLORS` - ボード・セル・ブロックの基本色
- `CELL_STYLE` - セルのパディング・ハイライト幅・シャドウ幅
- `PATTERN_COLORS` - パターン別のカラーセット
- `SEAL_COLORS` - シール別の表示色
- `HD_LAYOUT` - HDレイアウト全体の座標・サイズ定義
- `HD_STATUS_PANEL_STYLE` - ステータスパネルのフォント・色
- `RELIC_PANEL_STYLE` - レリックパネルのアイコンサイズ・間隔
- `STOCK_SLOT_STYLE` - ストックスロットのサイズ・枠線・ラベル設定
- `TOOLTIP_STYLE` - ツールチップの背景・枠線・フォント設定
- `RELIC_EFFECT_STYLE` - レリック発動エフェクトのポップアップ設定
- `CLEAR_ANIMATION` - 消去アニメーションの回転・上昇・スケール設定
- `SCORE_ANIMATION` - スコアアニメーションのフェードイン・カウントアップ時間設定
- `SHOP_STYLE` - ショップ画面のレイアウト・価格表示設定
- `DEBUG_WINDOW_STYLE` - デバッグウィンドウの全スタイル設定

## レスポンシブ対応

- ウィンドウリサイズ・画面向き変更時にレイアウトを再計算
- DPR（デバイスピクセル比）に応じてCanvas内部解像度を調整
- `touch-none` クラスとイベントの `passive: false` でスクロール防止

## パフォーマンス最適化

- ドラッグ中またはアニメーション中のみ `requestAnimationFrame` ループを実行
- 通常時はゲーム状態変化時のみ再描画（`useEffect`）
- イベントリスナーを `useEffect` のクリーンアップで適切に解放

## 関連ファイル

- `src/components/GameCanvas.tsx` - Canvas管理・イベント処理・レンダラー呼び出し
- `src/components/GameContainer.tsx` - ゲームコンテナ
- `src/components/renderer/boardRenderer.ts` - ボード描画
- `src/components/renderer/pieceRenderer.ts` - ブロック描画
- `src/components/renderer/previewRenderer.ts` - 配置プレビュー描画
- `src/components/renderer/cellRenderer.ts` - セル描画共通関数
- `src/components/renderer/clearAnimationRenderer.ts` - 消去アニメーション描画
- `src/components/renderer/scoreRenderer.ts` - スコア描画
- `src/components/renderer/scoreAnimationRenderer.ts` - スコアアニメーション描画
- `src/components/renderer/statusPanelRenderer.ts` - ステータスパネル描画
- `src/components/renderer/relicPanelRenderer.ts` - レリックパネル描画
- `src/components/renderer/StockSlotRenderer.ts` - ストックスロット描画
- `src/components/renderer/relicEffectRenderer.ts` - レリック発動エフェクト描画
- `src/components/renderer/tooltipRenderer.ts` - ツールチップ描画
- `src/components/renderer/uiRenderer.ts` - 残りハンド・ゴールド描画
- `src/components/renderer/roundRenderer.ts` - ラウンド情報描画
- `src/components/renderer/overlayRenderer.ts` - ゲームオーバー・ラウンドクリア等
- `src/components/renderer/shopRenderer.ts` - ショップ画面描画
- `src/components/renderer/DeckViewRenderer.ts` - デッキ一覧画面描画
- `src/components/renderer/RoundProgressRenderer.ts` - ラウンド進行画面描画
- `src/components/renderer/debugRenderer.ts` - デバッグウィンドウ描画
- `src/lib/game/Data/Constants.ts` - 描画スタイル定数

## 更新履歴

- 2026-02-01: 初版作成
- 2026-02-01: 消去アニメーション描画、スコア描画を追加
- 2026-02-09: HD固定レイアウトに伴う新規描画機能を追加（ステータスパネル、レリックパネル、ツールチップ、レリック発動エフェクト）
- 2026-02-17: `src/components/renderer/` 配下の全レンダラーに基づき全面更新。スコアアニメーション（ステップバイステップ表示）、レリックパネルのドラッグ&ドロップ並び替え・視覚的フィードバック、ストックスロット2スロット対応、デバッグウィンドウの詳細、ショップ・デッキ一覧・ラウンド進行画面の各レンダラーを追加

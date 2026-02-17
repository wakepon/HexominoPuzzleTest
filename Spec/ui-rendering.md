# UI・描画システム

## 概要

Canvas APIを使用したゲーム描画システムとユーザーインタラクション処理について説明する。

## コンポーネント構成

```
GameContainer
  └─ GameCanvas
      ├─ boardRenderer (ボード描画)
      ├─ pieceRenderer (ブロック描画)
      ├─ previewRenderer (プレビュー描画)
      ├─ cellRenderer (セル描画)
      ├─ clearAnimationRenderer (消去アニメーション描画)
      └─ scoreRenderer (スコア描画)
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

**サイズ設定:**
```typescript
canvas.width = layout.canvasWidth * dpr
canvas.height = layout.canvasHeight * dpr
canvas.style.width = `${layout.canvasWidth}px`
canvas.style.height = `${layout.canvasHeight}px`
```

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

### 描画順序

```
1. 背景塗りつぶし
   ↓
2. スコア描画
   ↓
3. ボード描画
   ↓
4. 配置プレビュー描画（ドラッグ中のみ）
   ↓
5. スロットのブロック描画（ドラッグ中のブロックを除く）
   ↓
6. ドラッグ中のブロック描画
   ↓
7. 消去アニメーション描画（アニメーション中のみ）
```

## ユーザー入力処理

### マウスイベント

**イベントリスナー:**
- `mousedown` (Canvas上): ドラッグ開始判定
- `mousemove` (Window): ドラッグ位置更新
- `mouseup` (Window): ドロップ処理

**Canvas座標変換:**
```typescript
const rect = canvas.getBoundingClientRect()
const pos = {
  x: e.clientX - rect.left,
  y: e.clientY - rect.top,
}
```

### タッチイベント

**イベントリスナー:**
- `touchstart` (Canvas上): ドラッグ開始判定
- `touchmove` (Window): ドラッグ位置更新
- `touchend` / `touchcancel` (Window): ドロップ処理

**passive: false設定:**
- デフォルトのスクロール動作を防止
- `preventDefault()` を有効化

### ドラッグ開始判定

1. タッチ/クリック位置を取得
2. その位置にブロックスロットがあるか判定
3. スロットが見つかった場合:
   - ドラッグフラグを設定
   - `onDragStart` を呼び出し

**スロット判定:**
- 各スロットの位置とサイズを計算
- タッチ位置がスロット矩形内にあるかチェック

### ドラッグ中の処理

1. 現在のマウス/タッチ位置を取得
2. ボード座標に変換:
   - ブロック中心をドラッグ位置に合わせる
   - 左上座標を計算
   - スクリーン座標からボード座標に変換
3. `onDragMove` を呼び出し

### ドロップ処理

1. ドラッグフラグをクリア
2. `onDragEnd` を呼び出し
3. Reducer側で配置可能性を判定

## 描画システム

### ボード描画 (boardRenderer)

**ボード背景:**
- パディング付きの矩形を描画
- 木目調の背景色

**各セル:**
- 空セル: タン色の背景
- 埋まっているセル: 木目調のブロック（`drawWoodenCell`）
- すべてのセルに枠線を描画

### ブロック描画 (pieceRenderer)

**スロット内ブロック:**
- ドラッグ中でないブロックのみ描画
- スロット位置に配置
- セルサイズを縮小（`slotCellSizeRatio` 倍）

**ドラッグ中ブロック:**
- 不透明度を設定（`dragOpacity`）
- ブロック中心をドラッグ位置に合わせる
- 通常のセルサイズで描画

**ブロック形状描画:**
- 形状配列を走査
- `true` のセルのみ描画
- 各セルに木目調スタイルを適用

### プレビュー描画 (previewRenderer)

**描画条件:**
- ドラッグ中
- ボード座標が有効

**プレビュー色:**
- 配置可能: 半透明茶色（`previewValid`）
- 配置不可: 半透明赤色（`previewInvalid`）

**描画処理:**
- 配置可能性を判定（`canPlacePiece`）
- ブロック形状の各セルをボード上に描画

### セル描画 (cellRenderer)

**木目調セルスタイル:**

1. ベース色で塗りつぶし
2. ハイライト（上端・左端）を描画
3. シャドウ（下端・右端）を描画
4. オプションで枠線を描画

**パディング:**
- セル内にパディングを適用
- 立体感を表現

### 消去アニメーション描画 (clearAnimationRenderer)

**アニメーション効果:**
- 回転: 0度から180度まで
- 上昇: セルが上方向に移動
- 縮小: スケールが1.0から0.0に変化
- イージング: ease-out cubic

**描画処理:**
1. 経過時間から進行度を計算
2. イージング関数を適用
3. 各消去対象セルを変形して描画
4. 進行度100%で完了を返す

### スコア描画 (scoreRenderer)

**描画位置:**
- Canvas上部中央
- 固定パディング位置

**スタイル:**
- テキストシャドウ付き
- 中央揃え
- 表示形式: `"Score: {数値}"`

## スタイル設定

### 色定義

**ボード:**
- 背景: ダークブラウン（`#8B7355`）
- セル背景: タン色（`#D2B48C`）
- セル枠線: 濃い茶色（`#6B5344`）

**ブロック:**
- ベース: シエナ（`#A0522D`）
- ハイライト: ペルー（`#CD853F`）
- シャドウ: ダークブラウン（`#5D3A1A`）

**プレビュー:**
- 有効: 半透明茶色
- 無効: 半透明赤色

### アニメーション設定

- ドラッグ中の不透明度
- プレビューの不透明度
- 消去アニメーションの設定:
  - 継続時間
  - 最大回転角度
  - 最大上昇距離
  - スケール変化範囲

### セルスタイル

- パディング
- ハイライト幅
- シャドウ幅

### スコア表示スタイル

- フォントサイズ
- フォントファミリー
- フォント太さ
- 色
- シャドウ設定
- パディング

## レスポンシブ対応

### Canvas サイズ調整

- ウィンドウリサイズ時に再計算
- 画面向き変更時に再計算
- DPRに応じた解像度調整

### タッチ操作最適化

- `touch-none` クラスでデフォルト動作を無効化
- `preventDefault()` でスクロール防止
- タッチイベントに `passive: false` を設定

## パフォーマンス最適化

### 描画最適化

- ドラッグ中またはアニメーション中のみループを実行
- `requestAnimationFrame` で60FPSを目標
- 不要な再描画を防止

### メモリ管理

- イベントリスナーを適切にクリーンアップ
- `useEffect` のクリーンアップ関数で解放

### DPR最適化

- デバイスピクセル比をキャッシュ
- `useRef` で再レンダリングを回避

## 新規描画機能

### HDステータスパネル描画

**左側パネルに表示:**
- 目標スコア（大きく強調表示）
- 現在のラウンドスコア
- 獲得得点表示
- 得点計算式
- ゴールド表示
- ラウンド情報
- 残りハンド数

**スタイル設定:**
`HD_STATUS_PANEL_STYLE` で各要素のフォントサイズ、色、配置を定義。

### レリックパネル描画

**表示位置:**
ボードの左側（レリック置き場エリア）

**内容:**
- 所持レリックのアイコンを縦に配置
- アイコンサイズ、間隔は `HD_LAYOUT.relicArea*` で定義

### ツールチップ描画

**表示条件:**
- レリックやショップアイテムにマウスホバー時
- タッチデバイスでは長押し時

**内容:**
- 名前（強調表示）
- 説明文
- 効果リスト

**スタイル:**
`TOOLTIP_STYLE` で背景色、枠線、フォント設定を定義。

### レリック発動エフェクト描画

**表示タイミング:**
- レリック効果が発動した時
- スコア計算後

**内容:**
- レリックアイコン
- レリック名
- ボーナス値表示

**アニメーション:**
- 一定時間表示後にフェードアウト
- 複数同時発動時は縦に並べて表示

**スタイル:**
`RELIC_EFFECT_STYLE` で背景、枠線、グロー効果を定義。

## 関連ファイル

- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/components/GameCanvas.tsx` - Canvas管理とイベント処理
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/components/GameContainer.tsx` - ゲームコンテナ
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Data/Constants.ts` - 描画スタイル定数
- `/Users/kenwatanabe/Projects/HexominoPuzzleTest/src/lib/game/Services/TooltipService.ts` - ツールチップ処理

**注意:**
現在のコードベースには `src/components/renderer/` ディレクトリが存在しない可能性があります。描画処理は `GameCanvas.tsx` 内に統合されているか、別のディレクトリ構造になっている可能性があります。

## 更新履歴

- 2026-02-01: 初版作成
- 2026-02-01: 消去アニメーション描画、スコア描画を追加
- 2026-02-09: HD固定レイアウトに伴う新規描画機能を追加（ステータスパネル、レリックパネル、ツールチップ、レリック発動エフェクト）

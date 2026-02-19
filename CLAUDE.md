# プロジェクト概要
Wooden Puzzle 風デッキ構築パズルブラウザゲーム

# 技術スタック
- React + TypeScript
- Tailwind CSS
- Vite（ビルドツール）
- React Hooks（状態管理）

## その他
- スマホ対応（タッチ操作）を考慮
- GitHub Pagesで動作すること
- コメントは日本語でOK
- テストコードはロジックのコア部分に絞ること。
- テストコードは指示されるまで書かないこと

# アーキテクチャ

## ディレクトリ構造
```
src/
├── lib/game/               # Pure ゲームロジック（React非依存）
│   ├── Domain/             # 型定義・ドメインモデル
│   │   ├── Core/           # Id（ブランド型）, Position
│   │   ├── Piece/          # Piece, PieceShape, MinoCategory, BlockData
│   │   ├── Board/          # Board(6x6 Grid), Cell
│   │   ├── Effect/         # Pattern, Seal, Relic, Amulet, ScoreBreakdown
│   │   │                   #   PatternEffectHandler, SealEffectHandler, RelicEffectHandler
│   │   ├── Animation/      # ClearingAnimation, ScoreAnimation, FormulaBuilder
│   │   ├── Round/          # GamePhase, RoundInfo, BossCondition
│   │   ├── Deck/           # DeckState, PieceSlot, HandState
│   │   ├── Shop/           # ShopItem, ShopState
│   │   ├── Player/         # PlayerState (gold, relics, amulets)
│   │   ├── Canvas/         # CanvasLayout
│   │   ├── Input/          # DragState
│   │   ├── Tooltip/        # TooltipState
│   │   ├── Debug/          # DebugSettings
│   │   └── GameState.ts    # ルートのゲーム状態型
│   ├── Services/           # ビジネスロジック（純粋関数）
│   │   ├── BoardService.ts        # 盤面操作（配置、障害物、チャージ）
│   │   ├── CollisionService.ts    # 配置バリデーション・座標変換
│   │   ├── LineService.ts         # ライン完成検出・スコア計算（最重要）
│   │   ├── PieceService.ts        # ピース生成・パターン/シール付与
│   │   ├── DeckService.ts         # デッキ操作（ドロー、シャッフル）
│   │   ├── RoundService.ts        # ラウンド進行・目標スコア
│   │   ├── ShopService.ts         # ショップ生成・購入処理
│   │   ├── ShopPriceCalculator.ts # 価格計算
│   │   ├── AmuletEffectService.ts # 護符効果適用
│   │   ├── ClearingCellService.ts # 消去セル順序生成
│   │   ├── StorageService.ts      # ローカルストレージ保存/復元
│   │   └── TooltipService.ts      # ツールチップ状態計算
│   ├── State/              # Redux風の状態管理
│   │   ├── Actions/GameActions.ts # 全アクション型定義
│   │   └── Reducers/
│   │       ├── GameReducer.ts     # メインReducer
│   │       └── PlayerReducer.ts   # プレイヤー状態更新
│   ├── Events/             # イベントバス（診断・ログ用）
│   ├── Data/               # 定数・静的データ（Constants, MinoDefinitions）
│   └── Utils/              # ユーティリティ（Random等）
├── hooks/                  # React Hook（ロジックとUIの橋渡し）
│   ├── useGame.ts          # メイン状態管理（dispatch wrapper）
│   ├── useCanvasLayout.ts  # HD 1280x720 レイアウト計算
├── components/             # UIコンポーネント
│   ├── GameContainer.tsx   # 最上位コンテナ（hooks接続）
│   ├── GameCanvas.tsx      # Canvas描画オーケストレーター＋イベント処理
│   └── renderer/           # 描画関数群（18ファイル、React非依存）
│       ├── boardRenderer.ts          # ボード描画
│       ├── cellRenderer.ts           # セル描画（パターン/シール表示）
│       ├── pieceRenderer.ts          # ピース描画（スロット・ドラッグ）
│       ├── previewRenderer.ts        # 配置プレビュー
│       ├── clearAnimationRenderer.ts # 消去アニメーション
│       ├── scoreAnimationRenderer.ts # スコア計算式表示
│       ├── relicEffectRenderer.ts    # レリック発動演出
│       ├── relicPanelRenderer.ts     # レリックパネル
│       ├── statusPanelRenderer.ts    # ステータスパネル
│       ├── shopRenderer.ts           # ショップ画面
│       ├── overlayRenderer.ts        # フェーズオーバーレイ
│       ├── RoundProgressRenderer.ts  # ラウンド進行画面
│       ├── StockSlotRenderer.ts      # ストック枠
│       ├── DeckViewRenderer.ts       # デッキ一覧
│       ├── AmuletModalRenderer.ts    # 護符モーダル
│       ├── tooltipRenderer.ts        # ツールチップ
│       ├── debugRenderer.ts          # デバッグウィンドウ
│       └── TextHighlightUtils.ts     # テキスト装飾ユーティリティ
```

## データフロー
```
ユーザー入力 → GameCanvas(mouse/touch) → useGame(dispatch)
→ GameReducer(純粋関数) → Services呼び出し → 新GameState
→ React再描画 → renderer関数群 → Canvas描画
```

## 主要ドメイン概念
- **Board**: 6x6グリッド、Cell配列。Cell = { filled, blockSetId, pattern, seal, chargeValue }
- **Piece**: shape(boolean[][]) + blocks(BlockDataMap) + blockSetId
- **Effect系統**:
  - Pattern(ブロック効果): enhanced, lucky, combo, aura, moss, feather, nohand, charge, obstacle
  - Seal(シール効果): gold, score, multi, stone, arrow_v, arrow_h
  - Relic(レリック): 20種 - サイズボーナス(1-6), chain_master, single_line, takenoko, kani, rensha, nobi_takenoko, nobi_kani, hand_stock, script, volcano, bandaid, timing, copy, full_clear_bonus
  - Amulet(護符): sculpt, pattern_add, seal_add, vanish
- **スコア計算**: A×B方式（ブロック点×列点）
  - LineService.calculateScoreWithEffects() → PatternEffectHandler → RelicEffectHandler
  - FormulaBuilder がステップ分解して式アニメーション生成
- **GamePhase遷移**: round_progress → playing → round_clear → shopping → round_progress → ... (game_over | game_clear)

## GameAction プレフィックス
- `BOARD/` ボード操作、`UI/` UI操作、`GAME/` ゲーム全体
- `ANIMATION/` アニメーション、`PHASE/` フェーズ遷移
- `ROUND/` ラウンド、`SHOP/` ショップ、`STOCK/` ストック
- `RELIC/` レリック、`AMULET/` 護符、`DEBUG/` デバッグ

## 頻繁に変更されるファイル
- `Domain/Effect/` 配下 - 新エフェクト追加時
- `Services/LineService.ts` - スコア計算ロジック変更時
- `State/Reducers/GameReducer.ts` - 新アクション追加時
- `components/renderer/` 配下 - UI描画変更時
- `Domain/Effect/Relic.ts` - レリック追加時
- `Domain/Effect/Pattern.ts` / `Seal.ts` - パターン/シール追加時

# 詳細ドキュメント
- [アーキテクチャ詳細](codemaps/architecture.md) - モジュール依存関係、Service関数一覧
- [データモデル詳細](codemaps/data.md) - 型定義、Effect全種別、アクション一覧

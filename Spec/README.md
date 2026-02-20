# ゲーム仕様書

このディレクトリにはゲームの仕様書を格納します。

## 目次

### コアシステム
1. [ゲーム概要](./game-overview.md) - ゲームの基本情報と目的、ラウンド制、ショップシステム
2. [ゲームメカニクス](./game-mechanics.md) - コアゲームメカニクス（デッキ、ミノ配置、衝突判定、ライン消去、ラウンド制、ショップ等）
3. [ミノシステム](./mino-system.md) - ミノ定義と生成システム（全307種類）

### ローグライト要素
4. [パターンシステム](./pattern-system.md) - ブロックセット全体に付与する特殊効果（全6パターン）
5. [シールシステム](./seal-system.md) - 個別セルに付与する特殊効果（全3シール）
6. [加護システム](./blessing-system.md) - ブロックに付与され、消去時にセルへバフとして刻まれる効果（加護4種→バフ4種）
7. [レリックシステム](./relic-system.md) - 恒久的なパッシブ効果アイテム（全52種、倍率・加算・特殊効果）
   - [レリック一覧](./relic-list.md) - 全52種のレリック詳細仕様
8. [護符システム](./amulet-system.md) - デッキ強化用消費アイテム（全4種）

### 技術仕様
9. [データ構造](./data-structures.md) - 型定義とデータモデル（DeckState、GamePhase、ShopState、PlayerState、RelicMultiplierState等）
   - [効果計算型](./data-structures-effect-types.md) - スコア計算・レリック効果・アニメーション関連の型（ScoreBreakdown、RelicEffectResult、ScoreAnimationState等）
10. [状態管理](./state-management.md) - ゲーム状態とアクション（全フィールド・全アクション定義、アニメーション状態管理）
11. [UI・描画システム](./ui-rendering.md) - Canvas描画とユーザーインタラクション（全19レンダラー、スコアアニメーション）
12. [レイアウトシステム](./layout-system.md) - HD固定レイアウト計算（1280x720）
13. [アーキテクチャ](./Architecture.md) - コード構造とDomain/Service/State層の設計

### 設計計画
14. [レリック中心設計への修正計画](./RelicCentricRedesign.md) - Balatro型レリック中心設計への移行計画（レリック5枠・売却、利息、護符、ショップ変更、デッキ6枚化、レリック200〜300種拡充）
15. [ピース購入モチベーション問題の分析](./PiecePurchaseMotivation.md) - レリック中心設計に至るまでの問題分析と検討過程

### その他
16. [未実装機能](./UnimplementedFeatures.md) - 未実装機能の一覧（レリック中心設計の未実装項目含む）
17. [実装計画](./ImplementationPlan.md) - 初期実装計画（歴史的文書）

## 仕様書の管理方針

- **コードが正（Source of Truth）**: 仕様書とコードにズレがある場合、コードを正として仕様書を更新する
- **数値の記載ルール**: パラメータ調整対象の値は記載せず、動作の概要のみを記載する
- **ファイルサイズ**: 800行を超えたらカテゴリ別に分割を検討する
- **更新履歴**: 各ファイルに更新履歴を記載する

## 更新方法

doc-updater エージェントを使用してコードから仕様書を生成・更新します。

## 更新履歴

- 2026-02-01: 初版作成（ゲーム概要、メカニクス、データ構造、状態管理、UI描画、レイアウトシステム）
- 2026-02-01: ミノシステム、ライン消去、スコアシステム、消去アニメーションを追加
- 2026-02-02: デッキシステム、ラウンド制、ゴールド、ショップ、ゲームフェーズ、デバッグウィンドウに関する仕様を追加・更新
- 2026-02-06: ローグライト要素追加（パターン・シールシステム、レリックシステム、ラウンドセット構成、ボス条件、ショップ拡張）
- 2026-02-09: コードベース大幅リファクタリングを反映
  - Domain/Service/State層への構造変更
  - HD固定レイアウト（1280x720）への移行
  - アクション型プレフィックス化（UI/、BOARD/、GAME/、ANIMATION/、ROUND/、SHOP/）
  - PlayerState統合（ゴールド・レリックを一元管理）
  - BlockDataMap導入（パターン・シール情報の管理強化）
  - イベントシステム追加（GameEventBus）
  - セーブデータシステム追加（StorageService）
  - ツールチップシステム追加
  - レリック発動アニメーション追加
- 2026-02-17: レリック中心設計を全仕様書に反映（デッキ6枚化、レリック5枠・売却、利息、ショップ2+3構成、護符システム）
- 2026-02-17: 全仕様書をコードベースに合わせて一括同期
  - relic-system.md: 全20レリック対応に全面書き直し
  - pattern-system.md / seal-system.md: パターン9種・シール6種に更新（pattern-seal-system.mdから分離）
  - game-mechanics.md: スコア計算式全面更新、全消しボーナス+100、連射+2
  - game-overview.md: round_progressフェーズ、ストック2スロット、フェーズ遷移図追加
  - state-management.md: GameState全フィールド・全アクション同期
  - data-structures.md: 新型追加、効果計算型をdata-structures-effect-types.mdに分割
  - ui-rendering.md: 全19レンダラー、スコアアニメーション、レリックパネル等追加
  - UnimplementedFeatures.md: 実装済み機能を棚卸し（残り4項目）
  - README.md: 目次を全ファイルカバーに更新
- 2026-02-20: 全仕様書をコードベースに合わせて一括同期
  - pattern-system.md: combo, aura, moss削除 → 全6パターンに縮小
  - seal-system.md: score, arrow_v, arrow_h削除 → 全3シールに縮小
  - blessing-system.md: 加護/バフの概念分離を反映（加護4種→バフ4種の変換フロー）
  - relic-system.md: RelicModuleアーキテクチャ追記、52種対応
  - relic-list.md: 全52種のレリック詳細仕様に全面書き直し
  - game-overview.md: 加護/バフ、レリック52種、ショップ最新仕様に同期
  - game-mechanics.md: スコア計算・ショップ・ボス条件・加護バフを最新実装に同期
  - state-management.md: 護符アクション（AMULET/*）、売却モード、加護スタンプ処理を追加
  - data-structures.md: Cell型バフフィールド、Blessing/Buff型、護符型、RelicType 52種に更新
  - data-structures-effect-types.md: 削除パターン/シール効果を除去、レリック効果を動的Map化

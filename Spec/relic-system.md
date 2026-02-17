# レリックシステム

## 概要

恒久的なパッシブ効果を持つアイテムシステム。ショップで購入して獲得し、複数所持可能。ゲームオーバー時にリセットされる。

## レリックの基本仕様

### 獲得方法

- ショップでゴールドを消費して購入
- 1つのレリックは1回のみ購入可能

### 効果適用

- 所持している間、常に効果が適用される
- 特定条件を満たした時に発動するタイプもある

### リセット条件

- ゲームオーバー時に全てのレリックがリセット

## レアリティ

| レアリティ | 日本語名 | 価格帯（目安） |
|------------|----------|----------------|
| common | コモン | 低価格 |
| rare | レア | 中価格 |
| epic | エピック | 高価格 |

## レリック一覧

### 全消しボーナス (full_clear_bonus)

| 項目 | 値 |
|------|-----|
| ID | `full_clear_bonus` |
| 名前 | 全消しボーナス |
| レアリティ | common |
| 説明 | 盤面を全て空にするとスコア+20 |

**発動条件**: ライン消去後に盤面が完全に空になった場合

### 小さな幸運 (small_luck)

| 項目 | 値 |
|------|-----|
| ID | `small_luck` |
| 名前 | 小さな幸運 |
| レアリティ | common |
| 説明 | 3ブロックのピースを配置した際に行または列が揃うとスコア+20 |

**発動条件**:
- 配置したブロックが3セル
- その配置でライン消去が発生

### 連鎖の達人 (chain_master)

| 項目 | 値 |
|------|-----|
| ID | `chain_master` |
| 名前 | 連鎖の達人 |
| レアリティ | rare |
| 説明 | 複数行列を同時消しするとスコア倍率を1.5倍 |

**発動条件**: 消去ライン数が2以上

## 効果計算

### レリック効果判定

```
レリック効果判定(totalLines, totalBlocks, placedBlockSize, isBoardEmpty) {
    effects = {
        chainMasterActive: false,
        smallLuckActive: false,
        fullClearActive: false
    }

    // 連鎖の達人
    if (hasRelic('chain_master') && totalLines >= 2) {
        effects.chainMasterActive = true
    }

    // 小さな幸運
    if (hasRelic('small_luck') && placedBlockSize === 3 && totalLines > 0) {
        effects.smallLuckActive = true
    }

    // 全消しボーナス
    if (hasRelic('full_clear_bonus') && isBoardEmpty) {
        effects.fullClearActive = true
    }

    return effects
}
```

### 効果適用順序

1. 基本スコア計算
2. 連鎖の達人（×1.5、切り捨て）
3. スコアアニメーション
4. 小さな幸運（+20）
5. 全消しボーナス（+20）

## 状態管理

### 所持レリック

```typescript
interface RelicState {
  ownedRelics: string[]  // 所持レリックIDのリスト
}
```

### 操作

- `addRelic(relicId)`: レリックを追加
- `removeRelic(relicId)`: レリックを削除（デバッグ用）
- `hasRelic(relicId)`: 所持判定
- `reset()`: 全レリックをクリア

### 永続化

- ゲーム状態と一緒に保存
- ゲームオーバー時にリセット

## UI表示

### レリックパネル

- 画面上部に所持レリックのアイコンを表示
- レリックが0個の場合は非表示

### ツールチップ

- アイコンホバー/タップで表示
- レリック名、レアリティ、説明を表示
- 画面端で位置調整

### 効果発動エフェクト

- レリック発動時にアイコンが光る
- 画面中央にポップアップ表示:
  - レリックアイコン
  - レリック名
  - ボーナス値

### CSSクラス

- `relic-icon`: レリックアイコン
- `rarity-{rarity}`: レアリティ別スタイル
- `relic-activated`: 発動時アニメーション
- `relic-effect-popup`: エフェクトポップアップ

## ショップでの購入

### レリック商品データ

```
{
    type: 'relic',
    relic: { id: 'chain_master', name: '連鎖の達人', ... },
    price: レアリティに応じた価格,
    rarity: 'rare'
}
```

### 生成ルール

- 未所持のレリックからランダムに最大3つ選択
- すべてのレリックを所持している場合は表示されない

## 関連ファイル

- （実装時に追加）

## 更新履歴

- 2026-02-06: 初版作成（JSVersionSpecから移植）

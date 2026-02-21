# 護符システム

## 概要

- 護符はショップでレリック枠に出現する**消費アイテム**
- **ストック可能**: 最大2個まで保持できる（購入後すぐ使わなくてよい）
- **使用タイミング**: ショップフェーズ中、またはパズル中
- **効果対象**: デッキ内のピースに対して効果を適用する

---

## 護符のストック

| 項目 | 仕様 |
|---|---|
| ストック上限 | 2個 |
| 使用タイミング | ショップフェーズ中/パズル中 |
| 売却 | 購入価格の半額（端数切り捨て）で売却可能 |

---

## 護符の種類（全4種）

| 護符名 | タイプ | アイコン | 効果 | 対象 | 価格帯 |
|---|---|---|---|---|---|
| **彫刻** | `sculpt` | 🪨 | ピースの形状を編集する（ブロック追加/削除） | デッキ内の1ピース | 8〜12G |
| **パターン付与** | `pattern_add` | ✨ | ピースにランダムなパターンを付与する | デッキ内の1ピース | 6〜10G |
| **シール付与** | `seal_add` | 🔮 | ピースにランダムなシールを付与する | デッキ内の1ピース | 5〜9G |
| **消去** | `vanish` | 💨 | デッキからピースを1つ削除する | デッキ内の1ピース | 4〜7G |

---

## 護符の使用フロー

### 共通フロー

```
1. 護符ストックから使用する護符を選択（AMULET/USE）
2. デッキからピースを選択（AMULET/SELECT_PIECE）
3. 効果適用（タイプ別に分岐）
4. モーダル閉じ → 護符消費
```

### タイプ別処理

**pattern_add / seal_add / vanish**:
- ピース選択後、即座に効果適用してモーダルを閉じる

**sculpt**:
- ピース選択後、`sculpt_edit` ステップへ遷移
- ブロックのON/OFFをトグルして形状を編集（`AMULET/SCULPT_TOGGLE_BLOCK`）
- 確定時にバリデーション（連結性チェック + ブロック1個以上）
- キャンセル可能（`AMULET/CANCEL`）

### モーダル状態

| ステップ | 説明 |
|---------|------|
| `select_piece` | デッキからピースを選択 |
| `sculpt_edit` | 形状編集（sculptタイプ専用） |

---

## 護符の効果詳細

### 彫刻（sculpt）

- ピースの形状をブロック単位で編集可能（ON/OFFトグル）
- 既存ブロックのデータ（パターン・シール・加護）は維持される
- 新規ブロックは既存の最初のブロックからパターンを引き継ぎ、シール・加護はなし
- 確定条件: `isShapeConnected()`（BFSによる連結性検証）+ ブロック1個以上

### パターン付与（pattern_add）

- `SHOP_AVAILABLE_PATTERNS`（enhanced, lucky, feather, nohand, charge）からランダム選択
- 既存のパターンは上書きされる
- 内部で `createPieceWithPattern()` を使用してピースを再生成

### シール付与（seal_add）

- `SHOP_AVAILABLE_SEALS` からランダム選択
- ピースのブロック位置からランダムに1つ選択してシール付与
- 既存のシールがある場合は上書き

### 消去（vanish）

- デッキから対象ミノを完全削除
- `deck.cards`、`deck.allMinos`、`deck.purchasedPieces` の3つから削除

---

## ショップでの出現

- レリック枠の1つが30%の確率で護符に置換される
- 護符タイプは全4種からランダム選択
- 価格は各護符の `minPrice〜maxPrice` の範囲でランダム決定
- セール対象に含まれる
- Jesterレリック所持時は30%OFF対象

---

## GameAction

| アクション | パラメータ | 説明 |
|-----------|-----------|------|
| `AMULET/USE` | `amuletIndex: number` | 護符使用開始 |
| `AMULET/SELECT_PIECE` | `minoId: MinoId` | ピース選択 |
| `AMULET/CONFIRM` | — | sculpt確定 |
| `AMULET/CANCEL` | — | 操作キャンセル |
| `AMULET/SELL` | `amuletIndex: number` | 護符売却 |
| `AMULET/SCULPT_TOGGLE_BLOCK` | `row, col: number` | sculpt中のブロックトグル |

デバッグ用:

| アクション | パラメータ | 説明 |
|-----------|-----------|------|
| `DEBUG/ADD_AMULET` | `amuletType: AmuletType` | 護符追加 |
| `DEBUG/REMOVE_AMULET` | `amuletIndex: number` | 護符削除 |

---

## 護符の将来拡張候補

| 護符名 | 効果 |
|---|---|
| 複製の護符 | デッキ内のピースを1つ複製して追加 |
| 拡大の護符 | ピースに1ブロックをくっつける |
| 変容の護符 | ピースのパターンを別のパターンに変更 |
| 浄化の護符 | ピースのパターン/シールを除去 |

---

## データ構造

### Amulet型（Domain/Effect/Amulet.ts）

```typescript
interface Amulet {
  readonly id: AmuletId
  readonly type: AmuletType
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly price: number  // 購入時の価格（売却額計算用）
}
```

### AmuletModalState型（Domain/Effect/AmuletModalState.ts）

```typescript
interface AmuletModalState {
  readonly amuletType: AmuletType
  readonly amuletIndex: number
  readonly step: AmuletModalStep  // 'select_piece' | 'sculpt_edit'
  readonly selectedMinoId: MinoId | null
  readonly editingShape: PieceShape | null
}
```

### PlayerState（護符関連フィールド）

```typescript
interface PlayerState {
  readonly amuletStock: readonly Amulet[]  // 護符ストック（最大2個）
  // ...
}
```

---

## 関連ファイル

- `src/lib/game/Domain/Effect/Amulet.ts` — 護符定義・型・マスターデータ
- `src/lib/game/Domain/Effect/AmuletModalState.ts` — 護符モーダル状態型
- `src/lib/game/Services/AmuletEffectService.ts` — 護符効果適用（純粋関数）
- `src/lib/game/Services/ShopService.ts` — 護符ショップ生成（`generateAmuletShopItem`）
- `src/lib/game/State/Actions/GameActions.ts` — 護符アクション定義
- `src/lib/game/State/Reducers/GameReducer.ts` — 護符アクション処理
- `src/lib/game/Domain/Player/PlayerState.ts` — 護符ストック管理
- `src/components/renderer/AmuletModalRenderer.ts` — 護符モーダル描画

---

## 更新履歴

- 2026-02-22: 実装済みの内容に合わせて全面更新（価格帯、ショップ出現仕様、使用フロー、GameAction、データ構造、関連ファイル追加）
- 2026-02-19: relic-system.mdから分離して独立ファイル化
- 2026-02-17: レリック中心設計の一環として護符システム追加

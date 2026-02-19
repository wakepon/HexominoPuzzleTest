# アーキテクチャ詳細

## モジュール依存関係

```
GameContainer ─→ useGame (dispatch) ─→ GameReducer ─→ Services
     │                                      │
     ├→ useCanvasLayout                     ├→ BoardService
     │                                      ├→ LineService ─→ PatternEffectHandler
     └→ GameCanvas ─→ renderer/*            │                  RelicEffectHandler
                                            │                  SealEffectHandler
                                            ├→ PieceService
                                            ├→ DeckService
                                            ├→ RoundService
                                            ├→ ShopService ─→ ShopPriceCalculator
                                            ├→ AmuletEffectService
                                            ├→ ClearingCellService
                                            └→ StorageService
```

## Service 関数一覧

### BoardService.ts - 盤面操作
```typescript
createEmptyBoard(): Board
placePieceOnBoard(board, piece, position): Board
placePieceShapeOnBoard(board, shape, position, blockSetId, pattern?, seal?): Board
getCell(board, position): Cell | null
placeObstacleOnBoard(board, positions): Board
incrementChargeValues(board, excludeBlockSetId?): Board
```

### LineService.ts - ライン完成検出・スコア計算（最重要）
```typescript
findCompletedLines(board): CompletedLines         // 完成行/列の検出
getCellsToRemove(completedLines): ClearingCell[]   // 消去対象セル取得
getCellsToRemoveWithFilter(completedLines, board): ClearingCell[]  // 石シール考慮
calculateScore(completedLines): number             // 基本スコア計算
calculateScoreWithEffects(                         // 全効果込みスコア計算
  completedLines, board, ownedRelics, relicMultiplierState,
  relicDisplayOrder, lastPlacedPieceCellCount?, remainingHands?
): { score, breakdown, goldGained, ... }
clearLines(board, cellsToClear): Board             // ライン消去実行
```

### PieceService.ts - ピース生成
```typescript
selectCategory(rng, weights?): MinoCategory
selectMinoFromCategory(category, rng): MinoDefinition
createPiece(mino): Piece
createPieceWithPattern(mino, pattern, rng): Piece
createPieceWithSeal(mino, seal, rng): Piece
createPieceWithPatternAndSeal(mino, pattern, seal, rng): Piece
createPieceFromShape(idPrefix, shape): Piece
generatePieceSet(rng, count, patternProb?, sealProb?): Piece[]
getPiecePattern(piece): PatternId | null
getPieceSize(shape): { width, height }
getPieceCellCount(shape): number
```

### DeckService.ts - デッキ操作
```typescript
getDeckMinoIds(): string[]
shuffleDeck(cards, rng): string[]
drawFromDeck(deck, count, rng, patternProb?, sealProb?): { pieces, newDeck }
minoIdToPiece(minoId, rng, patternProb?, sealProb?): Piece | null
createInitialDeckState(rng): DeckState
createInitialDeckStateWithParams(rng, minoIds): DeckState
drawPiecesFromDeck(deck, rng, patternProb?, sealProb?): { slots, newDeck }
drawPiecesFromDeckWithCount(deck, count, rng, patternProb?, sealProb?): { slots, newDeck }
decrementRemainingHands(deck): DeckState
```

### RoundService.ts - ラウンド進行
```typescript
calculateTargetScore(round): number
getBaseReward(roundType): number
calculateGoldReward(remainingHands, roundType): number
calculateInterest(currentGold): number
isRoundCleared(score, targetScore): boolean
isFinalRound(round): boolean
selectRandomBossCondition(rng): BossCondition
createRoundInfo(round, rng): RoundInfo
getMaxPlacements(roundInfo): number
getDrawCount(roundInfo): number
```

### ShopService.ts - ショップ
```typescript
generateShopItems(deck, round, rng, patternProb?, sealProb?): ShopItem[]
generateRelicShopItems(ownedRelics, rng): ShopItem[]
generateAmuletShopItem(rng): ShopItem
createShopState(deck, round, ownedRelics, rng, options?): ShopState
getRerollCost(rerollCount): number
canAfford(gold, price): boolean
markItemAsPurchased(shopState, itemIndex): ShopState
shuffleCurrentDeck(shopState): ShopState
```

### CollisionService.ts - 配置バリデーション
```typescript
canPlacePiece(board, piece, position): boolean
screenToBoardPosition(screenX, screenY, layout): Position | null
canPieceBePlacedAnywhere(board, piece): boolean
isPositionInBoard(position): boolean
```

### AmuletEffectService.ts - 護符効果
```typescript
applyPatternAdd(deck, minoId, rng): DeckState
applySealAdd(deck, minoId, rng): DeckState
applyVanish(deck, minoId): DeckState
applySculpt(deck, minoId, editedShape): DeckState
isShapeConnected(shape): boolean
```

### ShopPriceCalculator.ts - 価格計算
```typescript
getPatternPrice(patternId): number
getSealPrice(sealId): number
calculatePiecePrice(piece): number
calculateSalePrice(originalPrice): number
calculateRelicSellPrice(price): number
```

### ClearingCellService.ts - 消去アニメーション
```typescript
createSequentialClearingCells(cells, board): ClearingCell[]  // delay, pattern, seal付与
```

### StorageService.ts - セーブ/ロード
```typescript
saveGameState(state): void
loadGameState(): SavedGameState | null
clearGameState(): void
hasSavedGame(): boolean
restoreGameState(saved, rng): GameState
```

### TooltipService.ts - ツールチップ
```typescript
calculateTooltipState(mouseX, mouseY, board, layout, ownedRelics, ...): TooltipState
```

## Renderer 関数一覧

| ファイル | 主要関数 | 責務 |
|---------|---------|------|
| boardRenderer | `renderBoard(ctx, board, layout, clearingCells)` | ボード描画。clearingCells=除外セル |
| cellRenderer | `drawWoodenCell(ctx, x, y, size, pattern?, seal?, chargeValue?)` | 個別セル描画 |
| pieceRenderer | `renderPieceSlots(ctx, slots, layout, dragState)` | スロット内ピース描画 |
| previewRenderer | `renderPlacementPreview(ctx, board, slots, dragState, layout)` | 配置プレビュー |
| clearAnimationRenderer | `renderClearAnimation(ctx, animation, layout): boolean` | 消去アニメーション |
| scoreAnimationRenderer | `renderScoreAnimation(ctx, scoreAnim, formulaY): RenderResult` | スコア式表示 |
| relicEffectRenderer | `renderRelicEffect(ctx, animation, layout): boolean` | レリック発動演出 |
| relicPanelRenderer | `renderRelicPanel(ctx, relics, layout, ...)` | レリックアイコン列 |
| statusPanelRenderer | `renderStatusPanel(ctx, data, layout)` | 左側ステータス |
| shopRenderer | `renderShop(ctx, shopState, gold, layout, ...)` | ショップ画面 |
| overlayRenderer | `renderRoundClear / renderGameOver / renderGameClear` | 各種オーバーレイ |
| RoundProgressRenderer | `renderRoundProgress(ctx, round, roundInfo, target, layout)` | ラウンド進行画面 |
| StockSlotRenderer | `renderStockSlot(ctx, piece, layout, dragState)` | ストック枠 |
| DeckViewRenderer | `renderDeckView(ctx, deck, slots, layout)` | デッキ一覧 |
| AmuletModalRenderer | `renderAmuletModal(ctx, modal, deck, layout)` | 護符モーダル |
| tooltipRenderer | `renderTooltip(ctx, tooltip, width, height)` | ツールチップ |
| debugRenderer | `renderDebugWindow(ctx, deck, settings, gold, score, relics)` | デバッグ |

## Effect処理チェーン（スコア計算時）

```
LineService.calculateScoreWithEffects()
  ├→ PatternEffectHandler.calculatePatternEffects()
  │    ├→ calculateEnhancedBonus()  → ブロック点+2
  │    ├→ calculateAuraBonus()      → 隣接ブロック点+1
  │    ├→ rollLuckyMultiplier()     → 10%で列点×2
  │    ├→ calculateComboBonus()     → 同時消去ブロック点
  │    └→ calculateMossBonus()      → 端接触で列点+1
  ├→ SealEffectHandler.calculateSealEffects()
  │    ├→ filterClearableCells()    → 石シール除外
  │    ├→ calculateGoldCount()     → ゴールドシール
  │    ├→ calculateScoreBonus()    → スコアシール+5
  │    └→ calculateMultiBonus()    → マルチシール×2
  └→ RelicEffectHandler.calculateRelicEffects()
       ├→ checkRelicActivations()  → 発動判定
       └→ applyRelicEffectsToScore() → 列点乗算
```

# Dead Code Analysis Report

**Generated:** 2026-02-19
**Tools Used:** knip v5.84.1, ts-prune v0.10.3, depcheck

---

## Summary

| Category | Count |
|----------|-------|
| 削除したファイル | 6 |
| 削除した関数/定数 | 9 |
| 修正したファイル | 5 |
| 未使用 devDependencies | 5 (eslint config不在のため) |

---

## 1. 削除したファイル

| ファイル | 理由 |
|---------|------|
| `src/components/renderer/roundRenderer.ts` | 未参照レンダラー |
| `src/components/renderer/scoreRenderer.ts` | 未参照レンダラー |
| `src/components/renderer/uiRenderer.ts` | 未参照レンダラー |
| `src/hooks/useGameEvents.ts` | 未参照hook |
| `src/lib/game/Events/index.ts` | 未参照バレルファイル |
| `src/lib/game/index.ts` | 未参照レガシーバレルファイル |

## 2. 削除した関数・定数

| 項目 | ファイル | 理由 |
|------|---------|------|
| `BASE_CELL_SIZE` | Data/Constants.ts | 未参照定数 |
| `SLOT_COUNT` | Data/Constants.ts | 未参照定数 |
| `SCORE_STYLE` | Data/Constants.ts | roundRenderer等でのみ使用 |
| `HANDS_STYLE` | Data/Constants.ts | uiRendererでのみ使用 |
| `GOLD_STYLE` | Data/Constants.ts | uiRendererでのみ使用 |
| `ROUND_STYLE` | Data/Constants.ts | roundRendererでのみ使用 |
| `placePieceShapeOnBoard` | Services/BoardService.ts | @deprecated、未参照 |
| `getCell` (function版) | Services/BoardService.ts | Domain/Board/Board.ts版が使用されている |
| `isValidPhaseTransition` | Domain/Round/GamePhase.ts | 未参照 |
| `hasSavedGame` | Services/StorageService.ts | 未参照 |
| `drawWoodenCellSmall` | renderer/cellRenderer.ts | 未参照 |
| `renderPieceShape` | renderer/pieceRenderer.ts | @deprecated、未参照 |

## 3. エクスポート修正

| 項目 | ファイル | 変更 |
|------|---------|------|
| `drawSealSymbol` | renderer/cellRenderer.ts | export → private（内部使用のみ） |

## 4. 未使用 devDependencies（要検討）

eslint config ファイル（.eslintrc等）が存在しないため、以下は完全に未使用:

| パッケージ | 備考 |
|-----------|------|
| `eslint` | config不在 |
| `@typescript-eslint/eslint-plugin` | config不在 |
| `@typescript-eslint/parser` | config不在 |
| `eslint-plugin-react-hooks` | config不在 |
| `eslint-plugin-react-refresh` | config不在 |

**注**: lint script (`npm run lint`) は存在するが実行不可。eslint configの作成 or 削除が必要。

### 使用中（depcheckの誤検知）
| パッケージ | 使用箇所 |
|-----------|---------|
| `tailwindcss` | tailwind.config.js, src/index.css |
| `autoprefixer` | postcss.config.js |
| `postcss` | postcss.config.js |

---

## 5. 検証結果

```
✅ TypeScript型チェック: パス
✅ 全テストパス: 43 tests (3 files)
✅ ビルド成功: 102 modules transformed
```

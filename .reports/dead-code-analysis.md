# Dead Code Analysis Report

**Generated:** 2026-02-08
**Tools Used:** knip, depcheck

---

## Summary

| Category | Count |
|----------|-------|
| 削除したファイル（合計） | 10 |
| 修正したファイル | 15 |
| 未使用 devDependencies | 7 (保持推奨) |

---

## 1. 削除完了したファイル ✅

### 第1回クリーンアップで削除

| ファイル | 理由 |
|---------|------|
| `src/lib/game/boardLogic.ts` | 後方互換エイリアス |
| `src/lib/game/deckLogic.ts` | 後方互換エイリアス |
| `src/lib/game/roundLogic.ts` | 後方互換エイリアス |
| `src/lib/game/Data/index.ts` | 未使用インデックス |
| `src/lib/game/Services/index.ts` | 未使用インデックス |
| `src/lib/game/Utils/index.ts` | 未使用インデックス |

### 第2回クリーンアップで削除（インポート移行後）

| ファイル | 理由 |
|---------|------|
| `src/lib/game/constants.ts` | Data/Constants への移行完了 |
| `src/lib/game/collisionDetection.ts` | Services/CollisionService への移行完了 |
| `src/lib/game/pieceDefinitions.ts` | Services/PieceService への移行完了 |
| `src/lib/game/shopLogic.ts` | Services/ShopService への移行完了 |

---

## 2. 修正したファイル

### インポートパスの変更

| ファイル | 変更内容 |
|---------|---------|
| `src/components/GameCanvas.tsx` | constants → Data/Constants, collisionDetection → Services/CollisionService, pieceDefinitions → Services/PieceService, shopLogic → Services/ShopService |
| `src/components/renderer/boardRenderer.ts` | constants → Data/Constants |
| `src/components/renderer/cellRenderer.ts` | constants → Data/Constants |
| `src/components/renderer/clearAnimationRenderer.ts` | constants → Data/Constants |
| `src/components/renderer/debugRenderer.ts` | constants → Data/Constants |
| `src/components/renderer/overlayRenderer.ts` | constants → Data/Constants |
| `src/components/renderer/pieceRenderer.ts` | constants → Data/Constants |
| `src/components/renderer/previewRenderer.ts` | constants → Data/Constants, collisionDetection → Services/CollisionService |
| `src/components/renderer/relicEffectRenderer.ts` | constants → Data/Constants |
| `src/components/renderer/relicPanelRenderer.ts` | constants → Data/Constants |
| `src/components/renderer/roundRenderer.ts` | constants → Data/Constants |
| `src/components/renderer/scoreRenderer.ts` | constants → Data/Constants |
| `src/components/renderer/shopRenderer.ts` | constants → Data/Constants |
| `src/components/renderer/tooltipRenderer.ts` | constants → Data/Constants |
| `src/components/renderer/uiRenderer.ts` | constants → Data/Constants |
| `src/lib/game/lineLogic.test.ts` | boardLogic → Services/BoardService |

---

## 3. 将来使用予定（保持）

| ファイル | 理由 |
|---------|------|
| `src/hooks/useGameEvents.ts` | デバッグ/ログ用hook。将来使用予定 |
| `src/lib/game/index.ts` | メインエントリポイント。公開API用 |
| `src/lib/game/Events/index.ts` | useGameEvents.tsから参照される |

---

## 4. 未使用 devDependencies（保持推奨）

これらは `npm run lint` や CSS ビルドで使用されるため削除しません。

| パッケージ | 使用目的 |
|-----------|---------|
| `@typescript-eslint/eslint-plugin` | ESLint TypeScript プラグイン |
| `@typescript-eslint/parser` | ESLint TypeScript パーサー |
| `autoprefixer` | PostCSS ベンダープレフィックス |
| `eslint-plugin-react-hooks` | React Hooks Lint ルール |
| `eslint-plugin-react-refresh` | React Refresh 用 Lint |
| `postcss` | Tailwind CSS 依存 |
| `tailwindcss` | スタイリング |

---

## 5. 検証結果

```
✅ 全テストパス (43 tests)
✅ ビルド成功 (90 modules transformed)
✅ 10ファイル削除完了
✅ 15ファイルのインポートパス統一
```

---

## 6. 効果

- **コードベースの簡素化**: 後方互換エイリアスファイル10個を削除
- **インポートパスの統一**: 全ての参照が正式な層構造に従うようになった
- **保守性向上**: 将来の変更箇所が明確になった

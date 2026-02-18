/**
 * 護符モーダルの描画
 *
 * 護符使用時のUI:
 * - select_piece: デッキ全ピース一覧からピースを選択
 * - sculpt_edit: グリッドでブロック追加/削除
 */

import type { CanvasLayout } from '../../lib/game/types'
import type { AmuletModalState } from '../../lib/game/Domain/Effect/AmuletModalState'
import type { DeckState } from '../../lib/game/Domain/Deck/DeckState'
import type { MinoId } from '../../lib/game/Domain/Core/Id'
import type { ButtonArea } from './overlayRenderer'
import { getMinoById } from '../../lib/game/Data/MinoDefinitions'
import { COLORS, CELL_STYLE, PATTERN_COLORS } from '../../lib/game/Data/Constants'
import { isShapeConnected } from '../../lib/game/Services/AmuletEffectService'
import { getPatternDefinition } from '../../lib/game/Domain/Effect/Pattern'

/**
 * ピース選択領域
 */
export interface PieceSelectArea extends ButtonArea {
  minoId: MinoId
}

/**
 * セルトグル領域（sculpt_edit用）
 */
export interface SculptCellArea extends ButtonArea {
  row: number
  col: number
}

/**
 * モーダル描画結果
 */
export interface AmuletModalRenderResult {
  /** ピース選択領域（select_pieceステップ） */
  pieceAreas: PieceSelectArea[]
  /** セルトグル領域（sculpt_editステップ） */
  sculptCellAreas: SculptCellArea[]
  /** 確定ボタン（sculpt_editステップ） */
  confirmButton: ButtonArea | null
  /** キャンセルボタン */
  cancelButton: ButtonArea
}

/**
 * ミノ形状を小さく描画（ピース選択用）
 */
function drawMiniPiece(
  ctx: CanvasRenderingContext2D,
  minoId: MinoId,
  deck: DeckState,
  x: number,
  y: number,
  cellSize: number
): { width: number; height: number } {
  const mino = getMinoById(minoId)
  if (!mino) return { width: 0, height: 0 }

  // purchasedPiecesにある場合はそちらを使用
  const purchasedPiece = deck.purchasedPieces.get(minoId)
  const shape = purchasedPiece ? purchasedPiece.shape : mino.shape

  const { padding, highlightWidth, shadowWidth } = CELL_STYLE

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (!shape[row][col]) continue

      const cellX = x + col * cellSize
      const cellY = y + row * cellSize

      // パターン色判定
      let pattern: string | null = null
      if (purchasedPiece) {
        const blockData = purchasedPiece.blocks.get(`${row},${col}`)
        pattern = blockData?.pattern ?? null
      }

      const colors = pattern && PATTERN_COLORS[pattern]
        ? PATTERN_COLORS[pattern]
        : { base: COLORS.piece, highlight: COLORS.pieceHighlight, shadow: COLORS.pieceShadow }

      ctx.fillStyle = colors.base
      ctx.fillRect(cellX + padding, cellY + padding, cellSize - padding * 2, cellSize - padding * 2)

      ctx.fillStyle = colors.highlight
      ctx.fillRect(cellX + padding, cellY + padding, cellSize - padding * 2, highlightWidth)
      ctx.fillRect(cellX + padding, cellY + padding, highlightWidth, cellSize - padding * 2)

      ctx.fillStyle = colors.shadow
      ctx.fillRect(cellX + padding, cellY + cellSize - padding - shadowWidth, cellSize - padding * 2, shadowWidth)
      ctx.fillRect(cellX + cellSize - padding - shadowWidth, cellY + padding, shadowWidth, cellSize - padding * 2)

      // パターン記号
      if (pattern) {
        const patternDef = getPatternDefinition(pattern)
        if (patternDef) {
          const fontSize = Math.max(6, Math.floor(cellSize * 0.35))
          ctx.save()
          ctx.font = `bold ${fontSize}px Arial`
          ctx.fillStyle = '#FFFFFF'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(patternDef.symbol, cellX + cellSize / 2, cellY + cellSize / 2)
          ctx.restore()
        }
      }
    }
  }

  return {
    width: shape[0].length * cellSize,
    height: shape.length * cellSize,
  }
}

/**
 * ピース選択ステップを描画
 */
function renderSelectPieceStep(
  ctx: CanvasRenderingContext2D,
  modal: AmuletModalState,
  deck: DeckState,
  layout: CanvasLayout
): { pieceAreas: PieceSelectArea[]; cancelButton: ButtonArea } {
  const centerX = layout.canvasWidth / 2
  const centerY = layout.canvasHeight / 2

  // オーバーレイ
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
  ctx.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight)

  // タイトル
  const amuletTypeNames: Record<string, string> = {
    sculpt: '彫刻 - ピースを選択',
    pattern_add: 'パターン付与 - ピースを選択',
    seal_add: 'シール付与 - ピースを選択',
    vanish: '消去 - 削除するピースを選択',
  }
  ctx.font = 'bold 18px Arial, sans-serif'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(amuletTypeNames[modal.amuletType] ?? 'ピースを選択', centerX, 40)

  // デッキ全ピース（重複除去）を表示
  const uniqueMinoIds = [...new Set(deck.allMinos)]
  const cellSize = 14
  const itemWidth = 90
  const itemHeight = 100
  const cols = Math.min(5, uniqueMinoIds.length)
  const rows = Math.ceil(uniqueMinoIds.length / cols)
  const totalWidth = cols * itemWidth
  const totalHeight = rows * itemHeight
  const startX = centerX - totalWidth / 2
  const startY = centerY - totalHeight / 2

  const pieceAreas: PieceSelectArea[] = []

  uniqueMinoIds.forEach((minoId, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    const boxX = startX + col * itemWidth
    const boxY = startY + row * itemHeight

    // ボックス背景
    ctx.fillStyle = 'rgba(60, 60, 80, 0.9)'
    ctx.beginPath()
    ctx.roundRect(boxX + 2, boxY + 2, itemWidth - 4, itemHeight - 4, 6)
    ctx.fill()

    // ボックス枠線
    ctx.strokeStyle = '#888888'
    ctx.lineWidth = 1
    ctx.stroke()

    // ミノ形状描画
    const mino = getMinoById(minoId)
    if (mino) {
      const purchasedPiece = deck.purchasedPieces.get(minoId)
      const shape = purchasedPiece ? purchasedPiece.shape : mino.shape
      const pieceWidth = shape[0].length * cellSize
      const pieceHeight = shape.length * cellSize
      const px = boxX + (itemWidth - pieceWidth) / 2
      const py = boxY + (itemHeight - pieceHeight) / 2 - 5

      drawMiniPiece(ctx, minoId, deck, px, py, cellSize)
    }

    // ミノ名（短縮）
    ctx.font = '9px Arial, sans-serif'
    ctx.fillStyle = '#AAAAAA'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(minoId.replace(/-\d+-[a-z0-9]+$/, ''), boxX + itemWidth / 2, boxY + itemHeight - 5)

    pieceAreas.push({
      minoId,
      x: boxX + 2,
      y: boxY + 2,
      width: itemWidth - 4,
      height: itemHeight - 4,
    })
  })

  // キャンセルボタン
  const cancelWidth = 120
  const cancelHeight = 36
  const cancelX = centerX - cancelWidth / 2
  const cancelY = startY + totalHeight + 20

  ctx.fillStyle = '#CC5555'
  ctx.beginPath()
  ctx.roundRect(cancelX, cancelY, cancelWidth, cancelHeight, 8)
  ctx.fill()

  ctx.font = 'bold 14px Arial, sans-serif'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('キャンセル', cancelX + cancelWidth / 2, cancelY + cancelHeight / 2)

  return {
    pieceAreas,
    cancelButton: { x: cancelX, y: cancelY, width: cancelWidth, height: cancelHeight },
  }
}

/**
 * 形状編集ステップを描画
 */
function renderSculptEditStep(
  ctx: CanvasRenderingContext2D,
  modal: AmuletModalState,
  layout: CanvasLayout
): { sculptCellAreas: SculptCellArea[]; confirmButton: ButtonArea; cancelButton: ButtonArea } {
  const centerX = layout.canvasWidth / 2
  const centerY = layout.canvasHeight / 2

  // オーバーレイ
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
  ctx.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight)

  const shape = modal.editingShape
  if (!shape) {
    return {
      sculptCellAreas: [],
      confirmButton: { x: -1, y: -1, width: 0, height: 0 },
      cancelButton: { x: -1, y: -1, width: 0, height: 0 },
    }
  }

  // タイトル
  ctx.font = 'bold 18px Arial, sans-serif'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('形状を編集（クリックでトグル）', centerX, centerY - 180)

  // グリッド描画
  const cellSize = 40
  const rows = shape.length
  const cols = shape[0].length
  const gridWidth = cols * cellSize
  const gridHeight = rows * cellSize
  const gridX = centerX - gridWidth / 2
  const gridY = centerY - gridHeight / 2

  const sculptCellAreas: SculptCellArea[] = []

  // 連結性チェック
  const connected = isShapeConnected(shape)
  const blockCount = shape.reduce((sum, row) => sum + row.filter(Boolean).length, 0)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = gridX + col * cellSize
      const y = gridY + row * cellSize

      if (shape[row][col]) {
        // ブロックあり
        ctx.fillStyle = '#A0522D'
        ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4)

        // ハイライト
        ctx.fillStyle = '#CD853F'
        ctx.fillRect(x + 2, y + 2, cellSize - 4, 3)
        ctx.fillRect(x + 2, y + 2, 3, cellSize - 4)

        // シャドウ
        ctx.fillStyle = '#5D3A1A'
        ctx.fillRect(x + 2, y + cellSize - 5, cellSize - 4, 3)
        ctx.fillRect(x + cellSize - 5, y + 2, 3, cellSize - 4)
      } else {
        // ブロックなし（空セル）
        ctx.fillStyle = 'rgba(100, 100, 100, 0.3)'
        ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4)
      }

      // 枠線
      ctx.strokeStyle = '#666666'
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, cellSize, cellSize)

      sculptCellAreas.push({
        row,
        col,
        x,
        y,
        width: cellSize,
        height: cellSize,
      })
    }
  }

  // 連結性の警告
  if (!connected && blockCount > 0) {
    ctx.font = 'bold 14px Arial, sans-serif'
    ctx.fillStyle = '#FF6666'
    ctx.textAlign = 'center'
    ctx.fillText('形状が分断されています', centerX, gridY + gridHeight + 25)
  }

  // ボタン配置
  const buttonY = gridY + gridHeight + 50
  const btnWidth = 100
  const btnHeight = 36
  const btnGap = 20

  // 確定ボタン
  const confirmX = centerX - btnWidth - btnGap / 2
  const canConfirm = connected && blockCount > 0
  ctx.fillStyle = canConfirm ? '#4CAF50' : '#555555'
  ctx.beginPath()
  ctx.roundRect(confirmX, buttonY, btnWidth, btnHeight, 8)
  ctx.fill()

  ctx.font = 'bold 14px Arial, sans-serif'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('確定', confirmX + btnWidth / 2, buttonY + btnHeight / 2)

  // キャンセルボタン
  const cancelX = centerX + btnGap / 2
  ctx.fillStyle = '#CC5555'
  ctx.beginPath()
  ctx.roundRect(cancelX, buttonY, btnWidth, btnHeight, 8)
  ctx.fill()

  ctx.fillStyle = '#FFFFFF'
  ctx.fillText('キャンセル', cancelX + btnWidth / 2, buttonY + btnHeight / 2)

  return {
    sculptCellAreas,
    confirmButton: { x: confirmX, y: buttonY, width: btnWidth, height: btnHeight },
    cancelButton: { x: cancelX, y: buttonY, width: btnWidth, height: btnHeight },
  }
}

/**
 * 護符モーダルを描画
 */
export function renderAmuletModal(
  ctx: CanvasRenderingContext2D,
  modal: AmuletModalState,
  deck: DeckState,
  layout: CanvasLayout
): AmuletModalRenderResult {
  ctx.save()

  if (modal.step === 'select_piece') {
    const result = renderSelectPieceStep(ctx, modal, deck, layout)
    ctx.restore()
    return {
      pieceAreas: result.pieceAreas,
      sculptCellAreas: [],
      confirmButton: null,
      cancelButton: result.cancelButton,
    }
  }

  if (modal.step === 'sculpt_edit') {
    const result = renderSculptEditStep(ctx, modal, layout)
    ctx.restore()
    return {
      pieceAreas: [],
      sculptCellAreas: result.sculptCellAreas,
      confirmButton: result.confirmButton,
      cancelButton: result.cancelButton,
    }
  }

  ctx.restore()
  return {
    pieceAreas: [],
    sculptCellAreas: [],
    confirmButton: null,
    cancelButton: { x: -1, y: -1, width: 0, height: 0 },
  }
}

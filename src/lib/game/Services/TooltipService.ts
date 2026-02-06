/**
 * ツールチップ用ヒットテストサービス
 */

import type { Position, GameState, CanvasLayout, PieceSlot, Board, ShopState } from '../Domain'
import type { EffectInfo, TooltipState } from '../Domain/Tooltip'
import type { BlockData } from '../Domain/Piece/BlockData'
import { INITIAL_TOOLTIP_STATE } from '../Domain/Tooltip'
import { getPatternDefinition } from '../Domain/Effect/Pattern'
import { getSealDefinition } from '../Domain/Effect/Seal'
import { LAYOUT, SHOP_STYLE, GRID_SIZE } from '../Data/Constants'
import { BlockDataMapUtils } from '../Domain/Piece/BlockData'

/** ショップアイテムボックス内の最大セル数 */
const SHOP_ITEM_CELLS_WIDTH = 6

/**
 * BlockDataからエフェクト情報を取得
 */
function getEffectsFromBlockData(blockData: BlockData): EffectInfo[] {
  const effects: EffectInfo[] = []

  if (blockData.pattern) {
    const patternDef = getPatternDefinition(blockData.pattern)
    if (patternDef) {
      effects.push({ name: patternDef.name, description: patternDef.description })
    }
  }

  if (blockData.seal) {
    const sealDef = getSealDefinition(blockData.seal)
    if (sealDef) {
      effects.push({ name: sealDef.name, description: sealDef.description })
    }
  }

  return effects
}

/**
 * ボード上のセルからエフェクト情報を取得
 */
function getEffectsFromBoardCell(
  board: Board,
  gridX: number,
  gridY: number
): EffectInfo[] {
  if (gridX < 0 || gridX >= GRID_SIZE || gridY < 0 || gridY >= GRID_SIZE) {
    return []
  }

  const cell = board[gridY][gridX]
  if (!cell.filled) {
    return []
  }

  const effects: EffectInfo[] = []

  if (cell.pattern) {
    const patternDef = getPatternDefinition(cell.pattern)
    if (patternDef) {
      effects.push({
        name: patternDef.name,
        description: patternDef.description,
      })
    }
  }

  if (cell.seal) {
    const sealDef = getSealDefinition(cell.seal)
    if (sealDef) {
      effects.push({
        name: sealDef.name,
        description: sealDef.description,
      })
    }
  }

  return effects
}

/**
 * ボード領域のヒットテスト
 */
function hitTestBoard(
  pos: Position,
  board: Board,
  layout: CanvasLayout
): EffectInfo[] {
  const { boardOffsetX, boardOffsetY, cellSize } = layout

  // ボード領域内かチェック
  const boardWidth = GRID_SIZE * cellSize
  const boardHeight = GRID_SIZE * cellSize

  if (
    pos.x < boardOffsetX ||
    pos.x >= boardOffsetX + boardWidth ||
    pos.y < boardOffsetY ||
    pos.y >= boardOffsetY + boardHeight
  ) {
    return []
  }

  // グリッド座標に変換
  const gridX = Math.floor((pos.x - boardOffsetX) / cellSize)
  const gridY = Math.floor((pos.y - boardOffsetY) / cellSize)

  return getEffectsFromBoardCell(board, gridX, gridY)
}

/**
 * ピーススロット領域のヒットテスト
 */
function hitTestSlots(
  pos: Position,
  slots: readonly PieceSlot[],
  layout: CanvasLayout
): EffectInfo[] {
  const slotCellSize = layout.cellSize * LAYOUT.slotCellSizeRatio

  for (const slot of slots) {
    if (!slot.piece) continue

    const slotPos = slot.position
    const shape = slot.piece.shape

    // ピースの各セルをチェック
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (!shape[row][col]) continue

        const cellX = slotPos.x + col * slotCellSize
        const cellY = slotPos.y + row * slotCellSize

        // マウス位置がセル内かチェック
        if (
          pos.x >= cellX &&
          pos.x < cellX + slotCellSize &&
          pos.y >= cellY &&
          pos.y < cellY + slotCellSize
        ) {
          const blockData = BlockDataMapUtils.get(slot.piece.blocks, row, col)
          if (!blockData) continue

          const effects = getEffectsFromBlockData(blockData)
          if (effects.length > 0) {
            return effects
          }
        }
      }
    }
  }

  return []
}

/**
 * ショップ領域のヒットテスト
 */
function hitTestShop(
  pos: Position,
  shopState: ShopState,
  layout: CanvasLayout
): EffectInfo[] {
  const { canvasWidth, canvasHeight, cellSize } = layout
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2

  const shopCellSize = cellSize * SHOP_STYLE.cellSizeRatio
  const itemCount = shopState.items.length
  const totalWidth =
    itemCount * (shopCellSize * SHOP_ITEM_CELLS_WIDTH + SHOP_STYLE.itemBoxPadding * 2) +
    (itemCount - 1) * SHOP_STYLE.itemBoxGap
  const startX = centerX - totalWidth / 2

  for (let i = 0; i < shopState.items.length; i++) {
    const item = shopState.items[i]
    if (item.type !== 'block' || !item.piece) continue

    const itemWidth = shopCellSize * SHOP_ITEM_CELLS_WIDTH + SHOP_STYLE.itemBoxPadding * 2
    const itemX = startX + i * (itemWidth + SHOP_STYLE.itemBoxGap)
    const itemY = centerY + SHOP_STYLE.itemsOffsetY

    const shape = item.piece.shape
    const shapeWidth = shape[0].length * shopCellSize
    const pieceX = itemX + SHOP_STYLE.itemBoxPadding + (shopCellSize * SHOP_ITEM_CELLS_WIDTH - shapeWidth) / 2
    const pieceY = itemY + SHOP_STYLE.itemBoxPadding + SHOP_STYLE.shapeVerticalOffset

    // ピースの各セルをチェック
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (!shape[row][col]) continue

        const cellX = pieceX + col * shopCellSize
        const cellY = pieceY + row * shopCellSize

        // マウス位置がセル内かチェック
        if (
          pos.x >= cellX &&
          pos.x < cellX + shopCellSize &&
          pos.y >= cellY &&
          pos.y < cellY + shopCellSize
        ) {
          const blockData = BlockDataMapUtils.get(item.piece.blocks, row, col)
          if (!blockData) continue

          const effects = getEffectsFromBlockData(blockData)
          if (effects.length > 0) {
            return effects
          }
        }
      }
    }
  }

  return []
}

/**
 * マウス位置からツールチップ状態を計算
 */
export function calculateTooltipState(
  pos: Position,
  state: GameState,
  layout: CanvasLayout
): TooltipState {
  // ショッピングフェーズの場合はショップをチェック
  if (state.phase === 'shopping' && state.shopState) {
    const shopEffects = hitTestShop(pos, state.shopState, layout)
    if (shopEffects.length > 0) {
      return {
        visible: true,
        x: pos.x,
        y: pos.y,
        effects: shopEffects,
      }
    }
    return INITIAL_TOOLTIP_STATE
  }

  // プレイ中はボードとスロットをチェック
  if (state.phase === 'playing') {
    // まずボードをチェック
    const boardEffects = hitTestBoard(pos, state.board, layout)
    if (boardEffects.length > 0) {
      return {
        visible: true,
        x: pos.x,
        y: pos.y,
        effects: boardEffects,
      }
    }

    // 次にスロットをチェック
    const slotEffects = hitTestSlots(pos, state.pieceSlots, layout)
    if (slotEffects.length > 0) {
      return {
        visible: true,
        x: pos.x,
        y: pos.y,
        effects: slotEffects,
      }
    }
  }

  return INITIAL_TOOLTIP_STATE
}

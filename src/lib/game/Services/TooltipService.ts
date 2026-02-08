/**
 * ツールチップ用ヒットテストサービス
 */

import type { Position, GameState, CanvasLayout, PieceSlot, Board, ShopState } from '../Domain'
import type { EffectInfo, TooltipState } from '../Domain/Tooltip'
import type { BlockData } from '../Domain/Piece/BlockData'
import type { RelicId } from '../Domain/Core/Id'
import { INITIAL_TOOLTIP_STATE } from '../Domain/Tooltip'
import { getPatternDefinition } from '../Domain/Effect/Pattern'
import { getSealDefinition } from '../Domain/Effect/Seal'
import { getRelicDefinition } from '../Domain/Effect/Relic'
import { HD_LAYOUT, SHOP_STYLE, GRID_SIZE, RELIC_PANEL_STYLE } from '../Data/Constants'
import { BlockDataMapUtils } from '../Domain/Piece/BlockData'
import { isBlockShopItem, isRelicShopItem } from '../Domain/Shop/ShopTypes'


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
  const slotCellSize = layout.cellSize * HD_LAYOUT.slotCellSizeRatio

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]
    if (!slot.piece) continue

    // layout.slotPositionsから実際の描画位置を取得
    const slotPos = layout.slotPositions[i]
    // レイアウト再計算中にslotPositionsとslotsの数が一致しない場合はスキップ
    if (!slotPos) continue

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

/** ショップアイテムボックスのセル数（ヘキソミノ最大6x6 + 余白で7） */
const SHOP_BOX_CELLS = 7
/** ショップアイテムボックスの価格表示用追加高さ */
const SHOP_BOX_PRICE_HEIGHT = 30

/**
 * ショップ領域のヒットテスト
 * 座標計算はshopRenderer.tsのrenderShop/renderBlockShopItem/renderPieceShapeと同一
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

  // shopRenderer.tsと同じボックスサイズ計算
  const boxWidth = SHOP_BOX_CELLS * shopCellSize + SHOP_STYLE.itemBoxPadding * 2
  const boxHeight = SHOP_BOX_CELLS * shopCellSize + SHOP_STYLE.itemBoxPadding * 2 + SHOP_BOX_PRICE_HEIGHT

  // shopRenderer.tsと同じレイアウト計算（ブロックアイテムのみをフィルタ）
  const blockItems = shopState.items.filter(isBlockShopItem)
  const blockTotalWidth = boxWidth * blockItems.length + SHOP_STYLE.itemBoxGap * (blockItems.length - 1)
  const startX = centerX - blockTotalWidth / 2
  const boxY = centerY + SHOP_STYLE.itemsOffsetY - boxHeight / 2

  // フィルタ後のインデックスで座標計算
  for (let blockIndex = 0; blockIndex < blockItems.length; blockIndex++) {
    const item = blockItems[blockIndex]
    if (!item.piece) continue

    const boxX = startX + blockIndex * (boxWidth + SHOP_STYLE.itemBoxGap)

    const shape = item.piece.shape
    const rows = shape.length
    const cols = shape[0].length
    const shapeWidth = cols * shopCellSize
    const shapeHeight = rows * shopCellSize

    // shopRenderer.tsのrenderBlockShopItem/renderPieceShapeと同じ座標計算
    const shapeCenterX = boxX + boxWidth / 2
    const shapeCenterY = boxY + boxHeight / 2 - SHOP_STYLE.shapeVerticalOffset
    const pieceX = shapeCenterX - shapeWidth / 2
    const pieceY = shapeCenterY - shapeHeight / 2

    // ピースの各セルをチェック
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
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
 * レリックパネル領域のヒットテスト
 * relicPanelRenderer.tsと同じ座標計算を使用（HDレイアウト対応）
 */
function hitTestRelicPanel(
  pos: Position,
  ownedRelics: readonly RelicId[]
): EffectInfo[] {
  if (ownedRelics.length === 0) return []

  const { iconSize, iconGap } = RELIC_PANEL_STYLE
  const panelX = HD_LAYOUT.relicAreaX
  const startY = HD_LAYOUT.relicAreaY
  const panelWidth = HD_LAYOUT.relicAreaWidth

  for (let i = 0; i < ownedRelics.length; i++) {
    const relicId = ownedRelics[i]
    const def = getRelicDefinition(relicId)
    if (!def) continue

    // relicPanelRenderer.tsと同じ計算
    const iconX = panelX + panelWidth / 2 - (iconSize + 8) / 2
    const iconY = startY + 30 + i * (iconSize + iconGap + 10)

    // アイコン領域内かチェック
    if (
      pos.x >= iconX &&
      pos.x < iconX + iconSize + 8 &&
      pos.y >= iconY &&
      pos.y < iconY + iconSize + 8
    ) {
      return [{ name: def.name, description: def.description }]
    }
  }

  return []
}

/**
 * ショップのレリック商品ヒットテスト
 * shopRenderer.tsと同じ座標計算を使用
 */
function hitTestShopRelics(
  pos: Position,
  shopState: ShopState,
  layout: CanvasLayout
): EffectInfo[] {
  const { canvasWidth, canvasHeight, cellSize } = layout
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2

  const shopCellSize = cellSize * SHOP_STYLE.cellSizeRatio

  // shopRenderer.tsと同じボックスサイズ計算（ブロック行の高さに必要）
  const blockBoxHeight = SHOP_BOX_CELLS * shopCellSize + SHOP_STYLE.itemBoxPadding * 2 + SHOP_BOX_PRICE_HEIGHT

  // レリックアイテムをフィルタ
  const relicItems = shopState.items.filter(isRelicShopItem)

  if (relicItems.length === 0) return []

  // ブロック行の配置（レリック行の基準位置計算に必要）
  const blockBoxY = centerY + SHOP_STYLE.itemsOffsetY - blockBoxHeight / 2

  // レリック行の配置
  const { relicBoxWidth, relicBoxHeight, relicRowOffsetY } = SHOP_STYLE
  const relicTotalWidth = relicBoxWidth * relicItems.length + SHOP_STYLE.itemBoxGap * (relicItems.length - 1)
  const relicStartX = centerX - relicTotalWidth / 2
  const relicBoxY = blockBoxY + blockBoxHeight + relicRowOffsetY

  // レリック商品のヒットテスト
  for (let i = 0; i < relicItems.length; i++) {
    const item = relicItems[i]
    const boxX = relicStartX + i * (relicBoxWidth + SHOP_STYLE.itemBoxGap)

    // ボックス領域内かチェック
    if (
      pos.x >= boxX &&
      pos.x < boxX + relicBoxWidth &&
      pos.y >= relicBoxY &&
      pos.y < relicBoxY + relicBoxHeight
    ) {
      const def = getRelicDefinition(item.relicId)
      if (def) {
        return [{ name: def.name, description: def.description }]
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
  // 所持レリックパネルは全フェーズで常にチェック（最優先）
  const relicPanelEffects = hitTestRelicPanel(pos, state.player.ownedRelics)
  if (relicPanelEffects.length > 0) {
    return {
      visible: true,
      x: pos.x,
      y: pos.y,
      effects: relicPanelEffects,
    }
  }

  // ショッピングフェーズの場合はショップをチェック
  if (state.phase === 'shopping' && state.shopState) {
    // ショップのレリック商品をチェック
    const shopRelicEffects = hitTestShopRelics(pos, state.shopState, layout)
    if (shopRelicEffects.length > 0) {
      return {
        visible: true,
        x: pos.x,
        y: pos.y,
        effects: shopRelicEffects,
      }
    }

    // ショップのブロック商品をチェック
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

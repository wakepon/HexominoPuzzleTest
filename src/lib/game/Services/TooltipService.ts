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
import { getRelicDefinition, RELIC_DEFINITIONS } from '../Domain/Effect/Relic'
import { getBlessingDefinition } from '../Domain/Effect/Blessing'
import { getBuffDefinition, getBuffDescription } from '../Domain/Effect/Buff'
import { calculateRelicSellPrice } from './ShopPriceCalculator'
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

  if (blockData.blessing) {
    const blessingDef = getBlessingDefinition(blockData.blessing)
    if (blessingDef) {
      effects.push({
        name: blessingDef.name,
        description: blessingDef.description,
      })
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
  const effects: EffectInfo[] = []

  // パターン・シールはfilledセルのみ
  if (cell.filled) {
    if (cell.pattern) {
      const patternDef = getPatternDefinition(cell.pattern)
      if (patternDef) {
        const description = cell.pattern === 'charge'
          ? `${patternDef.description}（現在: +${cell.chargeValue}）`
          : patternDef.description
        effects.push({
          name: patternDef.name,
          description,
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

    if (cell.blockBlessing) {
      const blessingDef = getBlessingDefinition(cell.blockBlessing)
      if (blessingDef) {
        effects.push({
          name: blessingDef.name,
          description: blessingDef.description,
        })
      }
    }
  }

  // バフは空セルでも表示（消去後もセルに残る永続効果）
  if (cell.buff && cell.buffLevel > 0) {
    const buffDef = getBuffDefinition(cell.buff)
    if (buffDef) {
      const desc = getBuffDescription(cell.buff, cell.buffLevel)
      if (desc) {
        effects.push({
          name: buffDef.name,
          description: desc,
        })
      }
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

/**
 * ショップ領域のヒットテスト
 * 座標計算はshopRenderer.tsのrenderShop/renderBlockShopItem/renderPieceShapeと同一
 */
function hitTestShop(
  pos: Position,
  shopState: ShopState,
  layout: CanvasLayout
): EffectInfo[] {
  const { canvasWidth, canvasHeight } = layout
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2

  const { relicBoxWidth, relicBoxHeight, relicRowOffsetY } = SHOP_STYLE

  // ブロック行はレリックと同じボックスサイズ
  const boxWidth = relicBoxWidth
  const boxHeight = relicBoxHeight

  // ボックス内のcellSize算出（shopRenderer.tsと同一）
  const maxCellW = boxWidth / 7
  const maxCellH = (boxHeight - 40) / 6
  const shopCellSize = Math.min(maxCellW, maxCellH)

  // レリック行Y → ブロック行Y（shopRenderer.tsと同一）
  const relicRowY = centerY + SHOP_STYLE.itemsOffsetY - relicBoxHeight / 2
  const blockRowY = relicRowY + relicBoxHeight + relicRowOffsetY

  // shopRenderer.tsと同じレイアウト計算（ブロックアイテムのみをフィルタ）
  const blockItems = shopState.items.filter(isBlockShopItem)
  const blockTotalWidth = boxWidth * blockItems.length + SHOP_STYLE.itemBoxGap * (blockItems.length - 1)
  const startX = centerX - blockTotalWidth / 2
  const boxY = blockRowY

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

  const { slotSize, slotGap } = RELIC_PANEL_STYLE
  const panelX = HD_LAYOUT.relicAreaX
  const startY = HD_LAYOUT.relicAreaY

  for (let i = 0; i < ownedRelics.length; i++) {
    const relicId = ownedRelics[i]
    const def = getRelicDefinition(relicId)
    if (!def) continue

    // relicPanelRenderer.tsと同じスロット座標計算
    const slotY = startY + i * (slotSize + slotGap)

    // スロット全体（80x80）でヒット判定
    if (
      pos.x >= panelX &&
      pos.x < panelX + slotSize &&
      pos.y >= slotY &&
      pos.y < slotY + slotSize
    ) {
      // 売却額を計算して表示
      const relicType = relicId as string
      const relicDef = RELIC_DEFINITIONS[relicType as keyof typeof RELIC_DEFINITIONS]
      const sellPrice = relicDef ? calculateRelicSellPrice(relicDef.price) : 0
      const descWithSellPrice = `${def.description}\n売却額: ${sellPrice}G`
      return [{ name: def.name, description: descWithSellPrice, rarity: def.rarity }]
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
  const { canvasWidth, canvasHeight } = layout
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2

  // レリックアイテムをフィルタ
  const relicItems = shopState.items.filter(isRelicShopItem)

  if (relicItems.length === 0) return []

  // レリック行の配置（上段 - shopRenderer.tsと同一）
  const { relicBoxWidth, relicBoxHeight } = SHOP_STYLE
  const relicTotalWidth = relicBoxWidth * relicItems.length + SHOP_STYLE.itemBoxGap * (relicItems.length - 1)
  const relicStartX = centerX - relicTotalWidth / 2
  const relicBoxY = centerY + SHOP_STYLE.itemsOffsetY - relicBoxHeight / 2

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
        return [{ name: def.name, description: def.description, rarity: def.rarity }]
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
  const relicPanelEffects = hitTestRelicPanel(pos, state.player.relicDisplayOrder)
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

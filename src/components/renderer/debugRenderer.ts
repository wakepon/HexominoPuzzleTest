/**
 * デバッグウィンドウの描画
 */

import { DeckState, PieceShape } from '../../lib/game/types'
import { DEBUG_WINDOW_STYLE, COLORS } from '../../lib/game/Data/Constants'
import { getMinoById } from '../../lib/game/minoDefinitions'
import type { DebugSettings } from '../../lib/game/Domain/Debug'
import { RELIC_DEFINITIONS, type RelicType } from '../../lib/game/Domain/Effect/Relic'
import type { RelicId } from '../../lib/game/Domain/Core/Id'

/**
 * ボタン領域の型定義
 */
export interface ButtonArea {
  x: number
  y: number
  width: number
  height: number
}

/**
 * レリックボタン領域の型定義
 */
export interface RelicButtonArea extends ButtonArea {
  relicType: RelicType
  isOwned: boolean
}

/**
 * デバッグウィンドウの描画結果
 */
export interface DebugWindowRenderResult {
  patternPlusButton: ButtonArea
  patternMinusButton: ButtonArea
  sealPlusButton: ButtonArea
  sealMinusButton: ButtonArea
  deleteSaveButton: ButtonArea
  windowBounds: ButtonArea
  // レリック操作ボタン
  relicButtons: RelicButtonArea[]
  // ゴールド操作ボタン
  goldMinus50Button: ButtonArea
  goldMinus10Button: ButtonArea
  goldPlus10Button: ButtonArea
  goldPlus50Button: ButtonArea
  // スコア操作ボタン
  scoreMinus50Button: ButtonArea
  scoreMinus10Button: ButtonArea
  scorePlus10Button: ButtonArea
  scorePlus50Button: ButtonArea
}

/**
 * ミノ形状を小さいセルで描画
 */
function drawMiniMino(
  ctx: CanvasRenderingContext2D,
  shape: PieceShape,
  x: number,
  y: number,
  cellSize: number
): { width: number; height: number } {
  const rows = shape.length
  const cols = shape[0]?.length ?? 0

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (shape[row][col]) {
        const cellX = x + col * cellSize
        const cellY = y + row * cellSize

        // ベース色
        ctx.fillStyle = COLORS.piece
        ctx.fillRect(cellX, cellY, cellSize - 1, cellSize - 1)

        // ハイライト（上端と左端）- セルが小さいので1pxのみ
        ctx.fillStyle = COLORS.pieceHighlight
        ctx.fillRect(cellX, cellY, cellSize - 1, 1)
        ctx.fillRect(cellX, cellY, 1, cellSize - 1)

        // シャドウ（下端と右端）
        ctx.fillStyle = COLORS.pieceShadow
        ctx.fillRect(cellX, cellY + cellSize - 2, cellSize - 1, 1)
        ctx.fillRect(cellX + cellSize - 2, cellY, 1, cellSize - 1)
      }
    }
  }

  return {
    width: cols * cellSize,
    height: rows * cellSize,
  }
}

/**
 * ミノ形状のサイズを取得
 */
function getMinoSize(shape: PieceShape, cellSize: number): { width: number; height: number } {
  const rows = shape.length
  const cols = shape[0]?.length ?? 0
  return {
    width: cols * cellSize,
    height: rows * cellSize,
  }
}

/**
 * +/-ボタンを描画
 */
function drawProbabilityButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  buttonColor: string,
  textColor: string,
  fontSize: number
): void {
  // ボタン背景
  ctx.fillStyle = buttonColor
  ctx.fillRect(x, y, width, height)

  // ボタン枠
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, width, height)

  // ボタンテキスト
  ctx.fillStyle = textColor
  ctx.font = `bold ${fontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + width / 2, y + height / 2)
}

/**
 * 確率設定行を描画
 */
function drawProbabilityRow(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: number,
  x: number,
  y: number,
  windowWidth: number,
  padding: number
): { minusButton: ButtonArea; plusButton: ButtonArea } {
  const ps = DEBUG_WINDOW_STYLE.probabilitySection

  // ラベル
  ctx.fillStyle = ps.labelColor
  ctx.font = `${ps.labelFontSize}px ${DEBUG_WINDOW_STYLE.fontFamily}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x + padding, y + ps.rowHeight / 2)

  // ボタンと値の配置計算（右端から配置）
  const rightEdge = x + windowWidth - padding
  const plusX = rightEdge - ps.buttonWidth
  const valueX = plusX - ps.valueWidth
  const minusX = valueX - ps.buttonGap - ps.buttonWidth
  const buttonY = y + (ps.rowHeight - ps.buttonHeight) / 2

  // マイナスボタン
  drawProbabilityButton(
    ctx, minusX, buttonY, ps.buttonWidth, ps.buttonHeight,
    '-', ps.buttonColor, ps.buttonTextColor, ps.buttonFontSize
  )

  // 値表示
  ctx.fillStyle = ps.valueColor
  ctx.font = `bold ${ps.valueFontSize}px ${DEBUG_WINDOW_STYLE.fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${value}%`, valueX + ps.valueWidth / 2, y + ps.rowHeight / 2)

  // プラスボタン
  drawProbabilityButton(
    ctx, plusX, buttonY, ps.buttonWidth, ps.buttonHeight,
    '+', ps.buttonColor, ps.buttonTextColor, ps.buttonFontSize
  )

  return {
    minusButton: { x: minusX, y: buttonY, width: ps.buttonWidth, height: ps.buttonHeight },
    plusButton: { x: plusX, y: buttonY, width: ps.buttonWidth, height: ps.buttonHeight },
  }
}

/**
 * 値調整行を描画（4ボタン: -50, -10, +10, +50）
 */
function drawValueAdjustRow(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: number,
  x: number,
  y: number,
  _windowWidth: number,
  padding: number
): { minus50: ButtonArea; minus10: ButtonArea; plus10: ButtonArea; plus50: ButtonArea } {
  const vs = DEBUG_WINDOW_STYLE.valueSection

  // ラベル
  ctx.fillStyle = vs.labelColor
  ctx.font = `${vs.labelFontSize}px ${DEBUG_WINDOW_STYLE.fontFamily}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x + padding, y + vs.rowHeight / 2)

  // 値表示
  const valueCenterX = x + padding + vs.labelWidth + vs.valueWidth / 2
  ctx.fillStyle = vs.valueColor
  ctx.font = `bold ${vs.valueFontSize}px ${DEBUG_WINDOW_STYLE.fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${value}`, valueCenterX, y + vs.rowHeight / 2)

  // ボタン配置（値の右側に4つ）
  const buttonsStartX = x + padding + vs.labelWidth + vs.valueWidth + vs.buttonGap
  const buttonY = y + (vs.rowHeight - vs.buttonHeight) / 2
  const buttons = [
    { text: '-50', delta: -50 },
    { text: '-10', delta: -10 },
    { text: '+10', delta: 10 },
    { text: '+50', delta: 50 },
  ]

  const buttonAreas: ButtonArea[] = []
  let btnX = buttonsStartX

  for (const btn of buttons) {
    const color = btn.delta < 0 ? '#CC6666' : '#4CAF50'
    drawProbabilityButton(
      ctx, btnX, buttonY, vs.buttonWidth, vs.buttonHeight,
      btn.text, color, vs.buttonTextColor, vs.buttonFontSize
    )
    buttonAreas.push({ x: btnX, y: buttonY, width: vs.buttonWidth, height: vs.buttonHeight })
    btnX += vs.buttonWidth + vs.buttonGap
  }

  return {
    minus50: buttonAreas[0],
    minus10: buttonAreas[1],
    plus10: buttonAreas[2],
    plus50: buttonAreas[3],
  }
}

/**
 * レリックセクションを描画
 */
function drawRelicSection(
  ctx: CanvasRenderingContext2D,
  ownedRelics: readonly RelicId[],
  x: number,
  y: number,
  _windowWidth: number,
  padding: number
): { relicButtons: RelicButtonArea[]; sectionHeight: number } {
  const rs = DEBUG_WINDOW_STYLE.relicSection
  const allRelicTypes = Object.keys(RELIC_DEFINITIONS) as RelicType[]

  // セクションラベル
  ctx.fillStyle = rs.labelColor
  ctx.font = `${rs.labelFontSize}px ${DEBUG_WINDOW_STYLE.fontFamily}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('Relics (click to toggle)', x + padding, y)

  const iconsY = y + rs.labelFontSize + 4
  const relicButtons: RelicButtonArea[] = []

  // レリックアイコンをグリッド配置
  for (let i = 0; i < allRelicTypes.length; i++) {
    const relicType = allRelicTypes[i]
    const relic = RELIC_DEFINITIONS[relicType]
    const row = Math.floor(i / rs.iconsPerRow)
    const col = i % rs.iconsPerRow

    const iconX = x + padding + col * (rs.iconSize + rs.iconGap)
    const iconY = iconsY + row * (rs.iconSize + rs.iconGap)

    const isOwned = ownedRelics.includes(relicType as RelicId)

    // 背景（所持時はハイライト）
    if (isOwned) {
      ctx.fillStyle = rs.ownedBgColor
      ctx.fillRect(iconX - 1, iconY - 1, rs.iconSize + 2, rs.iconSize + 2)
    }

    // アイコン描画
    ctx.globalAlpha = isOwned ? rs.ownedOpacity : rs.unownedOpacity
    ctx.font = `${rs.iconSize - 4}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(relic.icon, iconX + rs.iconSize / 2, iconY + rs.iconSize / 2)
    ctx.globalAlpha = 1.0

    // 枠線
    ctx.strokeStyle = isOwned ? '#FFD700' : '#666666'
    ctx.lineWidth = 1
    ctx.strokeRect(iconX, iconY, rs.iconSize, rs.iconSize)

    relicButtons.push({
      x: iconX,
      y: iconY,
      width: rs.iconSize,
      height: rs.iconSize,
      relicType,
      isOwned,
    })
  }

  const totalRows = Math.ceil(allRelicTypes.length / rs.iconsPerRow)
  const sectionHeight = rs.labelFontSize + 4 + totalRows * (rs.iconSize + rs.iconGap)

  return { relicButtons, sectionHeight }
}

/**
 * デバッグウィンドウを描画
 * デッキの中身をストックに登場する順（先頭から）にブロック形状で表示する
 */
export function renderDebugWindow(
  ctx: CanvasRenderingContext2D,
  deck: DeckState,
  debugSettings: DebugSettings,
  gold: number,
  score: number,
  ownedRelics: readonly RelicId[]
): DebugWindowRenderResult {
  const {
    backgroundColor,
    titleFontSize,
    titleColor,
    infoFontSize,
    infoColor,
    highlightBgColor,
    fontFamily,
    padding,
    itemPadding,
    cellSize,
    maxItems,
    numberColumnWidth,
    minWindowWidth,
    offsetX,
    offsetY,
  } = DEBUG_WINDOW_STYLE

  const cards = deck.cards
  const displayCount = Math.min(cards.length, maxItems)

  // ミノ形状を取得
  const minoShapes: { id: string; shape: PieceShape }[] = []
  let maxMinoWidth = 0

  for (let i = 0; i < displayCount; i++) {
    const mino = getMinoById(cards[i])
    if (mino) {
      minoShapes.push({ id: cards[i], shape: mino.shape })
      const size = getMinoSize(mino.shape, cellSize)
      maxMinoWidth = Math.max(maxMinoWidth, size.width)
    }
  }

  // ウィンドウサイズを計算
  const titleHeight = titleFontSize + 4
  const infoHeight = infoFontSize + 4
  const headerHeight = titleHeight + infoHeight + padding

  // 各ミノの高さを計算して合計
  let totalMinoHeight = 0
  for (const { shape } of minoShapes) {
    const size = getMinoSize(shape, cellSize)
    totalMinoHeight += size.height + itemPadding
  }

  // 省略テキスト用の高さ
  const ellipsisHeight = cards.length > maxItems ? infoFontSize + 4 : 0

  // 確率設定セクションの高さ
  const ps = DEBUG_WINDOW_STYLE.probabilitySection
  const probabilitySectionHeight = ps.sectionMarginTop + ps.rowHeight * 2 + padding

  // レリックセクションの高さ
  const rs = DEBUG_WINDOW_STYLE.relicSection
  const allRelicTypes = Object.keys(RELIC_DEFINITIONS) as RelicType[]
  const relicRows = Math.ceil(allRelicTypes.length / rs.iconsPerRow)
  const relicSectionHeight = rs.sectionMarginTop + rs.labelFontSize + 4 + relicRows * (rs.iconSize + rs.iconGap) + padding

  // 値調整セクションの高さ（ゴールド + スコア）
  const vs = DEBUG_WINDOW_STYLE.valueSection
  const valueSectionHeight = vs.sectionMarginTop + vs.rowHeight * 2 + padding

  // 削除ボタン用の高さ
  const deleteSaveButtonSectionHeight = 30 + padding

  // ウィンドウ幅を計算（値調整ボタン4つ分を考慮）
  const valueRowWidth = vs.labelWidth + vs.valueWidth + (vs.buttonWidth + vs.buttonGap) * 4 + padding * 2
  const relicRowWidth = rs.iconsPerRow * (rs.iconSize + rs.iconGap) + padding * 2
  const windowWidth = Math.max(maxMinoWidth + padding * 2 + numberColumnWidth + 5, minWindowWidth, 130, valueRowWidth, relicRowWidth)
  const windowHeight = headerHeight + totalMinoHeight + ellipsisHeight + probabilitySectionHeight + relicSectionHeight + valueSectionHeight + deleteSaveButtonSectionHeight + padding

  ctx.save()

  // 背景描画
  ctx.fillStyle = backgroundColor
  ctx.fillRect(offsetX, offsetY, windowWidth, windowHeight)

  // 枠線
  ctx.strokeStyle = titleColor
  ctx.lineWidth = 1
  ctx.strokeRect(offsetX, offsetY, windowWidth, windowHeight)

  // タイトル描画
  ctx.font = `bold ${titleFontSize}px ${fontFamily}`
  ctx.fillStyle = titleColor
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  let y = offsetY + padding
  ctx.fillText('DECK', offsetX + padding, y)
  y += titleHeight

  // 残りカード数とハンド数
  ctx.font = `${infoFontSize}px ${fontFamily}`
  ctx.fillStyle = infoColor
  ctx.fillText(`${cards.length}枚 / ${deck.remainingHands}手`, offsetX + padding, y)
  y += infoHeight + padding / 2

  // デッキの中身をミノ形状で表示（先頭から順に）
  for (let i = 0; i < minoShapes.length; i++) {
    const { shape } = minoShapes[i]
    const size = getMinoSize(shape, cellSize)

    // 先頭（次に出るミノ）の背景ハイライト
    if (i === 0) {
      ctx.fillStyle = highlightBgColor
      ctx.fillRect(
        offsetX + padding - 2,
        y - 2,
        windowWidth - padding * 2 + 4,
        size.height + itemPadding
      )
    }

    // 番号表示
    ctx.font = `${infoFontSize}px ${fontFamily}`
    ctx.fillStyle = i === 0 ? titleColor : infoColor
    ctx.textAlign = 'right'
    ctx.textBaseline = 'top'
    ctx.fillText(`${i + 1}.`, offsetX + padding + numberColumnWidth - 5, y + (size.height - infoFontSize) / 2)

    // ミノ形状を描画
    drawMiniMino(ctx, shape, offsetX + padding + numberColumnWidth, y, cellSize)

    y += size.height + itemPadding
  }

  // 省略表示
  if (cards.length > maxItems) {
    ctx.font = `${infoFontSize}px ${fontFamily}`
    ctx.fillStyle = infoColor
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(`+${cards.length - maxItems}枚`, offsetX + padding, y)
    y += infoFontSize + 4
  }

  // 確率設定セクション
  y += ps.sectionMarginTop

  // セパレータライン
  ctx.strokeStyle = titleColor
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(offsetX + padding, y - ps.sectionMarginTop / 2)
  ctx.lineTo(offsetX + windowWidth - padding, y - ps.sectionMarginTop / 2)
  ctx.stroke()

  // パターン確率
  const patternButtons = drawProbabilityRow(
    ctx, 'Pattern', debugSettings.patternProbability,
    offsetX, y, windowWidth, padding
  )
  y += ps.rowHeight

  // シール確率
  const sealButtons = drawProbabilityRow(
    ctx, 'Seal', debugSettings.sealProbability,
    offsetX, y, windowWidth, padding
  )
  y += ps.rowHeight

  // セパレータライン
  y += padding / 2
  ctx.strokeStyle = titleColor
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(offsetX + padding, y)
  ctx.lineTo(offsetX + windowWidth - padding, y)
  ctx.stroke()
  y += padding / 2

  // レリックセクション
  y += rs.sectionMarginTop
  const relicResult = drawRelicSection(ctx, ownedRelics, offsetX, y, windowWidth, padding)
  y += relicResult.sectionHeight

  // セパレータライン
  ctx.strokeStyle = titleColor
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(offsetX + padding, y)
  ctx.lineTo(offsetX + windowWidth - padding, y)
  ctx.stroke()
  y += padding / 2

  // 値調整セクション（ゴールド/スコア）
  y += vs.sectionMarginTop

  // ゴールド調整
  const goldButtons = drawValueAdjustRow(ctx, 'Gold', gold, offsetX, y, windowWidth, padding)
  y += vs.rowHeight

  // スコア調整
  const scoreButtons = drawValueAdjustRow(ctx, 'Score', score, offsetX, y, windowWidth, padding)
  y += vs.rowHeight

  // セパレータライン
  y += padding / 2
  ctx.strokeStyle = titleColor
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(offsetX + padding, y)
  ctx.lineTo(offsetX + windowWidth - padding, y)
  ctx.stroke()
  y += padding / 2

  // セーブデータ削除ボタン
  const deleteButtonWidth = windowWidth - padding * 2
  const deleteButtonHeight = 22
  const deleteButtonX = offsetX + padding
  const deleteButtonY = y

  drawProbabilityButton(
    ctx, deleteButtonX, deleteButtonY, deleteButtonWidth, deleteButtonHeight,
    'Delete Save', '#CC3333', '#FFFFFF', 11
  )

  ctx.restore()

  return {
    patternPlusButton: patternButtons.plusButton,
    patternMinusButton: patternButtons.minusButton,
    sealPlusButton: sealButtons.plusButton,
    sealMinusButton: sealButtons.minusButton,
    deleteSaveButton: { x: deleteButtonX, y: deleteButtonY, width: deleteButtonWidth, height: deleteButtonHeight },
    windowBounds: { x: offsetX, y: offsetY, width: windowWidth, height: windowHeight },
    relicButtons: relicResult.relicButtons,
    goldMinus50Button: goldButtons.minus50,
    goldMinus10Button: goldButtons.minus10,
    goldPlus10Button: goldButtons.plus10,
    goldPlus50Button: goldButtons.plus50,
    scoreMinus50Button: scoreButtons.minus50,
    scoreMinus10Button: scoreButtons.minus10,
    scorePlus10Button: scoreButtons.plus10,
    scorePlus50Button: scoreButtons.plus50,
  }
}

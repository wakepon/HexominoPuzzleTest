/**
 * 所持レリックパネルの描画（正方形スロットデザイン）
 */

import type { RelicId } from '../../lib/game/Domain/Core/Id'
import type { CanvasLayout } from '../../lib/game/types'
import { getRelicDefinition } from '../../lib/game/Domain/Effect/Relic'
import { HD_LAYOUT, MAX_RELIC_SLOTS, RELIC_PANEL_STYLE } from '../../lib/game/Data/Constants'
import { JESTER_SLOT_REDUCTION } from '../../lib/game/Domain/Effect/Relics/Jester'

/**
 * レリックアイコンの位置情報（ドラッグ&ドロップ用）
 */
export interface RelicIconArea {
  readonly relicId: RelicId
  readonly index: number
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/**
 * レリックパネルの描画結果
 */
export interface RelicPanelRenderResult {
  readonly relicAreas: readonly RelicIconArea[]
}

/**
 * スロットのY座標を計算
 */
function getSlotY(index: number, startY: number): number {
  const { slotSize, slotGap } = RELIC_PANEL_STYLE
  return startY + index * (slotSize + slotGap)
}

/**
 * グロー背景を描画するヘルパー
 */
function drawGlow(
  ctx: CanvasRenderingContext2D,
  slotX: number,
  slotY: number,
  slotSize: number,
  shadowColor: string,
  shadowBlur: number,
  fillColor: string
): void {
  ctx.shadowColor = shadowColor
  ctx.shadowBlur = shadowBlur
  ctx.fillStyle = fillColor
  ctx.beginPath()
  ctx.roundRect(slotX, slotY, slotSize, slotSize, 6)
  ctx.fill()
  ctx.shadowBlur = 0
}

/**
 * 所持レリックパネルを描画（HDレイアウト: ボードの左側に縦配置、正方形スロット）
 */
export function renderRelicPanel(
  ctx: CanvasRenderingContext2D,
  ownedRelics: readonly RelicId[],
  _layout?: CanvasLayout,
  highlightedRelicId?: RelicId | null,
  dragState?: {
    isDragging: boolean
    dragIndex: number | null
    currentY: number
    dropTargetIndex: number | null
  } | null,
  grayedOutRelics?: ReadonlySet<RelicId>,
  timingBonusRelicId?: RelicId | null,
  copyLinkRelics?: ReadonlySet<RelicId>
): RelicPanelRenderResult {
  const {
    slotSize, slotBorderWidth,
    slotBorderColor, slotEmptyBorderColor,
    slotBackgroundColor, slotEmptyBackgroundColor,
    iconSize,
  } = RELIC_PANEL_STYLE
  const panelX = HD_LAYOUT.relicAreaX
  const startY = HD_LAYOUT.relicAreaY
  const relicAreas: RelicIconArea[] = []

  ctx.save()

  // jester所持時はスロット数を1減らす
  const hasJester = ownedRelics.includes('jester' as RelicId)
  const effectiveSlots = hasJester ? MAX_RELIC_SLOTS - JESTER_SLOT_REDUCTION : MAX_RELIC_SLOTS

  // スロット枠を描画
  for (let i = 0; i < effectiveSlots; i++) {
    const slotY = getSlotY(i, startY)
    const hasRelic = i < ownedRelics.length

    // スロット背景
    ctx.fillStyle = hasRelic ? slotBackgroundColor : slotEmptyBackgroundColor
    ctx.beginPath()
    ctx.roundRect(panelX, slotY, slotSize, slotSize, 4)
    ctx.fill()

    // スロット枠線
    ctx.strokeStyle = hasRelic ? slotBorderColor : slotEmptyBorderColor
    ctx.lineWidth = slotBorderWidth
    ctx.beginPath()
    ctx.roundRect(panelX, slotY, slotSize, slotSize, 4)
    ctx.stroke()
  }

  // レリックアイコンを描画
  if (ownedRelics.length > 0) {
    ctx.font = `${iconSize + 8}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ownedRelics.forEach((relicId, index) => {
      const def = getRelicDefinition(relicId)
      if (!def) return

      const iconX = panelX + slotSize / 2
      const slotY = getSlotY(index, startY)
      let iconY = slotY + slotSize / 2

      // ドラッグ中のレリック位置調整
      const isDragTarget = dragState?.isDragging && dragState.dragIndex === index
      if (isDragTarget) {
        iconY = dragState.currentY
        ctx.globalAlpha = 0.5
      }

      // ドロップ先インジケーター表示
      if (dragState?.isDragging && dragState.dropTargetIndex === index && dragState.dragIndex !== index) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)'
        ctx.beginPath()
        ctx.roundRect(panelX, slotY, slotSize, slotSize, 4)
        ctx.fill()
      }

      // グレーアウト判定
      const isGrayedOut = grayedOutRelics?.has(relicId) ?? false
      const isTimingBonus = timingBonusRelicId === relicId
      const isHighlighted = highlightedRelicId === relicId

      if (isGrayedOut && !isHighlighted && !isDragTarget) {
        ctx.globalAlpha = 0.3
      }

      if (isHighlighted) {
        // 金色グロー背景
        drawGlow(ctx, panelX, slotY, slotSize, '#FFD700', 12, 'rgba(255, 215, 0, 0.25)')

        // パルスアニメーション（拡大効果）
        const pulse = 1 + 0.15 * Math.sin(Date.now() / 200)
        ctx.save()
        ctx.translate(iconX, iconY)
        ctx.scale(pulse, pulse)
        ctx.translate(-iconX, -iconY)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(def.icon, iconX, iconY)
        ctx.restore()
      } else if (isTimingBonus && !isDragTarget) {
        // 青系グロー
        drawGlow(ctx, panelX, slotY, slotSize, '#00BFFF', 8, 'rgba(0, 191, 255, 0.2)')
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(def.icon, iconX, iconY)
      } else if (copyLinkRelics?.has(relicId) && !isDragTarget) {
        // 紫色グロー（コピーリンク表示）
        drawGlow(ctx, panelX, slotY, slotSize, '#9370DB', 8, 'rgba(147, 112, 219, 0.2)')
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(def.icon, iconX, iconY)
      } else {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(def.icon, iconX, iconY)
      }

      if (isDragTarget || isGrayedOut) {
        ctx.globalAlpha = 1.0
      }

      // ヒット領域を記録（スロット全体）
      relicAreas.push({
        relicId,
        index,
        x: panelX,
        y: slotY,
        width: slotSize,
        height: slotSize,
      })
    })
  }

  ctx.restore()

  return { relicAreas }
}

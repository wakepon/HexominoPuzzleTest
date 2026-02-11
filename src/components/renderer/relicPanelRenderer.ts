/**
 * 所持レリックパネルの描画
 */

import type { RelicId } from '../../lib/game/Domain/Core/Id'
import type { CanvasLayout } from '../../lib/game/types'
import { getRelicDefinition } from '../../lib/game/Domain/Effect/Relic'
import { HD_LAYOUT, RELIC_PANEL_STYLE } from '../../lib/game/Data/Constants'

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
 * 所持レリックパネルを描画（HDレイアウト: ボードの左側に縦配置）
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
  } | null
): RelicPanelRenderResult {
  const { iconSize, iconGap } = RELIC_PANEL_STYLE
  const x = HD_LAYOUT.relicAreaX
  const startY = HD_LAYOUT.relicAreaY
  const relicAreas: RelicIconArea[] = []
  const itemHeight = iconSize + iconGap + 10

  ctx.save()

  // レリック置き場のラベル
  ctx.font = '12px Arial, sans-serif'
  ctx.fillStyle = '#AAAAAA'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('レリック置き場', x + HD_LAYOUT.relicAreaWidth / 2, startY)

  // レリック置き場の背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fillRect(x, startY + 20, HD_LAYOUT.relicAreaWidth, HD_LAYOUT.relicAreaHeight - 20)

  // レリックがある場合のみアイコンを描画
  if (ownedRelics.length > 0) {
    ctx.font = `${iconSize + 8}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    ownedRelics.forEach((relicId, index) => {
      const def = getRelicDefinition(relicId)
      if (!def) return

      const iconX = x + HD_LAYOUT.relicAreaWidth / 2
      let iconY = startY + 30 + index * itemHeight

      // ドラッグ中のレリック位置調整
      const isDragTarget = dragState?.isDragging && dragState.dragIndex === index
      if (isDragTarget) {
        // ドラッグ中のアイコンはカーソル位置に追従
        iconY = dragState.currentY - iconSize / 2
        ctx.globalAlpha = 0.5
      }

      // ドロップ先インジケーター表示
      if (dragState?.isDragging && dragState.dropTargetIndex === index && dragState.dragIndex !== index) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)'
        ctx.fillRect(x, startY + 30 + index * itemHeight - 2, HD_LAYOUT.relicAreaWidth, itemHeight)
      }

      // ハイライト描画（スコアアニメーション中）
      const isHighlighted = highlightedRelicId === relicId
      if (isHighlighted) {
        // 金色グロー背景
        const glowX = x + 4
        const glowY = startY + 26 + index * itemHeight
        const glowW = HD_LAYOUT.relicAreaWidth - 8
        const glowH = itemHeight + 4

        ctx.shadowColor = '#FFD700'
        ctx.shadowBlur = 12
        ctx.fillStyle = 'rgba(255, 215, 0, 0.25)'
        ctx.beginPath()
        ctx.roundRect(glowX, glowY, glowW, glowH, 6)
        ctx.fill()
        ctx.shadowBlur = 0

        // パルスアニメーション（拡大効果）
        const pulse = 1 + 0.15 * Math.sin(Date.now() / 200)
        ctx.save()
        ctx.translate(iconX, iconY + iconSize / 2)
        ctx.scale(pulse, pulse)
        ctx.translate(-iconX, -(iconY + iconSize / 2))
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(def.icon, iconX, iconY)
        ctx.restore()
      } else {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(def.icon, iconX, iconY)
      }

      if (isDragTarget) {
        ctx.globalAlpha = 1.0
      }

      // ヒット領域を記録
      relicAreas.push({
        relicId,
        index,
        x: x,
        y: startY + 30 + index * itemHeight,
        width: HD_LAYOUT.relicAreaWidth,
        height: itemHeight,
      })
    })
  }

  ctx.restore()

  return { relicAreas }
}

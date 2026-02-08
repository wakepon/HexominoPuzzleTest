/**
 * 所持レリックパネルの描画
 */

import type { RelicId } from '../../lib/game/Domain/Core/Id'
import type { CanvasLayout } from '../../lib/game/types'
import { getRelicDefinition } from '../../lib/game/Domain/Effect/Relic'
import { HD_LAYOUT, RELIC_PANEL_STYLE } from '../../lib/game/Data/Constants'

/**
 * 所持レリックパネルを描画（HDレイアウト: ボードの左側に縦配置）
 */
export function renderRelicPanel(
  ctx: CanvasRenderingContext2D,
  ownedRelics: readonly RelicId[],
  _layout?: CanvasLayout
): void {
  const { iconSize, iconGap } = RELIC_PANEL_STYLE
  const x = HD_LAYOUT.relicAreaX
  const startY = HD_LAYOUT.relicAreaY

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
    // レリックアイコン（縦配置）
    ctx.font = `${iconSize + 8}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    ownedRelics.forEach((relicId, index) => {
      const def = getRelicDefinition(relicId)
      if (!def) return

      const iconX = x + HD_LAYOUT.relicAreaWidth / 2
      const iconY = startY + 30 + index * (iconSize + iconGap + 10)

      ctx.fillText(def.icon, iconX, iconY)
    })
  }

  ctx.restore()
}

/**
 * 所持レリックパネルの描画
 */

import type { RelicId } from '../../lib/game/Domain/Core/Id'
import { getRelicDefinition } from '../../lib/game/Domain/Effect/Relic'
import { RELIC_PANEL_STYLE } from '../../lib/game/Data/Constants'

/**
 * 所持レリックパネルを描画（ゴールドの右隣）
 */
export function renderRelicPanel(
  ctx: CanvasRenderingContext2D,
  ownedRelics: readonly RelicId[]
): void {
  if (ownedRelics.length === 0) return

  const { iconSize, iconGap, paddingLeft, paddingTop } = RELIC_PANEL_STYLE

  ctx.save()
  ctx.font = `${iconSize}px Arial, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  ownedRelics.forEach((relicId, index) => {
    const def = getRelicDefinition(relicId)
    if (!def) return

    const x = paddingLeft + index * (iconSize + iconGap)
    const y = paddingTop

    ctx.fillText(def.icon, x, y)
  })

  ctx.restore()
}

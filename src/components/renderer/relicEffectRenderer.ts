/**
 * レリック発動エフェクトの描画
 */

import type { RelicActivationAnimationState } from '../../lib/game/Domain/Animation/AnimationState'
import type { CanvasLayout } from '../../lib/game/Domain/Canvas/CanvasLayout'
import { getRelicDefinition } from '../../lib/game/Domain/Effect/Relic'
import { RELIC_EFFECT_STYLE } from '../../lib/game/constants'

/**
 * レリック発動エフェクトを描画
 * @returns アニメーションが完了したかどうか
 */
export function renderRelicEffect(
  ctx: CanvasRenderingContext2D,
  animation: RelicActivationAnimationState,
  layout: CanvasLayout
): boolean {
  const elapsed = Date.now() - animation.startTime
  const progress = Math.min(elapsed / animation.duration, 1)

  // フェードイン/アウト
  const alpha =
    progress < 0.2
      ? progress / 0.2 // フェードイン
      : progress > 0.8
        ? (1 - progress) / 0.2 // フェードアウト
        : 1

  const { canvasWidth, canvasHeight } = layout
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2

  const style = RELIC_EFFECT_STYLE

  // 発動レリックを縦に並べて表示
  const totalHeight =
    animation.activatedRelics.length * (style.popupHeight + style.popupGap)
  let startY = centerY - totalHeight / 2

  for (const relic of animation.activatedRelics) {
    const definition = getRelicDefinition(relic.relicId)
    if (!definition) continue

    const popupX = centerX - style.popupWidth / 2
    const popupY = startY

    ctx.save()
    ctx.globalAlpha = alpha

    // グロー効果
    ctx.shadowColor = style.glowColor
    ctx.shadowBlur = style.glowRadius

    // 背景
    ctx.fillStyle = style.backgroundColor
    ctx.beginPath()
    ctx.roundRect(
      popupX,
      popupY,
      style.popupWidth,
      style.popupHeight,
      style.borderRadius
    )
    ctx.fill()

    // ボーダー
    ctx.strokeStyle = style.borderColor
    ctx.lineWidth = style.borderWidth
    ctx.stroke()

    ctx.shadowBlur = 0

    // アイコン
    ctx.font = `${style.iconSize}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(
      definition.icon,
      popupX + style.iconOffsetX,
      popupY + style.popupHeight / 2
    )

    // レリック名
    ctx.font = `bold ${style.nameFontSize}px ${style.fontFamily}`
    ctx.textAlign = 'left'
    ctx.fillStyle = style.nameColor
    ctx.fillText(
      definition.name,
      popupX + style.nameOffsetX,
      popupY + style.nameOffsetY
    )

    // ボーナス値
    ctx.font = `bold ${style.bonusFontSize}px ${style.fontFamily}`
    ctx.fillStyle = style.bonusColor
    const bonusText =
      typeof relic.bonusValue === 'number'
        ? `+${relic.bonusValue}`
        : relic.bonusValue
    ctx.fillText(bonusText, popupX + style.nameOffsetX, popupY + style.bonusOffsetY)

    ctx.restore()

    startY += style.popupHeight + style.popupGap
  }

  return progress >= 1
}

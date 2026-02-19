/**
 * レリック効果計算ハンドラー
 *
 * レジストリベースのエフェクトエンジンへの橋渡し。
 * 旧APIとの互換性を維持しつつ、内部ではRelicModuleレジストリを使用する。
 */

import type { RelicId } from '../Core/Id'
import type { RelicType } from './Relic'
import type { ActivatedRelicInfo } from './RelicEffectTypes'
import type { ScoreBreakdown } from './PatternEffectTypes'
import { getRelicModule } from './Relics/RelicRegistry'

/**
 * レリックを所持しているか判定
 */
export function hasRelic(
  ownedRelics: readonly RelicId[],
  relicType: RelicType
): boolean {
  return ownedRelics.includes(relicType as RelicId)
}

/**
 * ScoreBreakdownから発動したレリック情報を取得（エフェクト表示用）
 *
 * レジストリベースの動的マップから発動レリックを検出する。
 * 個々のレリックIDのハードコードは不要。
 */
export function getActivatedRelicsFromScoreBreakdown(
  scoreBreakdown: ScoreBreakdown
): ActivatedRelicInfo[] {
  const activated: ActivatedRelicInfo[] = []

  for (const [relicId, effectValue] of scoreBreakdown.relicEffects) {
    // コピーレリックは後で処理
    if (relicId === 'copy') continue

    const module = getRelicModule(relicId)
    if (!module) continue

    switch (module.scoreEffect) {
      case 'multiplicative':
        if (effectValue !== 1) {
          const fmtValue = Number.isInteger(effectValue) ? effectValue : effectValue.toFixed(1)
          activated.push({
            relicId: relicId as RelicId,
            bonusValue: `列点×${fmtValue}`,
          })
        }
        break
      case 'additive':
        if (effectValue > 0) {
          activated.push({
            relicId: relicId as RelicId,
            bonusValue: effectValue,
          })
        }
        break
      case 'line_additive':
        if (effectValue > 0) {
          activated.push({
            relicId: relicId as RelicId,
            bonusValue: `+${effectValue}列`,
          })
        }
        break
      // 'none' は表示しない
    }
  }

  // コピーレリック
  const copyEffectValue = scoreBreakdown.relicEffects.get('copy')
  if (scoreBreakdown.copyTargetRelicId && copyEffectValue !== undefined) {
    const targetModule = getRelicModule(scoreBreakdown.copyTargetRelicId)
    if (targetModule) {
      switch (targetModule.scoreEffect) {
        case 'multiplicative':
          if (copyEffectValue > 1) {
            const fmtValue = Number.isInteger(copyEffectValue) ? copyEffectValue : copyEffectValue.toFixed(1)
            activated.push({
              relicId: 'copy' as RelicId,
              bonusValue: `列点×${fmtValue}`,
            })
          }
          break
        case 'additive':
          if (copyEffectValue > 0) {
            activated.push({
              relicId: 'copy' as RelicId,
              bonusValue: copyEffectValue,
            })
          }
          break
        case 'line_additive':
          if (copyEffectValue > 0) {
            activated.push({
              relicId: 'copy' as RelicId,
              bonusValue: `+${copyEffectValue}列`,
            })
          }
          break
      }
    }
  }

  return activated
}


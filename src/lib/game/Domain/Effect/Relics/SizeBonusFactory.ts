/**
 * サイズボーナスレリックのファクトリ
 *
 * size_bonus_1〜6 は対象サイズ以外同じ構造なので、
 * ファクトリ関数で生成する。
 */

import type { RelicModule, RelicContext, RelicActivation } from './RelicModule'

const SIZE_BONUS_ICONS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣']

export function createSizeBonusRelic(size: number): RelicModule {
  return {
    type: `size_bonus_${size}`,
    definition: {
      name: `${size}サイズボーナス`,
      description: `${size}ブロックのピースでライン消去時、各ブロック点を+1`,
      rarity: 'common',
      price: 10,
      icon: SIZE_BONUS_ICONS[size - 1] ?? `${size}️⃣`,
    },
    scoreEffect: 'additive',

    checkActivation(ctx: RelicContext): RelicActivation {
      const active = ctx.totalLines > 0 && ctx.placedBlockSize === size
      return {
        active,
        // 仮値1（実際はPatternEffectHandlerで消去ブロック数に上書き）
        value: active ? 1 : 0,
        displayLabel: active ? `+ブロック点` : '',
      }
    },
  }
}

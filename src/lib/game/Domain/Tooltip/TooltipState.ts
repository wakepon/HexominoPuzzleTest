/**
 * ツールチップ状態の型定義
 */

import type { RelicRarity } from '../Effect/Relic'

/**
 * ツールチップに表示するエフェクト情報
 */
export interface EffectInfo {
  /** エフェクト名（例: "ゴールドシール"） */
  readonly name: string
  /** 説明文（例: "このブロックが消えると+1G"） */
  readonly description: string
  /** レアリティ（レリックのみ） */
  readonly rarity?: RelicRarity
}

/**
 * ツールチップの表示状態
 */
export interface TooltipState {
  /** 表示中かどうか */
  readonly visible: boolean
  /** マウス位置X */
  readonly x: number
  /** マウス位置Y */
  readonly y: number
  /** 表示するエフェクト情報のリスト（パターンとシール両方の場合は複数） */
  readonly effects: readonly EffectInfo[]
}

/**
 * ツールチップの初期状態
 */
export const INITIAL_TOOLTIP_STATE: TooltipState = {
  visible: false,
  x: 0,
  y: 0,
  effects: [],
}

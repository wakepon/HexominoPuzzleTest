import type { Position } from '../Core/Position'

/**
 * Canvas描画に必要なレイアウト情報
 */
export interface CanvasLayout {
  readonly canvasWidth: number
  readonly canvasHeight: number
  readonly boardOffsetX: number
  readonly boardOffsetY: number
  readonly cellSize: number
  readonly slotAreaY: number
  readonly slotPositions: readonly Position[]
  /** ストック枠の位置（hand_stockレリック所持時のみ設定） */
  readonly stockSlotPosition: Position | null
}

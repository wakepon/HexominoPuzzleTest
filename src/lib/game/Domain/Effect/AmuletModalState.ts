/**
 * 護符モーダルの状態定義
 *
 * 護符使用時のUI状態を管理する。
 * - select_piece: デッキからピースを選択するステップ
 * - sculpt_edit: 形状編集ステップ（sculptタイプ専用）
 */

import type { AmuletType } from './Amulet'
import type { MinoId } from '../Core/Id'
import type { PieceShape } from '../Piece/PieceShape'

/**
 * モーダルのステップ
 */
export type AmuletModalStep = 'select_piece' | 'sculpt_edit'

/**
 * 護符モーダル状態
 */
export interface AmuletModalState {
  /** 使用中の護符の種類 */
  readonly amuletType: AmuletType
  /** 使用中の護符のストック内インデックス */
  readonly amuletIndex: number
  /** 現在のステップ */
  readonly step: AmuletModalStep
  /** 選択されたミノID（sculpt_editステップで使用） */
  readonly selectedMinoId: MinoId | null
  /** 編集中の形状（sculpt_editステップで使用） */
  readonly editingShape: PieceShape | null
}

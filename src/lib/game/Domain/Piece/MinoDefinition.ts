import type { MinoId } from '../Core/Id'
import type { MinoCategory } from './MinoCategory'
import type { PieceShape } from './PieceShape'

/**
 * ミノの静的定義（マスターデータ）
 */
export interface MinoDefinition {
  readonly id: MinoId
  readonly category: MinoCategory
  readonly shape: PieceShape
  readonly cellCount: number
}

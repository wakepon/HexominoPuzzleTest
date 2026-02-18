/**
 * 護符（アミュレット）定義
 *
 * 消費アイテム。デッキ内のピースに効果を適用する。
 * 最大2個ストック可能。
 */

/**
 * 護符ID型（ブランド型）
 */
export type AmuletId = string & { readonly __brand?: 'AmuletId' }

/**
 * 護符の種類
 */
export type AmuletType =
  | 'sculpt'       // 形状編集: ピースのブロックを追加/削除
  | 'pattern_add'  // パターン追加: ランダムなパターンを付与
  | 'seal_add'     // シール追加: ランダムなシールを付与
  | 'vanish'       // 消去: デッキからピースを削除

/**
 * 護符定義
 */
export interface AmuletDefinition {
  readonly id: AmuletId
  readonly type: AmuletType
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly minPrice: number
  readonly maxPrice: number
}

/**
 * 護符インスタンス（ストックに入る実体）
 */
export interface Amulet {
  readonly id: AmuletId
  readonly type: AmuletType
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly price: number  // 購入時の価格（売却額計算用）
}

/**
 * 護符の最大ストック数
 */
export const MAX_AMULET_STOCK = 2

/**
 * 護符定義マスターデータ
 */
export const AMULET_DEFINITIONS: Record<AmuletType, AmuletDefinition> = {
  sculpt: {
    id: 'sculpt' as AmuletId,
    type: 'sculpt',
    name: '彫刻',
    description: 'ピースの形状を編集する（ブロック追加/削除）',
    icon: '🪨',
    minPrice: 8,
    maxPrice: 12,
  },
  pattern_add: {
    id: 'pattern_add' as AmuletId,
    type: 'pattern_add',
    name: 'パターン付与',
    description: 'ピースにランダムなパターンを付与する',
    icon: '✨',
    minPrice: 6,
    maxPrice: 10,
  },
  seal_add: {
    id: 'seal_add' as AmuletId,
    type: 'seal_add',
    name: 'シール付与',
    description: 'ピースにランダムなシールを付与する',
    icon: '🔮',
    minPrice: 5,
    maxPrice: 9,
  },
  vanish: {
    id: 'vanish' as AmuletId,
    type: 'vanish',
    name: '消去',
    description: 'デッキからピースを1つ削除する',
    icon: '💨',
    minPrice: 4,
    maxPrice: 7,
  },
}

/**
 * AmuletIdからAmuletDefinitionを取得
 */
export const getAmuletDefinition = (
  amuletId: AmuletId
): AmuletDefinition | undefined => {
  return AMULET_DEFINITIONS[amuletId as AmuletType]
}

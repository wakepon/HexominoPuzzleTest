/**
 * ブランド型を使った型安全なID
 *
 * 注意: 現在の実装では string として扱われます。
 * 将来的にブランド型の恩恵を受けるための準備として定義。
 */
export type PieceId = string & { readonly __brand?: 'PieceId' }
export type MinoId = string & { readonly __brand?: 'MinoId' }
export type BlockSetId = number & { readonly __brand?: 'BlockSetId' }
export type RelicId = string & { readonly __brand?: 'RelicId' }
export type PatternId = string & { readonly __brand?: 'PatternId' }
export type SealId = string & { readonly __brand?: 'SealId' }

/**
 * ID生成ユーティリティ
 */
let blockSetIdCounter = 0

export const createPieceId = (base: string): PieceId =>
  `${base}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` as PieceId

export const createBlockSetId = (): BlockSetId => {
  blockSetIdCounter += 1
  return blockSetIdCounter as BlockSetId
}

export const resetBlockSetIdCounter = (): void => {
  blockSetIdCounter = 0
}

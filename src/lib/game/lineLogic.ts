/**
 * 後方互換性のためのエイリアス
 * 新しいコードはServices/LineServiceから直接インポートしてください。
 */
export {
  findCompletedLines,
  getCellsToRemove,
  calculateScore,
  clearLines,
} from './Services/LineService'
export type { CompletedLines } from './Services/LineService'

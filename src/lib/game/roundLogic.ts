/**
 * 後方互換性のためのエイリアス
 * 新しいコードはServices/RoundServiceから直接インポートしてください。
 */
export {
  calculateTargetScore,
  calculateGoldReward,
  isRoundCleared,
  isFinalRound,
} from './Services/RoundService'

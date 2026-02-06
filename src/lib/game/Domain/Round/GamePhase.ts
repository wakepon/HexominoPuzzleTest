/**
 * ゲームフェーズ
 */
export type GamePhase =
  | 'round_progress'  // ラウンド進行画面（将来用）
  | 'playing'         // プレイ中
  | 'round_clear'     // ラウンドクリア演出
  | 'shopping'        // ショップ
  | 'game_over'       // ゲームオーバー
  | 'game_clear'      // ゲームクリア

/**
 * フェーズ遷移の妥当性をチェック
 */
export const isValidPhaseTransition = (from: GamePhase, to: GamePhase): boolean => {
  const validTransitions: Record<GamePhase, GamePhase[]> = {
    round_progress: ['playing'],
    playing: ['round_clear', 'game_over'],
    round_clear: ['shopping', 'game_clear'],
    shopping: ['round_progress', 'playing'],
    game_over: ['round_progress', 'playing'],
    game_clear: ['round_progress', 'playing'],
  }

  return validTransitions[from].includes(to)
}

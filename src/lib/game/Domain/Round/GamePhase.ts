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


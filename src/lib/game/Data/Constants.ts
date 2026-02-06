/**
 * ゲームの定数定義
 */

// グリッドサイズ
export const GRID_SIZE = 6

// 基本セルサイズ（レスポンシブで調整される）
export const BASE_CELL_SIZE = 50

// スロット数
export const SLOT_COUNT = 3

// 色定義（木目調）
export const COLORS = {
  // ボード関連
  boardBackground: '#8B7355',    // 木目調ベース（ダーク）
  cellBackground: '#D2B48C',     // タン色（セル背景）
  cellBorder: '#6B5344',         // 濃い茶色（枠線）

  // ブロック関連
  piece: '#A0522D',              // シエナ（ブロック色）
  pieceHighlight: '#CD853F',     // ペルー（ハイライト）
  pieceShadow: '#5D3A1A',        // ダークブラウン（影）

  // プレビュー関連
  previewValid: 'rgba(160, 82, 45, 0.5)',    // 配置可能プレビュー
  previewInvalid: 'rgba(255, 0, 0, 0.3)',    // 配置不可プレビュー

  // スロットエリア
  slotBackground: 'rgba(139, 115, 85, 0.8)', // スロット背景
}

// アニメーション設定
export const ANIMATION = {
  dragOpacity: 0.8,              // ドラッグ中のブロックの透明度
  previewOpacity: 0.5,           // プレビューの透明度
}

// レイアウト設定
export const LAYOUT = {
  boardPadding: 4,               // ボード周りのパディング
  slotGap: 20,                   // スロット間の隙間
  slotAreaPadding: 30,           // スロットエリアの上下パディング
  canvasPaddingHorizontal: 20,   // Canvas水平パディング
  canvasPaddingVertical: 40,     // Canvas垂直パディング
  boardAreaRatio: 0.55,          // ボードエリアの高さ比率
  slotCellSizeRatio: 0.8,        // スロット内ブロックのサイズ比率
}

// セル描画スタイル
export const CELL_STYLE = {
  padding: 2,                    // セル内パディング
  highlightWidth: 3,             // ハイライト幅
  shadowWidth: 3,                // シャドウ幅
}

// 消去アニメーション設定
export const CLEAR_ANIMATION = {
  duration: 500,                 // アニメーション時間（ms）
  maxRotation: Math.PI,          // 最大回転角度（180度）
  maxRise: 30,                   // 最大上昇距離（px）
  initialScale: 1.0,             // 初期スケール
  finalScale: 0,                 // 最終スケール
}

// スコア表示設定
export const SCORE_STYLE = {
  fontSize: 24,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'bold',
  color: '#FFFFFF',
  shadowColor: '#000000',
  shadowBlur: 4,
  paddingTop: 15,
}

// デッキ設定
export const DECK_CONFIG = {
  totalHands: 12,    // 配置可能回数
  drawCount: 3,      // 一度に引く枚数
  // デッキに含めるミノのID（モノミノ1 + ドミノ2 + トロミノ6 = 9）
  minoIds: [
    'mono-1',
    'dom-h',
    'dom-v',
    'tro-i-h',
    'tro-i-v',
    'tro-l-0',
    'tro-l-90',
    'tro-l-180',
    'tro-l-270',
  ] as const,
}

// 残りハンド表示設定
export const HANDS_STYLE = {
  fontSize: 20,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'bold',
  color: '#FFFFFF',
  shadowColor: '#000000',
  shadowBlur: 4,
  paddingRight: 20,
  paddingTop: 15,
}

// ラウンド設定
export const ROUND_CONFIG = {
  initialGold: 5,              // 初期ゴールド
  maxRound: 24,                // 最終ラウンド
  initialTargetScore: 20,      // 初期目標スコア
  targetScoreIncrement: 10,    // ラウンドごとの目標スコア増加量
}

// ゴールド表示スタイル
export const GOLD_STYLE = {
  fontSize: 20,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'bold',
  color: '#FFD700',            // ゴールド色
  shadowColor: '#000000',
  shadowBlur: 4,
  paddingLeft: 20,
  paddingTop: 15,
}

// ラウンド表示スタイル
export const ROUND_STYLE = {
  fontSize: 18,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'bold',
  color: '#FFFFFF',
  shadowColor: '#000000',
  shadowBlur: 4,
  paddingTop: 45,
}

// ラウンドクリア演出
export const ROUND_CLEAR_STYLE = {
  duration: 1500,              // 1.5秒表示
  fontSize: 36,
  subFontSize: 24,
  color: '#FFFFFF',
  goldColor: '#FFD700',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  titleOffsetY: -30,
  goldTextOffsetY: 20,
}

// ゲームオーバー表示
export const GAME_OVER_STYLE = {
  titleFontSize: 36,
  subtextFontSize: 20,
  color: '#FFFFFF',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  buttonWidth: 160,
  buttonHeight: 50,
  buttonColor: '#4CAF50',
  buttonTextColor: '#FFFFFF',
  buttonFontSize: 20,
  titleOffsetY: -80,
  line1OffsetY: -30,
  line2OffsetY: 5,
  line3OffsetY: 40,
  buttonOffsetY: 80,
}

// ゲームクリア表示
export const GAME_CLEAR_STYLE = {
  titleFontSize: 40,
  subtextFontSize: 24,
  color: '#FFD700',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  buttonWidth: 160,
  buttonHeight: 50,
  buttonColor: '#4CAF50',
  buttonTextColor: '#FFFFFF',
  buttonFontSize: 20,
  titleOffsetY: -60,
  line1OffsetY: -10,
  line2OffsetY: 30,
  buttonOffsetY: 80,
}

// ショップ表示スタイル
export const SHOP_STYLE = {
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  titleFontSize: 28,
  titleColor: '#FFFFFF',
  priceFontSize: 18,
  priceColor: '#FFD700',
  priceDisabledColor: '#888888',
  itemBoxPadding: 15,
  itemBoxGap: 20,
  itemBorderColor: '#8B7355',
  itemBorderWidth: 3,
  itemBackgroundColor: 'rgba(210, 180, 140, 0.3)',
  itemSelectedColor: 'rgba(76, 175, 80, 0.3)',
  itemPurchasedColor: 'rgba(100, 100, 100, 0.5)',
  leaveButtonWidth: 160,
  leaveButtonHeight: 50,
  leaveButtonColor: '#8B7355',
  leaveButtonTextColor: '#FFFFFF',
  leaveButtonFontSize: 20,
  titleOffsetY: -180,
  itemsOffsetY: -50,
  leaveButtonOffsetY: 180,
  goldDisplayOffsetY: -220,
  cellSizeRatio: 0.6,
  shapeVerticalOffset: 15,      // ミノ形状の垂直オフセット
  priceVerticalOffset: 20,      // 価格表示の下からのオフセット
}

// デバッグウィンドウ表示スタイル
export const DEBUG_WINDOW_STYLE = {
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  titleFontSize: 14,
  titleColor: '#00FF00',
  infoFontSize: 11,
  infoColor: '#FFFFFF',
  highlightBgColor: 'rgba(255, 215, 0, 0.3)',  // 次のミノのハイライト背景
  fontFamily: 'Consolas, Monaco, monospace',
  padding: 10,
  itemPadding: 4,          // ミノアイテム間のパディング
  cellSize: 7,             // ミノセルサイズ（小さい 6-8px）
  maxItems: 20,            // 表示する最大アイテム数
  numberColumnWidth: 25,   // 番号表示用の幅
  minWindowWidth: 90,      // 最小ウィンドウ幅
  offsetX: 10,             // 左端からのオフセット
  offsetY: 80,             // 上端からのオフセット
}

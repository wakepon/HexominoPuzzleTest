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
  // レリック行（ブロック行の下）
  relicRowOffsetY: 100,         // ブロック行からのオフセット
  relicBoxWidth: 100,
  relicBoxHeight: 100,
  relicIconSize: 32,
}

// レリックパネル表示スタイル（画面上部、ゴールドの右隣）
export const RELIC_PANEL_STYLE = {
  iconSize: 24,
  iconGap: 8,
  paddingLeft: 100,             // ゴールド表示の右隣
  paddingTop: 20,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  borderRadius: 4,
  padding: 4,
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
  // 確率設定セクション
  probabilitySection: {
    sectionMarginTop: 12,   // セクション間のマージン
    labelFontSize: 11,      // ラベルのフォントサイズ
    labelColor: '#AAAAAA',  // ラベルの色
    valueFontSize: 12,      // 値表示のフォントサイズ
    valueColor: '#00FF00',  // 値の色
    buttonWidth: 20,        // +/-ボタンの幅
    buttonHeight: 18,       // +/-ボタンの高さ
    buttonColor: '#4CAF50', // ボタンの色
    buttonHoverColor: '#66BB6A', // ボタンホバー時の色
    buttonTextColor: '#FFFFFF',  // ボタンテキストの色
    buttonFontSize: 14,     // ボタンテキストのフォントサイズ
    rowHeight: 24,          // 各行の高さ
    valueWidth: 40,         // 値表示の幅
    buttonGap: 4,           // ボタン間のギャップ
  },
}

// レアリティ別カラー定義
export const RARITY_COLORS: Record<string, string> = {
  common: '#AAAAAA',
  uncommon: '#55AA55',
  rare: '#5555FF',
  epic: '#AA00AA',
}

// パターン別カラー定義
export const PATTERN_COLORS: Record<string, { base: string; highlight: string; shadow: string }> = {
  enhanced: {
    base: '#DAA520',      // ゴールデンロッド
    highlight: '#FFD700', // ゴールド
    shadow: '#B8860B',    // ダークゴールデンロッド
  },
  lucky: {
    base: '#228B22',      // フォレストグリーン
    highlight: '#32CD32', // ライムグリーン
    shadow: '#006400',    // ダークグリーン
  },
  combo: {
    base: '#8B008B',      // ダークマゼンタ
    highlight: '#BA55D3', // ミディアムオーキッド
    shadow: '#4B0082',    // インディゴ
  },
  aura: {
    base: '#00CED1',      // ダークターコイズ
    highlight: '#40E0D0', // ターコイズ
    shadow: '#008B8B',    // ダークシアン
  },
  moss: {
    base: '#2E8B57',      // シーグリーン
    highlight: '#3CB371', // ミディアムシーグリーン
    shadow: '#006400',    // ダークグリーン
  },
  obstacle: {
    base: '#696969',      // ディムグレー
    highlight: '#808080', // グレー
    shadow: '#2F4F4F',    // ダークスレートグレー
  },
}

// パターン記号のフォント設定
export const PATTERN_SYMBOL_STYLE = {
  fontSize: 12,
  fontFamily: 'Arial, sans-serif',
  color: '#FFFFFF',
  shadowColor: '#000000',
  shadowBlur: 2,
}

// シール別カラー定義
export const SEAL_COLORS: Record<string, string> = {
  gold: '#FFD700',   // ゴールド
  score: '#00FF00',  // グリーン
  multi: '#FF69B4',  // ピンク
  stone: '#808080',  // グレー
}

// シール記号のスタイル設定
export const SEAL_SYMBOL_STYLE = {
  fontSize: 10,
  fontFamily: 'Arial, sans-serif',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  borderRadius: 2,
  padding: 1,
}

// デバッグ用確率設定
export const DEBUG_PROBABILITY_SETTINGS = {
  MIN: 0,
  MAX: 100,
  STEP: 10,
} as const

// ツールチップスタイル設定
export const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  borderColor: '#8B7355',
  borderWidth: 2,
  borderRadius: 6,
  padding: 10,
  maxWidth: 180,
  nameFontSize: 13,
  descFontSize: 11,
  fontFamily: 'Arial, sans-serif',
  nameColor: '#FFD700',
  descColor: '#FFFFFF',
  lineHeight: 1.4,
  offsetX: 15,
  offsetY: 15,
  effectGap: 8,
}

// レリック発動エフェクトスタイル
export const RELIC_EFFECT_STYLE = {
  duration: 1500, // エフェクト表示時間（ms）
  popupWidth: 200,
  popupHeight: 80,
  popupGap: 10, // ポップアップ間のギャップ
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderColor: '#FFD700',
  borderWidth: 3,
  borderRadius: 10,
  iconSize: 32,
  iconOffsetX: 40, // アイコンのX位置オフセット
  nameFontSize: 16,
  nameOffsetX: 70, // 名前のX位置オフセット
  nameOffsetY: 25, // 名前のY位置オフセット
  bonusFontSize: 20,
  bonusOffsetY: 55, // ボーナス値のY位置オフセット
  nameColor: '#FFFFFF',
  bonusColor: '#FFD700',
  fontFamily: 'Arial, sans-serif',
  glowColor: 'rgba(255, 215, 0, 0.5)',
  glowRadius: 20,
}

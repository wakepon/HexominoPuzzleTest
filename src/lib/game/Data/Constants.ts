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

// HD画面用レイアウト設定（1280x720固定）
export const HD_LAYOUT = {
  // 固定画面サイズ
  canvasWidth: 1280,
  canvasHeight: 720,

  // 左右分割
  leftPanelWidth: 380,           // 左側ステータスパネルの幅
  rightPanelStartX: 380,         // 右側パネルの開始位置

  // 左側パネル（ステータス情報）
  statusPadding: 30,             // ステータスエリアの内側パディング
  statusGroupGap: 25,            // グループ間のギャップ
  statusItemGap: 8,              // アイテム間のギャップ

  // 右側パネル（ゲームボード + スロット）
  boardOffsetX: 570,             // ボードのX位置
  boardOffsetY: 50,              // ボードのY位置（上部余白）
  cellSize: 70,                  // セルサイズ（6x6グリッドで420px）

  // スロットエリア
  slotAreaY: 530,                // スロットエリアのY位置（ボード下）
  slotCellSizeRatio: 0.7,        // スロット内ブロックのサイズ比率
  slotGap: 15,                   // スロット間の隙間

  // レリック置き場（ボードの左側）
  relicAreaX: 470,               // レリック置き場のX位置
  relicAreaY: 20,                // レリック置き場のY位置
  relicAreaWidth: 80,            // レリック置き場の幅
  relicAreaHeight: 490,          // レリック置き場の高さ
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

// HDレイアウト用ステータスパネルスタイル
export const HD_STATUS_PANEL_STYLE = {
  // 目標セクション
  targetFontSize: 48,
  targetColor: '#FFFFFF',
  targetLabelFontSize: 16,
  targetLabelColor: '#AAAAAA',

  // ラウンドスコアセクション
  roundScoreFontSize: 28,
  roundScoreColor: '#FFFFFF',
  roundScoreLabelFontSize: 16,
  roundScoreLabelColor: '#AAAAAA',

  // 獲得得点表示
  earnedScoreFontSize: 22,
  earnedScoreColor: '#FFFFFF',

  // 得点計算式
  scoringFontSize: 18,
  scoringColor: '#AAAAAA',

  // ゴールド表示
  goldFontSize: 24,
  goldColor: '#FFD700',

  // ラウンド表示
  roundFontSize: 20,
  roundColor: '#FFFFFF',

  // ハンド表示
  handFontSize: 24,
  handColor: '#FFFFFF',
  handLabelFontSize: 16,
  handLabelColor: '#AAAAAA',

  // 共通スタイル
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'bold',
  shadowColor: '#000000',
  shadowBlur: 4,
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
  leaveButtonGap: 50,             // 商品とボタンの間隔
  titleOffsetY: -180,
  itemsOffsetY: -50,
  goldDisplayOffsetY: -220,
  cellSizeRatio: 0.6,
  shapeVerticalOffset: 15,      // ミノ形状の垂直オフセット
  priceVerticalOffset: 20,      // 価格表示の下からのオフセット
  // レリック行（ブロック行の下）
  relicRowOffsetY: 20,          // ブロック行からのオフセット
  relicBoxWidth: 100,
  relicBoxHeight: 100,
  relicIconSize: 32,
  // セール表示
  saleColor: '#FF4444',               // セール価格の色（赤）
  saleBadgeColor: '#FF0000',          // SALEバッジ背景色
  saleBadgeTextColor: '#FFFFFF',      // SALEバッジ文字色
  saleBadgeFontSize: 10,
  saleBadgeWidth: 40,
  saleBadgeHeight: 16,
  saleBadgeOffsetX: 5,                // ボックス左上からのオフセット
  saleBadgeOffsetY: 5,
  originalPriceColor: '#888888',      // 元価格の色（グレー）
  strikethroughColor: '#888888',      // 打ち消し線の色
  // 購入不可表示
  unavailableOpacity: 0.5,            // 購入不可時の不透明度
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
  // レリックセクション（デバッグ用）
  relicSection: {
    sectionMarginTop: 12,   // セクション間のマージン
    iconSize: 22,           // レリックアイコンのサイズ
    iconGap: 4,             // アイコン間のギャップ
    iconsPerRow: 5,         // 1行あたりのアイコン数
    ownedOpacity: 1.0,      // 所持時の不透明度
    unownedOpacity: 0.3,    // 未所持時の不透明度
    ownedBgColor: 'rgba(255, 215, 0, 0.3)', // 所持時の背景
    labelFontSize: 11,      // ラベルのフォントサイズ
    labelColor: '#AAAAAA',  // ラベルの色
  },
  // 値調整セクション（ゴールド/スコア用）
  valueSection: {
    sectionMarginTop: 8,    // セクション間のマージン
    buttonWidth: 26,        // ボタン幅（-50, -10, +10, +50）
    buttonHeight: 18,       // ボタン高さ
    buttonGap: 3,           // ボタン間のギャップ
    rowHeight: 24,          // 各行の高さ
    labelWidth: 45,         // ラベル幅
    valueWidth: 45,         // 値表示幅
    labelFontSize: 11,      // ラベルのフォントサイズ
    labelColor: '#AAAAAA',  // ラベルの色
    valueFontSize: 12,      // 値表示のフォントサイズ
    valueColor: '#00FF00',  // 値の色
    buttonColor: '#4CAF50', // ボタンの色
    buttonTextColor: '#FFFFFF', // ボタンテキストの色
    buttonFontSize: 10,     // ボタンテキストのフォントサイズ
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
  feather: {
    base: '#F5F5DC',      // ベージュ
    highlight: '#FFFACD', // レモンシフォン
    shadow: '#D2B48C',    // タン
  },
  nohand: {
    base: '#87CEEB',      // スカイブルー
    highlight: '#B0E0E6', // パウダーブルー
    shadow: '#4682B4',    // スティールブルー
  },
  charge: {
    base: '#FF8C00',      // ダークオレンジ
    highlight: '#FFA500', // オレンジ
    shadow: '#CC7000',    // ダークオレンジ（暗）
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

// ラウンド進行画面スタイル
export const ROUND_PROGRESS_STYLE = {
  backgroundColor: 'rgba(0, 0, 0, 0.85)',

  // セット表示
  setFontSize: 20,
  setColor: '#AAAAAA',
  setOffsetY: -200,

  // カード設定
  cardWidth: 180,
  cardHeight: 240,
  cardGap: 30,
  cardBorderRadius: 12,
  cardBorderWidth: 3,

  // カード状態別の色
  cardColors: {
    current: {
      background: 'rgba(76, 175, 80, 0.3)',
      border: '#4CAF50',
    },
    cleared: {
      background: 'rgba(100, 100, 100, 0.5)',
      border: '#666666',
    },
    locked: {
      background: 'rgba(50, 50, 50, 0.5)',
      border: '#333333',
    },
  },

  // ラウンドタイプ別の色
  typeColors: {
    normal: '#FFFFFF',
    elite: '#FFD700',
    boss: '#FF4444',
  },

  // カード内テキスト
  typeFontSize: 24,
  typeOffsetY: 40,
  roundFontSize: 18,
  roundOffsetY: 80,
  conditionFontSize: 14,
  conditionColor: '#FF6666',
  conditionOffsetY: 120,

  // クリア済みマーク
  clearedMarkFontSize: 48,
  clearedMarkColor: '#4CAF50',

  // ロックマーク
  lockedMarkFontSize: 32,
  lockedMarkColor: '#666666',

  // 開始ボタン
  buttonWidth: 200,
  buttonHeight: 60,
  buttonColor: '#4CAF50',
  buttonTextColor: '#FFFFFF',
  buttonFontSize: 24,
  buttonOffsetY: 150,
}

// デッキ一覧画面スタイル
export const DECK_VIEW_STYLE = {
  backgroundColor: 'rgba(0, 0, 0, 0.9)',

  // タイトル
  titleFontSize: 24,
  titleColor: '#FFFFFF',
  titleOffsetY: 40,

  // カード表示エリア
  areaWidth: 800,
  areaHeight: 500,
  cardCellSize: 8,
  cardGap: 10,
  cardsPerRow: 8,
  maxCardWidth: 48, // 6 * cardCellSize

  // セクションラベル
  sectionFontSize: 16,
  sectionColor: '#AAAAAA',
  deckSectionY: 80,
  usedSectionY: 300,

  // 使用中カードのグレーアウト
  usedOpacity: 0.4,
  usedOverlayColor: 'rgba(100, 100, 100, 0.6)',

  // 閉じるボタン
  closeButtonWidth: 120,
  closeButtonHeight: 40,
  closeButtonColor: '#8B7355',
  closeButtonTextColor: '#FFFFFF',
  closeButtonFontSize: 16,
  closeButtonOffsetY: -50,
}

// ステータスパネル用デッキボタン
export const DECK_BUTTON_STYLE = {
  width: 80,
  height: 36,
  backgroundColor: '#8B7355',
  textColor: '#FFFFFF',
  fontSize: 14,
  borderRadius: 6,
  offsetY: 350,
}

// ストック枠スタイル（ボードの左側、レリックパネルの下）
export const STOCK_SLOT_STYLE = {
  x: 470,                           // ストック枠のX位置（relicAreaXと同じ）
  y: 520,                           // ストック枠のY位置（レリックパネルの下）
  width: 80,                        // ストック枠の幅
  height: 80,                       // ストック枠の高さ
  borderWidth: 3,                   // 枠線の太さ
  borderColor: '#8B7355',           // 枠線の色
  backgroundColor: 'rgba(210, 180, 140, 0.2)',  // 背景色（半透明）
  labelFontSize: 12,                // ラベルのフォントサイズ
  labelColor: '#AAAAAA',            // ラベルの色
}

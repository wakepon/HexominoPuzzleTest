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

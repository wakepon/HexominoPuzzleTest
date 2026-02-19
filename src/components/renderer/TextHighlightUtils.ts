/**
 * テキスト内の特定パターンを検出し、パターンごとに異なる色・太字で描画するユーティリティ
 */

/** ハイライトルール定義 */
export interface HighlightRule {
  pattern: RegExp
  color: string
  bold: boolean
}

/**
 * テキスト内の複数パターンを検出し、それぞれのスタイルで描画する
 * マッチしない部分は normalColor で通常描画
 */
export function drawTextWithMultiplierHighlight(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  normalColor: string,
  highlightColor: string,
  highlightRules?: HighlightRule[]
): void {
  // ルールが指定されていない場合は既存の×Nパターンのみ（後方互換）
  const rules: HighlightRule[] = highlightRules ?? [
    { pattern: /×(?:\d+(?:\.\d+)?|\S+)/, color: highlightColor, bold: true },
  ]

  // テキストを走査し、各位置でマッチを探す
  const segments: Array<{ text: string; color: string; bold: boolean }> = []
  let remaining = text

  while (remaining.length > 0) {
    // 全ルールから最も早い位置のマッチを探す
    let earliestMatch: { index: number; length: number; rule: HighlightRule } | null = null

    for (const rule of rules) {
      const match = remaining.match(rule.pattern)
      if (match && match.index !== undefined) {
        if (earliestMatch === null || match.index < earliestMatch.index) {
          earliestMatch = { index: match.index, length: match[0].length, rule }
        }
      }
    }

    if (earliestMatch === null) {
      // マッチなし: 残り全体を通常色で追加
      segments.push({ text: remaining, color: normalColor, bold: false })
      break
    }

    // マッチ前のテキストを通常色で追加
    if (earliestMatch.index > 0) {
      segments.push({ text: remaining.slice(0, earliestMatch.index), color: normalColor, bold: false })
    }

    // マッチ部分をハイライト色で追加
    segments.push({
      text: remaining.slice(earliestMatch.index, earliestMatch.index + earliestMatch.length),
      color: earliestMatch.rule.color,
      bold: earliestMatch.rule.bold,
    })

    remaining = remaining.slice(earliestMatch.index + earliestMatch.length)
  }

  // セグメントを描画
  const baseFont = ctx.font
  // 現在のフォントからサイズとファミリーを抽出
  const fontMatch = baseFont.match(/(?:bold\s+)?(\d+)px\s+(.+)/)
  const fontSize = fontMatch ? fontMatch[1] : '11'
  const fontFamily = fontMatch ? fontMatch[2] : 'Arial, sans-serif'

  let currentX = x

  for (const segment of segments) {
    ctx.fillStyle = segment.color
    ctx.font = segment.bold ? `bold ${fontSize}px ${fontFamily}` : `${fontSize}px ${fontFamily}`
    ctx.fillText(segment.text, currentX, y)
    currentX += ctx.measureText(segment.text).width
  }

  // フォントを元に戻す
  ctx.font = baseFont
}

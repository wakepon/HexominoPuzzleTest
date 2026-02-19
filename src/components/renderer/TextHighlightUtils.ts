/**
 * テキスト内の「×N」パターンを検出し、その部分だけ指定色で描画するユーティリティ
 */

/**
 * テキスト内の「×N」パターンを検出し、その部分だけ指定色で描画する
 * ×の後に数値（整数・小数）またはテキスト（揃った列数 等）が続くパターンを検出
 * パターンがなければ通常のfillTextと同じ動作
 */
export function drawTextWithMultiplierHighlight(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  normalColor: string,
  highlightColor: string
): void {
  // ×N パターンを検出（×の後に数値または日本語テキストが続く）
  // 複数のパターンがある場合は最初の1つのみハイライト
  const pattern = /×(?:\d+(?:\.\d+)?|\S+)/
  const match = text.match(pattern)

  if (!match || match.index === undefined) {
    // パターンなし: 通常描画
    ctx.fillStyle = normalColor
    ctx.fillText(text, x, y)
    return
  }

  const matchStart = match.index
  const matchEnd = matchStart + match[0].length

  // ×の前のテキスト
  const beforeText = text.slice(0, matchStart)
  // ×N部分
  const highlightText = text.slice(matchStart, matchEnd)
  // ×Nの後のテキスト
  const afterText = text.slice(matchEnd)

  let currentX = x

  // 前半を通常色で描画
  if (beforeText) {
    ctx.fillStyle = normalColor
    ctx.fillText(beforeText, currentX, y)
    currentX += ctx.measureText(beforeText).width
  }

  // ×N部分を赤色で描画
  ctx.fillStyle = highlightColor
  ctx.fillText(highlightText, currentX, y)
  currentX += ctx.measureText(highlightText).width

  // 後半を通常色で描画
  if (afterText) {
    ctx.fillStyle = normalColor
    ctx.fillText(afterText, currentX, y)
  }
}

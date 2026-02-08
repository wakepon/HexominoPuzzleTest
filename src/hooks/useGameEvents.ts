/**
 * ゲームイベントバス連携hook
 *
 * イベントログの取得とハンドラ登録を提供する。
 * 主にデバッグ・ログ表示用途。
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { gameEventBus } from '../lib/game/Events'
import type { GameEvent } from '../lib/game/Events'

// 全イベントタイプのリスト
const EVENT_TYPES: readonly GameEvent['type'][] = [
  'PIECE_PLACED',
  'LINES_COMPLETED',
  'LINES_CLEARED',
  'SCORE_CALCULATED',
  'GOLD_GAINED',
  'ROUND_CLEARED',
  'ROUND_STARTED',
  'RELIC_TRIGGERED',
] as const

/**
 * イベントログを取得するhook
 */
export function useEventLog(): readonly GameEvent[] {
  const [log, setLog] = useState<readonly GameEvent[]>([])

  useEffect(() => {
    // 初期ログを取得
    setLog(gameEventBus.getEventLog())

    // 全イベントを監視してログを更新
    const updateLog = () => setLog(gameEventBus.getEventLog())
    const unsubscribes = EVENT_TYPES.map((type) =>
      gameEventBus.on(type, updateLog)
    )

    return () => {
      unsubscribes.forEach((unsub) => unsub())
    }
  }, [])

  return log
}

/**
 * 特定のイベント型を監視するhook
 * handlerは最新の参照を常に使用するため、useCallbackでラップする必要なし
 */
export function useGameEvent<T extends GameEvent>(
  eventType: T['type'],
  handler: (event: T) => void
): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const unsubscribe = gameEventBus.on(eventType, (event) => {
      handlerRef.current(event as T)
    })
    return unsubscribe
  }, [eventType])
}

/**
 * イベントバスをクリアする関数を返すhook
 */
export function useClearEventLog(): () => void {
  return useCallback(() => {
    gameEventBus.clear()
  }, [])
}

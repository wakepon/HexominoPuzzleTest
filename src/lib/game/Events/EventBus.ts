/**
 * イベントバス
 *
 * ゲーム内のアクション（ピース配置、ライン消去、スコア計算など）を
 * イベントとして発火・ログ記録するシステム。
 * 主にデバッグ・ログ用途で使用。
 */

import type { GameEvent } from './GameEvent'

/**
 * イベントハンドラ型
 */
export type EventHandler<T extends GameEvent> = (event: T) => void

/**
 * イベントハンドラ登録情報
 */
interface HandlerEntry {
  readonly eventType: GameEvent['type']
  readonly handler: EventHandler<GameEvent>
  readonly priority: number
}

/**
 * イベントバス
 */
export class EventBus {
  private handlers: HandlerEntry[] = []
  private eventLog: GameEvent[] = []
  private readonly maxLogSize: number
  private readonly enableLogging: boolean

  constructor(maxLogSize: number = 100, enableLogging: boolean = false) {
    this.maxLogSize = maxLogSize
    this.enableLogging = enableLogging
  }

  /**
   * イベントハンドラを登録
   */
  on<T extends GameEvent>(
    eventType: T['type'],
    handler: EventHandler<T>,
    priority: number = 0
  ): () => void {
    const entry: HandlerEntry = {
      eventType,
      handler: handler as EventHandler<GameEvent>,
      priority,
    }
    this.handlers.push(entry)

    // 優先度でソート（高い順）
    this.handlers.sort((a, b) => b.priority - a.priority)

    // 登録解除関数を返す
    return () => {
      const index = this.handlers.indexOf(entry)
      if (index > -1) {
        this.handlers.splice(index, 1)
      }
    }
  }

  /**
   * イベントを発火
   */
  emit<T extends GameEvent>(event: T): void {
    // コンソールログ出力（開発環境用）
    if (this.enableLogging) {
      console.log(`[GameEvent] ${event.type}`, event)
    }

    // ログに追加
    this.eventLog.push(event)
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift()
    }

    // ハンドラを実行
    for (const entry of this.handlers) {
      if (entry.eventType === event.type) {
        entry.handler(event)
      }
    }
  }

  /**
   * イベントログを取得（デバッグ用）
   */
  getEventLog(): readonly GameEvent[] {
    return [...this.eventLog]
  }

  /**
   * 全ハンドラを解除
   */
  clear(): void {
    this.handlers = []
    this.eventLog = []
  }
}

/**
 * イベントバスのファクトリ
 */
export const createEventBus = (): EventBus => new EventBus()

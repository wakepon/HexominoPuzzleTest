/**
 * Relics モジュール公開API
 *
 * レリック追加時: 個別ファイルを作成し、このファイルのallModules配列に追加する。
 * レリック削除時: 個別ファイルを削除し、このファイルのallModules配列から削除する。
 */

// 型のエクスポート
export type {
  RelicModule,
  RelicModuleDefinition,
  RelicContext,
  RelicActivation,
  RelicStateEvent,
  RelicHookContext,
  RelicHookResult,
  ScoreEffectType,
} from './RelicModule'

// レジストリAPIのエクスポート
export {
  getRelicModule,
  getAllRelicModules,
  getAllRelicTypes,
  getRelicCount,
  getRelicDefinitionFromRegistry,
  clearRelicRegistry,
  dumpRelicRegistry,
} from './RelicRegistry'

// ============================================================
// レリックモジュールの登録
// ============================================================
// 個別レリックファイルから import し、initializeRelicRegistry() で一括登録する。
// レリック追加/削除時はここの import と allModules 配列を変更するだけでよい。

import type { RelicModule } from './RelicModule'
import { registerRelics, getRelicCount, clearRelicRegistry as clearRegistry } from './RelicRegistry'

// --- 個別レリックの import ---
import { chainMasterRelic } from './ChainMaster'
import { fullClearBonusRelic } from './FullClearBonus'
import { singleLineRelic } from './SingleLine'
import { takenokoRelic } from './Takenoko'
import { kaniRelic } from './Kani'
import { renshaRelic } from './Rensha'
import { nobiTakenokoRelic } from './NobiTakenoko'
import { nobiKaniRelic } from './NobiKani'
import { timingRelic } from './Timing'
import { scriptRelic } from './Script'
import { bandaidRelic } from './Bandaid'
import { volcanoRelic } from './Volcano'
import { handStockRelic } from './HandStock'
import { copyRelic } from './Copy'
import { createSizeBonusRelic } from './SizeBonusFactory'
import { anchorRelic } from './Anchor'
import { crownRelic } from './Crown'
import { stampRelic } from './Stamp'
import { compassRelic } from './Compass'
import { featherweightRelic } from './Featherweight'
import { heavyweightRelic } from './Heavyweight'
import { meteorRelic } from './Meteor'
import { symmetryRelic } from './Symmetry'
import { crescentRelic } from './Crescent'
import { lastStandRelic } from './LastStand'
import { firstStrikeRelic } from './FirstStrike'
import { patienceRelic } from './Patience'
import { snowballRelic } from './Snowball'
import { muscleRelic } from './Muscle'
import { gardenerRelic } from './Gardener'
import { collectorRelic } from './Collector'
import { merchantRelic } from './Merchant'
import { treasureHunterRelic } from './TreasureHunter'
import { crossRelic } from './Cross'
import { midasRelic } from './Midas'
import { extraDrawRelic } from './ExtraDraw'
import { extraHandRelic } from './ExtraHand'
import { recyclerRelic } from './Recycler'

/**
 * 全レリックモジュールの配列
 * レリック追加/削除時はここだけ変更する
 */
const allModules: readonly RelicModule[] = [
  // サイズボーナス（1〜6）
  createSizeBonusRelic(1),
  createSizeBonusRelic(2),
  createSizeBonusRelic(3),
  createSizeBonusRelic(4),
  createSizeBonusRelic(5),
  createSizeBonusRelic(6),
  // 乗算系
  chainMasterRelic,
  fullClearBonusRelic,
  singleLineRelic,
  takenokoRelic,
  kaniRelic,
  renshaRelic,
  nobiTakenokoRelic,
  nobiKaniRelic,
  timingRelic,
  // ライン加算
  scriptRelic,
  // 特殊
  bandaidRelic,
  volcanoRelic,
  handStockRelic,
  copyRelic,
  // 加算系
  anchorRelic,
  crownRelic,
  stampRelic,
  compassRelic,
  featherweightRelic,
  heavyweightRelic,
  // 乗算系（追加）
  meteorRelic,
  symmetryRelic,
  crescentRelic,
  lastStandRelic,
  // 乗算系（先制攻撃）
  firstStrikeRelic,
  // 乗算系（忍耐）
  patienceRelic,
  // 加算系（雪だるま）
  snowballRelic,
  // 乗算系（筋肉）
  muscleRelic,
  // 加算系（庭師）
  gardenerRelic,
  // 乗算系（収集家）
  collectorRelic,
  // 非スコア系（商人）
  merchantRelic,
  // 非スコア系（トレジャーハンター）
  treasureHunterRelic,
  // 加算系（十字）
  crossRelic,
  // 非スコア系（ミダス）
  midasRelic,
  // 非スコア系（追加ドロー）
  extraDrawRelic,
  // 非スコア系（追加ハンド）
  extraHandRelic,
  // 非スコア系（リサイクラー）
  recyclerRelic,
]

/**
 * レリックレジストリを初期化する
 * アプリ起動時に1回だけ呼ぶ
 */
let initialized = false

export function initializeRelicRegistry(): void {
  if (initialized) return
  registerRelics(allModules)
  initialized = true
}

/**
 * レジストリの初期化状態を確認する（テスト用）
 */
export function isRelicRegistryInitialized(): boolean {
  return initialized && getRelicCount() > 0
}

/**
 * レジストリをリセットする（テスト用）
 * clearRelicRegistry + initialized フラグをリセット
 */
export function resetRelicRegistry(): void {
  clearRegistry()
  initialized = false
}

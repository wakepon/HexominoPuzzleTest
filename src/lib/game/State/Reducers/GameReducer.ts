/**
 * ゲームReducer
 */

import type {
  GameState,
  PieceSlot,
  DeckState,
  Piece,
  Board,
  ScoreBreakdown,
  ClearingCell,
} from '../../Domain'
import { toGridPosition } from '../../Domain/Core/Position'
import type { GameAction } from '../Actions/GameActions'
import type { RelicEffectContext } from '../../Domain/Effect/RelicEffectTypes'
import type { ScoreBonus } from '../../Events/GameEvent'
import { isBlockShopItem, isRelicShopItem } from '../../Domain/Shop/ShopTypes'
import { addRelic, removeRelic, addGold, subtractGold } from './PlayerReducer'
import {
  emitPiecePlaced,
  emitLinesCompleted,
  emitLinesCleared,
  emitScoreCalculated,
  emitGoldGained,
  emitRoundCleared,
  emitRoundStarted,
  emitRelicTriggered,
} from '../../Events/GameEventBus'
import {
  initialDragState,
  createInitialState,
  generateNewPieceSlotsFromDeck,
  generateNewPieceSlotsFromDeckWithCount,
  areAllSlotsEmpty,
  determinePhase,
} from '../InitialState'
import {
  createEmptyBoard,
  placePieceOnBoard,
  placeObstacleOnBoard,
} from '../../Services/BoardService'
import { canPlacePiece, canPieceBePlacedAnywhere } from '../../Services/CollisionService'
import {
  findCompletedLines,
  getCellsToRemoveWithFilter,
  clearLines,
  calculateScoreWithEffects,
} from '../../Services/LineService'
import { hasComboPattern, calculateScoreBreakdown } from '../../Domain/Effect/PatternEffectHandler'
import {
  getActivatedRelicsFromScoreBreakdown,
  hasRelic,
} from '../../Domain/Effect/RelicEffectHandler'
import {
  INITIAL_RELIC_MULTIPLIER_STATE,
  updateRenshaMultiplier,
  updateNobiTakenokoMultiplier,
  updateNobiKaniMultiplier,
} from '../../Domain/Effect/RelicState'
import { createRelicActivationAnimation } from '../../Domain/Animation/AnimationState'
import type { ScoreAnimationState } from '../../Domain/Animation/ScoreAnimationState'
import { SCORE_ANIMATION } from '../../Domain/Animation/ScoreAnimationState'
import { buildFormulaSteps } from '../../Domain/Animation/FormulaBuilder'
import { decrementRemainingHands } from '../../Services/DeckService'
import {
  calculateTargetScore,
  isFinalRound,
  calculateGoldReward,
  createRoundInfo,
  getMaxPlacements,
  getDrawCount,
} from '../../Services/RoundService'
import {
  createShopState,
  canAfford,
  markItemAsPurchased,
  shuffleCurrentDeck,
} from '../../Services/ShopService'
import { getPiecePattern } from '../../Services/PieceService'
import { DefaultRandom } from '../../Utils/Random'
import { CLEAR_ANIMATION, RELIC_EFFECT_STYLE, GRID_SIZE } from '../../Data/Constants'
import { RELIC_EFFECT_VALUES } from '../../Domain/Effect/Relic'
import { saveGameState, clearGameState } from '../../Services/StorageService'
import type { RelicMultiplierState } from '../../Domain/Effect/RelicState'
import type { RelicId } from '../../Domain/Core/Id'
import { generateScriptLines } from '../../Domain/Effect/ScriptRelicState'

/**
 * レリック倍率状態を更新
 * ピース配置後に呼び出し、消去ライン数に基づいて各倍率を更新
 */
function updateRelicMultipliers(
  currentState: RelicMultiplierState,
  ownedRelics: readonly RelicId[],
  totalLines: number,
  rowLines: number,
  colLines: number
): RelicMultiplierState {
  let newState = currentState

  // 2-D: 連射倍率の更新
  if (hasRelic(ownedRelics, 'rensha')) {
    newState = updateRenshaMultiplier(newState, totalLines)
  }

  // 2-E: のびのびタケノコ倍率の更新
  if (hasRelic(ownedRelics, 'nobi_takenoko')) {
    newState = updateNobiTakenokoMultiplier(newState, rowLines, colLines)
  }

  // 2-F: のびのびカニ倍率の更新
  if (hasRelic(ownedRelics, 'nobi_kani')) {
    newState = updateNobiKaniMultiplier(newState, rowLines, colLines)
  }

  return newState
}

/**
 * スコアアニメーション状態を作成
 */
function createScoreAnimation(
  scoreBreakdown: ScoreBreakdown,
  relicDisplayOrder: readonly RelicId[],
  currentScore: number
): ScoreAnimationState | null {
  const steps = buildFormulaSteps(scoreBreakdown, relicDisplayOrder)
  if (steps.length === 0) {
    // ステップなし（異常系）→ アニメーションスキップ
    return null
  }
  const now = Date.now()
  return {
    isAnimating: true,
    steps,
    currentStepIndex: 0,
    stepStartTime: now,
    stepDuration: SCORE_ANIMATION.stepDuration,
    isFastForward: false,
    highlightedRelicId: steps[0]?.relicId ?? null,
    finalScore: scoreBreakdown.finalScore,
    scoreGain: scoreBreakdown.finalScore,
    startingScore: currentScore,
    isCountingUp: false,
    countStartTime: 0,
  }
}

/**
 * ピースのブロック数を取得
 */
function getPieceBlockCount(piece: Piece): number {
  let count = 0
  for (const row of piece.shape) {
    for (const cell of row) {
      if (cell) count++
    }
  }
  return count
}

/**
 * ScoreBreakdownからScoreBonus配列を生成（イベントログ用）
 */
function buildScoreBonuses(breakdown: ScoreBreakdown): ScoreBonus[] {
  const bonuses: ScoreBonus[] = []

  if (breakdown.enhancedBonus > 0) {
    bonuses.push({ source: 'pattern:enhanced', amount: breakdown.enhancedBonus })
  }
  if (breakdown.auraBonus > 0) {
    bonuses.push({ source: 'pattern:aura', amount: breakdown.auraBonus })
  }
  if (breakdown.mossBonus > 0) {
    bonuses.push({ source: 'pattern:moss', amount: breakdown.mossBonus })
  }
  if (breakdown.comboBonus > 0) {
    bonuses.push({ source: 'pattern:combo', amount: breakdown.comboBonus })
  }
  if (breakdown.luckyMultiplier > 1) {
    bonuses.push({
      source: 'pattern:lucky',
      amount: 0,
      multiplier: breakdown.luckyMultiplier,
    })
  }
  if (breakdown.sealScoreBonus > 0) {
    bonuses.push({ source: 'seal:score', amount: breakdown.sealScoreBonus })
  }
  if (breakdown.chainMasterMultiplier > 1) {
    bonuses.push({
      source: 'relic:chain_master',
      amount: 0,
      multiplier: breakdown.chainMasterMultiplier,
    })
  }
  if (breakdown.sizeBonusTotal > 0 && breakdown.sizeBonusRelicId) {
    bonuses.push({
      source: `relic:${breakdown.sizeBonusRelicId}`,
      amount: breakdown.sizeBonusTotal,
    })
  }
  if (breakdown.fullClearBonus > 0) {
    bonuses.push({
      source: 'relic:full_clear_bonus',
      amount: breakdown.fullClearBonus,
    })
  }

  return bonuses
}

/**
 * 盤面が空か判定
 */
function isBoardEmpty(board: Board): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (cell.filled) return false
    }
  }
  return true
}

/**
 * ボード上の全filledセルを取得（火山レリック用）
 */
function getAllFilledCells(board: Board): ClearingCell[] {
  const cells: ClearingCell[] = []
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col].filled) {
        cells.push({ x: col, y: row, row, col })
      }
    }
  }
  return cells
}

/**
 * 配置後のデッキとスロットの状態を計算
 */
function handlePlacement(
  slots: readonly PieceSlot[],
  deck: DeckState,
  skipHandConsumption: boolean = false
): { finalSlots: PieceSlot[]; finalDeck: DeckState } {
  const updatedDeck = skipHandConsumption ? deck : decrementRemainingHands(deck)

  if (!areAllSlotsEmpty(slots) || updatedDeck.remainingHands === 0) {
    return {
      finalSlots: [...slots],
      finalDeck: updatedDeck,
    }
  }

  const result = generateNewPieceSlotsFromDeck(updatedDeck)
  return {
    finalSlots: result.slots,
    finalDeck: result.newDeck,
  }
}

/**
 * 手札がすべて配置不可能な場合、ハンドを消費してリドローする
 * ストックピースが配置可能な場合はスタックとみなさない
 */
function resolveUnplaceableHand(
  board: Board,
  slots: PieceSlot[],
  deck: DeckState,
  score: number,
  targetScore: number
): { finalSlots: PieceSlot[]; finalDeck: DeckState; phase: ReturnType<typeof determinePhase> } {
  let currentSlots = slots
  let currentDeck = deck

  while (true) {
    // 手札にピースが残っているか確認
    const remainingPieces = currentSlots.filter(s => s.piece !== null)
    if (remainingPieces.length === 0) break

    // 手札のいずれかがボード上に配置可能かチェック
    const canPlaceAny = currentSlots.some(
      s => s.piece && canPieceBePlacedAnywhere(board, s.piece.shape, getPiecePattern(s.piece))
    )
    if (canPlaceAny) break

    // ストックが配置可能ならスタックではない
    if (currentDeck.stockSlot && canPieceBePlacedAnywhere(board, currentDeck.stockSlot.shape, getPiecePattern(currentDeck.stockSlot))) {
      break
    }

    // 全て配置不可 → ハンドを手札枚数分減らす
    const penaltyCount = remainingPieces.length
    const newRemainingHands = Math.max(0, currentDeck.remainingHands - penaltyCount)
    currentDeck = { ...currentDeck, remainingHands: newRemainingHands }

    // ハンドが0以下 → 敗北
    if (newRemainingHands <= 0) {
      return {
        finalSlots: currentSlots,
        finalDeck: currentDeck,
        phase: determinePhase(score, targetScore, 0),
      }
    }

    // 手札をリセットして新しくドロー
    const result = generateNewPieceSlotsFromDeck(currentDeck)
    currentSlots = result.slots
    currentDeck = result.newDeck
    // ループで再チェック（新しい手札も配置不可の場合に対応）
  }

  return {
    finalSlots: currentSlots,
    finalDeck: currentDeck,
    phase: determinePhase(score, targetScore, currentDeck.remainingHands),
  }
}

/**
 * 火山レリック発動処理
 * ゲームオーバー時に火山レリック所持かつ未発動なら、全ブロック消去+スコア加算
 */
function tryVolcanoActivation(
  state: GameState,
  resolved: { finalSlots: PieceSlot[]; finalDeck: DeckState; phase: ReturnType<typeof determinePhase> },
  newBoard: Board,
  comboCount: number,
  newRelicMultiplierState: RelicMultiplierState
): PlacementResult | null {
  if (
    resolved.phase !== 'game_over' ||
    !hasRelic(state.player.ownedRelics, 'volcano') ||
    !state.volcanoEligible
  ) {
    return null
  }

  const filledCells = getAllFilledCells(newBoard)
  if (filledCells.length === 0) return null

  // スコア計算（linesCleared=VOLCANO_MULTIPLIER でブロック数×5）
  const volcanoBreakdown = calculateScoreBreakdown(
    newBoard,
    filledCells,
    RELIC_EFFECT_VALUES.VOLCANO_MULTIPLIER,
    0,
    null,
    Math.random,
    state.player.relicDisplayOrder
  )

  const newScore = state.score + volcanoBreakdown.finalScore
  const goldGain = volcanoBreakdown.goldCount
  const newPlayer = addGold(state.player, goldGain)
  const volcanoPhase = determinePhase(newScore, state.targetScore, 0)

  // クリアリングアニメーション（全filledCells）
  const clearAnim = {
    isAnimating: true as const,
    cells: filledCells,
    startTime: Date.now(),
    duration: CLEAR_ANIMATION.duration,
  }

  // レリック発動アニメーション（火山）
  const volcanoRelicAnim = createRelicActivationAnimation(
    [{
      relicId: 'volcano' as RelicId,
      bonusValue: `+${volcanoBreakdown.finalScore}`,
    }],
    RELIC_EFFECT_STYLE.duration
  )

  // スコアアニメーション
  const scoreAnim = createScoreAnimation(
    volcanoBreakdown,
    state.player.relicDisplayOrder,
    state.score
  )

  return {
    success: true,
    newState: {
      ...state,
      board: newBoard,
      pieceSlots: resolved.finalSlots,
      dragState: initialDragState,
      deck: resolved.finalDeck,
      phase: volcanoPhase,
      comboCount,
      relicMultiplierState: newRelicMultiplierState,
      clearingAnimation: clearAnim,
      relicActivationAnimation: volcanoRelicAnim,
      scoreAnimation: scoreAnim,
      score: newScore,
      player: newPlayer,
      volcanoEligible: false,
    },
  }
}

/**
 * ボードにピースを配置し、ライン消去とスコア計算を行う共通処理
 * 手札からの配置とストックからの配置で共通して使用
 */
interface PlacementResult {
  readonly newState: GameState
  readonly success: boolean
}

function processPiecePlacement(
  state: GameState,
  piece: Piece,
  boardPos: { x: number; y: number },
  newSlots: PieceSlot[],
  newDeck: DeckState,
  comboCount: number
): PlacementResult {
  // ブロックを配置
  const newBoard = placePieceOnBoard(state.board, piece, boardPos)
  emitPiecePlaced(piece, toGridPosition(boardPos), newBoard)

  // nohandパターンの場合はハンド消費をスキップ
  const isNohand = getPiecePattern(piece) === 'nohand'

  // 配置後の状態を計算
  const { finalSlots, finalDeck } = handlePlacement(newSlots, newDeck, isNohand)

  // ライン消去判定
  const completedLines = findCompletedLines(newBoard)
  const totalLines = completedLines.rows.length + completedLines.columns.length

  if (totalLines > 0) {
    // 石シールを除いた消去対象セルを取得
    const cells = getCellsToRemoveWithFilter(newBoard, completedLines)

    emitLinesCompleted(
      completedLines.rows,
      completedLines.columns,
      cells.map((c) => ({
        position: { row: c.row, col: c.col },
        cell: newBoard[c.row][c.col],
      }))
    )

    // 消去後の盤面を先に計算（全消し判定用）
    const boardAfterClear = clearLines(newBoard, cells)

    // レリック効果コンテキストを作成
    const relicContext: RelicEffectContext = {
      ownedRelics: state.player.ownedRelics,
      totalLines,
      rowLines: completedLines.rows.length,
      colLines: completedLines.columns.length,
      placedBlockSize: getPieceBlockCount(piece),
      isBoardEmptyAfterClear: isBoardEmpty(boardAfterClear),
      relicMultiplierState: state.relicMultiplierState,
      completedRows: completedLines.rows,
      completedCols: completedLines.columns,
      scriptRelicLines: state.scriptRelicLines,
    }

    const scoreBreakdown = calculateScoreWithEffects(
      newBoard,
      completedLines,
      comboCount,
      relicContext,
      Math.random,
      state.player.relicDisplayOrder
    )
    const scoreGain = scoreBreakdown.finalScore
    const newScore = state.score + scoreGain
    const goldGain = scoreBreakdown.goldCount
    const newPlayer = addGold(state.player, goldGain)
    const newPhase = determinePhase(newScore, state.targetScore, finalDeck.remainingHands)

    // スコアアニメーション作成
    const scoreAnim = createScoreAnimation(
      scoreBreakdown,
      state.player.relicDisplayOrder,
      state.score
    )

    emitScoreCalculated(scoreBreakdown.baseScore, buildScoreBonuses(scoreBreakdown), scoreGain)
    emitGoldGained(goldGain, 'seal:gold')

    const activatedRelics = getActivatedRelicsFromScoreBreakdown(scoreBreakdown)
    for (const relic of activatedRelics) {
      emitRelicTriggered(relic.relicId, relic.relicId, typeof relic.bonusValue === 'number' ? relic.bonusValue : 0)
    }

    const relicAnimation = activatedRelics.length > 0
      ? createRelicActivationAnimation(activatedRelics, RELIC_EFFECT_STYLE.duration)
      : null

    const newRelicMultiplierState = updateRelicMultipliers(
      state.relicMultiplierState,
      state.player.ownedRelics,
      totalLines,
      completedLines.rows.length,
      completedLines.columns.length
    )

    return {
      success: true,
      newState: {
        ...state,
        board: newBoard,
        pieceSlots: finalSlots,
        dragState: initialDragState,
        clearingAnimation: {
          isAnimating: true,
          cells,
          startTime: Date.now(),
          duration: CLEAR_ANIMATION.duration,
        },
        relicActivationAnimation: relicAnimation,
        scoreAnimation: scoreAnim,
        score: newScore,
        player: newPlayer,
        deck: finalDeck,
        phase: newPhase,
        comboCount,
        relicMultiplierState: newRelicMultiplierState,
        volcanoEligible: false, // ライン消去があったので火山は発動不可
      },
    }
  }

  // ライン消去なし
  const newRelicMultiplierState = updateRelicMultipliers(
    state.relicMultiplierState,
    state.player.ownedRelics,
    0,
    0,
    0
  )

  // 配置不可チェック＆リドロー
  const resolved = resolveUnplaceableHand(
    newBoard, finalSlots, finalDeck, state.score, state.targetScore
  )

  // 火山レリック発動判定
  const volcanoResult = tryVolcanoActivation(
    state, resolved, newBoard, comboCount, newRelicMultiplierState
  )
  if (volcanoResult) {
    return volcanoResult
  }

  return {
    success: true,
    newState: {
      ...state,
      board: newBoard,
      pieceSlots: resolved.finalSlots,
      dragState: initialDragState,
      deck: resolved.finalDeck,
      phase: resolved.phase,
      comboCount,
      relicMultiplierState: newRelicMultiplierState,
    },
  }
}

/**
 * 購入したPieceをデッキに追加
 * minoIdをallMinosに追加し、パターン/シール情報をpurchasedPiecesに保存
 */
function addPieceToDeck(deck: DeckState, piece: Piece): DeckState {
  // PieceのIDからミノIDを抽出
  // ID形式: "minoId-timestamp-random"（PieceService.createPieceIdで生成）
  // 例: "tetromino-t-1234567890-abc123" → "tetromino-t"
  const minoId = piece.id.replace(/-\d+-[a-z0-9]+$/, '')

  // パターンまたはシールがある場合はpurchasedPiecesに保存
  const hasEffect = Array.from(piece.blocks.values()).some(
    (block) => block.pattern || block.seal
  )

  let newPurchasedPieces: ReadonlyMap<string, Piece> = deck.purchasedPieces
  if (hasEffect) {
    const mutableMap = new Map(deck.purchasedPieces)
    mutableMap.set(minoId, piece)
    newPurchasedPieces = mutableMap
  }

  return {
    ...deck,
    cards: [...deck.cards, minoId],
    allMinos: [...deck.allMinos, minoId],
    purchasedPieces: newPurchasedPieces,
  }
}

/**
 * 次のラウンドの状態を作成
 */
function createNextRoundState(currentState: GameState): GameState {
  const rng = new DefaultRandom()
  const nextRound = currentState.round + 1
  const roundInfo = createRoundInfo(nextRound, rng)

  // ボス条件に基づいた配置回数とドロー枚数を取得
  const maxHands = getMaxPlacements(roundInfo)
  const drawCount = getDrawCount(roundInfo)

  // allMinos（初期デッキ + 購入済みブロック）を使って新しいデッキを作成
  // purchasedPiecesも引き継ぐ（パターン/シール情報を維持するため）
  const baseDeck: DeckState = {
    cards: shuffleCurrentDeck(currentState.deck, rng).cards,
    allMinos: currentState.deck.allMinos,
    remainingHands: maxHands,
    purchasedPieces: currentState.deck.purchasedPieces,
    stockSlot: null, // ラウンド開始時にストックをクリア
  }

  const { slots, newDeck } = generateNewPieceSlotsFromDeckWithCount(
    baseDeck,
    drawCount,
    rng
  )

  // ボス条件「おじゃまブロック」の場合は配置
  let board = createEmptyBoard()
  if (roundInfo.bossCondition?.id === 'obstacle') {
    board = placeObstacleOnBoard(board, rng)
  }

  const targetScore = calculateTargetScore(nextRound)

  // 台本レリック: 所持時に指定ラインを抽選
  const scriptRelicLines = hasRelic(currentState.player.ownedRelics, 'script')
    ? generateScriptLines(() => rng.next())
    : null

  // イベント発火: ラウンド開始
  emitRoundStarted(nextRound, targetScore)

  return {
    board,
    pieceSlots: slots,
    dragState: initialDragState,
    score: 0,
    clearingAnimation: null,
    relicActivationAnimation: null,
    scoreAnimation: null,
    deck: newDeck,
    phase: 'round_progress',
    round: nextRound,
    roundInfo,
    player: currentState.player,
    targetScore,
    shopState: null,
    comboCount: 0,
    relicMultiplierState: INITIAL_RELIC_MULTIPLIER_STATE, // ラウンド開始時に倍率をリセット
    scriptRelicLines,
    deckViewOpen: false,
    volcanoEligible: true, // ラウンド開始時にリセット
  }
}

/**
 * ゲームリデューサー
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UI/START_DRAG': {
      const slot = state.pieceSlots[action.slotIndex]
      if (!slot?.piece) return state

      return {
        ...state,
        dragState: {
          isDragging: true,
          pieceId: slot.piece.id,
          slotIndex: action.slotIndex,
          dragSource: 'hand',
          currentPos: action.startPos,
          startPos: action.startPos,
          boardPos: null,
        },
      }
    }

    case 'UI/START_DRAG_FROM_STOCK': {
      const stockPiece = state.deck.stockSlot
      if (!stockPiece) return state

      return {
        ...state,
        dragState: {
          isDragging: true,
          pieceId: stockPiece.id,
          slotIndex: null,
          dragSource: 'stock',
          currentPos: action.startPos,
          startPos: action.startPos,
          boardPos: null,
        },
      }
    }

    case 'UI/UPDATE_DRAG': {
      if (!state.dragState.isDragging) return state

      return {
        ...state,
        dragState: {
          ...state.dragState,
          currentPos: action.currentPos,
          boardPos: action.boardPos,
        },
      }
    }

    case 'UI/END_DRAG': {
      if (!state.dragState.isDragging) {
        return { ...state, dragState: initialDragState }
      }

      // ストックからのドラッグの場合
      if (state.dragState.dragSource === 'stock') {
        const stockPiece = state.deck.stockSlot
        if (!stockPiece) {
          return { ...state, dragState: initialDragState }
        }

        const boardPos = state.dragState.boardPos

        // ボードへの配置（配置回数を消費）
        if (
          state.phase === 'playing' &&
          boardPos &&
          canPlacePiece(state.board, stockPiece.shape, boardPos, getPiecePattern(stockPiece))
        ) {
          // ストックをクリアした新しいデッキを作成
          const newDeck: DeckState = { ...state.deck, stockSlot: null }
          const newSlots = [...state.pieceSlots]
          const newComboCount = hasComboPattern(stockPiece) ? state.comboCount + 1 : 0

          const result = processPiecePlacement(state, stockPiece, boardPos, newSlots, newDeck, newComboCount)
          return result.newState
        }

        // ボードへの配置ができなかった場合は元に戻す（ストックに残る）
        return { ...state, dragState: initialDragState }
      }

      // 手札からのドラッグの場合
      if (state.dragState.slotIndex === null) {
        return { ...state, dragState: initialDragState }
      }

      // ゲーム終了状態では配置不可
      if (state.phase !== 'playing') {
        return { ...state, dragState: initialDragState }
      }

      const slotIndex = state.dragState.slotIndex
      const slot = state.pieceSlots[slotIndex]
      const boardPos = state.dragState.boardPos

      // 配置可能かチェック
      if (
        slot?.piece &&
        boardPos &&
        canPlacePiece(state.board, slot.piece.shape, boardPos, getPiecePattern(slot.piece))
      ) {
        // スロットからブロックを削除
        const newSlots = state.pieceSlots.map((s, i) =>
          i === slotIndex ? { ...s, piece: null } : s
        )
        const newComboCount = hasComboPattern(slot.piece) ? state.comboCount + 1 : 0

        const result = processPiecePlacement(state, slot.piece, boardPos, newSlots, state.deck, newComboCount)
        return result.newState
      }

      // 配置不可の場合は元に戻す
      return { ...state, dragState: initialDragState }
    }

    case 'BOARD/PLACE_PIECE': {
      const slot = state.pieceSlots[action.slotIndex]
      if (!slot?.piece) return state

      // ゲーム終了状態では配置不可
      if (state.phase !== 'playing') return state

      if (!canPlacePiece(state.board, slot.piece.shape, action.position, getPiecePattern(slot.piece))) {
        return state
      }

      // comboCount更新（配置したピースがcomboパターンを持つか）
      const newComboCount = hasComboPattern(slot.piece)
        ? state.comboCount + 1
        : 0

      // Piece全体を渡す
      const newBoard = placePieceOnBoard(state.board, slot.piece, action.position)
      const newSlots = state.pieceSlots.map((s, i) =>
        i === action.slotIndex ? { ...s, piece: null } : s
      )

      // 配置後の状態を計算
      const { finalSlots, finalDeck } = handlePlacement(newSlots, state.deck)
      const newPhase = determinePhase(
        state.score,
        state.targetScore,
        finalDeck.remainingHands
      )

      return {
        ...state,
        board: newBoard,
        pieceSlots: finalSlots,
        deck: finalDeck,
        phase: newPhase,
        comboCount: newComboCount,
      }
    }

    case 'GAME/RESET': {
      // 保存データを削除
      clearGameState()
      return createInitialState()
    }

    case 'ANIMATION/END_CLEAR': {
      if (!state.clearingAnimation) return state

      const clearedBoard = clearLines(state.board, state.clearingAnimation.cells)

      // イベント発火: ライン消去完了
      emitLinesCleared(
        state.clearingAnimation.cells.map((c) => ({
          position: { row: c.row, col: c.col },
          cell: state.board[c.row][c.col],
        })),
        isBoardEmpty(clearedBoard)
      )

      // 配置不可チェック＆リドロー
      const resolved = resolveUnplaceableHand(
        clearedBoard, [...state.pieceSlots], state.deck, state.score, state.targetScore
      )

      return {
        ...state,
        board: clearedBoard,
        clearingAnimation: null,
        pieceSlots: resolved.finalSlots,
        deck: resolved.finalDeck,
        phase: resolved.phase,
      }
    }

    case 'ANIMATION/END_RELIC_ACTIVATION': {
      return {
        ...state,
        relicActivationAnimation: null,
      }
    }

    case 'ANIMATION/ADVANCE_SCORE_STEP': {
      if (!state.scoreAnimation?.isAnimating) return state
      const nextIndex = state.scoreAnimation.currentStepIndex + 1
      if (nextIndex >= state.scoreAnimation.steps.length) {
        // 全ステップ完了 → カウントアップ開始
        return {
          ...state,
          scoreAnimation: {
            ...state.scoreAnimation,
            isCountingUp: true,
            countStartTime: Date.now(),
          },
        }
      }
      const nextStep = state.scoreAnimation.steps[nextIndex]
      return {
        ...state,
        scoreAnimation: {
          ...state.scoreAnimation,
          currentStepIndex: nextIndex,
          stepStartTime: Date.now(),
          highlightedRelicId: nextStep?.relicId ?? null,
        },
      }
    }

    case 'ANIMATION/END_SCORE': {
      if (!state.scoreAnimation) return state
      return {
        ...state,
        scoreAnimation: null,
      }
    }

    case 'ANIMATION/SET_FAST_FORWARD': {
      if (!state.scoreAnimation?.isAnimating) return state
      return {
        ...state,
        scoreAnimation: {
          ...state.scoreAnimation,
          isFastForward: action.isFastForward,
          stepDuration: action.isFastForward
            ? SCORE_ANIMATION.fastForwardDuration
            : SCORE_ANIMATION.stepDuration,
        },
      }
    }

    case 'RELIC/REORDER': {
      if (action.fromIndex === action.toIndex) return state
      const source = state.player.relicDisplayOrder
      const item = source[action.fromIndex]
      if (!item) return state
      // fromIndex を除外した配列に toIndex の位置に挿入
      const without = [...source.slice(0, action.fromIndex), ...source.slice(action.fromIndex + 1)]
      const newOrder = [...without.slice(0, action.toIndex), item, ...without.slice(action.toIndex)]
      return {
        ...state,
        player: { ...state.player, relicDisplayOrder: newOrder },
      }
    }

    case 'ROUND/ADVANCE': {
      // round_clear状態でのみショップに進める
      if (state.phase !== 'round_clear') return state

      // 最終ラウンドならゲームクリア（ショップをスキップ）
      if (isFinalRound(state.round)) {
        const goldReward = calculateGoldReward(state.deck.remainingHands)

        // イベント発火: ラウンドクリア + ゴールド獲得
        emitRoundCleared(state.round, state.score, goldReward)
        emitGoldGained(goldReward, 'round_clear')

        // ゲームクリア時は保存データを削除
        clearGameState()

        return {
          ...state,
          phase: 'game_clear',
          player: addGold(state.player, goldReward),
          shopState: null,
        }
      }

      // ショップへ遷移（デバッグ用の確率オーバーライドを適用）
      const rng = new DefaultRandom()
      const goldReward = calculateGoldReward(state.deck.remainingHands)

      // イベント発火: ラウンドクリア + ゴールド獲得
      emitRoundCleared(state.round, state.score, goldReward)
      emitGoldGained(goldReward, 'round_clear')

      const newState = {
        ...state,
        phase: 'shopping' as const,
        player: addGold(state.player, goldReward),
        shopState: createShopState(rng, state.player.ownedRelics, action.probabilityOverride),
      }

      // ショップ遷移時に保存
      saveGameState(newState)

      return newState
    }

    case 'SHOP/BUY_ITEM': {
      // shopping状態でのみ購入可能
      if (state.phase !== 'shopping' || !state.shopState) return state

      const { itemIndex } = action

      // 配列境界チェック
      if (itemIndex < 0 || itemIndex >= state.shopState.items.length) return state

      const item = state.shopState.items[itemIndex]

      // 既に購入済み、またはゴールド不足の場合は何もしない
      if (item.purchased || !canAfford(state.player.gold, item.price)) return state

      // アイテムを購入済みにする
      const newShopState = markItemAsPurchased(state.shopState, itemIndex)

      // 価格を支払う
      let newPlayer = subtractGold(state.player, item.price)

      // BlockShopItemの場合はPieceをデッキに追加
      let newDeck = state.deck
      if (isBlockShopItem(item)) {
        newDeck = addPieceToDeck(state.deck, item.piece)
      }

      // RelicShopItemの場合はレリックをプレイヤーに追加
      if (isRelicShopItem(item)) {
        newPlayer = addRelic(newPlayer, item.relicId)
      }

      const updatedState = {
        ...state,
        player: newPlayer,
        deck: newDeck,
        shopState: newShopState,
      }

      // 購入後に保存（データ整合性のため）
      saveGameState(updatedState)

      return updatedState
    }

    case 'SHOP/LEAVE': {
      // shopping状態でのみ店を出られる
      if (state.phase !== 'shopping') return state

      const nextRoundState = createNextRoundState(state)

      // 次ラウンド開始時に保存
      saveGameState(nextRoundState)

      return nextRoundState
    }

    case 'ROUND/START': {
      // round_progress状態でのみプレイ開始可能
      if (state.phase !== 'round_progress') return state

      const playingState = {
        ...state,
        phase: 'playing' as const,
      }

      // プレイ開始時に保存
      saveGameState(playingState)

      return playingState
    }

    case 'ROUND/SHOW_PROGRESS': {
      // shopping状態からのみラウンド進行画面へ遷移可能
      if (state.phase !== 'shopping') return state

      const progressState = {
        ...state,
        phase: 'round_progress' as const,
        shopState: null,
      }

      saveGameState(progressState)

      return progressState
    }

    case 'UI/OPEN_DECK_VIEW': {
      // オーバーレイ表示中は開けない
      if (
        state.phase === 'round_clear' ||
        state.phase === 'game_over' ||
        state.phase === 'game_clear' ||
        state.phase === 'shopping'
      ) {
        return state
      }
      return {
        ...state,
        deckViewOpen: true,
      }
    }

    case 'UI/CLOSE_DECK_VIEW': {
      return {
        ...state,
        deckViewOpen: false,
      }
    }

    // ストック操作（配置回数を消費しない）
    case 'STOCK/MOVE_TO_STOCK': {
      // playing状態でのみ操作可能
      if (state.phase !== 'playing') return state

      // 境界チェック
      if (action.slotIndex < 0 || action.slotIndex >= state.pieceSlots.length) return state

      const slot = state.pieceSlots[action.slotIndex]
      if (!slot?.piece) return state

      const pieceToStock = slot.piece
      const currentStock = state.deck.stockSlot

      // 手札スロットを更新（既存ストックがあればスワップ）
      const newSlots = state.pieceSlots.map((s, i) =>
        i === action.slotIndex ? { ...s, piece: currentStock } : s
      )

      return {
        ...state,
        pieceSlots: newSlots,
        deck: { ...state.deck, stockSlot: pieceToStock },
        dragState: initialDragState,
      }
    }

    case 'STOCK/MOVE_FROM_STOCK': {
      // playing状態でのみ操作可能
      if (state.phase !== 'playing') return state

      // 境界チェック
      if (action.targetSlotIndex < 0 || action.targetSlotIndex >= state.pieceSlots.length) return state

      const stockPiece = state.deck.stockSlot
      if (!stockPiece) return state

      const targetSlot = state.pieceSlots[action.targetSlotIndex]
      if (targetSlot?.piece) return state  // 空きスロットがなければ失敗

      const newSlots = state.pieceSlots.map((s, i) =>
        i === action.targetSlotIndex ? { ...s, piece: stockPiece } : s
      )

      return {
        ...state,
        pieceSlots: newSlots,
        deck: { ...state.deck, stockSlot: null },
        dragState: initialDragState,
      }
    }

    case 'STOCK/SWAP': {
      // playing状態でのみ操作可能
      if (state.phase !== 'playing') return state

      // 境界チェック
      if (action.slotIndex < 0 || action.slotIndex >= state.pieceSlots.length) return state

      const slot = state.pieceSlots[action.slotIndex]
      if (!slot?.piece) return state

      const stockPiece = state.deck.stockSlot
      if (!stockPiece) return state

      const newSlots = state.pieceSlots.map((s, i) =>
        i === action.slotIndex ? { ...s, piece: stockPiece } : s
      )

      return {
        ...state,
        pieceSlots: newSlots,
        deck: { ...state.deck, stockSlot: slot.piece },
        dragState: initialDragState,
      }
    }

    // デバッグアクション
    case 'DEBUG/ADD_RELIC': {
      const relicId = action.relicType as RelicId
      const newPlayer = addRelic(state.player, relicId)
      const newState = { ...state, player: newPlayer }
      saveGameState(newState)
      return newState
    }

    case 'DEBUG/REMOVE_RELIC': {
      const relicId = action.relicType as RelicId
      const newPlayer = removeRelic(state.player, relicId)
      // hand_stockを削除した場合、ストック枠もクリア
      let newDeck = state.deck
      if (action.relicType === 'hand_stock' && state.deck.stockSlot) {
        newDeck = { ...state.deck, stockSlot: null }
      }
      const newState = { ...state, player: newPlayer, deck: newDeck }
      saveGameState(newState)
      return newState
    }

    case 'DEBUG/ADD_GOLD': {
      const newGold = Math.max(0, state.player.gold + action.amount)
      const newPlayer = { ...state.player, gold: newGold }
      const newState = { ...state, player: newPlayer }
      saveGameState(newState)
      return newState
    }

    case 'DEBUG/ADD_SCORE': {
      const newScore = Math.max(0, state.score + action.amount)
      const newState = { ...state, score: newScore }
      saveGameState(newState)
      return newState
    }

    default:
      return state
  }
}

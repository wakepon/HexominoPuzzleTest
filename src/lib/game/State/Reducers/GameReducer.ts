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
} from '../../Domain'
import { toGridPosition } from '../../Domain/Core/Position'
import type { GameAction } from '../Actions/GameActions'
import type { RelicEffectContext } from '../../Domain/Effect/RelicEffectTypes'
import type { ScoreBonus } from '../../Events/GameEvent'
import { isBlockShopItem, isRelicShopItem } from '../../Domain/Shop/ShopTypes'
import { addRelic, addGold, subtractGold } from './PlayerReducer'
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
import { canPlacePiece } from '../../Services/CollisionService'
import {
  findCompletedLines,
  getCellsToRemoveWithFilter,
  clearLines,
  calculateScoreWithEffects,
} from '../../Services/LineService'
import { hasComboPattern } from '../../Domain/Effect/PatternEffectHandler'
import { getActivatedRelicsFromScoreBreakdown } from '../../Domain/Effect/RelicEffectHandler'
import { createRelicActivationAnimation } from '../../Domain/Animation/AnimationState'
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
import { DefaultRandom } from '../../Utils/Random'
import { CLEAR_ANIMATION, RELIC_EFFECT_STYLE } from '../../Data/Constants'
import { saveGameState, clearGameState } from '../../Services/StorageService'

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
  if (breakdown.smallLuckBonus > 0) {
    bonuses.push({
      source: 'relic:small_luck',
      amount: breakdown.smallLuckBonus,
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
 * 配置後のデッキとスロットの状態を計算
 */
function handlePlacement(
  slots: readonly PieceSlot[],
  deck: DeckState
): { finalSlots: PieceSlot[]; finalDeck: DeckState } {
  const updatedDeck = decrementRemainingHands(deck)

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

  // イベント発火: ラウンド開始
  emitRoundStarted(nextRound, targetScore)

  return {
    board,
    pieceSlots: slots,
    dragState: initialDragState,
    score: 0,
    clearingAnimation: null,
    relicActivationAnimation: null,
    deck: newDeck,
    phase: 'playing',
    round: nextRound,
    roundInfo,
    player: currentState.player,
    targetScore,
    shopState: null,
    comboCount: 0,
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
      if (!state.dragState.isDragging || state.dragState.slotIndex === null) {
        return {
          ...state,
          dragState: initialDragState,
        }
      }

      // ゲーム終了状態では配置不可
      if (state.phase !== 'playing') {
        return {
          ...state,
          dragState: initialDragState,
        }
      }

      const slotIndex = state.dragState.slotIndex
      const slot = state.pieceSlots[slotIndex]
      const boardPos = state.dragState.boardPos

      // 配置可能かチェック
      if (
        slot?.piece &&
        boardPos &&
        canPlacePiece(state.board, slot.piece.shape, boardPos)
      ) {
        // ブロックを配置（Piece全体を渡す）
        const newBoard = placePieceOnBoard(state.board, slot.piece, boardPos)

        // イベント発火: ピース配置
        emitPiecePlaced(slot.piece, toGridPosition(boardPos), newBoard)

        // スロットからブロックを削除
        const newSlots = state.pieceSlots.map((s, i) =>
          i === slotIndex ? { ...s, piece: null } : s
        )

        // 配置後の状態を計算
        const { finalSlots, finalDeck } = handlePlacement(newSlots, state.deck)

        // comboCount更新（配置したピースがcomboパターンを持つか）
        const newComboCount = hasComboPattern(slot.piece)
          ? state.comboCount + 1
          : 0

        // ライン消去判定
        const completedLines = findCompletedLines(newBoard)
        const totalLines =
          completedLines.rows.length + completedLines.columns.length

        if (totalLines > 0) {
          // 石シールを除いた消去対象セルを取得
          const cells = getCellsToRemoveWithFilter(newBoard, completedLines)

          // イベント発火: ライン完成
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
            placedBlockSize: getPieceBlockCount(slot.piece),
            isBoardEmptyAfterClear: isBoardEmpty(boardAfterClear),
          }

          const scoreBreakdown = calculateScoreWithEffects(
            newBoard,
            completedLines,
            newComboCount,
            relicContext,
            Math.random
          )
          const scoreGain = scoreBreakdown.finalScore
          const newScore = state.score + scoreGain
          // ゴールドシール効果: 消去されたゴールドシール数分ゴールドを加算
          const goldGain = scoreBreakdown.goldCount
          const newPlayer = addGold(state.player, goldGain)
          const newPhase = determinePhase(
            newScore,
            state.targetScore,
            finalDeck.remainingHands
          )

          // イベント発火: スコア計算
          emitScoreCalculated(
            scoreBreakdown.baseScore,
            buildScoreBonuses(scoreBreakdown),
            scoreGain
          )

          // イベント発火: ゴールド獲得（シール効果）
          emitGoldGained(goldGain, 'seal:gold')

          // レリック発動アニメーション（scoreBreakdownから直接取得し、重複計算を回避）
          const activatedRelics =
            getActivatedRelicsFromScoreBreakdown(scoreBreakdown)

          // イベント発火: レリック発動
          for (const relic of activatedRelics) {
            emitRelicTriggered(
              relic.relicId,
              relic.relicId,
              typeof relic.bonusValue === 'number' ? relic.bonusValue : 0
            )
          }

          const relicAnimation =
            activatedRelics.length > 0
              ? createRelicActivationAnimation(
                  activatedRelics,
                  RELIC_EFFECT_STYLE.duration
                )
              : null

          return {
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
            score: newScore,
            player: newPlayer,
            deck: finalDeck,
            phase: newPhase,
            comboCount: newComboCount,
          }
        }

        // ライン消去なしでもフェーズ判定
        const newPhase = determinePhase(
          state.score,
          state.targetScore,
          finalDeck.remainingHands
        )

        return {
          ...state,
          board: newBoard,
          pieceSlots: finalSlots,
          dragState: initialDragState,
          deck: finalDeck,
          phase: newPhase,
          comboCount: newComboCount,
        }
      }

      // 配置不可の場合は元に戻す
      return {
        ...state,
        dragState: initialDragState,
      }
    }

    case 'BOARD/PLACE_PIECE': {
      const slot = state.pieceSlots[action.slotIndex]
      if (!slot?.piece) return state

      // ゲーム終了状態では配置不可
      if (state.phase !== 'playing') return state

      if (!canPlacePiece(state.board, slot.piece.shape, action.position)) {
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

      return {
        ...state,
        board: clearedBoard,
        clearingAnimation: null,
      }
    }

    case 'ANIMATION/END_RELIC_ACTIVATION': {
      return {
        ...state,
        relicActivationAnimation: null,
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

    default:
      return state
  }
}

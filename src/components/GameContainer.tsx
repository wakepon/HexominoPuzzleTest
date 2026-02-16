import { useCallback } from 'react'
import { useGame } from '../hooks/useGame'
import { useCanvasLayout } from '../hooks/useCanvasLayout'
import { GameCanvas } from './GameCanvas'
import type { RelicType } from '../lib/game/Domain/Effect/Relic'
import type { RelicId } from '../lib/game/Domain/Core/Id'

export function GameContainer() {
  const { state, debugSettings, actions } = useGame()
  const layout = useCanvasLayout(state.pieceSlots, state.player.ownedRelics)

  // レリックのトグル（所持していれば削除、していなければ追加）
  const handleDebugToggleRelic = useCallback((relicType: RelicType) => {
    const isOwned = state.player.ownedRelics.includes(relicType as RelicId)
    if (isOwned) {
      actions.debugRemoveRelic(relicType)
    } else {
      actions.debugAddRelic(relicType)
    }
  }, [state.player.ownedRelics, actions])

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-screen bg-wood-board">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-start bg-wood-board min-h-screen overflow-hidden"
      style={{
        touchAction: 'none',
      }}
    >
      <GameCanvas
        state={state}
        layout={layout}
        debugSettings={debugSettings}
        onDragStart={actions.startDrag}
        onDragStartFromStock={actions.startDragFromStock}
        onDragStartFromStock2={actions.startDragFromStock2}
        onDragMove={actions.updateDrag}
        onDragEnd={actions.endDrag}
        onClearAnimationEnd={actions.endClearAnimation}
        onRelicActivationAnimationEnd={actions.endRelicActivationAnimation}
        onAdvanceScoreStep={actions.advanceScoreStep}
        onEndScoreAnimation={actions.endScoreAnimation}
        onSetFastForward={actions.setFastForward}
        onAdvanceRound={actions.advanceRound}
        onReset={actions.resetGame}
        onBuyItem={actions.buyItem}
        onLeaveShop={actions.leaveShop}
        onRerollShop={actions.rerollShop}
        onUpdateDebugSettings={actions.updateDebugSettings}
        onDeleteSave={actions.deleteSave}
        onStartRound={actions.startRound}
        onOpenDeckView={actions.openDeckView}
        onCloseDeckView={actions.closeDeckView}
        onMoveToStock={actions.moveToStock}
        onMoveFromStock={actions.moveFromStock}
        onSwapWithStock={actions.swapWithStock}
        onMoveToStock2={actions.moveToStock2}
        onMoveFromStock2={actions.moveFromStock2}
        onSwapWithStock2={actions.swapWithStock2}
        onReorderRelic={actions.reorderRelic}
        onApplyPendingPhase={actions.applyPendingPhase}
        onDebugToggleRelic={handleDebugToggleRelic}
        onDebugAddGold={actions.debugAddGold}
        onDebugAddScore={actions.debugAddScore}
      />
    </div>
  )
}

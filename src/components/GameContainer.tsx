import { useGame } from '../hooks/useGame'
import { useCanvasLayout } from '../hooks/useCanvasLayout'
import { GameCanvas } from './GameCanvas'

export function GameContainer() {
  const { state, debugSettings, actions } = useGame()
  const layout = useCanvasLayout(state.pieceSlots)

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
        onDragMove={actions.updateDrag}
        onDragEnd={actions.endDrag}
        onClearAnimationEnd={actions.endClearAnimation}
        onRelicActivationAnimationEnd={actions.endRelicActivationAnimation}
        onAdvanceRound={actions.advanceRound}
        onReset={actions.resetGame}
        onBuyItem={actions.buyItem}
        onLeaveShop={actions.leaveShop}
        onUpdateDebugSettings={actions.updateDebugSettings}
        onDeleteSave={actions.deleteSave}
        onStartRound={actions.startRound}
        onOpenDeckView={actions.openDeckView}
        onCloseDeckView={actions.closeDeckView}
      />
    </div>
  )
}

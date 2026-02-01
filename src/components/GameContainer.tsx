import { useGame } from '../hooks/useGame'
import { useCanvasLayout } from '../hooks/useCanvasLayout'
import { GameCanvas } from './GameCanvas'

export function GameContainer() {
  const { state, actions } = useGame()
  const layout = useCanvasLayout()

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
        onDragStart={actions.startDrag}
        onDragMove={actions.updateDrag}
        onDragEnd={actions.endDrag}
      />
    </div>
  )
}

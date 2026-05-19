import { useStore } from '../store'
import PanelControls from './PanelControls'
import CanvasSettings from './CanvasSettings'

export default function PropertiesPanel() {
  const selectedId = useStore(s => s.selectedId)
  const textObjects = useStore(s => s.textObjects)
  const selectedObj = selectedId ? (textObjects.find(o => o.id === selectedId) ?? null) : null

  return (
    <aside id="panel">
      {selectedObj ? (
        <PanelControls obj={selectedObj} />
      ) : (
        <div id="panel-placeholder">
          <p>Select a text object<br />to edit its properties</p>
        </div>
      )}
      <CanvasSettings />
    </aside>
  )
}

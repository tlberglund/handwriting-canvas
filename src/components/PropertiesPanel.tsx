import { useStore } from '../store'
import PanelControls from './PanelControls'
import CanvasSettings from './CanvasSettings'
import PanelFooter from './PanelFooter'

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
          <p>Select a text object or<br />create a new one</p>
        </div>
      )}
      <CanvasSettings />
      <PanelFooter />
    </aside>
  )
}

import { useState } from 'react'
import { useStore } from '../store'

export default function TabBar() {
  const projects = useStore(s => s.projects)
  const openProjectIds = useStore(s => s.openProjectIds)
  const activeProjectId = useStore(s => s.activeProjectId)
  const createProject = useStore(s => s.createProject)
  const renameProject = useStore(s => s.renameProject)
  const closeProject = useStore(s => s.closeProject)
  const setActiveProject = useStore(s => s.setActiveProject)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const startEdit = (id: string) => {
    setEditingId(id)
    setEditValue(projects[id]?.name ?? '')
  }

  const commitEdit = () => {
    if (!editingId) return
    const trimmed = editValue.trim()
    if (trimmed) renameProject(editingId, trimmed)
    setEditingId(null)
  }

  const cancelEdit = () => setEditingId(null)

  const handleNew = () => {
    const id = createProject('Untitled Project')
    startEdit(id)
  }

  return (
    <div id="tab-bar">
      {openProjectIds.map(id => {
        const project = projects[id]
        if (!project) return null
        const isActive = id === activeProjectId
        return (
          <div
            key={id}
            className={`tab${isActive ? ' active' : ''}`}
            onClick={() => { if (!isActive) setActiveProject(id) }}
          >
            {editingId === id ? (
              <input
                autoFocus
                className="tab-label-input"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitEdit()
                  if (e.key === 'Escape') cancelEdit()
                }}
                onBlur={commitEdit}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span
                className="tab-label"
                onDoubleClick={e => { e.stopPropagation(); startEdit(id) }}
              >
                {project.name}
              </span>
            )}
            <button
              className="tab-close"
              onClick={e => { e.stopPropagation(); closeProject(id) }}
              title="Close project"
            >×</button>
          </div>
        )
      })}

      <button id="btn-new-project" onClick={handleNew} title="New project">+</button>
    </div>
  )
}

import { useRef, useState } from 'react'
import { useStore } from '../store'
import ProjectLibrary from './ProjectLibrary'

export default function TabBar() {
  const projects = useStore(s => s.projects)
  const openProjectIds = useStore(s => s.openProjectIds)
  const activeProjectId = useStore(s => s.activeProjectId)
  const createProject = useStore(s => s.createProject)
  const renameProject = useStore(s => s.renameProject)
  const closeProject = useStore(s => s.closeProject)
  const setActiveProject = useStore(s => s.setActiveProject)
  const importProjects = useStore(s => s.importProjects)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleExport = () => {
    const { projects: allProjects } = useStore.getState()
    const data = JSON.stringify({ version: 1, projects: allProjects }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `handwritten-projects-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        const ok = importProjects(data)
        if (!ok) setImportError('File does not contain valid project data')
        else setImportError(null)
      } catch {
        setImportError('Invalid JSON file')
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsText(file)
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

      <div className="tab-bar-spacer" />

      {importError && <span className="tab-bar-error">{importError}</span>}

      <div className="tab-bar-actions">
        <ProjectLibrary />
        <button className="tab-bar-action" onClick={handleExport} title="Export all projects as JSON">
          Export
        </button>
        <button
          className="tab-bar-action"
          onClick={() => fileInputRef.current?.click()}
          title="Import projects from JSON"
        >
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImportFile}
        />
      </div>
    </div>
  )
}

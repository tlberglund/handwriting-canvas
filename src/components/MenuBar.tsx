import { useRef, useState, useEffect } from 'react'
import { useStore } from '../store'

export default function MenuBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showProjects, setShowProjects] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [projectPanelStyle, setProjectPanelStyle] = useState<React.CSSProperties>({})

  const menuContainerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const projectsPanelRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const projects = useStore(s => s.projects)
  const openProjectIds = useStore(s => s.openProjectIds)
  const activeProjectId = useStore(s => s.activeProjectId)
  const createProject = useStore(s => s.createProject)
  const closeProject = useStore(s => s.closeProject)
  const openProject = useStore(s => s.openProject)
  const deleteProject = useStore(s => s.deleteProject)
  const importProjects = useStore(s => s.importProjects)

  useEffect(() => {
    if (!menuOpen) return
    const handle = (e: MouseEvent) => {
      if (menuContainerRef.current?.contains(e.target as Node)) return
      setMenuOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

  useEffect(() => {
    if (!showProjects) return
    const handle = (e: MouseEvent) => {
      if (projectsPanelRef.current?.contains(e.target as Node)) return
      setShowProjects(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [showProjects])

  const handleNew = () => {
    createProject('Untitled Project')
    setMenuOpen(false)
  }

  const handleOpenProjects = () => {
    setMenuOpen(false)
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setProjectPanelStyle({ top: rect.bottom + 4, left: rect.left })
    }
    setShowProjects(true)
  }

  const handleClose = () => {
    if (activeProjectId) closeProject(activeProjectId)
    setMenuOpen(false)
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
    setMenuOpen(false)
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

  const allProjects = Object.values(projects).sort((a, b) => b.createdAt - a.createdAt)

  return (
    <>
      <div id="menu-bar">
        <div ref={menuContainerRef} className="menu-item">
          <button
            ref={triggerRef}
            className={`menu-trigger${menuOpen ? ' active' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
          >
            Project
          </button>
          {menuOpen && (
            <div className="menu-dropdown">
              <button className="menu-action" onClick={handleNew}>New</button>
              <button className="menu-action" onClick={handleOpenProjects}>Open…</button>
              <div className="menu-separator" />
              <button className="menu-action" onClick={handleClose} disabled={!activeProjectId}>Close</button>
              <div className="menu-separator" />
              <button className="menu-action" onClick={handleExport}>Export</button>
              <button className="menu-action" onClick={() => { fileInputRef.current?.click(); setMenuOpen(false) }}>Import</button>
            </div>
          )}
        </div>
        {importError && <span className="menu-bar-error">{importError}</span>}
      </div>

      {showProjects && (
        <div ref={projectsPanelRef} className="project-library-panel" style={projectPanelStyle}>
          {allProjects.length === 0 ? (
            <div className="project-library-empty">No projects yet</div>
          ) : (
            <ul className="project-library-list">
              {allProjects.map(p => {
                const isActive = p.id === activeProjectId
                const isOpen = openProjectIds.includes(p.id)
                return (
                  <li key={p.id} className={`project-library-row${isActive ? ' active' : ''}`}>
                    <span className="project-library-name" title={p.name}>{p.name}</span>
                    {isOpen && !isActive && <span className="project-library-badge">open</span>}
                    <button
                      className="project-library-open"
                      onClick={() => { openProject(p.id); setShowProjects(false) }}
                      disabled={isActive}
                      title={isActive ? 'Currently active' : isOpen ? 'Switch to this project' : 'Open this project'}
                    >
                      {isActive ? 'Active' : isOpen ? 'Switch' : 'Open'}
                    </button>
                    <button
                      className="project-library-delete"
                      onClick={() => deleteProject(p.id)}
                      title="Delete permanently"
                    >✕</button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />
    </>
  )
}

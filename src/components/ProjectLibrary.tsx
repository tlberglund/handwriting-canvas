import { useRef, useState, useEffect } from 'react'
import { useStore } from '../store'

export default function ProjectLibrary() {
  const [open, setOpen] = useState(false)
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({})
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const projects = useStore(s => s.projects)
  const openProjectIds = useStore(s => s.openProjectIds)
  const activeProjectId = useStore(s => s.activeProjectId)
  const openProject = useStore(s => s.openProject)
  const deleteProject = useStore(s => s.deleteProject)

  const toggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPanelStyle({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
    setOpen(v => !v)
  }

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return
      if (buttonRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const allProjects = Object.values(projects).sort((a, b) => b.createdAt - a.createdAt)

  return (
    <>
      <button
        ref={buttonRef}
        className={`tab-bar-action${open ? ' active' : ''}`}
        onClick={toggle}
        title="Browse all projects"
      >
        Projects
      </button>
      {open && (
        <div ref={panelRef} className="project-library-panel" style={panelStyle}>
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
                      onClick={() => { openProject(p.id); setOpen(false) }}
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
    </>
  )
}

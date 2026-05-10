import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MoreHorizontal,
  ChevronDown,
  Check,
  ExternalLink,
  Pencil,
  Trash2,
} from 'lucide-react'
import { getElementLayout, getResponsiveValue } from '../utils/responsive'
import { getCanvasHeight } from '../utils/editorGeometry'

const sortOptions = [
  { key: 'viewed', label: 'Last viewed by me' },
  { key: 'edited', label: 'Last edited' },
  { key: 'alphabetical', label: 'Alphabetically' },
]

export default function Dashboard({
  view = 'dashboard',
  projects = [],
  onNewProject,
  onUnarchiveProject = () => {},
  onDeleteProject = () => {},
  onRenameProject = () => {},
  onOpenProject = () => {},
}) {
  const [selectedSort, setSelectedSort] = useState('viewed')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)
  const sortRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false)
      }

      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsSortOpen(false)
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const visibleProjects = useMemo(() => {
    const filteredProjects = projects.filter((project) => {
      if (view === 'archive') {
        return project.archived
      }

      return !project.archived
    })

    return [...filteredProjects].sort((a, b) => {
      if (selectedSort === 'edited') {
        return a.lastEditedHours - b.lastEditedHours
      }

      if (selectedSort === 'alphabetical') {
        return a.name.localeCompare(b.name)
      }

      return a.lastViewedHours - b.lastViewedHours
    })
  }, [projects, selectedSort, view])

  const activeSortLabel = sortOptions.find((option) => option.key === selectedSort)?.label ?? 'Last viewed by me'
  const title = view === 'archive' ? 'Archive' : 'All'
  const description =
    view === 'archive'
      ? 'Projects you archive will appear here until you restore them.'
      : 'Browse your recent projects and manage them from one place.'

  function handleMenuAction(action, project) {
    if (action === 'open') {
      onOpenProject(project.id)
      setOpenMenuId(null)
      return
    }

    if (action === 'rename') {
      const nextName = window.prompt('Rename project', project.name)

      if (nextName && nextName.trim()) {
        onRenameProject(project.id, nextName.trim())
      }

      setOpenMenuId(null)
      return
    }

    if (action === 'delete') {
      const shouldDelete = window.confirm(`Delete "${project.name}"?`)

      if (shouldDelete) {
        onDeleteProject(project.id)
      }

      setOpenMenuId(null)
    }
  }

  const menuItems = [
    { key: 'open', label: 'Open', icon: ExternalLink },
    { key: 'rename', label: 'Rename', icon: Pencil },
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F5F8FF] min-h-full">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-[#0F2348] font-bold text-2xl">{title}</h1>
        <p className="text-[#6F7E99] text-sm">{description}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div ref={sortRef} className="relative w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsSortOpen((open) => !open)}
            className="flex items-center justify-between gap-2 w-full sm:w-auto min-w-[220px] text-sm text-[#1F2C44] border border-[#D8E1F0] bg-white px-4 py-3 rounded-2xl hover:bg-[#F3F7FF] shadow-sm transition-colors"
          >
            <span>{activeSortLabel}</span>
            <ChevronDown
              size={16}
              className={`text-[#8C99B2] transition-transform ${isSortOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isSortOpen && (
            <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-full sm:w-[240px] overflow-hidden rounded-3xl bg-white border border-[#D8E1F0] text-[#12284C] shadow-[0_18px_45px_rgba(35,72,215,0.12)] z-20">
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    setSelectedSort(option.key)
                    setIsSortOpen(false)
                  }}
                  className="flex items-center gap-3 w-full px-5 py-4 text-left text-base font-semibold hover:bg-[#F3F7FF] transition-colors"
                >
                  <span className="w-4 flex justify-center">
                    {selectedSort === option.key ? <Check size={16} /> : null}
                  </span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {view !== 'archive' && (
          <button
            onClick={onNewProject}
            className="w-full sm:w-auto bg-[#2348D7] hover:bg-[#1B3FC8] text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-[0_8px_18px_rgba(35,72,215,0.22)] transition-colors"
          >
            New Project
          </button>
        )}
      </div>

      {visibleProjects.length === 0 ? (
        <div className="rounded-3xl border border-[#DCE4F2] bg-white p-8 sm:p-10 text-center shadow-sm">
          <p className="text-[#12284C] text-lg font-semibold mb-2">
            {view === 'archive' ? 'No archived projects yet' : 'No projects found'}
          </p>
          <p className="text-[#7D8CA8] text-sm">
            {view === 'archive'
              ? 'Archive a project from the options menu and it will show up here.'
              : 'Create a new project to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visibleProjects.map((project) => (
            <div key={project.id} className="group cursor-pointer">
              <div
                role="button"
                tabIndex={0}
                onClick={() => onOpenProject(project.id)}
                onKeyDown={event => event.key === 'Enter' && onOpenProject(project.id)}
                className="mb-3 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm transition-all group-hover:border-[#C7D2FE] group-hover:shadow-md"
              >
                <ProjectThumbnail project={project} />
              </div>

              <div className="flex items-start justify-between gap-3 relative">
                <div className="min-w-0">
                  <p className="text-[#12284C] text-sm font-medium truncate">{project.name}</p>
                  <p className="text-[#7D8CA8] text-xs mt-0.5">{project.viewed}</p>
                </div>
                {view === 'archive' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUnarchiveProject(project.id)}
                      className="px-3 py-2 rounded-xl bg-[#EEF3FF] text-[#2348D7] text-sm font-semibold hover:bg-[#E3ECFF] transition-colors"
                    >
                      Unarchive
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMenuAction('delete', project)}
                      className="px-3 py-2 rounded-xl bg-[#FFE9EE] text-[#D64545] text-sm font-semibold hover:bg-[#FFD9E1] transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div ref={openMenuId === project.id ? menuRef : null} className="flex items-center gap-1 shrink-0 relative">
                    {project.badge && (
                      <span className="text-xs text-[#3154DB] bg-[#EEF3FF] border border-[#D7E3FF] px-2 py-0.5 rounded">
                        {project.badge}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setOpenMenuId((current) => (current === project.id ? null : project.id))}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-[#8B98B1] hover:text-[#1637B8] hover:bg-white p-1.5 rounded-lg"
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {openMenuId === project.id && (
                      <div className="absolute right-0 top-8 z-20 w-[148px] max-w-[80vw] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white py-1 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                        {menuItems.map((item) => {
                          const Icon = item.icon

                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => handleMenuAction(item.key, project)}
                              className={`flex items-center gap-2 w-full px-3 py-2.5 text-left text-sm transition-colors ${
                                item.danger
                                  ? 'text-[#D64545] hover:bg-[#FFF3F3]'
                                  : 'text-[#1F2C44] hover:bg-[#F5F7FB]'
                              }`}
                            >
                              <Icon size={14} />
                              <span>{item.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectThumbnail({ project }) {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  const elements = project.elements || []
  const canvasSettings = project.canvasSettings || { width: 1200, height: 900, fill: '#ffffff' }
  const canvasWidth = canvasSettings.width || 1200
  const canvasHeight = getCanvasHeight(elements, canvasSettings, 'desktop')
  const scale = width ? width / canvasWidth : 0.25

  useEffect(() => {
    const measure = () => {
      if (ref.current) setWidth(ref.current.getBoundingClientRect().width)
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative aspect-[4/3] w-full overflow-hidden bg-[#F8FAFC]">
      {elements.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#A1A1AA]">
          Blank Project
        </div>
      ) : (
        <div
          style={{
            width: canvasWidth,
            height: canvasHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            background: canvasSettings.fill || '#ffffff',
            position: 'relative',
          }}
        >
          {elements.map(element => (
            <ThumbnailElement key={element.id} element={element} />
          ))}
        </div>
      )}
    </div>
  )
}

function ThumbnailElement({ element }) {
  const layout = getElementLayout(element, 'desktop')
  const width = layout.width || 200
  const height = layout.height || 100
  const base = {
    position: 'absolute',
    left: layout.x || 0,
    top: layout.y || 0,
    width,
    height,
    opacity: (element.opacity ?? 100) / 100,
    borderRadius: element.radius || 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
  }
  const border = element.borderColor ? `1.5px solid ${element.borderColor}` : undefined
  const textBase = {
    color: element.textColor || '#111827',
    fontFamily: element.fontFamily || 'Inter, system-ui, sans-serif',
    fontSize: `${getResponsiveValue(element, 'desktop', 'fontSize', element.type === 'heading' ? 32 : 16)}px`,
    fontWeight: getResponsiveValue(element, 'desktop', 'fontWeight', element.type === 'heading' ? 700 : 400),
    lineHeight: getResponsiveValue(element, 'desktop', 'lineHeight', element.lineHeight || 1.3),
    textAlign: getResponsiveValue(element, 'desktop', 'textAlign', element.textAlign || 'left'),
    margin: 0,
    whiteSpace: 'pre-wrap',
  }

  if (['heading', 'paragraph', 'text', 'label', 'link'].includes(element.type)) {
    return <div style={{ ...base, height: 'auto', padding: '2px 4px' }}><p style={textBase}>{element.content || element.name || element.type}</p></div>
  }

  if (element.type === 'button') {
    return (
      <div style={{ ...base, background: element.fill || '#2348D7', color: element.textColor || '#fff', border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: element.fontWeight || 600 }}>
        {element.content || 'Button'}
      </div>
    )
  }

  if (element.type === 'image') {
    return element.src
      ? <img src={element.src} alt="" style={{ ...base, objectFit: element.objectFit || 'cover' }} />
      : <div style={{ ...base, background: element.fill || '#EEF3FF', border }} />
  }

  if (element.type === 'divider') {
    return <div style={{ ...base, height: height || 2, background: element.fill || '#E2E8F4' }} />
  }

  return <div style={{ ...base, background: element.fill || 'transparent', border, boxShadow: element.shadowColor ? `0 4px 24px ${element.shadowColor}` : undefined }} />
}

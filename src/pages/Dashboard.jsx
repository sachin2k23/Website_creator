import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MoreHorizontal,
  ChevronDown,
  Sparkles,
  Check,
  ExternalLink,
  Link2,
  Copy,
  FolderInput,
  Pencil,
  Settings,
  Rocket,
  Archive,
  Trash2,
} from 'lucide-react'

const sortOptions = [
  { key: 'viewed', label: 'Last viewed by me' },
  { key: 'edited', label: 'Last edited' },
  { key: 'alphabetical', label: 'Alphabetically' },
]

export default function Dashboard({
  view = 'dashboard',
  projects = [],
  onNewProject,
  onArchiveProject = () => {},
  onUnarchiveProject = () => {},
  onDeleteProject = () => {},
  onDuplicateProject = () => {},
  onRenameProject = () => {},
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

  async function copyText(value) {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      window.prompt('Copy this value:', value)
    }
  }

  function handleMenuAction(action, project) {
    const projectUrl = `${window.location.origin}/projects/${project.id}`

    if (action === 'open') {
      window.open(projectUrl, '_blank', 'noopener,noreferrer')
      setOpenMenuId(null)
      return
    }

    if (action === 'copy-link') {
      copyText(projectUrl)
      setOpenMenuId(null)
      return
    }

    if (action === 'copy-remix-link') {
      copyText(`${projectUrl}?remix=1`)
      setOpenMenuId(null)
      return
    }

    if (action === 'duplicate') {
      onDuplicateProject(project.id)
      setOpenMenuId(null)
      return
    }

    if (action === 'move') {
      window.alert(`Move is ready for folder support for "${project.name}".`)
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

    if (action === 'settings') {
      window.alert(`Settings for "${project.name}" can be connected next.`)
      setOpenMenuId(null)
      return
    }

    if (action === 'upgrade') {
      window.alert('Upgrade flow can be connected to billing next.')
      setOpenMenuId(null)
      return
    }

    if (action === 'archive') {
      onArchiveProject(project.id)
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
    { key: 'open', label: 'Open in New Tab', icon: ExternalLink },
    { key: 'copy-link', label: 'Copy Link', icon: Link2 },
    { key: 'copy-remix-link', label: 'Copy Remix Link', icon: Copy },
    { key: 'duplicate', label: 'Duplicate', icon: Copy },
    { key: 'move', label: 'Move', icon: FolderInput },
    { key: 'rename', label: 'Rename', icon: Pencil },
    { key: 'settings', label: 'Open Settings', icon: Settings },
    { key: 'upgrade', label: 'Upgrade Plan', icon: Rocket },
    { key: 'archive', label: 'Archive', icon: Archive, divider: true },
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {visibleProjects.map((project) => (
            <div key={project.id} className="group cursor-pointer">
              <div className="w-full aspect-video bg-white rounded-xl overflow-hidden mb-3 border border-[#DCE4F2] shadow-sm group-hover:border-[#BDD0FF] group-hover:shadow-md transition-all">
                {project.preview ? (
                  <img
                    src={project.preview}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F6F9FF] to-[#E8F0FF]">
                    <Sparkles size={32} className="text-[#B4C5F6]" />
                  </div>
                )}
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
                      <div className="absolute right-0 top-10 z-20 w-[220px] max-w-[80vw] rounded-3xl border border-[#D8E1F0] bg-white shadow-[0_18px_45px_rgba(35,72,215,0.12)] overflow-hidden">
                        {menuItems.map((item) => {
                          const Icon = item.icon

                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => handleMenuAction(item.key, project)}
                              className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm transition-colors ${
                                item.divider ? 'border-t border-[#E6ECF6]' : ''
                              } ${
                                item.danger
                                  ? 'text-[#D64545] hover:bg-[#FFF3F3]'
                                  : 'text-[#1F2C44] hover:bg-[#F3F7FF]'
                              }`}
                            >
                              <Icon size={16} />
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

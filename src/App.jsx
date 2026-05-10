import { useCallback, useEffect, useState } from 'react'
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import SelectTemplate from './pages/SelectTemplate'
import Builder from './pages/Builder'
import { TEMPLATES } from './utils/templates'
import { getContentHeight } from './utils/editorGeometry'

const cloneElements = elements => elements.map(element => ({
  ...element,
  breakpoints: element.breakpoints ? structuredClone(element.breakpoints) : undefined,
  children: element.children ? cloneElements(element.children) : [],
}))

const createProjectFromTemplate = (templateKey, overrides = {}) => {
  const template = TEMPLATES[templateKey] || TEMPLATES.blank
  const elements = cloneElements(template.elements || [])
  const canvasSettings = {
    width: 1200,
    height: getContentHeight(elements, 'desktop', 900),
    x: 0,
    y: 0,
    fill: '#ffffff',
  }

  return {
    id: overrides.id ?? Date.now(),
    name: overrides.name ?? template.name,
    viewed: overrides.viewed ?? 'Viewed just now',
    badge: overrides.badge ?? null,
    lastViewedHours: overrides.lastViewedHours ?? 0,
    lastEditedHours: overrides.lastEditedHours ?? 0,
    archived: false,
    templateKey,
    elements,
    canvasSettings,
    ...overrides,
  }
}

const initialProjects = [
  createProjectFromTemplate('portfolio', {
    id: 1,
    name: 'Pearl FREE Portfolio Template ...',
    viewed: 'Viewed 10h ago',
    badge: 'FREE',
    lastViewedHours: 10,
    lastEditedHours: 18,
  }),
]

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [projects, setProjects] = useState(initialProjects)
  const [builderConfig, setBuilderConfig] = useState({
    projectId: null,
    elements: [],
    name: 'My Project',
    canvasSettings: null,
  })

  useEffect(() => {
    window.history.replaceState({
      page: 'dashboard',
      builderConfig: { projectId: null, elements: [], name: 'My Project', canvasSettings: null },
    }, '')

    function handlePopState(event) {
      const nextState = event.state

      if (nextState?.page) {
        setPage(nextState.page)
        setBuilderConfig(nextState.builderConfig ?? { projectId: null, elements: [], name: 'My Project', canvasSettings: null })
        return
      }

    setPage('dashboard')
    setBuilderConfig({ projectId: null, elements: [], name: 'My Project', canvasSettings: null })
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  function navigateTo(nextPage, nextBuilderConfig = { projectId: null, elements: [], name: 'My Project', canvasSettings: null }) {
    setPage(nextPage)
    setBuilderConfig(nextBuilderConfig)
    window.history.pushState({ page: nextPage, builderConfig: nextBuilderConfig }, '')
  }

  function handleTemplateSelect(templateKey) {
    const template = TEMPLATES[templateKey]
    if (!template) return

    const project = createProjectFromTemplate(templateKey, { id: Date.now() })
    const config = {
      projectId: project.id,
      elements: cloneElements(project.elements),
      name: project.name,
      canvasSettings: project.canvasSettings,
    }

    setProjects(currentProjects => [project, ...currentProjects])
    setBuilderConfig(config)
    setPage('builder')
    window.history.pushState({ page: 'builder', builderConfig: config }, '')
  }

  function handleOpenProject(projectId) {
    const project = projects.find(item => item.id === projectId)
    if (!project) return

    const config = {
      projectId: project.id,
      elements: cloneElements(project.elements || []),
      name: project.name,
      canvasSettings: project.canvasSettings,
    }

    setProjects(currentProjects =>
      currentProjects.map(item =>
        item.id === projectId
          ? { ...item, viewed: 'Viewed just now', lastViewedHours: 0 }
          : item,
      ),
    )
    navigateTo('builder', config)
  }

  const handleProjectChange = useCallback((projectId, changes) => {
    if (!projectId) return
    setProjects(currentProjects =>
      currentProjects.map(project =>
        project.id === projectId
          ? {
              ...project,
              ...changes,
              elements: changes.elements ? cloneElements(changes.elements) : project.elements,
              canvasSettings: changes.canvasSettings || project.canvasSettings,
              viewed: 'Viewed just now',
              lastViewedHours: 0,
              lastEditedHours: 0,
            }
          : project,
      ),
    )
  }, [])

  const handleBuilderProjectChange = useCallback((changes) => {
    handleProjectChange(builderConfig.projectId, changes)
  }, [builderConfig.projectId, handleProjectChange])

  function handleArchiveProject(projectId) {
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === projectId ? { ...project, archived: true } : project,
      ),
    )
    navigateTo('archive')
  }

  function handleUnarchiveProject(projectId) {
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === projectId ? { ...project, archived: false } : project,
      ),
    )
  }

  function handleDeleteProject(projectId) {
    setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectId))
  }

  function handleRenameProject(projectId, nextName) {
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === projectId ? { ...project, name: nextName } : project,
      ),
    )
  }

  return (
    <>
      {(page === 'dashboard' || page === 'archive') && (
        <DashboardLayout currentPage={page} onNavigate={navigateTo}>
          <Dashboard
            view={page}
            projects={projects}
            onNewProject={() => navigateTo('select-template')}
            onArchiveProject={handleArchiveProject}
            onUnarchiveProject={handleUnarchiveProject}
            onDeleteProject={handleDeleteProject}
            onRenameProject={handleRenameProject}
            onOpenProject={handleOpenProject}
          />
        </DashboardLayout>
      )}
      {page === 'select-template' && (
        <SelectTemplate
          onBack={() => navigateTo('dashboard')}
          onSelect={handleTemplateSelect}
        />
      )}
      {page === 'builder' && (
        <Builder
          initialElements={builderConfig.elements}
          initialCanvasSettings={builderConfig.canvasSettings}
          projectName={builderConfig.name}
          onProjectChange={handleBuilderProjectChange}
          onBack={() => navigateTo('dashboard')}
        />
      )}
    </>
  )
}

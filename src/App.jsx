import { useEffect, useState } from 'react'
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import SelectTemplate from './pages/SelectTemplate'
import Builder from './pages/Builder'
import { TEMPLATES } from './utils/templates'

const initialProjects = [
  {
    id: 1,
    name: 'Pearl FREE Portfolio Template ...',
    viewed: 'Viewed 10h ago',
    badge: 'FREE',
    preview: 'https://placehold.co/600x400/e8e8e8/333?text=Pearl+Template',
    lastViewedHours: 10,
    lastEditedHours: 18,
    archived: false,
  },
  {
    id: 2,
    name: 'Amiable Falcon',
    viewed: 'Viewed 1d ago',
    badge: null,
    preview: null,
    lastViewedHours: 24,
    lastEditedHours: 6,
    archived: false,
  },
  {
    id: 3,
    name: 'Blue Horizon Studio',
    viewed: 'Viewed 2d ago',
    badge: null,
    preview: null,
    lastViewedHours: 48,
    lastEditedHours: 12,
    archived: false,
  },
]

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [projects, setProjects] = useState(initialProjects)
  const [builderConfig, setBuilderConfig] = useState({
    elements: [],
    name: 'My Project',
  })

  useEffect(() => {
    window.history.replaceState({
      page: 'dashboard',
      builderConfig: { elements: [], name: 'My Project' },
    }, '')

    function handlePopState(event) {
      const nextState = event.state

      if (nextState?.page) {
        setPage(nextState.page)
        setBuilderConfig(nextState.builderConfig ?? { elements: [], name: 'My Project' })
        return
      }

      setPage('dashboard')
      setBuilderConfig({ elements: [], name: 'My Project' })
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  function navigateTo(nextPage, nextBuilderConfig = { elements: [], name: 'My Project' }) {
    setPage(nextPage)
    setBuilderConfig(nextBuilderConfig)
    window.history.pushState({ page: nextPage, builderConfig: nextBuilderConfig }, '')
  }

  function handleTemplateSelect(templateKey) {
    const template = TEMPLATES[templateKey]
    if (!template) return

    const config = {
      elements: template.elements.map((element) => ({ ...element })),
      name: template.name,
    }

    setBuilderConfig(config)
    setPage('builder')
    window.history.pushState({ page: 'builder', builderConfig: config }, '')
  }

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

  function handleDuplicateProject(projectId) {
    setProjects((currentProjects) => {
      const projectToDuplicate = currentProjects.find((project) => project.id === projectId)

      if (!projectToDuplicate) {
        return currentProjects
      }

      const duplicate = {
        ...projectToDuplicate,
        id: Date.now(),
        name: `${projectToDuplicate.name} Copy`,
        viewed: 'Viewed just now',
        lastViewedHours: 0,
        lastEditedHours: 0,
        archived: false,
      }

      return [duplicate, ...currentProjects]
    })
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
            onDuplicateProject={handleDuplicateProject}
            onRenameProject={handleRenameProject}
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
          projectName={builderConfig.name}
          onBack={() => navigateTo('dashboard')}
        />
      )}
    </>
  )
}

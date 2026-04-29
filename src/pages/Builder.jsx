import { useState, useCallback, useRef, useEffect } from 'react'
import CanvasTopbar from '../components/builder/CanvasTopbar'
import LeftPanel from '../components/builder/LeftPanel'
import Canvas from '../components/builder/Canvas'
import RightPanel from '../components/builder/RightPanel'
import InsertPanel from '../components/builder/InsertPanel'
import PreviewMode from '../components/builder/PreviewMode'
import ContextMenu from '../components/builder/ContextMenu'
import { exportToHTML } from '../utils/exportHTML'
import { updateNode, deleteNode, findNode } from '../utils/treeHelpers'

const DEFAULT_SIZES = {
  heading:   { width: 320, height: 50 },
  paragraph: { width: 300, height: 80 },
  link:      { width: 120, height: 30 },
  container: { width: 320, height: 200 },
  section:   { width: 1200, height: 120 },
  divider:   { width: 400, height: 4 },
  image:     { width: 280, height: 180 },
  video:     { width: 320, height: 200 },
  button:    { width: 140, height: 44 },
  input:     { width: 260, height: 44 },
  checkbox:  { width: 140, height: 30 },
}

export default function Builder({ onBack, initialElements = [], projectName = 'My Project' }) {

  // ── Pages ──────────────────────────────────────────────
  const [pages, setPages] = useState([{ id: 'home', name: 'Home' }])
  const [activePageId, setActivePageId] = useState('home')

  // ── Elements (TREE SYSTEM) ──────────────────────────────
  const [treeByPage, setTreeByPage] = useState({
    home: initialElements.map(el => ({
      ...el,
      name: el.name || el.type,
      children: [],
    }))
  })

  // current page tree (root-level nodes)
  const tree = treeByPage[activePageId] || []
  const elements = tree  // alias used by Canvas, RightPanel, etc.

  // helper: update only the active page's tree
  const setTree = useCallback((updater) => {
    setTreeByPage(prev => ({
      ...prev,
      [activePageId]:
        typeof updater === 'function'
          ? updater(prev[activePageId] || [])
          : updater,
    }))
  }, [activePageId])

  // ── Other state ───────────────────────────────────────
  const [selectedId, setSelectedId]   = useState(null)
  const [showInsert, setShowInsert]   = useState(false)
  const [activeTab, setActiveTab]     = useState('Layers')
  const [isPreview, setIsPreview]     = useState(false)
  const [contextMenu, setContextMenu] = useState(null)
  const [canvasSettings, setCanvasSettings] = useState({
    width: 1200, height: 900,
    x: 0, y: 0,
    fill: '#ffffff',
  })

  // ── History ───────────────────────────────────────────
  // Store snapshots of the full treeByPage map
  const historyRef   = useRef([{ home: [] }])
  const historyIndex = useRef(0)

  const pushHistory = useCallback((newTree) => {
    setTreeByPage(prev => {
      const snapshot = { ...prev, [activePageId]: newTree }
      const trimmed  = historyRef.current.slice(0, historyIndex.current + 1)
      trimmed.push(snapshot)
      historyRef.current = trimmed
      historyIndex.current = trimmed.length - 1
      return snapshot
    })
  }, [activePageId])

  // ── Selected element (flat search across root nodes only for now) ──
  const selectedElement = elements.find(el => el.id === selectedId) ?? null

  // ── Sync initialElements when template changes ────────
  useEffect(() => {
    const mapped = initialElements.map(el => ({
      ...el,
      name: el.name || el.type,
      children: [],
    }))
    setTreeByPage(prev => ({ ...prev, [activePageId]: mapped }))
    setSelectedId(null)
    historyRef.current = [{ [activePageId]: mapped }]
    historyIndex.current = 0
  }, [initialElements]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────

  const handleInsert = useCallback((el) => {
    const sizes = DEFAULT_SIZES[el.id] || { width: 200, height: 100 }

    const newNode = {
      id: Date.now().toString(),
      type: el.id,
      name: el.label,
      x: 80,
      y: 80,
      width: sizes.width,
      height: sizes.height,
      content: '',
      fill: '#ffffff',
      borderColor: null,
      shadowColor: null,
      radius: 0,
      opacity: 100,
      textColor: '#111827',
      children: [],
    }

    // If a container/section/frame is selected, nest inside it
    if (selectedId) {
      const selected = findNode(tree, selectedId)
      const isContainer =
        selected?.type === 'container' ||
        selected?.type === 'section' ||
        selected?.type === 'frame'

      if (isContainer) {
        setTree(prev =>
          updateNode(prev, selectedId, {
            children: [...(selected.children || []), newNode],
          })
        )
        setSelectedId(newNode.id)
        return
      }
    }

    // Fallback: add to root
    setTree(prev => {
      const next = [...prev, newNode]
      // push history snapshot
      const snapshot = { ...treeByPage, [activePageId]: next }
      const trimmed  = historyRef.current.slice(0, historyIndex.current + 1)
      trimmed.push(snapshot)
      historyRef.current = trimmed
      historyIndex.current = trimmed.length - 1
      return next
    })
    setSelectedId(newNode.id)
  }, [tree, selectedId, treeByPage, activePageId, setTree])

  const handleDelete = useCallback((id) => {
    setTree(prev => {
      // deleteNode handles nested removal; fallback to flat filter
      const next = typeof deleteNode === 'function'
        ? deleteNode(prev, id)
        : prev.filter(el => el.id !== id)
      // push history
      const snapshot = { ...treeByPage, [activePageId]: next }
      const trimmed  = historyRef.current.slice(0, historyIndex.current + 1)
      trimmed.push(snapshot)
      historyRef.current = trimmed
      historyIndex.current = trimmed.length - 1
      return next
    })
    setSelectedId(null)
  }, [setTree, treeByPage, activePageId])

  const handleUpdate = useCallback((id, changes) => {
    setTree(prev => updateNode(prev, id, changes))
  }, [setTree])

  const handleCanvasUpdate = useCallback((changes) => {
    setCanvasSettings(prev => ({ ...prev, ...changes }))
  }, [])

  const undo = useCallback(() => {
    if (historyIndex.current <= 0) return
    historyIndex.current--
    const snapshot = historyRef.current[historyIndex.current]
    setTreeByPage(snapshot)
    setSelectedId(null)
  }, [])

  const redo = useCallback(() => {
    if (historyIndex.current >= historyRef.current.length - 1) return
    historyIndex.current++
    const snapshot = historyRef.current[historyIndex.current]
    setTreeByPage(snapshot)
    setSelectedId(null)
  }, [])

  const handleDuplicate = useCallback((id) => {
    const el = elements.find(el => el.id === id)
    if (!el) return
    const newEl = {
      ...el,
      id: Date.now().toString(),
      x: el.x + 20,
      y: el.y + 20,
    }
    setTree(prev => {
      const next = [...prev, newEl]
      const snapshot = { ...treeByPage, [activePageId]: next }
      const trimmed  = historyRef.current.slice(0, historyIndex.current + 1)
      trimmed.push(snapshot)
      historyRef.current = trimmed
      historyIndex.current = trimmed.length - 1
      return next
    })
    setSelectedId(newEl.id)
  }, [elements, setTree, treeByPage, activePageId])

  const handleReorder = useCallback((id, direction) => {
    setTree(prev => {
      const index = prev.findIndex(el => el.id === id)
      if (index === -1) return prev
      const next = [...prev]

      if (direction === 'forward' && index < next.length - 1) {
        ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      }
      if (direction === 'back' && index > 0) {
        ;[next[index], next[index - 1]] = [next[index - 1], next[index]]
      }
      if (direction === 'front') {
        const [el] = next.splice(index, 1)
        next.push(el)
      }
      if (direction === 'back-all') {
        const [el] = next.splice(index, 1)
        next.unshift(el)
      }

      const snapshot = { ...treeByPage, [activePageId]: next }
      const trimmed  = historyRef.current.slice(0, historyIndex.current + 1)
      trimmed.push(snapshot)
      historyRef.current = trimmed
      historyIndex.current = trimmed.length - 1
      return next
    })
  }, [setTree, treeByPage, activePageId])

  // ── Page management ───────────────────────────────────

  const handleAddPage = () => {
    const name = window.prompt('Page name', `Page ${pages.length + 1}`)
    if (!name?.trim()) return
    const id = `page-${Date.now()}`
    setPages(prev => [...prev, { id, name: name.trim() }])
    setTreeByPage(prev => ({ ...prev, [id]: [] }))
    setActivePageId(id)
    setSelectedId(null)
  }

  const handleRenamePage = (id) => {
    const page = pages.find(p => p.id === id)
    const name = window.prompt('Rename page', page?.name || '')
    if (!name?.trim()) return
    setPages(prev => prev.map(p => p.id === id ? { ...p, name: name.trim() } : p))
  }

  const handleDeletePage = (id) => {
    if (pages.length === 1) return
    if (!window.confirm('Delete this page?')) return
    setPages(prev => prev.filter(p => p.id !== id))
    setTreeByPage(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    const remaining = pages.filter(p => p.id !== id)
    setActivePageId(remaining[0].id)
    setSelectedId(null)
  }

  const handleSwitchPage = (id) => {
    setActivePageId(id)
    setSelectedId(null)
  }

  // ── Keyboard shortcuts ────────────────────────────────

  useEffect(() => {
    const onKeyDown = (e) => {
      const active = document.activeElement
      if (active?.tagName === 'INPUT' || active?.isContentEditable) return

      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); undo(); return
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault(); redo(); return
      }
      if (e.key === 'Escape') {
        setSelectedId(null); return
      }
      if (!selectedId) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDelete(selectedId); return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault()
        handleDuplicate(selectedId)
        return
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const el = elements.find(el => el.id === selectedId)
        if (!el) return
        const delta = {
          ArrowUp:    { y: el.y - step },
          ArrowDown:  { y: el.y + step },
          ArrowLeft:  { x: el.x - step },
          ArrowRight: { x: el.x + step },
        }[e.key]
        handleUpdate(selectedId, delta)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedId, elements, undo, redo, handleDelete, handleDuplicate, handleUpdate])

  // ── Close context menu on click ───────────────────────

  useEffect(() => {
    const close = () => setContextMenu(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  // ── Render ────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F0F2F8]">
      {isPreview ? (
        <PreviewMode
          elements={elements}
          canvasSettings={canvasSettings}
          onExit={() => setIsPreview(false)}
        />
      ) : (
        <>
          <CanvasTopbar
            onBack={onBack}
            onInsertClick={() => setShowInsert(v => !v)}
            onUndo={undo}
            onRedo={redo}
            canUndo={historyIndex.current > 0}
            canRedo={historyIndex.current < historyRef.current.length - 1}
            onPreview={() => setIsPreview(true)}
            onExport={() => exportToHTML(elements, canvasSettings, projectName)}
          />

          <div className="flex flex-1 overflow-hidden relative">

            <div className="relative flex shrink-0">
              <LeftPanel
                elements={elements}
                selectedId={selectedId}
                onSelect={setSelectedId}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                pages={pages}
                activePageId={activePageId}
                onSwitchPage={handleSwitchPage}
                onAddPage={handleAddPage}
                onRenamePage={handleRenamePage}
                onDeletePage={handleDeletePage}
              />
              {showInsert && (
                <div className="flex h-full border-r border-[#D8E1F0] bg-white shadow-xl z-40">
                  <InsertPanel onInsert={handleInsert} />
                </div>
              )}
            </div>

            <Canvas
              elements={elements}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id)
                setShowInsert(false)
              }}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              canvasSettings={canvasSettings}
              onContextMenu={(e, id) => {
                e.preventDefault()
                setContextMenu({ x: e.clientX, y: e.clientY, elementId: id })
                setSelectedId(id)
              }}
            />

            <RightPanel
              key={selectedId}
              selected={selectedElement}
              onUpdate={handleUpdate}
              canvasSettings={canvasSettings}
              onCanvasUpdate={handleCanvasUpdate}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onReorder={handleReorder}
            />

          </div>
        </>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          elementId={contextMenu.elementId}
          onReorder={handleReorder}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}
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
import {
  generateResponsiveDefaults,
  getElementLayout,
  setElementLayout,
  getCanvasWidth,
} from '../utils/responsive'
import { getContentHeight } from '../utils/editorGeometry'

const DEFAULT_SIZES = {
  heading:   { width: 320, height: 50  },
  paragraph: { width: 300, height: 80  },
  link:      { width: 120, height: 30  },
  container: { width: 320, height: 200 },
  section:   { width: 1200, height: 120 },
  divider:   { width: 400, height: 4   },
  image:     { width: 280, height: 180 },
  video:     { width: 320, height: 200 },
  button:    { width: 140, height: 44  },
  input:     { width: 260, height: 44  },
  textarea:  { width: 260, height: 100 },
  checkbox:  { width: 140, height: 30  },
  select:    { width: 200, height: 44  },
  label:     { width: 120, height: 24  },
  icon:      { width: 48,  height: 48  },
  card:      { width: 300, height: 200 },
}

export default function Builder({
  onBack,
  initialElements = [],
  initialCanvasSettings = null,
  projectName = 'My Project',
  onProjectChange,
}) {

  // ── Pages ──────────────────────────────────────────────────────────────────
  const [pages, setPages]               = useState([{ id: 'home', name: 'Home' }])
  const [activePageId, setActivePageId] = useState('home')

  // ── Breakpoint ────────────────────────────────────────────────────────────
  const [activeBreakpoint, setActiveBreakpoint] = useState('desktop')
  const [customWidth, setCustomWidth]           = useState(800)

  // ── Elements (tree) ────────────────────────────────────────────────────────
  const [treeByPage, setTreeByPage] = useState({
    home: initialElements.map(el => ({
      ...el,
      name:     el.name || el.type,
      children: [],
    }))
  })

  const tree     = treeByPage[activePageId] || []
  const elements = tree

  const setTree = useCallback((updater) => {
    setTreeByPage(prev => ({
      ...prev,
      [activePageId]:
        typeof updater === 'function'
          ? updater(prev[activePageId] || [])
          : updater,
    }))
  }, [activePageId])

  // ── Other state ────────────────────────────────────────────────────────────
  const [selectedId, setSelectedId]   = useState(null)
  const [showInsert, setShowInsert]   = useState(false)
  const [activeTab, setActiveTab]     = useState('Layers')
  const [isPreview, setIsPreview]     = useState(false)
  const [contextMenu, setContextMenu] = useState(null)
  const [canvasSettings, setCanvasSettings] = useState({
    width: 1200,
    height: 900,
    x: 0,
    y: 0,
    fill: '#ffffff',
    ...(initialCanvasSettings || {}),
  })

  // ── History ────────────────────────────────────────────────────────────────
  const historyRef   = useRef([{ home: [] }])
  const historyIndex = useRef(0)

  // Push snapshot helper — returns the new treeByPage
  const pushSnapshot = useCallback((nextPageTree, prevTreeByPage) => {
    const snapshot = { ...prevTreeByPage, [activePageId]: nextPageTree }
    const trimmed  = historyRef.current.slice(0, historyIndex.current + 1)
    trimmed.push(snapshot)
    historyRef.current   = trimmed
    historyIndex.current = trimmed.length - 1
    return snapshot
  }, [activePageId])

  // ── Selected element ───────────────────────────────────────────────────────
  const selectedElement = elements.find(el => el.id === selectedId) ?? null

  // ── Sync initialElements when template changes ─────────────────────────────
  useEffect(() => {
    const desktopCanvasWidth = canvasSettings?.width || 1200
    const mapped = initialElements.map(el => {
      const base = { ...el, name: el.name || el.type, children: [] }
      return generateResponsiveDefaults(base, desktopCanvasWidth)
    })
    setCanvasSettings(prev => ({
      ...prev,
      ...(initialCanvasSettings || {}),
      height: initialCanvasSettings?.height || getContentHeight(mapped, 'desktop', 900),
    }))
    setTreeByPage(prev => ({ ...prev, [activePageId]: mapped }))
    setSelectedId(null)
    historyRef.current   = [{ [activePageId]: mapped }]
    historyIndex.current = 0
  }, [initialElements, initialCanvasSettings]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onProjectChange?.({
      name: projectName,
      elements,
      canvasSettings,
    })
  }, [elements, canvasSettings, projectName, onProjectChange])

  // ── Breakpoint switch ──────────────────────────────────────────────────────
  const handleBreakpointChange = useCallback((bp) => {
    setActiveBreakpoint(bp)
    setSelectedId(null)
    if (bp !== 'desktop') {
      const desktopCanvasWidth = canvasSettings?.width || 1200
      setTree(prev =>
        prev.map(el => {
          if (el.breakpoints?.[bp]) return el
          return generateResponsiveDefaults(el, desktopCanvasWidth)
        })
      )
    }
  }, [canvasSettings, setTree])

  // ── Shared: commit new node(s) to tree + history ──────────────────────────
  const commitNodes = useCallback((newNodes) => {
    setTreeByPage(prev => {
      const current = prev[activePageId] || []
      const next    = [...current, ...newNodes]
      return pushSnapshot(next, prev)
    })
    setSelectedId(newNodes[newNodes.length - 1]?.id ?? null)
  }, [activePageId, pushSnapshot])

  // ── Click-to-insert ────────────────────────────────────────────────────────
  const handleInsert = useCallback((el) => {
    const sizes              = DEFAULT_SIZES[el.id] || { width: 200, height: 100 }
    const desktopCanvasWidth = canvasSettings?.width || 1200

    // Group elements (navigation, hero-block, cta-block, etc.)
    if (el.type === 'group') {
      const baseTime = Date.now()
      const newNodes = (el.children || []).map((child, index) =>
        generateResponsiveDefaults({
          ...child,
          id:       `${baseTime + index}`,
          type:     child.type || child.id,
          name:     child.name || child.label || child.type || child.id,
          children: child.children || [],
        }, desktopCanvasWidth)
      )
      if (!newNodes.length) return
      commitNodes(newNodes)
      return
    }

    const newNode = generateResponsiveDefaults({
      content:     '',
      fill:        '#ffffff',
      borderColor: null,
      shadowColor: null,
      radius:      0,
      opacity:     100,
      textColor:   '#111827',
      children:    [],
      ...el,
      id:     Date.now().toString(),
      type:   el.type || el.id,
      name:   el.name || el.label,
      x:      el.x    ?? 80,
      y:      el.y    ?? 80,
      width:  el.width  ?? sizes.width,
      height: el.height ?? sizes.height,
    }, desktopCanvasWidth)

    // Nest inside selected container if applicable
    if (selectedId) {
      const selected    = findNode(tree, selectedId)
      const isContainer = selected?.type === 'container' || selected?.type === 'section' || selected?.type === 'frame'
      if (isContainer) {
        setTree(prev => updateNode(prev, selectedId, { children: [...(selected.children || []), newNode] }))
        setSelectedId(newNode.id)
        return
      }
    }

    commitNodes([newNode])
  }, [tree, selectedId, canvasSettings, commitNodes, setTree])

  // ── Drag-to-canvas insert ──────────────────────────────────────────────────
  // Called by Canvas when user drops an element from InsertPanel onto the canvas.
  // dropX / dropY are already in canvas-space coordinates (zoom-corrected).
  const handleDropInsert = useCallback((el, dropX, dropY) => {
    const sizes              = DEFAULT_SIZES[el.id] || { width: 200, height: 100 }
    const desktopCanvasWidth = canvasSettings?.width || 1200

    // Group elements — offset each child relative to the drop point
    if (el.type === 'group') {
      const baseTime = Date.now()
      const newNodes = (el.children || []).map((child, index) =>
        generateResponsiveDefaults({
          ...child,
          id:       `${baseTime + index}`,
          type:     child.type || child.id,
          name:     child.name || child.label || child.type || child.id,
          x:        Math.max(0, (child.x ?? 0) + dropX),
          y:        Math.max(0, (child.y ?? 0) + dropY),
          children: child.children || [],
        }, desktopCanvasWidth)
      )
      if (!newNodes.length) return
      commitNodes(newNodes)
      return
    }

    // Single element — center on drop cursor
    const elWidth  = el.width  ?? sizes.width
    const elHeight = el.height ?? sizes.height

    const newNode = generateResponsiveDefaults({
      content:     '',
      fill:        '#ffffff',
      borderColor: null,
      shadowColor: null,
      radius:      0,
      opacity:     100,
      textColor:   '#111827',
      children:    [],
      ...el,
      id:     Date.now().toString(),
      type:   el.type || el.id,
      name:   el.name || el.label,
      x:      Math.max(0, dropX - Math.round(elWidth  / 2)),
      y:      Math.max(0, dropY - Math.round(elHeight / 2)),
      width:  elWidth,
      height: elHeight,
    }, desktopCanvasWidth)

    commitNodes([newNode])
  }, [canvasSettings, commitNodes])

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = useCallback((id) => {
    setTreeByPage(prev => {
      const current = prev[activePageId] || []
      const next    = deleteNode(current, id)
      return pushSnapshot(next, prev)
    })
    setSelectedId(null)
  }, [activePageId, pushSnapshot])

  // ── Update ─────────────────────────────────────────────────────────────────
  const handleUpdate = useCallback((id, changesOrFullElement) => {
    const isFullElement =
      changesOrFullElement &&
      typeof changesOrFullElement === 'object' &&
      changesOrFullElement.id === id

    setTree(prev => {
      if (isFullElement) {
        return updateNode(prev, id, changesOrFullElement)
      }

      const layoutKeys    = new Set(['x', 'y', 'width', 'height'])
      const layoutChanges = {}
      const styleChanges  = {}

      Object.entries(changesOrFullElement).forEach(([k, v]) => {
        if (layoutKeys.has(k)) layoutChanges[k] = v
        else                   styleChanges[k]  = v
      })

      return prev.map(el => {
        if (el.id !== id) return el
        let updated = { ...el, ...styleChanges }
        if (Object.keys(layoutChanges).length) {
          updated = setElementLayout(updated, activeBreakpoint, layoutChanges)
        }
        return updated
      })
    })
  }, [setTree, activeBreakpoint])

  const handleCanvasUpdate = useCallback((changes) => {
    setCanvasSettings(prev => ({ ...prev, ...changes }))
  }, [])

  // ── Undo / Redo ────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    if (historyIndex.current <= 0) return
    historyIndex.current--
    setTreeByPage(historyRef.current[historyIndex.current])
    setSelectedId(null)
  }, [])

  const redo = useCallback(() => {
    if (historyIndex.current >= historyRef.current.length - 1) return
    historyIndex.current++
    setTreeByPage(historyRef.current[historyIndex.current])
    setSelectedId(null)
  }, [])

  // ── Duplicate ──────────────────────────────────────────────────────────────
  const handleDuplicate = useCallback((id) => {
    const el = elements.find(el => el.id === id)
    if (!el) return
    const desktopCanvasWidth = canvasSettings?.width || 1200
    const layout = getElementLayout(el, activeBreakpoint)
    const newEl  = generateResponsiveDefaults({
      ...el,
      id: Date.now().toString(),
      x:  layout.x + 20,
      y:  layout.y + 20,
    }, desktopCanvasWidth)
    commitNodes([newEl])
  }, [elements, activeBreakpoint, canvasSettings, commitNodes])

  // ── Reorder ────────────────────────────────────────────────────────────────
  const handleReorder = useCallback((id, direction) => {
    setTreeByPage(prev => {
      const current = prev[activePageId] || []
      const index   = current.findIndex(el => el.id === id)
      if (index === -1) return prev
      const next = [...current]
      if (direction === 'forward'  && index < next.length - 1) [next[index], next[index + 1]] = [next[index + 1], next[index]]
      if (direction === 'back'     && index > 0)               [next[index], next[index - 1]] = [next[index - 1], next[index]]
      if (direction === 'front')   { const [el] = next.splice(index, 1); next.push(el) }
      if (direction === 'back-all'){ const [el] = next.splice(index, 1); next.unshift(el) }
      return pushSnapshot(next, prev)
    })
  }, [activePageId, pushSnapshot])

  // ── Page management ────────────────────────────────────────────────────────
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
    setTreeByPage(prev => { const next = { ...prev }; delete next[id]; return next })
    setActivePageId(pages.filter(p => p.id !== id)[0].id)
    setSelectedId(null)
  }

  const handleSwitchPage = (id) => {
    setActivePageId(id)
    setSelectedId(null)
  }

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      const active = document.activeElement
      if (active?.tagName === 'INPUT' || active?.isContentEditable) return

      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return }
      if (e.key === 'Escape') { setSelectedId(null); return }
      if (!selectedId) return

      if (e.key === 'Delete' || e.key === 'Backspace') { handleDelete(selectedId); return }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') { e.preventDefault(); handleDuplicate(selectedId); return }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const step   = e.shiftKey ? 10 : 1
        const el     = elements.find(el => el.id === selectedId)
        if (!el) return
        const layout = getElementLayout(el, activeBreakpoint)
        const delta  = {
          ArrowUp:    { y: layout.y - step },
          ArrowDown:  { y: layout.y + step },
          ArrowLeft:  { x: layout.x - step },
          ArrowRight: { x: layout.x + step },
        }[e.key]
        handleUpdate(selectedId, delta)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedId, elements, undo, redo, handleDelete, handleDuplicate, handleUpdate, activeBreakpoint])

  // ── Close context menu ─────────────────────────────────────────────────────
  useEffect(() => {
    const close = () => setContextMenu(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  // ── Resolve selected element layout for RightPanel ────────────────────────
  const selectedForPanel = selectedElement
    ? { ...selectedElement, ...getElementLayout(selectedElement, activeBreakpoint) }
    : null

  // ── Render ─────────────────────────────────────────────────────────────────
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
            projectName={projectName}
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
              onSelect={(id) => { setSelectedId(id); setShowInsert(false) }}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              canvasSettings={canvasSettings}
              onContextMenu={(e, id) => {
                e.preventDefault()
                setContextMenu({ x: e.clientX, y: e.clientY, elementId: id })
                setSelectedId(id)
              }}
              activeBreakpoint={activeBreakpoint}
              onBreakpointChange={handleBreakpointChange}
              customWidth={customWidth}
              onCustomWidthChange={setCustomWidth}
              onDropInsert={handleDropInsert}
            />

            <RightPanel
              key={selectedId}
              selected={selectedForPanel}
              onUpdate={handleUpdate}
              canvasSettings={canvasSettings}
              onCanvasUpdate={handleCanvasUpdate}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onReorder={handleReorder}
              activeBreakpoint={activeBreakpoint}
              customWidth={customWidth}
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

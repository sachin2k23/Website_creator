import { useState, useEffect, useRef, useMemo } from 'react'
import CanvasElement from './CanvasElement'
import { Monitor, Tablet, Smartphone, Settings2, MousePointer2, Hand } from 'lucide-react'

const BREAKPOINTS = [
  { id: 'desktop', label: 'Desktop', icon: Monitor,    width: 1200 },
  { id: 'tablet',  label: 'Tablet',  icon: Tablet,     width: 768  },
  { id: 'phone',   label: 'Phone',   icon: Smartphone, width: 390  },
  { id: 'custom',  label: 'Custom',  icon: Settings2,  width: null },
]

const PADDING_BOTTOM = 80  // extra space below last element

export default function Canvas({
  elements,
  selectedId,
  onSelect,
  onDelete,
  onUpdate,
  canvasSettings,
  onContextMenu,
}) {
  const [activeBreakpoint, setActiveBreakpoint] = useState('desktop')
  const [customWidth, setCustomWidth]           = useState(800)
  const [zoom, setZoom]                         = useState(0.75)
  const [activeTool, setActiveTool]             = useState('cursor')
  const [showGrid, setShowGrid]                 = useState(true)

  const isPanning     = useRef(false)
  const lastMouse     = useRef({ x: 0, y: 0 })
  const canvasAreaRef = useRef(null)

  const current = BREAKPOINTS.find(b => b.id === activeBreakpoint)

  const canvasWidth =
    activeBreakpoint === 'custom'  ? customWidth :
    activeBreakpoint === 'desktop' ? (canvasSettings?.width || 1200) :
    current.width

  // ── Auto-height: grow to fit all elements ──────────────────────────────────
  const canvasHeight = useMemo(() => {
    const minH = canvasSettings?.height || 900
    if (!elements?.length) return minH
    const maxBottom = elements.reduce((acc, el) => {
      const bottom = (el.y || 0) + (el.height || 100)
      return Math.max(acc, bottom)
    }, 0)
    return Math.max(minH, maxBottom + PADDING_BOTTOM)
  }, [elements, canvasSettings?.height])

  // ── Zoom helpers ───────────────────────────────────────────────────────────
  const applyZoom = (newZoom) => {
    const container = canvasAreaRef.current
    if (!container) { setZoom(newZoom); return }
    const rect  = container.getBoundingClientRect()
    const scale = newZoom / zoom
    container.scrollLeft = (container.scrollLeft + rect.width  / 2) * scale - rect.width  / 2
    container.scrollTop  = (container.scrollTop  + rect.height / 2) * scale - rect.height / 2
    setZoom(newZoom)
  }

  const zoomIn  = () => applyZoom(Math.min(+(zoom + 0.1).toFixed(1), 3))
  const zoomOut = () => applyZoom(Math.max(+(zoom - 0.1).toFixed(1), 0.1))

  // Ctrl/Cmd + scroll to zoom
  useEffect(() => {
    const el = canvasAreaRef.current
    if (!el) return
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.05 : 0.05
      const next  = Math.min(Math.max(+(zoom + delta).toFixed(2), 0.1), 3)
      applyZoom(next)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoom])

  // ── Pan (hand tool) ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = canvasAreaRef.current
    if (!el) return
    const onDown = (e) => {
      if (activeTool !== 'hand') return
      isPanning.current = true
      lastMouse.current = { x: e.clientX, y: e.clientY }
      el.style.cursor   = 'grabbing'
    }
    const onMove = (e) => {
      if (!isPanning.current) return
      el.scrollLeft -= e.clientX - lastMouse.current.x
      el.scrollTop  -= e.clientY - lastMouse.current.y
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }
    const onUp = () => {
      isPanning.current = false
      el.style.cursor   = activeTool === 'hand' ? 'grab' : 'default'
    }
    el.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [activeTool])

  useEffect(() => {
    if (canvasAreaRef.current)
      canvasAreaRef.current.style.cursor = activeTool === 'hand' ? 'grab' : 'default'
  }, [activeTool])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#F0F2F8]">

      {/* ── Breakpoint bar ── */}
      <div className="flex items-center justify-center pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-1 bg-white border border-[#D8E1F0] rounded-2xl px-2 py-1.5 shadow-sm">
          {BREAKPOINTS.map(({ id, label, icon: Icon, width }) => (
            <button
              key={id}
              onClick={e => { e.stopPropagation(); setActiveBreakpoint(id) }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeBreakpoint === id
                  ? 'bg-[#2348D7] text-white shadow'
                  : 'text-[#5E6F8E] hover:text-[#2348D7] hover:bg-[#F3F6FB]'
              }`}
            >
              <Icon size={13} />
              {label}
              {id !== 'custom' && (
                <span className={`text-[10px] ${activeBreakpoint === id ? 'text-blue-200' : 'text-[#AAB8D4]'}`}>
                  {width}
                </span>
              )}
            </button>
          ))}

          <div className="w-px h-5 bg-[#E2E8F4] mx-1" />

          {activeBreakpoint === 'custom' ? (
            <div className="flex items-center gap-1 px-2">
              <span className="text-[#8A9ABB] text-xs">W:</span>
              <input
                type="number"
                value={customWidth}
                onClick={e => e.stopPropagation()}
                onChange={e => setCustomWidth(Number(e.target.value))}
                className="w-16 text-xs text-[#0F2348] bg-[#F3F6FB] border border-[#D8E1F0] rounded-lg px-2 py-1 outline-none focus:border-[#2348D7]"
              />
              <span className="text-[#AAB8D4] text-xs">px</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2">
              <span className="text-[#8A9ABB] text-xs">W:</span>
              <span className="text-[#0F2348] text-xs font-medium">{canvasWidth}px</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Scroll area ── */}
      <div
        ref={canvasAreaRef}
        className="flex-1 overflow-auto select-none"
        style={{ backgroundColor: '#F0F2F8' }}
        onClick={() => activeTool === 'cursor' && onSelect(null)}
      >
        {/*
          Outer wrapper: centres the canvas horizontally and
          reserves the correct scaled height so the scrollbar is accurate.
        */}
        <div
          style={{
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            paddingTop:    '32px',
            paddingBottom: '120px',
            // Wide enough for the scaled canvas + some side breathing room
            minWidth:      `${canvasWidth * zoom + 160}px`,
          }}
        >
          {/* Scale wrapper — only this element is zoomed */}
          <div
            style={{
              width:           `${canvasWidth}px`,
              transform:       `scale(${zoom})`,
              transformOrigin: 'top center',
              flexShrink:      0,
              // Push the document flow down by the extra height the scale adds
              marginBottom:    `${canvasHeight * (zoom - 1)}px`,
            }}
          >
            {/* Canvas label row */}
            <div
              className="flex items-center justify-between mb-1 px-1"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#2348D7] rounded-sm flex items-center justify-center">
                  <span className="text-white text-[8px]">▶</span>
                </div>
                <span className="text-[#5E6F8E] text-xs font-medium">{current?.label}</span>
                <span className="text-[#AAB8D4] text-xs">{canvasWidth}</span>
              </div>
              <span className="text-[#2348D7] text-xs">Primary</span>
            </div>

            {/* ── White canvas page ── */}
            <div
              style={{
                width:           `${canvasWidth}px`,
                height:          `${canvasHeight}px`,   // auto-grows with content
                backgroundColor: canvasSettings?.fill || '#ffffff',
                borderRadius:    '6px 6px 0 0',
                position:        'relative',
                overflow:        'hidden',               // clip elements to canvas bounds
                pointerEvents:   activeTool === 'hand' ? 'none' : 'auto',
                boxShadow:       '0 4px 40px rgba(0,0,0,0.10)',
                backgroundImage: showGrid
                  ? 'radial-gradient(circle, #D8E1F0 1px, transparent 1px)'
                  : 'none',
                backgroundSize: '24px 24px',
              }}
              onClick={e => {
                e.stopPropagation()
                activeTool === 'cursor' && onSelect(null)
              }}
            >
              {/* Empty state */}
              {elements.length === 0 && (
                <div style={{
                  position:       'absolute',
                  inset:          0,
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            '8px',
                  pointerEvents:  'none',
                }}>
                  <span style={{ fontSize: '36px', color: '#D8E1F0' }}>✦</span>
                  <p style={{ color: '#C5D0E4', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
                    Click Insert to add elements
                  </p>
                </div>
              )}

              {/* Elements — pass zoom down for correct drag math */}
              {elements.map(el => (
                <CanvasElement
                  key={el.id}
                  element={el}
                  isSelected={selectedId === el.id}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  onContextMenu={onContextMenu}
                  zoom={zoom}                 // ← FIX: zoom-aware drag & resize
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom toolbar ── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position:     'absolute',
          bottom:       '24px',
          left:         '50%',
          transform:    'translateX(-50%)',
          display:      'flex',
          alignItems:   'center',
          gap:          '4px',
          background:   'white',
          border:       '1px solid #D8E1F0',
          borderRadius: '16px',
          padding:      '6px 8px',
          boxShadow:    '0 4px 24px rgba(35,72,215,0.10)',
          zIndex:       50,
        }}
      >
        {/* Cursor tool */}
        <ToolBtn active={activeTool === 'cursor'} onClick={() => setActiveTool('cursor')} title="Select (V)">
          <MousePointer2 size={15} />
        </ToolBtn>

        {/* Hand tool */}
        <ToolBtn active={activeTool === 'hand'} onClick={() => setActiveTool('hand')} title="Pan (H)">
          <Hand size={15} />
        </ToolBtn>

        <Divider />

        {/* Zoom out */}
        <ToolBtn onClick={zoomOut} title="Zoom out">
          <span style={{ fontSize: '16px', lineHeight: 1 }}>−</span>
        </ToolBtn>

        {/* Zoom label — click to reset 100% */}
        <button
          onClick={() => applyZoom(1)}
          style={{
            minWidth:   '48px',
            padding:    '0 4px',
            height:     '32px',
            border:     'none',
            background: 'transparent',
            color:      '#0F2348',
            fontSize:   '12px',
            fontWeight: 500,
            cursor:     'pointer',
            borderRadius: '8px',
          }}
          title="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>

        {/* Zoom in */}
        <ToolBtn onClick={zoomIn} title="Zoom in">
          <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
        </ToolBtn>

        <Divider />

        {/* Grid toggle */}
        <ToolBtn
          active={showGrid}
          onClick={() => setShowGrid(v => !v)}
          title="Toggle grid"
        >
          <GridIcon />
        </ToolBtn>
      </div>
    </div>
  )
}

// ── Small helpers ──────────────────────────────────────────────────────────────

function ToolBtn({ active, onClick, title, children }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick() }}
      title={title}
      style={{
        width:        '34px',
        height:       '34px',
        borderRadius: '10px',
        border:       'none',
        background:   active ? '#1a1a1a' : 'transparent',
        color:        active ? 'white'   : '#5E6F8E',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        cursor:       'pointer',
        transition:   'all 0.15s',
        flexShrink:   0,
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div style={{ width: '1px', height: '20px', background: '#E2E8F4', margin: '0 2px', flexShrink: 0 }} />
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )
}
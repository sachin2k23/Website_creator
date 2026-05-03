import { useState, useEffect, useRef, useMemo } from 'react'
import CanvasElement from './CanvasElement'
import { Monitor, Tablet, Smartphone, Settings2, MousePointer2, Hand } from 'lucide-react'
import { BREAKPOINTS, getCanvasWidth, getElementLayout } from '../../utils/responsive'

const PADDING_BOTTOM = 80

export default function Canvas({
  elements,
  selectedId,
  onSelect,
  onDelete,
  onUpdate,
  canvasSettings,
  onContextMenu,
  activeBreakpoint,
  onBreakpointChange,
  customWidth,
  onCustomWidthChange,
}) {
  const [zoom, setZoom]           = useState(0.75)
  const [activeTool, setActiveTool] = useState('cursor')
  const [showGrid, setShowGrid]   = useState(true)
  const [isCanvasHover, setIsCanvasHover] = useState(false)
  const [isCanvasPinned, setIsCanvasPinned] = useState(false)

  const isPanning     = useRef(false)
  const lastMouse     = useRef({ x: 0, y: 0 })
  const canvasAreaRef = useRef(null)

  const canvasWidth = getCanvasWidth(activeBreakpoint, canvasSettings, customWidth)

  // ── Auto-height ────────────────────────────────────────────────────────────
  const canvasHeight = useMemo(() => {
    const minH = canvasSettings?.height || 900
    if (!elements?.length) return minH
    const maxBottom = elements.reduce((acc, el) => {
      const layout = getElementLayout(el, activeBreakpoint)
      const bottom = (layout.y || 0) + (layout.height || 100)
      return Math.max(acc, bottom)
    }, 0)
    return Math.max(minH, maxBottom + PADDING_BOTTOM)
  }, [elements, canvasSettings?.height, activeBreakpoint])

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

  useEffect(() => {
    if (selectedId !== null) setIsCanvasPinned(false)
  }, [selectedId])

  const currentBP = BREAKPOINTS.find(b => b.id === activeBreakpoint)
  const showCanvasFrame = activeTool === 'cursor' && (isCanvasHover || isCanvasPinned)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#F0F2F8]">

      {/* ── Breakpoint bar ── */}
      <div className="flex items-center justify-center pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-1 bg-white border border-[#D8E1F0] rounded-2xl px-2 py-1.5 shadow-sm">

          {[
            { id: 'desktop', label: 'Desktop',  icon: Monitor,    hint: '1200' },
            { id: 'tablet',  label: 'Tablet',   icon: Tablet,     hint: '768'  },
            { id: 'phone',   label: 'Phone',    icon: Smartphone, hint: '390'  },
            { id: 'custom',  label: 'Custom',   icon: Settings2,  hint: null   },
          ].map(({ id, label, icon: Icon, hint }) => (
            <button
              key={id}
              onClick={e => { e.stopPropagation(); onBreakpointChange(id) }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeBreakpoint === id
                  ? 'bg-[#2348D7] text-white shadow'
                  : 'text-[#5E6F8E] hover:text-[#2348D7] hover:bg-[#F3F6FB]'
              }`}
            >
              <Icon size={13} />
              {label}
              {hint && (
                <span className={`text-[10px] ${activeBreakpoint === id ? 'text-blue-200' : 'text-[#AAB8D4]'}`}>
                  {hint}
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
                onChange={e => onCustomWidthChange(Number(e.target.value))}
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

          {/* Breakpoint indicator badge */}
          {activeBreakpoint !== 'desktop' && (
            <div className="ml-1 px-2 py-0.5 rounded-lg bg-[#FFF3CD] border border-[#FFE082] text-[#856404] text-[10px] font-medium">
              {currentBP?.label} layout
            </div>
          )}
        </div>
      </div>

      {/* ── Scroll area ── */}
      <div
        ref={canvasAreaRef}
        className="flex-1 overflow-auto select-none"
        style={{ backgroundColor: '#F0F2F8' }}
        onClick={e => {
          if (e.target === e.currentTarget && activeTool === 'cursor') {
            setIsCanvasPinned(false)
            onSelect(null)
          }
        }}
      >
        <div
          style={{
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            paddingTop:    '32px',
            paddingBottom: '120px',
            minWidth:      `${canvasWidth * zoom + 160}px`,
          }}
          onClick={e => {
            if (e.target === e.currentTarget && activeTool === 'cursor') {
              setIsCanvasPinned(false)
              onSelect(null)
            }
          }}
        >
          {/* ── Zoom wrapper — only zoom here, NO breakpoint scaling ── */}
          <div
            style={{
              width:           `${canvasWidth}px`,
              transform:       `scale(${zoom})`,
              transformOrigin: 'top center',
              flexShrink:      0,
              marginBottom:    `${canvasHeight * (zoom - 1)}px`,
              pointerEvents:    'auto',
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
                <span className="text-[#5E6F8E] text-xs font-medium">{currentBP?.label}</span>
                <span className="text-[#AAB8D4] text-xs">{canvasWidth}</span>
              </div>
              <span className="text-[#2348D7] text-xs">Primary</span>
            </div>

            {/* ── White canvas page ── */}
            <div
              className="canvas-page"
              style={{
                width:           `${canvasWidth}px`,
                height:          `${canvasHeight}px`,
                backgroundColor: canvasSettings?.fill || '#ffffff',
                borderRadius:    '6px 6px 0 0',
                position:        'relative',
                overflow:        'hidden',
                pointerEvents:   activeTool === 'hand' ? 'none' : 'auto',
                boxShadow:       '0 4px 40px rgba(0,0,0,0.10)',
                outline:         showCanvasFrame ? '2px solid #0EA5E9' : '1px solid transparent',
                outlineOffset:   showCanvasFrame ? '0px' : '-1px',
                backgroundImage: showGrid
                  ? 'radial-gradient(circle, #D8E1F0 1px, transparent 1px)'
                  : 'none',
                backgroundSize: '24px 24px',
              }}
              onClick={e => {
                if (e.target === e.currentTarget && activeTool === 'cursor') {
                  setIsCanvasPinned(true)
                  onSelect(null)
                }
              }}
              onMouseEnter={() => setIsCanvasHover(true)}
              onMouseLeave={() => setIsCanvasHover(false)}
            >
              {showCanvasFrame && (
                <>
                  {[
                    { left: -5, top: -5 },
                    { right: -5, top: -5 },
                    { left: -5, bottom: -5 },
                    { right: -5, bottom: -5 },
                  ].map((style, index) => (
                    <span
                      key={index}
                      style={{
                        position: 'absolute',
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        border: '1.5px solid #0EA5E9',
                        zIndex: 40,
                        pointerEvents: 'none',
                        ...style,
                      }}
                    />
                  ))}
                </>
              )}

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

              {/* ── Elements ── */}
              {elements.map(el => (
                <CanvasElement
                  key={el.id}
                  element={el}
                  isSelected={selectedId === el.id}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  onContextMenu={onContextMenu}
                  zoom={zoom}
                  activeBreakpoint={activeBreakpoint}
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
        <ToolBtn active={activeTool === 'cursor'} onClick={() => setActiveTool('cursor')} title="Select (V)">
          <MousePointer2 size={15} />
        </ToolBtn>
        <ToolBtn active={activeTool === 'hand'} onClick={() => setActiveTool('hand')} title="Pan (H)">
          <Hand size={15} />
        </ToolBtn>

        <Divider />

        <ToolBtn onClick={zoomOut} title="Zoom out">
          <span style={{ fontSize: '16px', lineHeight: 1 }}>−</span>
        </ToolBtn>
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
        <ToolBtn onClick={zoomIn} title="Zoom in">
          <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
        </ToolBtn>

        <Divider />

        <ToolBtn active={showGrid} onClick={() => setShowGrid(v => !v)} title="Toggle grid">
          <GridIcon />
        </ToolBtn>
      </div>
    </div>
  )
}

function ToolBtn({ active, onClick, title, children }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick() }}
      title={title}
      style={{
        width:          '34px',
        height:         '34px',
        borderRadius:   '10px',
        border:         'none',
        background:     active ? '#1a1a1a' : 'transparent',
        color:          active ? 'white'   : '#5E6F8E',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        cursor:         'pointer',
        transition:     'all 0.15s',
        flexShrink:     0,
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

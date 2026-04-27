import { useState, useEffect, useRef } from 'react'
import CanvasElement from './CanvasElement'
import { Monitor, Tablet, Smartphone, Settings2, MousePointer2, Hand } from 'lucide-react'

const breakpoints = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: 1200 },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: 768 },
  { id: 'phone', label: 'Phone', icon: Smartphone, width: 390 },
  { id: 'custom', label: 'Custom', icon: Settings2, width: null },
]

export default function Canvas({ elements, selectedId, onSelect, onDelete, onUpdate, canvasSettings, onContextMenu }) {
  const [activeBreakpoint, setActiveBreakpoint] = useState('desktop')
  const [customWidth, setCustomWidth] = useState(800)
  const [zoom, setZoom] = useState(0.75)
  const [activeTool, setActiveTool] = useState('cursor')
  const [showGrid, setShowGrid] = useState(true)

  const isPanning = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const canvasAreaRef = useRef(null)

  const current = breakpoints.find((b) => b.id === activeBreakpoint)
  const canvasWidth = activeBreakpoint === 'custom'
    ? customWidth
    : activeBreakpoint === 'desktop'
    ? (canvasSettings?.width || current.width)
    : current.width
  const canvasHeight = canvasSettings?.height || 900

  const zoomIn = () => setZoom((z) => Math.min(+(z + 0.1).toFixed(1), 3))
  const zoomOut = () => setZoom((z) => Math.max(+(z - 0.1).toFixed(1), 0.1))

  useEffect(() => {
    const el = canvasAreaRef.current
    if (!el) return
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        setZoom((z) => {
          const next = z + (e.deltaY > 0 ? -0.05 : 0.05)
          return Math.min(Math.max(+next.toFixed(2), 0.1), 3)
        })
      }
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  useEffect(() => {
    const el = canvasAreaRef.current
    if (!el) return

    const onMouseDown = (e) => {
      if (activeTool !== 'hand') return
      isPanning.current = true
      lastMouse.current = { x: e.clientX, y: e.clientY }
      el.style.cursor = 'grabbing'
    }
    const onMouseMove = (e) => {
      if (!isPanning.current) return
      el.scrollLeft -= e.clientX - lastMouse.current.x
      el.scrollTop -= e.clientY - lastMouse.current.y
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }
    const onMouseUp = () => {
      isPanning.current = false
      el.style.cursor = activeTool === 'hand' ? 'grab' : 'default'
    }

    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [activeTool])

  useEffect(() => {
    if (canvasAreaRef.current)
      canvasAreaRef.current.style.cursor = activeTool === 'hand' ? 'grab' : 'default'
  }, [activeTool])

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#F0F2F8]">

      {/* Breakpoint bar */}
      <div className="flex items-center justify-center pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-1 bg-white border border-[#D8E1F0] rounded-2xl px-2 py-1.5 shadow-sm">
          {breakpoints.map(({ id, label, icon: Icon, width }) => (
            <button
              key={id}
              onClick={(e) => { e.stopPropagation(); setActiveBreakpoint(id) }}
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
                onChange={(e) => setCustomWidth(Number(e.target.value))}
                className="w-16 text-xs text-[#0F2348] font-medium bg-[#F3F6FB] border border-[#D8E1F0] rounded-lg px-2 py-1 outline-none focus:border-[#2348D7]"
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

      {/* Canvas scroll area */}
      <div
        ref={canvasAreaRef}
        className="flex-1 overflow-auto bg-[#F0F2F8] select-none"
      >
        <div
          className="flex justify-center pt-4 pb-32"
          style={{
            minWidth: `${canvasWidth * zoom + 600}px`,
            minHeight: `${canvasHeight * zoom + 400}px`,
          }}
        >
          {/* Only this div scales */}
          <div
            style={{
              width: `${canvasWidth}px`,
              transformOrigin: 'top center',
              transform: `scale(${zoom})`,
              flexShrink: 0,
            }}
          >
            {/* Label */}
            <div className="flex items-center justify-between mb-1 px-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#2348D7] rounded-sm flex items-center justify-center">
                  <span className="text-white text-[8px]">▶</span>
                </div>
                <span className="text-[#5E6F8E] text-xs">{current.label}</span>
                <span className="text-[#AAB8D4] text-xs">{canvasWidth}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#2348D7] text-xs">Breakpoint</span>
                <button className="text-[#2348D7]">+</button>
              </div>
            </div>

            {/* White page */}
            <div
              style={{
                width: `${canvasWidth}px`,
                minHeight: `${canvasHeight}px`,
                backgroundColor: canvasSettings?.fill || '#ffffff',
                borderRadius: '6px 6px 0 0',
                position: 'relative',
                pointerEvents: activeTool === 'hand' ? 'none' : 'auto',
                boxShadow: '0 4px 40px rgba(0,0,0,0.10)',
                backgroundImage: showGrid
                  ? 'radial-gradient(circle, #D8E1F0 1px, transparent 1px)'
                  : 'none',
                backgroundSize: '24px 24px',
              }}
              onClick={() => activeTool === 'cursor' && onSelect(null)}
            >
              {elements.length === 0 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    pointerEvents: 'none',
                  }}
                >
                  <span style={{ fontSize: '36px', color: '#D8E1F0' }}>✦</span>
                  <p style={{ color: '#C5D0E4', fontSize: '13px' }}>Click Insert to add elements</p>
                </div>
              )}

              {elements.map((el) => (
                <CanvasElement
                  key={el.id}
                  element={el}
                  isSelected={selectedId === el.id}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  onContextMenu={onContextMenu}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom toolbar */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'white',
          border: '1px solid #D8E1F0',
          borderRadius: '16px',
          padding: '6px 8px',
          boxShadow: '0 4px 24px rgba(35,72,215,0.10)',
          zIndex: 50,
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setActiveTool('cursor') }}
          style={{
            width: '36px', height: '36px',
            borderRadius: '10px',
            border: 'none',
            background: activeTool === 'cursor' ? '#1a1a1a' : 'transparent',
            color: activeTool === 'cursor' ? 'white' : '#5E6F8E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <MousePointer2 size={15} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setActiveTool('hand') }}
          style={{
            width: '36px', height: '36px',
            borderRadius: '10px',
            border: 'none',
            background: activeTool === 'hand' ? '#1a1a1a' : 'transparent',
            color: activeTool === 'hand' ? 'white' : '#5E6F8E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <Hand size={15} />
        </button>

        <div style={{ width: '1px', height: '20px', background: '#E2E8F4', margin: '0 4px' }} />

        <button
          onClick={(e) => { e.stopPropagation(); zoomOut() }}
          style={{
            width: '30px', height: '30px', borderRadius: '8px',
            border: 'none', background: 'transparent',
            color: '#5E6F8E', cursor: 'pointer', fontSize: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >−</button>

        <button
          onClick={(e) => { e.stopPropagation(); setZoom(1) }}
          style={{
            minWidth: '44px', padding: '0 4px', height: '30px',
            border: 'none', background: 'transparent',
            color: '#0F2348', fontSize: '12px', fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); zoomIn() }}
          style={{
            width: '30px', height: '30px', borderRadius: '8px',
            border: 'none', background: 'transparent',
            color: '#5E6F8E', cursor: 'pointer', fontSize: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >+</button>

        <div style={{ width: '1px', height: '20px', background: '#E2E8F4', margin: '0 4px' }} />

        <button
          onClick={(e) => { e.stopPropagation(); setShowGrid(v => !v) }}
          title="Toggle grid"
          style={{
            width: '30px', height: '30px',
            borderRadius: '8px',
            border: 'none',
            background: showGrid ? '#EEF3FF' : 'transparent',
            color: showGrid ? '#2348D7' : '#5E6F8E',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
          }}
        >
          #
        </button>
      </div>
    </div>
  )
}

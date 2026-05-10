import { X, Monitor, Tablet, Smartphone } from 'lucide-react'
import { useState, useMemo, useRef, useEffect } from 'react'
import { BREAKPOINTS, getCanvasWidth, getElementLayout, getResponsiveValue } from '../../utils/responsive'
import { getCanvasHeight } from '../../utils/editorGeometry'

const TOPBAR_H = 48
const ICONS = { desktop: Monitor, tablet: Tablet, phone: Smartphone, custom: Monitor }

function renderElement(el, activeBreakpoint) {
  const layout = getElementLayout(el, activeBreakpoint)
  const radius = el.radius || 0
  const border = el.borderColor ? `1.5px solid ${el.borderColor}` : undefined
  const shadow = el.shadowColor ? `0 4px 24px ${el.shadowColor}` : undefined
  const opacity = (el.opacity ?? 100) / 100
  const w = layout.width || 200
  const h = layout.height || 100

  const base = {
    position: 'absolute',
    left: layout.x || 0,
    top: layout.y || 0,
    opacity,
  }

  const ts = (color, size, weight, line) => ({
    color: el.textColor || color,
    fontSize: `${getResponsiveValue(el, activeBreakpoint, 'fontSize', size)}px`,
    fontWeight: getResponsiveValue(el, activeBreakpoint, 'fontWeight', el.fontWeight || weight),
    fontFamily: el.fontFamily || 'Inter, system-ui, sans-serif',
    fontStyle: el.italic ? 'italic' : 'normal',
    textDecoration: el.underline ? 'underline' : 'none',
    textAlign: getResponsiveValue(el, activeBreakpoint, 'textAlign', el.textAlign || 'left'),
    lineHeight: getResponsiveValue(el, activeBreakpoint, 'lineHeight', el.lineHeight || line),
    letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
    width: `${w}px`,
    margin: 0,
    padding: '2px 4px',
    boxSizing: 'border-box',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  })

  switch (el.type) {
    case 'heading':
      return <h1 key={el.id} style={{ ...base, ...ts('#0F2348', 32, 700, 1.2) }}>{el.content || 'Your Heading'}</h1>
    case 'paragraph':
    case 'text':
      return <p key={el.id} style={{ ...base, ...ts('#4b5563', 16, 400, 1.6) }}>{el.content || 'Your text goes here'}</p>
    case 'link':
      return <a key={el.id} href="#" onClick={e => e.preventDefault()} style={{ ...base, ...ts('#2348D7', 16, 400, 1.6), textDecoration: 'underline', display: 'block' }}>{el.content || 'Click here'}</a>
    case 'label':
      return <span key={el.id} style={{ ...base, ...ts('#5E6F8E', 11, 700, 1.4), display: 'block' }}>{el.content || 'LABEL'}</span>
    case 'button':
      return (
        <button key={el.id} style={{ ...base, width: `${w}px`, height: `${h}px`, backgroundColor: el.fill || '#2348D7', color: el.textColor || '#fff', borderRadius: `${radius}px`, border: border || 'none', boxShadow: shadow, fontSize: `${getResponsiveValue(el, activeBreakpoint, 'fontSize', 14)}px`, fontWeight: getResponsiveValue(el, activeBreakpoint, 'fontWeight', el.fontWeight || 600), fontFamily: el.fontFamily || 'Inter, system-ui, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined }}>
          {el.content || 'Click me'}
        </button>
      )
    case 'image':
      return (
        <div key={el.id} style={{ ...base, width: `${w}px`, height: `${h}px`, backgroundColor: el.fill || '#F3F6FB', borderRadius: `${radius}px`, border: border || '1.5px dashed #D8E1F0', boxShadow: shadow, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {el.src
            ? <img src={el.src} alt={el.alt || ''} style={{ width: '100%', height: '100%', objectFit: el.objectFit || 'cover' }} />
            : <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C5D0E4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          }
        </div>
      )
    case 'video':
      return (
        <div key={el.id} style={{ ...base, width: `${w}px`, height: `${h}px`, backgroundColor: el.fill || '#0F1A2E', borderRadius: `${radius}px`, border, boxShadow: shadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18, color: 'white', marginLeft: 3 }}>▶</span>
          </div>
        </div>
      )
    case 'container':
    case 'section':
    case 'frame':
    case 'card':
      return <div key={el.id} style={{ ...base, width: `${w}px`, height: `${h}px`, backgroundColor: el.fill || 'transparent', borderRadius: `${radius}px`, border: border || ((!el.fill || el.fill === 'transparent') ? '1px dashed #E2E8F4' : 'none'), boxShadow: shadow }} />
    case 'divider':
      return <div key={el.id} style={{ ...base, width: `${w}px`, height: `${h || 2}px`, backgroundColor: el.fill || '#E2E8F4', borderRadius: 2 }} />
    case 'input':
      return <input key={el.id} readOnly type="text" placeholder={el.content || 'Placeholder...'} style={{ ...base, width: `${w}px`, height: `${h}px`, backgroundColor: el.fill || '#fff', borderRadius: `${radius || 8}px`, border: border || '1.5px solid #D8E1F0', padding: '0 12px', fontSize: `${getResponsiveValue(el, activeBreakpoint, 'fontSize', 14)}px`, fontFamily: el.fontFamily || 'Inter, system-ui, sans-serif', color: el.textColor || '#111827', outline: 'none', boxSizing: 'border-box' }} />
    case 'textarea':
      return <textarea key={el.id} readOnly placeholder={el.content || 'Placeholder...'} style={{ ...base, width: `${w}px`, height: `${h}px`, backgroundColor: el.fill || '#fff', borderRadius: `${radius || 8}px`, border: border || '1.5px solid #D8E1F0', padding: '10px 12px', fontSize: `${getResponsiveValue(el, activeBreakpoint, 'fontSize', 14)}px`, fontFamily: el.fontFamily || 'Inter, system-ui, sans-serif', color: el.textColor || '#111827', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
    case 'select':
      return <select key={el.id} style={{ ...base, width: `${w}px`, height: `${h}px`, backgroundColor: el.fill || '#fff', borderRadius: `${radius || 8}px`, border: border || '1.5px solid #D8E1F0', padding: '0 12px', fontSize: `${getResponsiveValue(el, activeBreakpoint, 'fontSize', 14)}px`, fontFamily: el.fontFamily || 'Inter, system-ui, sans-serif', color: el.textColor || '#111827', outline: 'none' }}><option>{el.content || 'Choose option'}</option></select>
    case 'checkbox':
      return (
        <label key={el.id} style={{ ...base, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input readOnly type="checkbox" style={{ width: 16, height: 16, accentColor: '#2348D7', flexShrink: 0 }} />
          <span style={{ fontSize: `${getResponsiveValue(el, activeBreakpoint, 'fontSize', 14)}px`, fontFamily: el.fontFamily || 'Inter, system-ui, sans-serif', color: el.textColor || '#111827' }}>{el.content || 'Option'}</span>
        </label>
      )
    case 'icon':
      return <div key={el.id} style={{ ...base, width: `${w}px`, height: `${h}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: el.textColor || '#2348D7', fontSize: Math.min(w, h) * 0.65 }}>★</div>
    default:
      return null
  }
}

export default function PreviewMode({ elements, canvasSettings, onExit }) {
  const [activeBreakpoint, setActiveBreakpoint] = useState('desktop')
  const containerRef = useRef(null)
  const [containerW, setContainerW] = useState(0)

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerW(containerRef.current.getBoundingClientRect().width)
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const current = BREAKPOINTS.find(b => b.id === activeBreakpoint) || BREAKPOINTS[0]
  const canvasWidth = getCanvasWidth(activeBreakpoint, canvasSettings)
  const canvasHeight = useMemo(
    () => getCanvasHeight(elements, canvasSettings, activeBreakpoint),
    [elements, canvasSettings, activeBreakpoint]
  )

  const zoom = useMemo(() => {
    if (containerW === 0) return 1
    const availableW = containerW - 64
    return Math.min(1, availableW / canvasWidth)
  }, [containerW, canvasWidth])

  const fill = canvasSettings?.fill || '#ffffff'
  const scaledDisplayW = canvasWidth * zoom

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: '#F0F2F8', overflow: 'hidden' }}>
      <div style={{ height: TOPBAR_H, minHeight: TOPBAR_H, backgroundColor: 'white', borderBottom: '1px solid #D8E1F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, backgroundColor: 'white', border: '1px solid #D8E1F0', borderRadius: 14, padding: '4px 6px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {BREAKPOINTS.filter(bp => bp.id !== 'custom').map(({ id, label, width }) => {
            const Icon = ICONS[id]
            const isActive = activeBreakpoint === id
            const displayW = width ?? canvasSettings?.width ?? 1200
            return (
              <button key={id} onClick={() => setActiveBreakpoint(id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 10, border: 'none', backgroundColor: isActive ? '#2348D7' : 'transparent', color: isActive ? 'white' : '#5E6F8E', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Inter, system-ui, sans-serif' }}>
                <Icon size={12} />
                {label}
                <span style={{ fontSize: 10, opacity: 0.65 }}>{displayW}</span>
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 0 2px rgba(34,197,94,0.25)' }} />
          <span style={{ fontSize: 12, color: '#8A9ABB', fontFamily: 'Inter, system-ui, sans-serif' }}>Preview Mode</span>
        </div>

        <button onClick={onExit}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', fontSize: 12, fontWeight: 500, color: '#5E6F8E', backgroundColor: 'white', border: '1px solid #D8E1F0', borderRadius: 10, cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FFF5F5'; e.currentTarget.style.borderColor = '#FCA5A5'; e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#D8E1F0'; e.currentTarget.style.color = '#5E6F8E' }}
        >
          <X size={12} /> Exit Preview
        </button>
      </div>

      <div ref={containerRef} style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 32, paddingBottom: 80, backgroundColor: '#F0F2F8' }}>
        {containerW > 0 && (
          <>
            <div style={{ width: scaledDisplayW, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, paddingLeft: 4, paddingRight: 4, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, backgroundColor: '#2348D7', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: 8 }}>▶</span>
                </div>
                <span style={{ fontSize: 12, color: '#5E6F8E', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>{current.label}</span>
                <span style={{ fontSize: 11, color: '#AAB8D4', fontFamily: 'Inter, sans-serif' }}>{canvasWidth}</span>
                <span style={{ fontSize: 10, color: 'white', backgroundColor: '#2348D7', borderRadius: 5, padding: '1px 6px', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <span style={{ fontSize: 11, color: '#2348D7', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>Responsive</span>
            </div>

            <div style={{
              width: canvasWidth,
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              flexShrink: 0,
              marginBottom: `${canvasHeight * (zoom - 1)}px`,
            }}>
              <div style={{
                width: canvasWidth,
                height: canvasHeight,
                backgroundColor: fill,
                borderRadius: '6px 6px 0 0',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 40px rgba(0,0,0,0.10)',
              }}>
                {elements.length === 0 && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, pointerEvents: 'none' }}>
                    <span style={{ fontSize: 36, color: '#D8E1F0' }}>✦</span>
                    <p style={{ color: '#C5D0E4', fontSize: 13, fontFamily: 'Inter, sans-serif', margin: 0 }}>Nothing to preview yet - add elements first</p>
                  </div>
                )}
                {elements.map(el => renderElement(el, activeBreakpoint))}
              </div>

              <div style={{ width: canvasWidth, height: 8, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05), transparent)', borderRadius: '0 0 6px 6px' }} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

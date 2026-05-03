import { useRef } from 'react'
import {
  AtSign,
  CheckCircle2,
  Feather,
  GitBranch,
  Globe2,
  Orbit,
  Shapes,
  Smile,
  Star,
  Trash2,
  Zap,
} from 'lucide-react'
import { getElementLayout, getResponsiveValue, setElementLayout } from '../../utils/responsive'

const HANDLES = [
  { id: 'nw', cursor: 'nw-resize', style: { top: -5,               left: -5               } },
  { id: 'n',  cursor: 'n-resize',  style: { top: -5,               left: 'calc(50% - 4px)' } },
  { id: 'ne', cursor: 'ne-resize', style: { top: -5,               right: -5              } },
  { id: 'e',  cursor: 'e-resize',  style: { top: 'calc(50% - 4px)', right: -5             } },
  { id: 'se', cursor: 'se-resize', style: { bottom: -5,            right: -5              } },
  { id: 's',  cursor: 's-resize',  style: { bottom: -5,            left: 'calc(50% - 4px)' } },
  { id: 'sw', cursor: 'sw-resize', style: { bottom: -5,            left: -5               } },
  { id: 'w',  cursor: 'w-resize',  style: { top: 'calc(50% - 4px)', left: -5             } },
]

const ICON_COMPONENTS = {
  iconic: Smile,
  phosphor: Shapes,
  hero: AtSign,
  feather: Feather,
  meteor: Globe2,
  material: Zap,
  basicons: Orbit,
  flowbite: GitBranch,
  nonicons: Feather,
  sargam: CheckCircle2,
}

const STYLE_ID = '__canvas-el-styles__'
if (!document.getElementById(STYLE_ID)) {
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = `
    .ce-root:not(.ce-selected):hover::before {
      content: '';
      position: absolute;
      inset: -4px;
      border: 1.5px solid #0EA5E9;
      border-radius: inherit;
      pointer-events: none;
      z-index: 12;
      opacity: 0.95;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.12);
    }
    .ce-root:not(.ce-selected):hover .ce-hover-label { opacity: 1; }
    .ce-hover-label {
      opacity: 0;
      transition: opacity 0.1s ease;
      position: absolute;
      top: -22px;
      left: 0;
      background: #2348D7;
      color: #fff;
      font-size: 10px;
      font-family: Inter, sans-serif;
      font-weight: 500;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      z-index: 20;
    }
    .ce-root.ce-selected::after {
      content: '';
      position: absolute;
      inset: -3px;
      border: 2px solid #0EA5E9;
      border-radius: inherit;
      pointer-events: none;
      z-index: 12;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.12);
    }
    .ce-root { cursor: move; }
  `
  document.head.appendChild(s)
}

export default function CanvasElement({
  element,
  onSelect,
  onDelete,
  isSelected,
  onUpdate,
  onContextMenu,
  zoom = 1,
  activeBreakpoint = 'desktop',
}) {
  const dragging    = useRef(false)
  const startPos    = useRef({ mouseX: 0, mouseY: 0, elX: 0, elY: 0 })
  const resizing    = useRef(null)
  const resizeStart = useRef({})

  // Resolve x/y/width/height for the current breakpoint (falls through to desktop)
  const layout = getElementLayout(element, activeBreakpoint)
  const { x, y, width: w, height: h } = layout

  /**
   * Layout changes (x/y/width/height) are written into the active breakpoint slot.
   * Everything else (fill, content, textColor…) is written to the root element
   * so it stays shared across all breakpoints.
   */
  const handleUpdate = (id, changes) => {
    const layoutKeys = new Set(['x', 'y', 'width', 'height'])
    const layoutChanges = {}
    const styleChanges  = {}

    Object.entries(changes).forEach(([k, v]) => {
      if (layoutKeys.has(k)) layoutChanges[k] = v
      else                   styleChanges[k]  = v
    })

    let updated = Object.keys(styleChanges).length
      ? { ...element, ...styleChanges }
      : { ...element }

    if (Object.keys(layoutChanges).length) {
      updated = setElementLayout(updated, activeBreakpoint, layoutChanges)
    }

    onUpdate(id, updated)
  }

  /* ── Drag ── */
  const handleMouseDown = (e) => {
    e.stopPropagation()
    e.preventDefault()
    onSelect(element.id)
    dragging.current = true
    startPos.current = { mouseX: e.clientX, mouseY: e.clientY, elX: x, elY: y }

    const onMove = (e) => {
      if (!dragging.current) return
      const dx = (e.clientX - startPos.current.mouseX) / zoom
      const dy = (e.clientY - startPos.current.mouseY) / zoom
      handleUpdate(element.id, {
        x: Math.round(startPos.current.elX + dx),
        y: Math.round(startPos.current.elY + dy),
      })
    }
    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  /* ── Resize ── */
  const handleResizeMouseDown = (e, handleId) => {
    e.stopPropagation()
    e.preventDefault()
    resizing.current = handleId
    resizeStart.current = { mouseX: e.clientX, mouseY: e.clientY, x, y, w, h }

    const onMove = (e) => {
      if (!resizing.current) return
      const dx = (e.clientX - resizeStart.current.mouseX) / zoom
      const dy = (e.clientY - resizeStart.current.mouseY) / zoom
      const id = resizing.current
      let { x: rx, y: ry, w: rw, h: rh } = resizeStart.current
      let newX = rx, newY = ry, newW = rw, newH = rh

      if (id.includes('e')) newW = Math.max(40, rw + dx)
      if (id.includes('s')) newH = Math.max(20, rh + dy)
      if (id.includes('w')) { newW = Math.max(40, rw - dx); newX = rx + (rw - newW) }
      if (id.includes('n')) { newH = Math.max(20, rh - dy); newY = ry + (rh - newH) }

      handleUpdate(element.id, {
        x: Math.round(newX), y: Math.round(newY),
        width: Math.round(newW), height: Math.round(newH),
      })
    }
    const onUp = () => {
      resizing.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  /* ── Visual styles (not layout) ── */
  const fill    = element.fill        || 'transparent'
  const radius  = element.radius      || 0
  const border  = element.borderColor ? `1.5px solid ${element.borderColor}` : undefined
  const shadow  = element.shadowColor ? `0 4px 24px ${element.shadowColor}` : undefined
  const opacity = (element.opacity    ?? 100) / 100

  const sharedTextProps = (defaultColor, defaultSize, defaultWeight, defaultLine) => ({
    contentEditable: true,
    suppressContentEditableWarning: true,
    onBlur: e => handleUpdate(element.id, { content: e.target.innerText }),
    style: {
      color:          element.textColor  || defaultColor,
      fontSize:       `${getResponsiveValue(element, activeBreakpoint, 'fontSize', defaultSize)}px`,
      fontWeight:     getResponsiveValue(element, activeBreakpoint, 'fontWeight', defaultWeight),
      fontFamily:     element.fontFamily || 'inherit',
      fontStyle:      element.italic     ? 'italic'    : 'normal',
      textDecoration: element.underline  ? 'underline' : 'none',
      textAlign:      getResponsiveValue(element, activeBreakpoint, 'textAlign', element.textAlign || 'left'),
      lineHeight:     getResponsiveValue(element, activeBreakpoint, 'lineHeight', element.lineHeight || defaultLine),
      letterSpacing:  element.letterSpacing ? `${element.letterSpacing}px` : undefined,
      outline: 'none', cursor: 'text', width: '100%',
      padding: '2px 4px', boxSizing: 'border-box',
      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    },
  })

  const renderContent = () => {
    switch (element.type) {
      case 'heading':
        return <h1 {...sharedTextProps('#0F2348', 32, 700, 1.2)}>{element.content || 'Your Heading'}</h1>
      case 'label':
        return (
          <span {...sharedTextProps('#5E6F8E', 11, 700, 1.4)}
            style={{
              ...sharedTextProps('#5E6F8E', 11, 700, 1.4).style,
              textTransform: 'uppercase',
              letterSpacing: `${element.letterSpacing ?? 2}px`,
            }}>
            {element.content || 'LABEL'}
          </span>
        )
      case 'paragraph':
      case 'text':
        return <p {...sharedTextProps('#4b5563', 16, 400, 1.6)}>{element.content || 'Your text goes here'}</p>
      case 'link':
        return (
          <a {...sharedTextProps('#2348D7', 16, 400, 1.6)}
            style={{ ...sharedTextProps('#2348D7', 16, 400, 1.6).style, textDecoration: 'underline' }}>
            {element.content || 'Click here'}
          </a>
        )
      case 'button':
        return (
          <div style={{
            width: `${w}px`, height: `${h}px`,
            backgroundColor: element.fill || '#2348D7',
            color: element.textColor || '#ffffff',
            borderRadius: `${radius}px`, border: border || 'none', boxShadow: shadow,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: `${getResponsiveValue(element, activeBreakpoint, 'fontSize', 14)}px`,
            fontWeight: element.fontWeight || 500,
            fontFamily: element.fontFamily || 'inherit',
            cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
          }}>
            {element.content || 'Click me'}
          </div>
        )
      case 'image':
        return element.src ? (
          <img src={element.src} alt="" style={{
            width: `${w}px`, height: `${h}px`,
            objectFit: 'cover', borderRadius: `${radius}px`, border, boxShadow: shadow, display: 'block',
          }} />
        ) : (
          <div style={{
            width: `${w}px`, height: `${h}px`,
            backgroundColor: fill !== 'transparent' ? fill : '#F3F6FB',
            borderRadius: `${radius}px`, border: border || '1.5px dashed #D8E1F0', boxShadow: shadow,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C5D0E4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span style={{ fontSize: '11px', color: '#C5D0E4', fontFamily: 'Inter, sans-serif' }}>Image</span>
          </div>
        )
      case 'video':
        return (
          <div style={{
            width: `${w}px`, height: `${h}px`,
            backgroundColor: '#0F1A2E', borderRadius: `${radius}px`, border, boxShadow: shadow,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px',
          }}>▶</div>
        )
      case 'icon':
        {
          const Icon = ICON_COMPONENTS[element.iconSet] || Star
          return (
            <div style={{
              width: `${w}px`, height: `${h}px`,
              color: element.textColor || '#2348D7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={Math.min(w, h)} strokeWidth={2.2} />
            </div>
          )
        }
      case 'divider':
        return <div style={{ width: `${w}px`, height: `${h || 2}px`, backgroundColor: element.fill || '#E2E8F4', borderRadius: '2px' }} />
      case 'card':
      case 'container':
      case 'section':
      case 'frame':
        return (
          <div style={{
            width: `${w}px`, height: `${h}px`, backgroundColor: fill,
            borderRadius: `${radius}px`,
            border: border || (fill === 'transparent' || !fill ? '1.5px dashed #D8E1F0' : 'none'),
            boxShadow: shadow, position: 'relative', overflow: 'hidden',
          }} />
        )
      case 'input':
        return (
          <input
            type="text"
            placeholder={element.content || 'Placeholder...'}
            style={{
              width: `${w}px`, height: `${h}px`,
              backgroundColor: element.fill || '#ffffff',
              color: element.textColor || '#111827',
              borderRadius: `${radius}px`, border: border || '1.5px solid #D8E1F0',
              padding: '0 12px', fontSize: `${getResponsiveValue(element, activeBreakpoint, 'fontSize', 14)}px`,
              fontFamily: element.fontFamily || 'inherit',
              outline: 'none', boxSizing: 'border-box', display: 'block',
            }}
          />
        )
      case 'textarea':
        return (
          <textarea
            placeholder={element.content || 'Placeholder...'}
            style={{
              width: `${w}px`, height: `${h}px`,
              backgroundColor: element.fill || '#ffffff',
              color: element.textColor || '#111827',
              borderRadius: `${radius}px`, border: border || '1.5px solid #D8E1F0',
              padding: '10px 12px', fontSize: `${getResponsiveValue(element, activeBreakpoint, 'fontSize', 14)}px`,
              fontFamily: element.fontFamily || 'inherit',
              outline: 'none', boxSizing: 'border-box', display: 'block', resize: 'none',
            }}
          />
        )
      case 'select':
        return (
          <div style={{
            width: `${w}px`, height: `${h}px`,
            backgroundColor: element.fill || '#ffffff',
            color: element.textColor || '#111827',
            borderRadius: `${radius}px`, border: border || '1.5px solid #D8E1F0',
            padding: '0 12px', fontSize: `${getResponsiveValue(element, activeBreakpoint, 'fontSize', 14)}px`,
            fontFamily: element.fontFamily || 'inherit',
            boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>{element.content || 'Choose option'}</span>
            <span style={{ color: '#7D8CA8', fontSize: '12px' }}>v</span>
          </div>
        )
      case 'checkbox':
        return (
          <label style={{
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
            fontSize: `${getResponsiveValue(element, activeBreakpoint, 'fontSize', 14)}px`,
            color: element.textColor || '#111827',
            fontFamily: element.fontFamily || 'inherit', userSelect: 'none',
          }}>
            <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#2348D7' }} />
            {element.content || 'Option'}
          </label>
        )
      default:
        return (
          <div style={{
            width: `${w}px`, height: `${h}px`,
            backgroundColor: fill !== 'transparent' ? fill : '#F3F6FB',
            borderRadius: `${radius}px`, border: border || '1.5px dashed #D8E1F0',
          }} />
        )
    }
  }

  return (
    <div
      className={`ce-root${isSelected ? ' ce-selected' : ''}`}
      onMouseDown={handleMouseDown}
      onClick={e => e.stopPropagation()}
      onContextMenu={e => onContextMenu?.(e, element.id)}
      style={{
        position: 'absolute',
        left:     `${x}px`,
        top:      `${y}px`,
        opacity,
        userSelect:   'none',
        borderRadius: `${radius}px`,
        zIndex:       isSelected ? 10 : 1,
      }}
    >
      <span className="ce-hover-label">{element.name || element.type}</span>
      {renderContent()}

      {isSelected && (
        <button
          onMouseDown={e => { e.stopPropagation(); onDelete(element.id) }}
          style={{
            position: 'absolute', top: '-13px', right: '-13px',
            width: '24px', height: '24px', borderRadius: '50%',
            backgroundColor: '#ef4444', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 30, boxShadow: '0 2px 8px rgba(239,68,68,0.35)',
          }}
        >
          <Trash2 size={10} color="white" />
        </button>
      )}

      {isSelected && HANDLES.map(handle => (
        <div key={handle.id} onMouseDown={e => handleResizeMouseDown(e, handle.id)} style={{
          position: 'absolute', width: 9, height: 9,
          backgroundColor: 'white', border: '1.5px solid #2348D7',
          borderRadius: '2px', cursor: handle.cursor, zIndex: 20,
          ...handle.style,
        }} />
      ))}
    </div>
  )
}

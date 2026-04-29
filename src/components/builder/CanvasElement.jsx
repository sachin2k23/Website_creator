import { useRef } from 'react'
import { Trash2 } from 'lucide-react'

const HANDLES = [
  { id: 'nw', cursor: 'nw-resize', style: { top: -4,              left: -4              } },
  { id: 'n',  cursor: 'n-resize',  style: { top: -4,              left: 'calc(50% - 4px)' } },
  { id: 'ne', cursor: 'ne-resize', style: { top: -4,              right: -4             } },
  { id: 'e',  cursor: 'e-resize',  style: { top: 'calc(50% - 4px)', right: -4           } },
  { id: 'se', cursor: 'se-resize', style: { bottom: -4,           right: -4             } },
  { id: 's',  cursor: 's-resize',  style: { bottom: -4,           left: 'calc(50% - 4px)' } },
  { id: 'sw', cursor: 'sw-resize', style: { bottom: -4,           left: -4              } },
  { id: 'w',  cursor: 'w-resize',  style: { top: 'calc(50% - 4px)', left: -4           } },
]

export default function CanvasElement({
  element,
  onSelect,
  onDelete,
  isSelected,
  onUpdate,
  onContextMenu,
  zoom = 1,           // ← NEW: passed from Canvas so drag math is correct
}) {
  const dragging    = useRef(false)
  const startPos    = useRef({ mouseX: 0, mouseY: 0, elX: 0, elY: 0 })
  const resizing    = useRef(null)
  const resizeStart = useRef({})

  // ── Drag ────────────────────────────────────────────────────────────────────
  const handleMouseDown = (e) => {
    e.stopPropagation()
    e.preventDefault()
    onSelect(element.id)
    dragging.current = true
    startPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elX: element.x,
      elY: element.y,
    }

    const onMove = (e) => {
      if (!dragging.current) return
      // Divide by zoom so 1 screen-pixel = 1/zoom canvas-pixel
      const dx = (e.clientX - startPos.current.mouseX) / zoom
      const dy = (e.clientY - startPos.current.mouseY) / zoom
      onUpdate(element.id, {
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

  // ── Resize ───────────────────────────────────────────────────────────────────
  const handleResizeMouseDown = (e, handleId) => {
    e.stopPropagation()
    e.preventDefault()
    resizing.current = handleId
    resizeStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: element.x,
      y: element.y,
      w: element.width  || 200,
      h: element.height || 100,
    }

    const onMove = (e) => {
      if (!resizing.current) return
      const dx = (e.clientX - resizeStart.current.mouseX) / zoom
      const dy = (e.clientY - resizeStart.current.mouseY) / zoom
      const id = resizing.current
      let { x, y, w, h } = resizeStart.current
      let newX = x, newY = y, newW = w, newH = h

      if (id.includes('e')) newW = Math.max(40, w + dx)
      if (id.includes('s')) newH = Math.max(20, h + dy)
      if (id.includes('w')) { newW = Math.max(40, w - dx); newX = x + (w - newW) }
      if (id.includes('n')) { newH = Math.max(20, h - dy); newY = y + (h - newH) }

      onUpdate(element.id, {
        x: Math.round(newX),
        y: Math.round(newY),
        width:  Math.round(newW),
        height: Math.round(newH),
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

  // ── Derived styles ───────────────────────────────────────────────────────────
  const w      = element.width  || 200
  const h      = element.height || 100
  const fill   = element.fill   || 'transparent'
  const radius = element.radius || 0
  const border = element.borderColor ? `1.5px solid ${element.borderColor}` : undefined
  const shadow = element.shadowColor ? `0 4px 24px ${element.shadowColor}` : undefined
  const opacity = (element.opacity ?? 100) / 100

  // ── Content renderer ─────────────────────────────────────────────────────────
  const renderContent = () => {
    const sharedTextProps = (defaultColor, defaultSize, defaultWeight, defaultLine) => ({
      contentEditable: true,
      suppressContentEditableWarning: true,
      onMouseDown: e => e.stopPropagation(),
      onBlur: e => onUpdate(element.id, { content: e.target.innerText }),
      style: {
        color:          element.textColor  || defaultColor,
        fontSize:       element.fontSize   ? `${element.fontSize}px` : `${defaultSize}px`,
        fontWeight:     element.fontWeight || defaultWeight,
        fontFamily:     element.fontFamily || 'inherit',
        fontStyle:      element.italic     ? 'italic'     : 'normal',
        textDecoration: element.underline  ? 'underline'  : 'none',
        textAlign:      element.textAlign  || 'left',
        lineHeight:     element.lineHeight || defaultLine,
        letterSpacing:  element.letterSpacing ? `${element.letterSpacing}px` : undefined,
        outline:        'none',
        cursor:         'text',
        width:          '100%',
        padding:        '2px 4px',
        boxSizing:      'border-box',
        whiteSpace:     'pre-wrap',
        wordBreak:      'break-word',
      },
    })

    switch (element.type) {
      // ── Text types ──────────────────────────────────────────────────────────
      case 'heading':
        return (
          <h1 {...sharedTextProps('#0F2348', 32, 700, 1.2)}>
            {element.content || 'Your Heading'}
          </h1>
        )

      case 'paragraph':
      case 'text':
        return (
          <p {...sharedTextProps('#4b5563', 16, 400, 1.6)}>
            {element.content || 'Your text goes here'}
          </p>
        )

      case 'link':
        return (
          <a
            {...sharedTextProps('#2348D7', 16, 400, 1.6)}
            style={{
              ...sharedTextProps('#2348D7', 16, 400, 1.6).style,
              textDecoration: 'underline',
            }}
          >
            {element.content || 'Click here'}
          </a>
        )

      // ── Button ──────────────────────────────────────────────────────────────
      case 'button':
        return (
          <div
            style={{
              width:           `${w}px`,
              height:          `${h}px`,
              backgroundColor: element.fill   || '#2348D7',
              color:           element.textColor || '#ffffff',
              borderRadius:    `${radius}px`,
              border:          border || 'none',
              boxShadow:       shadow,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              fontSize:        element.fontSize   ? `${element.fontSize}px` : '14px',
              fontWeight:      element.fontWeight || 500,
              fontFamily:      element.fontFamily || 'inherit',
              letterSpacing:   element.letterSpacing ? `${element.letterSpacing}px` : undefined,
              cursor:          'pointer',
              userSelect:      'none',
              whiteSpace:      'nowrap',
            }}
          >
            {element.content || 'Click me'}
          </div>
        )

      // ── Image placeholder ────────────────────────────────────────────────────
      case 'image':
        return element.src ? (
          <img
            src={element.src}
            alt=""
            style={{
              width:        `${w}px`,
              height:       `${h}px`,
              objectFit:    'cover',
              borderRadius: `${radius}px`,
              border,
              boxShadow:    shadow,
              display:      'block',
            }}
          />
        ) : (
          <div
            style={{
              width:           `${w}px`,
              height:          `${h}px`,
              backgroundColor: fill !== 'transparent' ? fill : '#F3F6FB',
              borderRadius:    `${radius}px`,
              border:          border || '1.5px dashed #D8E1F0',
              boxShadow:       shadow,
              display:         'flex',
              flexDirection:   'column',
              alignItems:      'center',
              justifyContent:  'center',
              gap:             '6px',
            }}
          >
            {/* Simple image icon SVG */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C5D0E4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span style={{ fontSize: '11px', color: '#C5D0E4', fontFamily: 'Inter, sans-serif' }}>Image</span>
          </div>
        )

      // ── Video placeholder ────────────────────────────────────────────────────
      case 'video':
        return (
          <div
            style={{
              width:           `${w}px`,
              height:          `${h}px`,
              backgroundColor: '#0F1A2E',
              borderRadius:    `${radius}px`,
              border,
              boxShadow:       shadow,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              color:           'white',
              fontSize:        '32px',
            }}
          >
            ▶
          </div>
        )

      // ── Divider ──────────────────────────────────────────────────────────────
      case 'divider':
        return (
          <div
            style={{
              width:           `${w}px`,
              height:          `${element.height || 2}px`,
              backgroundColor: element.fill || '#E2E8F4',
              borderRadius:    '2px',
            }}
          />
        )

      // ── Container / Section / Frame ──────────────────────────────────────────
      case 'container':
      case 'section':
      case 'frame':
        return (
          <div
            style={{
              width:           `${w}px`,
              height:          `${h}px`,
              backgroundColor: fill,
              borderRadius:    `${radius}px`,
              border:          border || (fill === 'transparent' || !fill ? '1.5px dashed #D8E1F0' : 'none'),
              boxShadow:       shadow,
              position:        'relative',
              overflow:        'hidden',
            }}
          />
        )

      // ── Input ────────────────────────────────────────────────────────────────
      case 'input':
        return (
          <input
            type="text"
            placeholder={element.content || 'Placeholder...'}
            onMouseDown={e => e.stopPropagation()}
            style={{
              width:           `${w}px`,
              height:          `${h}px`,
              backgroundColor: element.fill    || '#ffffff',
              color:           element.textColor || '#111827',
              borderRadius:    `${radius}px`,
              border:          border || '1.5px solid #D8E1F0',
              padding:         '0 12px',
              fontSize:        element.fontSize ? `${element.fontSize}px` : '14px',
              fontFamily:      element.fontFamily || 'inherit',
              outline:         'none',
              boxSizing:       'border-box',
              display:         'block',
            }}
          />
        )

      // ── Checkbox ─────────────────────────────────────────────────────────────
      case 'checkbox':
        return (
          <label
            onMouseDown={e => e.stopPropagation()}
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '8px',
              cursor:     'pointer',
              fontSize:   element.fontSize ? `${element.fontSize}px` : '14px',
              color:      element.textColor || '#111827',
              fontFamily: element.fontFamily || 'inherit',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              style={{ width: '16px', height: '16px', accentColor: '#2348D7' }}
            />
            {element.content || 'Option'}
          </label>
        )

      default:
        return (
          <div
            style={{
              width:           `${w}px`,
              height:          `${h}px`,
              backgroundColor: fill !== 'transparent' ? fill : '#F3F6FB',
              borderRadius:    `${radius}px`,
              border:          border || '1.5px dashed #D8E1F0',
            }}
          />
        )
    }
  }

  // ── Root wrapper ─────────────────────────────────────────────────────────────
  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={e => e.stopPropagation()}
      onContextMenu={e => onContextMenu?.(e, element.id)}
      style={{
        position:     'absolute',
        left:         `${element.x}px`,
        top:          `${element.y}px`,
        opacity,
        cursor:       'move',
        userSelect:   'none',
        outline:      isSelected ? '2px solid #2348D7' : 'none',
        outlineOffset: '1px',
        borderRadius: `${radius}px`,
        zIndex:       isSelected ? 10 : 1,
      }}
    >
      {renderContent()}

      {/* Delete button */}
      {isSelected && (
        <button
          onMouseDown={e => { e.stopPropagation(); onDelete(element.id) }}
          style={{
            position:        'absolute',
            top:             '-12px',
            right:           '-12px',
            width:           '24px',
            height:          '24px',
            borderRadius:    '50%',
            backgroundColor: '#ef4444',
            border:          'none',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            cursor:          'pointer',
            zIndex:          30,
            boxShadow:       '0 2px 8px rgba(239,68,68,0.4)',
          }}
        >
          <Trash2 size={10} color="white" />
        </button>
      )}

      {/* Resize handles */}
      {isSelected && HANDLES.map(handle => (
        <div
          key={handle.id}
          onMouseDown={e => handleResizeMouseDown(e, handle.id)}
          style={{
            position:        'absolute',
            width:           8,
            height:          8,
            backgroundColor: 'white',
            border:          '1.5px solid #2348D7',
            borderRadius:    '2px',
            cursor:          handle.cursor,
            zIndex:          20,
            ...handle.style,
          }}
        />
      ))}
    </div>
  )
}
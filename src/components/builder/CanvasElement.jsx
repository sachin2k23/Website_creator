import { useRef } from 'react'
import { Trash2 } from 'lucide-react'

const HANDLES = [
  { id: 'nw', cursor: 'nw-resize', style: { top: -4, left: -4 } },
  { id: 'n',  cursor: 'n-resize',  style: { top: -4, left: 'calc(50% - 4px)' } },
  { id: 'ne', cursor: 'ne-resize', style: { top: -4, right: -4 } },
  { id: 'e',  cursor: 'e-resize',  style: { top: 'calc(50% - 4px)', right: -4 } },
  { id: 'se', cursor: 'se-resize', style: { bottom: -4, right: -4 } },
  { id: 's',  cursor: 's-resize',  style: { bottom: -4, left: 'calc(50% - 4px)' } },
  { id: 'sw', cursor: 'sw-resize', style: { bottom: -4, left: -4 } },
  { id: 'w',  cursor: 'w-resize',  style: { top: 'calc(50% - 4px)', left: -4 } },
]

export default function CanvasElement({ element, onSelect, onDelete, isSelected, onUpdate, onContextMenu }) {
  const dragging = useRef(false)
  const startPos = useRef({ mouseX: 0, mouseY: 0, elX: 0, elY: 0 })
  const resizing = useRef(null)
  const resizeStart = useRef({})

  const handleMouseDown = (e) => {
    e.stopPropagation()
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
      const dx = e.clientX - startPos.current.mouseX
      const dy = e.clientY - startPos.current.mouseY
      onUpdate(element.id, {
        x: startPos.current.elX + dx,
        y: startPos.current.elY + dy,
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
      const dx = e.clientX - resizeStart.current.mouseX
      const dy = e.clientY - resizeStart.current.mouseY
      const id = resizing.current
      let { x, y, w, h } = resizeStart.current
      let newX = x, newY = y, newW = w, newH = h

      if (id.includes('e')) newW = Math.max(40, w + dx)
      if (id.includes('s')) newH = Math.max(20, h + dy)
      if (id.includes('w')) { newW = Math.max(40, w - dx); newX = x + (w - newW) }
      if (id.includes('n')) { newH = Math.max(20, h - dy); newY = y + (h - newH) }

      onUpdate(element.id, { x: newX, y: newY, width: newW, height: newH })
    }

    const onUp = () => {
      resizing.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const w = element.width || 200
  const h = element.height || 100
  const fill = element.fill || 'transparent'
  const radius = element.radius || 0
  const border = element.borderColor ? `1.5px solid ${element.borderColor}` : undefined
  const shadow = element.shadowColor ? `0 4px 24px ${element.shadowColor}` : undefined
  const opacity = (element.opacity ?? 100) / 100

  const renderContent = () => {
    switch (element.type) {
      case 'heading':
        return (
          <h1
            contentEditable
            suppressContentEditableWarning
            onMouseDown={e => e.stopPropagation()}
            onBlur={e => onUpdate(element.id, { content: e.target.innerText })}
            style={{
              color:          element.textColor  || '#111827',
              fontSize:       element.fontSize   ? `${element.fontSize}px` : '32px',
              fontWeight:     element.fontWeight || 700,
              fontStyle:      element.italic     ? 'italic' : 'normal',
              textDecoration: element.underline  ? 'underline' : 'none',
              textAlign:      element.textAlign  || 'left',
              lineHeight:     element.lineHeight || 1.2,
              outline: 'none',
              cursor: 'text',
              minWidth: '120px',
              padding: '4px',
            }}
          >
            {element.content || 'Your Heading'}
          </h1>
        )

      case 'text':
        return (
          <p
            contentEditable
            suppressContentEditableWarning
            onMouseDown={e => e.stopPropagation()}
            onBlur={e => onUpdate(element.id, { content: e.target.innerText })}
            style={{
              color:          element.textColor  || '#4b5563',
              fontSize:       element.fontSize   ? `${element.fontSize}px` : '16px',
              fontWeight:     element.fontWeight || 400,
              fontStyle:      element.italic     ? 'italic' : 'normal',
              textDecoration: element.underline  ? 'underline' : 'none',
              textAlign:      element.textAlign  || 'left',
              lineHeight:     element.lineHeight || 1.6,
              outline: 'none',
              cursor: 'text',
              minWidth: '120px',
              padding: '4px',
            }}
          >
            {element.content || 'Your text goes here'}
          </p>
        )

      case 'button':
        return (
          <div
            style={{
              width: `${w}px`,
              height: `${h}px`,
              backgroundColor: element.fill || '#2348D7',
              color: element.textColor || '#ffffff',
              borderRadius: `${radius}px`,
              border,
              boxShadow: shadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {element.content || 'Click me'}
          </div>
        )

      case 'image':
        return (
          <div
            style={{
              width: `${w}px`,
              height: `${h}px`,
              backgroundColor: fill !== 'transparent' ? fill : '#F3F6FB',
              borderRadius: `${radius}px`,
              border: border || '2px dashed #D8E1F0',
              boxShadow: shadow,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '24px', color: '#AAB8D4' }}>🖼</span>
            <span style={{ fontSize: '11px', color: '#AAB8D4' }}>Image</span>
          </div>
        )

      case 'divider':
        return (
          <div
            style={{
              width: `${w}px`,
              height: '2px',
              backgroundColor: element.fill || '#E2E8F4',
              borderRadius: '2px',
            }}
          />
        )

      case 'container':
        return (
          <div
            style={{
              width: `${w}px`,
              height: `${h}px`,
              backgroundColor: fill,
              borderRadius: `${radius}px`,
              border: border || '2px dashed #D8E1F0',
              boxShadow: shadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '11px', color: '#D8E1F0' }}>Container</span>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => onContextMenu && onContextMenu(e, element.id)}
      style={{
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        opacity,
        cursor: 'move',
        userSelect: 'none',
        outline: isSelected ? '2px solid #2348D7' : 'none',
        borderRadius: `${radius}px`,
      }}
    >
      {renderContent()}

      {isSelected && (
        <button
          onMouseDown={(e) => { e.stopPropagation(); onDelete(element.id) }}
          style={{
            position: 'absolute',
            top: '-12px',
            right: '-12px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <Trash2 size={10} color="white" />
        </button>
      )}

      {isSelected && HANDLES.map(handle => (
        <div
          key={handle.id}
          onMouseDown={e => handleResizeMouseDown(e, handle.id)}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            backgroundColor: 'white',
            border: '1.5px solid #2348D7',
            borderRadius: '2px',
            cursor: handle.cursor,
            zIndex: 20,
            ...handle.style,
          }}
        />
      ))}
    </div>
  )
}

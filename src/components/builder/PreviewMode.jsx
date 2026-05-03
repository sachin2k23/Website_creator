import { X, Monitor, Tablet, Smartphone } from 'lucide-react'
import { useState } from 'react'

const BREAKPOINTS = [
  { id: 'desktop',  label: 'Desktop',  icon: Monitor,    width: '100%' },
  { id: 'tablet',   label: 'Tablet',   icon: Tablet,     width: '768px' },
  { id: 'mobile',   label: 'Mobile',   icon: Smartphone, width: '390px' },
]

function renderElement(el) {
  const radius = el.radius || 0
  const border = el.borderColor ? `1.5px solid ${el.borderColor}` : undefined
  const shadow = el.shadowColor ? `0 4px 24px ${el.shadowColor}` : undefined
  const opacity = (el.opacity ?? 100) / 100
  const w = el.width || 200
  const h = el.height || 100

  const baseStyle = {
    position: 'absolute',
    left: el.x,
    top: el.y,
    opacity,
  }

  switch (el.type) {
    case 'heading':
      return (
        <div key={el.id} style={baseStyle}>
          <h1 style={{
            color:          el.textColor  || '#111827',
            fontSize:       el.fontSize   ? `${el.fontSize}px` : '32px',
            fontWeight:     el.fontWeight || 700,
            fontStyle:      el.italic     ? 'italic' : 'normal',
            textDecoration: el.underline  ? 'underline' : 'none',
            textAlign:      el.textAlign  || 'left',
            lineHeight:     el.lineHeight || 1.2,
            width:          `${w}px`,
            margin: 0,
          }}>
            {el.content || 'Your Heading'}
          </h1>
        </div>
      )

    case 'paragraph':
      return (
        <div key={el.id} style={baseStyle}>
          <p style={{
            color:          el.textColor  || '#4b5563',
            fontSize:       el.fontSize   ? `${el.fontSize}px` : '16px',
            fontWeight:     el.fontWeight || 400,
            fontStyle:      el.italic     ? 'italic' : 'normal',
            textDecoration: el.underline  ? 'underline' : 'none',
            textAlign:      el.textAlign  || 'left',
            lineHeight:     el.lineHeight || 1.6,
            width:          `${w}px`,
            margin: 0,
          }}>
            {el.content || 'Your text goes here'}
          </p>
        </div>
      )

    case 'button':
      return (
        <div key={el.id} style={baseStyle}>
          <button style={{
            width:           `${w}px`,
            height:          `${h}px`,
            backgroundColor: el.fill      || '#2348D7',
            color:           el.textColor || '#ffffff',
            borderRadius:    `${radius}px`,
            border,
            boxShadow:       shadow,
            fontSize:        el.fontSize  ? `${el.fontSize}px` : '14px',
            fontWeight:      el.fontWeight || 500,
            cursor:          'pointer',
          }}>
            {el.content || 'Click me'}
          </button>
        </div>
      )

    case 'image':
      return (
        <div key={el.id} style={{
          ...baseStyle,
          width:           `${w}px`,
          height:          `${h}px`,
          backgroundColor: el.fill || '#F3F6FB',
          borderRadius:    `${radius}px`,
          border:          border || '2px dashed #D8E1F0',
          overflow:        'hidden',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
        }}>
          {el.src
            ? <img src={el.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 28, color: '#AAB8D4' }}>🖼</span>
          }
        </div>
      )

    case 'container':
    case 'section':
      return (
        <div key={el.id} style={{
          ...baseStyle,
          width:           `${w}px`,
          height:          `${h}px`,
          backgroundColor: el.fill || 'transparent',
          borderRadius:    `${radius}px`,
          border,
          boxShadow:       shadow,
        }} />
      )

    case 'divider':
      return (
        <div key={el.id} style={{
          ...baseStyle,
          width:           `${w}px`,
          height:          '2px',
          backgroundColor: el.fill || '#E2E8F4',
        }} />
      )

    case 'video':
      return (
        <div key={el.id} style={{
          ...baseStyle,
          width:           `${w}px`,
          height:          `${h}px`,
          backgroundColor: '#0F1A2E',
          borderRadius:    `${radius}px`,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
        }}>
          <span style={{ fontSize: 32, color: 'white' }}>▶</span>
        </div>
      )

    case 'input':
      return (
        <div key={el.id} style={baseStyle}>
          <input
            type="text"
            placeholder={el.content || 'Placeholder...'}
            style={{
              width:           `${w}px`,
              height:          `${h}px`,
              backgroundColor: el.fill || '#ffffff',
              borderRadius:    `${radius || 8}px`,
              border:          border || '1.5px solid #D8E1F0',
              padding:         '0 12px',
              fontSize:        '14px',
              color:           el.textColor || '#111827',
              outline:         'none',
            }}
          />
        </div>
      )

    default:
      return null
  }
}

export default function PreviewMode({ elements, canvasSettings, onExit }) {
  const [activeBreakpoint, setActiveBreakpoint] = useState('desktop')

  const current = BREAKPOINTS.find(b => b.id === activeBreakpoint)

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F0F2F8]">

      {/* Preview topbar */}
      <div className="h-12 bg-white border-b border-[#D8E1F0] flex items-center justify-between px-4 shrink-0">

        {/* Breakpoint switcher */}
        <div className="flex items-center gap-1 bg-[#F3F6FB] border border-[#E2E8F4] rounded-xl p-1">
          {BREAKPOINTS.map(bp => {
            const Icon = bp.icon
            return (
              <button
                key={bp.id}
                onClick={() => setActiveBreakpoint(bp.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeBreakpoint === bp.id
                    ? 'bg-white text-[#2348D7] shadow-sm'
                    : 'text-[#8A9ABB] hover:text-[#2348D7]'
                }`}
              >
                <Icon size={12} />
                {bp.label}
              </button>
            )
          })}
        </div>

        <p className="text-xs text-[#AAB8D4]">Preview Mode</p>

        {/* Exit */}
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#5E6F8E] border border-[#D8E1F0] rounded-xl hover:bg-[#F3F7FF] transition-colors"
        >
          <X size={12} />
          Exit Preview
        </button>
      </div>

      {/* Preview canvas */}
      <div className="flex-1 overflow-auto flex justify-center pt-8 pb-16">
        <div
          style={{
            width:           current.width,
            minHeight:       '100%',
            backgroundColor: canvasSettings.fill || '#ffffff',
            position:        'relative',
            boxShadow:       '0 8px 40px rgba(0,0,0,0.12)',
            borderRadius:    '8px',
            transition:      'width 0.3s ease',
            
          }}
        >
          {elements.map(el => renderElement(el))}

          {elements.length === 0 && (
            <div style={{
              position:       'absolute',
              inset:          0,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              color:          '#C5D0E4',
              fontSize:       14,
            }}>
              Nothing to preview yet — add some elements first
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

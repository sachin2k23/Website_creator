import { useState, useRef } from 'react'
import {
  ChevronDown, X,
  BringToFront, SendToBack,
  ArrowUp, ArrowDown,
  Upload, ImageIcon,
} from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { BREAKPOINTS, getCanvasWidth } from '../../utils/responsive'

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[#EEF2FA]">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F8FAFF] transition-colors"
      >
        <span className="text-[#0F2348] text-xs font-semibold">{title}</span>
        <ChevronDown size={13} className={`text-[#AAB8D4] transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

function NumberInput({ label, value, suffix, onChange }) {
  return (
    <div>
      {label && <p className="text-[#AAB8D4] text-[10px] mb-1">{label}</p>}
      <div className="flex items-center bg-[#F3F6FB] border border-[#E2E8F4] rounded-xl overflow-hidden focus-within:border-[#2348D7] transition-colors">
        <input
          type="text"
          inputMode="numeric"
          value={value ?? ''}
          onChange={e => {
            const val = e.target.value
            if (val === '' || val === '-') { onChange?.(0); return }
            const num = Number(val)
            if (!isNaN(num)) onChange?.(num)
          }}
          className="flex-1 px-3 py-2 text-sm text-[#0F2348] bg-transparent outline-none w-0 min-w-0"
        />
        {suffix && <span className="text-[#AAB8D4] text-xs pr-3 shrink-0">{suffix}</span>}
      </div>
    </div>
  )
}

function ColorRow({ label, color, onChange, onRemove }) {
  const [open, setOpen] = useState(false)
  const safeColor = color || '#ffffff'
  return (
    <div className="relative">
      <div className="flex items-center justify-between py-2">
        <span className="text-[#5E6F8E] text-xs">{label}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-2 bg-[#F3F6FB] border border-[#E2E8F4] rounded-lg px-2 py-1.5 hover:border-[#2348D7] transition-colors"
          >
            <div className="w-4 h-4 rounded border border-[#D8E1F0] shrink-0" style={{ backgroundColor: safeColor }} />
            <span className="text-xs text-[#0F2348] font-mono">{safeColor.replace('#', '').toUpperCase()}</span>
          </button>
          {onRemove && (
            <button onClick={onRemove} className="text-[#AAB8D4] hover:text-red-400 transition-colors">
              <X size={12} />
            </button>
          )}
        </div>
      </div>
      {open && (
        <div className="absolute right-0 z-[100] bg-white border border-[#D8E1F0] rounded-2xl shadow-2xl p-3 w-[230px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#0F2348] text-xs font-semibold">{label}</span>
            <button onClick={() => setOpen(false)}><X size={13} className="text-[#AAB8D4]" /></button>
          </div>
          <HexColorPicker color={safeColor} onChange={onChange} style={{ width: '100%' }} />
          <div className="mt-3 flex gap-2">
            <div className="flex items-center bg-[#F3F6FB] border border-[#E2E8F4] rounded-xl overflow-hidden flex-1 focus-within:border-[#2348D7]">
              <span className="text-[#AAB8D4] text-xs pl-3">#</span>
              <input
                type="text"
                value={safeColor.replace('#', '').toUpperCase()}
                onChange={e => onChange('#' + e.target.value.replace('#', ''))}
                maxLength={6}
                className="flex-1 px-2 py-2 text-sm text-[#0F2348] bg-transparent outline-none font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Image Upload ───────────────────────────────────────────────────────────────
function ImageUploadSection({ selected, onUpdate }) {
  const fileRef = useRef(null)
  const urlRef  = useRef(null)
  const [dragging, setDragging]   = useState(false)
  const [tab, setTab]             = useState('upload') // 'upload' | 'url'
  const [urlValue, setUrlValue]   = useState(selected.src?.startsWith('http') ? selected.src : '')

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => onUpdate(selected.id, { src: e.target.result })
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const applyUrl = () => {
    if (urlValue.trim()) onUpdate(selected.id, { src: urlValue.trim() })
  }

  return (
    <Section title="Image" defaultOpen>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-3 p-1 bg-[#F3F6FB] rounded-xl">
        {['upload', 'url'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-colors capitalize ${
              tab === t ? 'bg-white text-[#0F2348] shadow-sm' : 'text-[#8A9ABB] hover:text-[#0F2348]'
            }`}
          >{t === 'url' ? 'URL' : 'Upload'}</button>
        ))}
      </div>

      {selected.src ? (
        /* Preview */
        <div className="flex flex-col gap-2">
          <div className="w-full rounded-xl overflow-hidden border border-[#E2E8F4] bg-[#F7F9FD]" style={{ aspectRatio: '16/9' }}>
            <img src={selected.src} alt="preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { onUpdate(selected.id, { src: null }); setUrlValue('') }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#E2E8F4] text-[#5E6F8E] text-xs hover:border-[#2348D7] hover:text-[#2348D7] hover:bg-[#EEF3FF] transition-all"
            >
              <Upload size={11} /> Replace
            </button>
            <button
              onClick={() => { onUpdate(selected.id, { src: null }); setUrlValue('') }}
              className="px-3 py-2 rounded-xl border border-[#FFE4E4] text-red-400 text-xs hover:bg-red-50 transition-all"
            >
              <X size={11} />
            </button>
          </div>
        </div>
      ) : tab === 'upload' ? (
        /* Drop zone */
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all py-7"
          style={{
            borderColor: dragging ? '#2348D7' : '#D8E1F0',
            backgroundColor: dragging ? '#EEF3FF' : '#F7F9FD',
          }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: dragging ? '#DCEAFF' : '#EEF2FA' }}>
            <ImageIcon size={18} className={dragging ? 'text-[#2348D7]' : 'text-[#AAB8D4]'} />
          </div>
          <div className="text-center">
            <p className="text-[#5E6F8E] text-xs font-medium">Drop image here</p>
            <p className="text-[#AAB8D4] text-[10px] mt-0.5">or click to browse</p>
          </div>
          <p className="text-[#C5D0E4] text-[9px]">PNG · JPG · GIF · WebP · SVG</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
        </div>
      ) : (
        /* URL input */
        <div className="flex flex-col gap-2">
          <input
            ref={urlRef}
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlValue}
            onChange={e => setUrlValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyUrl()}
            className="w-full px-3 py-2 text-xs text-[#0F2348] bg-[#F3F6FB] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#2348D7] placeholder-[#C5D0E4] transition-colors"
          />
          <button
            onClick={applyUrl}
            className="w-full py-2 bg-[#2348D7] text-white text-xs font-semibold rounded-xl hover:bg-[#1B3FC8] transition-colors"
          >
            Apply URL
          </button>
        </div>
      )}

      {/* Object fit */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-[#5E6F8E] text-xs">Fit</span>
        <div className="flex gap-1">
          {['cover', 'contain', 'fill'].map(fit => (
            <button
              key={fit}
              onClick={() => onUpdate(selected.id, { objectFit: fit })}
              className={`px-2 py-1 rounded-lg text-[10px] border transition-colors capitalize ${
                (selected.objectFit || 'cover') === fit
                  ? 'bg-[#EEF3FF] border-[#2348D7] text-[#2348D7] font-semibold'
                  : 'border-[#E2E8F4] text-[#5E6F8E] hover:border-[#2348D7]'
              }`}
            >{fit}</button>
          ))}
        </div>
      </div>

      {/* Alt text */}
      <div className="mt-3">
        <p className="text-[#AAB8D4] text-[10px] mb-1">Alt text</p>
        <input
          type="text"
          placeholder="Describe the image…"
          value={selected.alt || ''}
          onChange={e => onUpdate(selected.id, { alt: e.target.value })}
          className="w-full px-3 py-2 text-xs text-[#0F2348] bg-[#F3F6FB] border border-[#E2E8F4] rounded-xl outline-none focus:border-[#2348D7] transition-colors placeholder-[#C5D0E4]"
        />
      </div>
    </Section>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
const TEXT_TYPES = ['heading', 'paragraph', 'text', 'link', 'button', 'label']

export default function RightPanel({ selected, onUpdate, canvasSettings, onCanvasUpdate, onDelete, onDuplicate, onReorder, activeBreakpoint = 'desktop', customWidth = 800 }) {
  const [showBorder, setShowBorder] = useState(!!selected?.borderColor)
  const [showShadow, setShowShadow] = useState(!!selected?.shadowColor)

  const isText  = selected && TEXT_TYPES.includes(selected.type)
  const isImage = selected?.type === 'image'
  const update  = (key, val) => { if (selected) onUpdate(selected.id, { [key]: val }) }
  const breakpoint = BREAKPOINTS.find(bp => bp.id === activeBreakpoint)
  const canvasWidth = getCanvasWidth(activeBreakpoint, canvasSettings, customWidth)

  return (
    <div className="w-[260px] h-full bg-white border-l border-[#D8E1F0] flex flex-col shrink-0 overflow-y-auto">
      {selected ? (
        <>
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#EEF2FA] shrink-0 flex items-center justify-between">
            <div>
              <p className="text-[#8A9ABB] text-[10px] uppercase tracking-widest">Properties</p>
              <p className="text-[#0F2348] text-sm font-semibold mt-0.5 capitalize">{selected.type}</p>
              <p className="text-[#2348D7] text-[10px] font-semibold mt-1">{breakpoint?.label || 'Desktop'} breakpoint</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => onDuplicate(selected.id)} title="Duplicate"
                className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#E2E8F4] text-[#8A9ABB] hover:border-[#2348D7] hover:text-[#2348D7] hover:bg-[#EEF3FF] transition-all text-xs">
                ⧉
              </button>
              <button onClick={() => onDelete(selected.id)} title="Delete"
                className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#E2E8F4] text-[#8A9ABB] hover:border-red-300 hover:text-red-400 hover:bg-red-50 transition-all">
                <X size={11} />
              </button>
            </div>
          </div>

          {/* Image upload (image elements only) */}
          {isImage && <ImageUploadSection selected={selected} onUpdate={onUpdate} />}

          {/* Position */}
          <Section title="Position">
            <div className="grid grid-cols-2 gap-2">
              <NumberInput label="X" value={Math.round(selected.x || 0)} suffix="px" onChange={val => update('x', val)} />
              <NumberInput label="Y" value={Math.round(selected.y || 0)} suffix="px" onChange={val => update('y', val)} />
            </div>
          </Section>

          {/* Size */}
          <Section title="Size">
            <div className="grid grid-cols-2 gap-2">
              <NumberInput label="Width"  value={Math.round(selected.width  || 200)} suffix="px" onChange={val => update('width',  val)} />
              <NumberInput label="Height" value={Math.round(selected.height || 100)} suffix="px" onChange={val => update('height', val)} />
            </div>
          </Section>

          {/* Arrange */}
          <Section title="Arrange">
            <div className="flex items-center gap-1">
              {[
                { fn: 'back-all', icon: SendToBack,  label: 'Back'     },
                { fn: 'back',     icon: ArrowDown,   label: 'Backward' },
                { fn: 'forward',  icon: ArrowUp,     label: 'Forward'  },
                { fn: 'front',    icon: BringToFront, label: 'Front'   },
              ].map(({ fn, icon: Icon, label }) => (
                <button key={fn} onClick={() => onReorder(selected.id, fn)}
                  className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border border-[#E2E8F4] hover:border-[#2348D7] hover:bg-[#EEF3FF] text-[#5E6F8E] hover:text-[#2348D7] transition-all">
                  <Icon size={13} />
                  <span className="text-[9px]">{label}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* Typography */}
          <Section title="Typography">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <NumberInput label="Size"   value={selected.fontSize   || (selected.type === 'heading' ? 32 : 16)} suffix="px" onChange={val => update('fontSize',   val)} />
                <NumberInput label="Line H" value={selected.lineHeight || ''} suffix="x" onChange={val => update('lineHeight', val)} />
              </div>

              {isText && (
                <>
              <p className="text-[#AAB8D4] text-[9px] mb-1.5 font-medium uppercase tracking-wide">Font</p>
              <select value={selected.fontFamily || 'Inter'} onChange={e => update('fontFamily', e.target.value)}
                className="w-full mb-3 bg-[#F3F6FB] border border-[#E2E8F4] rounded-xl px-3 py-2 text-xs text-[#0F2348] outline-none focus:border-[#2348D7]">
                {['Inter','Poppins','Playfair Display','Roboto','Lato','Montserrat','Georgia','Merriweather'].map(f => (
                  <option key={f}>{f}</option>
                ))}
              </select>

              <p className="text-[#AAB8D4] text-[9px] mb-1.5 font-medium uppercase tracking-wide">Weight</p>
              <div className="grid grid-cols-3 gap-1 mb-3">
                {[{ label: 'Regular', val: 400 },{ label: 'Medium', val: 500 },{ label: 'Bold', val: 700 }].map(w => (
                  <button key={w.val} onClick={() => update('fontWeight', w.val)}
                    className={`py-1.5 rounded-lg text-[10px] border transition-colors ${
                      (selected.fontWeight || (selected.type === 'heading' ? 700 : 400)) === w.val
                        ? 'bg-[#EEF3FF] border-[#2348D7] text-[#2348D7] font-semibold'
                        : 'border-[#E2E8F4] text-[#5E6F8E] hover:border-[#2348D7]'
                    }`} style={{ fontWeight: w.val }}>{w.label}</button>
                ))}
              </div>

              <p className="text-[#AAB8D4] text-[9px] mb-1.5 font-medium uppercase tracking-wide">Format</p>
              <div className="flex items-center gap-1 mb-3">
                {[
                  { ch: 'B', title: 'Bold',      active: (selected.fontWeight||400)>=700, click: () => update('fontWeight',(selected.fontWeight||400)>=700?400:700), style:{fontWeight:700} },
                  { ch: 'I', title: 'Italic',    active: !!selected.italic,    click: () => update('italic',   !selected.italic),    style:{fontStyle:'italic'} },
                  { ch: 'U', title: 'Underline', active: !!selected.underline, click: () => update('underline',!selected.underline), style:{textDecoration:'underline'} },
                ].map(b => (
                  <button key={b.ch} onClick={b.click} title={b.title} style={b.style}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border text-xs transition-colors ${b.active?'bg-[#EEF3FF] border-[#2348D7] text-[#2348D7]':'border-[#E2E8F4] text-[#5E6F8E] hover:border-[#2348D7]'}`}>
                    {b.ch}
                  </button>
                ))}
                <div className="w-px h-5 bg-[#E2E8F4] mx-0.5" />
                {[{a:'left',i:'⬤'},{a:'center',i:'⬤'},{a:'right',i:'⬤'}].map(({a,i})=>(
                  <button key={a} onClick={()=>update('textAlign',a)} title={`Align ${a}`}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border text-[9px] transition-colors ${(selected.textAlign||'left')===a?'bg-[#EEF3FF] border-[#2348D7] text-[#2348D7]':'border-[#E2E8F4] text-[#5E6F8E] hover:border-[#2348D7]'}`}>
                    {a==='left'?'◀':a==='center'?'●':'▶'}
                  </button>
                ))}
              </div>
              <ColorRow label="Color" color={selected.textColor||'#111827'} onChange={val=>update('textColor',val)} />
                </>
              )}
            </Section>

          {/* Styles */}
          <Section title="Styles">
            {!isImage && <ColorRow label="Fill" color={selected.fill||'#ffffff'} onChange={val=>update('fill',val)} />}

            {showBorder ? (
              <ColorRow label="Border" color={selected.borderColor||'#e2e8f4'} onChange={val=>update('borderColor',val)}
                onRemove={()=>{setShowBorder(false);update('borderColor',null)}} />
            ) : (
              <div className="flex items-center justify-between py-2">
                <span className="text-[#5E6F8E] text-xs">Border</span>
                <button onClick={()=>{setShowBorder(true);update('borderColor','#e2e8f4')}}
                  className="text-[#AAB8D4] hover:text-[#2348D7] text-xs border border-dashed border-[#D8E1F0] px-3 py-1 rounded-lg transition-colors">+ Add</button>
              </div>
            )}

            {showShadow ? (
              <ColorRow label="Shadow" color={selected.shadowColor||'#00000033'} onChange={val=>update('shadowColor',val)}
                onRemove={()=>{setShowShadow(false);update('shadowColor',null)}} />
            ) : (
              <div className="flex items-center justify-between py-2">
                <span className="text-[#5E6F8E] text-xs">Shadow</span>
                <button onClick={()=>{setShowShadow(true);update('shadowColor','#00000033')}}
                  className="text-[#AAB8D4] hover:text-[#2348D7] text-xs border border-dashed border-[#D8E1F0] px-3 py-1 rounded-lg transition-colors">+ Add</button>
              </div>
            )}

            <div className="flex items-center justify-between py-2 gap-3">
              <span className="text-[#5E6F8E] text-xs shrink-0">Radius</span>
              <div className="w-28"><NumberInput value={selected.radius||0} suffix="px" onChange={val=>update('radius',val)} /></div>
            </div>
            <div className="flex items-center justify-between py-2 gap-3">
              <span className="text-[#5E6F8E] text-xs shrink-0">Opacity</span>
              <div className="w-28"><NumberInput value={selected.opacity??100} suffix="%" onChange={val=>update('opacity',Math.min(100,Math.max(0,val)))} /></div>
            </div>
          </Section>
        </>
      ) : (
        <>
          <div className="px-4 py-3 border-b border-[#EEF2FA] shrink-0">
            <p className="text-[#8A9ABB] text-[10px] uppercase tracking-widest">Properties</p>
            <p className="text-[#0F2348] text-sm font-semibold mt-0.5">Canvas</p>
            <p className="text-[#2348D7] text-[10px] font-semibold mt-1">{breakpoint?.label || 'Desktop'} breakpoint</p>
          </div>
          <Section title="Breakpoint">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <NumberInput label="X" value={canvasSettings.x || 0} suffix="px" onChange={val=>onCanvasUpdate({x:val})} />
                <NumberInput label="Y" value={canvasSettings.y || 0} suffix="px" onChange={val=>onCanvasUpdate({y:val})} />
              </div>
              <div>
                <p className="text-[#5E6F8E] text-xs mb-2">Width</p>
                <NumberInput value={canvasWidth} onChange={val=>activeBreakpoint === 'desktop' && val>0&&onCanvasUpdate({width:val})} />
              </div>
              <div>
                <p className="text-[#5E6F8E] text-xs mb-2">Height</p>
                <NumberInput value={canvasSettings.height} onChange={val=>val>0&&onCanvasUpdate({height:val})} />
              </div>
            </div>
          </Section>
          <Section title="Typography">
            <div className="grid grid-cols-2 gap-2">
              <NumberInput label="Base" value={canvasSettings.fontSize || 16} suffix="px" onChange={val=>onCanvasUpdate({fontSize:val})} />
              <NumberInput label="Line H" value={canvasSettings.lineHeight || ''} suffix="x" onChange={val=>onCanvasUpdate({lineHeight:val})} />
            </div>
          </Section>
          <Section title="Styles">
            <ColorRow label="Fill" color={canvasSettings.fill} onChange={val=>onCanvasUpdate({fill:val})} />
          </Section>
        </>
      )}
    </div>
  )
}

import { useState } from 'react'
import {
  ChevronDown, X,
  BringToFront, SendToBack,
  ArrowUp, ArrowDown,
  Copy, Trash2
} from 'lucide-react'
import { HexColorPicker } from 'react-colorful'

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[#EEF2FA]">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F8FAFF] transition-colors"
      >
        <span className="text-[#0F2348] text-xs font-semibold">{title}</span>
        <ChevronDown
          size={13}
          className={`text-[#AAB8D4] transition-transform ${open ? '' : '-rotate-90'}`}
        />
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
            if (val === '' || val === '-') {
              onChange && onChange(0)
              return
            }
            const num = Number(val)
            if (!isNaN(num)) onChange && onChange(num)
          }}
          className="flex-1 px-3 py-2 text-sm text-[#0F2348] bg-transparent outline-none w-0 min-w-0"
          style={{ MozAppearance: 'textfield' }}
        />
        {suffix && (
          <span className="text-[#AAB8D4] text-xs pr-3 shrink-0">{suffix}</span>
        )}
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
            <div
              className="w-4 h-4 rounded border border-[#D8E1F0] shrink-0"
              style={{ backgroundColor: safeColor }}
            />
            <span className="text-xs text-[#0F2348] font-mono">
              {safeColor.replace('#', '').toUpperCase()}
            </span>
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
            <button onClick={() => setOpen(false)}>
              <X size={13} className="text-[#AAB8D4]" />
            </button>
          </div>

          <HexColorPicker
            color={safeColor}
            onChange={onChange}
            style={{ width: '100%' }}
          />

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
            <div className="flex items-center bg-[#F3F6FB] border border-[#E2E8F4] rounded-xl w-16 focus-within:border-[#2348D7]">
              <input
                type="text"
                defaultValue="100%"
                className="flex-1 px-2 py-2 text-sm text-[#0F2348] bg-transparent outline-none text-center"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const TEXT_TYPES = ['heading', 'paragraph', 'link', 'button']

export default function RightPanel({ selected, onUpdate, canvasSettings, onCanvasUpdate, onDelete, onDuplicate, onReorder }) {
  const [showBorder, setShowBorder] = useState(false)
  const [showShadow, setShowShadow] = useState(false)
  const isText = selected && TEXT_TYPES.includes(selected.type)

  // Helpers to update selected element
  const update = (key, val) => {
    if (!selected) return
    onUpdate(selected.id, { [key]: val })
  }

  return (
    <div className="w-[260px] h-full bg-white border-l border-[#D8E1F0] flex flex-col shrink-0 overflow-y-auto">

      {selected ? (
        <>
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#EEF2FA] shrink-0">
            <p className="text-[#8A9ABB] text-[10px] uppercase tracking-widest">Properties</p>
            <p className="text-[#0F2348] text-sm font-semibold mt-0.5 capitalize">
              {selected.type}
            </p>
          </div>

          {/* Position */}
          <Section title="Position">
            <div className="grid grid-cols-2 gap-2">
              <NumberInput
                label="X"
                value={Math.round(selected.x)}
                suffix="x"
                onChange={val => update('x', val)}
              />
              <NumberInput
                label="Y"
                value={Math.round(selected.y)}
                suffix="y"
                onChange={val => update('y', val)}
              />
            </div>
          </Section>

          {/* Size */}
          <Section title="Size">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[#AAB8D4] text-[10px] mb-1">Width</p>
                <NumberInput
                  value={selected.width || 200}
                  onChange={val => update('width', val)}
                />
              </div>
              <div>
                <p className="text-[#AAB8D4] text-[10px] mb-1">Height</p>
                <NumberInput
                  value={selected.height || 100}
                  onChange={val => update('height', val)}
                />
              </div>
            </div>
          </Section>

          {/* Arrange */}
          <Section title="Arrange">
            <div className="flex items-center gap-1">
              <button
                onClick={() => onReorder(selected.id, 'back-all')}
                title="Send to Back"
                className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border border-[#E2E8F4] hover:border-[#2348D7] hover:bg-[#EEF3FF] text-[#5E6F8E] hover:text-[#2348D7] transition-all"
              >
                <SendToBack size={13} />
                <span className="text-[9px]">Back</span>
              </button>

              <button
                onClick={() => onReorder(selected.id, 'back')}
                title="Send Backward"
                className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border border-[#E2E8F4] hover:border-[#2348D7] hover:bg-[#EEF3FF] text-[#5E6F8E] hover:text-[#2348D7] transition-all"
              >
                <ArrowDown size={13} />
                <span className="text-[9px]">Backward</span>
              </button>

              <button
                onClick={() => onReorder(selected.id, 'forward')}
                title="Bring Forward"
                className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border border-[#E2E8F4] hover:border-[#2348D7] hover:bg-[#EEF3FF] text-[#5E6F8E] hover:text-[#2348D7] transition-all"
              >
                <ArrowUp size={13} />
                <span className="text-[9px]">Forward</span>
              </button>

              <button
                onClick={() => onReorder(selected.id, 'front')}
                title="Bring to Front"
                className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border border-[#E2E8F4] hover:border-[#2348D7] hover:bg-[#EEF3FF] text-[#5E6F8E] hover:text-[#2348D7] transition-all"
              >
                <BringToFront size={13} />
                <span className="text-[9px]">Front</span>
              </button>
            </div>
          </Section>

          {/* Typography */}
          {isText && (
            <Section title="Typography">
              {/* font size + line height */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <NumberInput
                  label="Size"
                  value={selected.fontSize || (selected.type === 'heading' ? 32 : 16)}
                  suffix="px"
                  onChange={val => update('fontSize', val)}
                />
                <NumberInput
                  label="Line H"
                  value={selected.lineHeight || ''}
                  suffix="x"
                  onChange={val => update('lineHeight', val)}
                />
              </div>

              {/* font weight */}
              <p className="text-[#AAB8D4] text-[9px] mb-1.5 font-medium uppercase tracking-wide">
                Weight
              </p>
              <div className="grid grid-cols-3 gap-1 mb-3">
                {[
                  { label: 'Regular', val: 400 },
                  { label: 'Medium',  val: 500 },
                  { label: 'Bold',    val: 700 },
                ].map(w => (
                  <button
                    key={w.val}
                    onClick={() => update('fontWeight', w.val)}
                    className={`py-1.5 rounded-lg text-[10px] border transition-colors ${
                      (selected.fontWeight || (selected.type === 'heading' ? 700 : 400)) === w.val
                        ? 'bg-[#EEF3FF] border-[#2348D7] text-[#2348D7] font-semibold'
                        : 'border-[#E2E8F4] text-[#5E6F8E] hover:border-[#2348D7]'
                    }`}
                    style={{ fontWeight: w.val }}
                  >
                    {w.label}
                  </button>
                ))}
              </div>

              {/* format toggles */}
              <p className="text-[#AAB8D4] text-[9px] mb-1.5 font-medium uppercase tracking-wide">
                Format
              </p>
              <div className="flex items-center gap-1 mb-3">
                {/* Bold */}
                <button
                  onClick={() => update('fontWeight', (selected.fontWeight || 400) >= 700 ? 400 : 700)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border text-xs font-bold transition-colors ${
                    (selected.fontWeight || 400) >= 700
                      ? 'bg-[#EEF3FF] border-[#2348D7] text-[#2348D7]'
                      : 'border-[#E2E8F4] text-[#5E6F8E] hover:border-[#2348D7]'
                  }`}
                >
                  B
                </button>

                {/* Italic */}
                <button
                  onClick={() => update('italic', !selected.italic)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors italic ${
                    selected.italic
                      ? 'bg-[#EEF3FF] border-[#2348D7] text-[#2348D7]'
                      : 'border-[#E2E8F4] text-[#5E6F8E] hover:border-[#2348D7]'
                  }`}
                >
                  I
                </button>

                {/* Underline */}
                <button
                  onClick={() => update('underline', !selected.underline)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors underline ${
                    selected.underline
                      ? 'bg-[#EEF3FF] border-[#2348D7] text-[#2348D7]'
                      : 'border-[#E2E8F4] text-[#5E6F8E] hover:border-[#2348D7]'
                  }`}
                >
                  U
                </button>

                <div className="w-px h-5 bg-[#E2E8F4] mx-1" />

                {/* Align Left */}
                <button
                  onClick={() => update('textAlign', 'left')}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border text-xs transition-colors ${
                    (selected.textAlign || 'left') === 'left'
                      ? 'bg-[#EEF3FF] border-[#2348D7] text-[#2348D7]'
                      : 'border-[#E2E8F4] text-[#5E6F8E] hover:border-[#2348D7]'
                  }`}
                >
                  ≡
                </button>

                {/* Align Center */}
                <button
                  onClick={() => update('textAlign', 'center')}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border text-xs transition-colors ${
                    selected.textAlign === 'center'
                      ? 'bg-[#EEF3FF] border-[#2348D7] text-[#2348D7]'
                      : 'border-[#E2E8F4] text-[#5E6F8E] hover:border-[#2348D7]'
                  }`}
                >
                  ≡
                </button>

                {/* Align Right */}
                <button
                  onClick={() => update('textAlign', 'right')}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border text-xs transition-colors ${
                    selected.textAlign === 'right'
                      ? 'bg-[#EEF3FF] border-[#2348D7] text-[#2348D7]'
                      : 'border-[#E2E8F4] text-[#5E6F8E] hover:border-[#2348D7]'
                  }`}
                >
                  ≡
                </button>
              </div>

              {/* text color */}
              <ColorRow
                label="Color"
                color={selected.textColor || '#111827'}
                onChange={val => update('textColor', val)}
              />
            </Section>
          )}

          {/* Styles */}
          <Section title="Styles">
            <ColorRow
              label="Fill"
              color={selected.fill || '#ffffff'}
              onChange={val => update('fill', val)}
            />

            {showBorder ? (
              <ColorRow
                label="Border"
                color={selected.borderColor || '#e2e8f4'}
                onChange={val => update('borderColor', val)}
                onRemove={() => { setShowBorder(false); update('borderColor', null) }}
              />
            ) : (
              <div className="flex items-center justify-between py-2">
                <span className="text-[#5E6F8E] text-xs">Border</span>
                <button
                  onClick={() => { setShowBorder(true); update('borderColor', '#e2e8f4') }}
                  className="text-[#AAB8D4] hover:text-[#2348D7] text-xs border border-dashed border-[#D8E1F0] px-3 py-1 rounded-lg transition-colors"
                >
                  + Add
                </button>
              </div>
            )}

            {showShadow ? (
              <ColorRow
                label="Shadow"
                color={selected.shadowColor || '#00000033'}
                onChange={val => update('shadowColor', val)}
                onRemove={() => { setShowShadow(false); update('shadowColor', null) }}
              />
            ) : (
              <div className="flex items-center justify-between py-2">
                <span className="text-[#5E6F8E] text-xs">Shadow</span>
                <button
                  onClick={() => { setShowShadow(true); update('shadowColor', '#00000033') }}
                  className="text-[#AAB8D4] hover:text-[#2348D7] text-xs border border-dashed border-[#D8E1F0] px-3 py-1 rounded-lg transition-colors"
                >
                  + Add
                </button>
              </div>
            )}

            <div className="flex items-center justify-between py-2 gap-3">
              <span className="text-[#5E6F8E] text-xs shrink-0">Radius</span>
              <div className="w-28">
                <NumberInput
                  value={selected.radius || 0}
                  suffix="px"
                  onChange={val => update('radius', val)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2 gap-3">
              <span className="text-[#5E6F8E] text-xs shrink-0">Opacity</span>
              <div className="w-28">
                <NumberInput
                  value={selected.opacity ?? 100}
                  suffix="%"
                  onChange={val => update('opacity', Math.min(100, Math.max(0, val)))}
                />
              </div>
            </div>
          </Section>
        </>
      ) : (
        <>
          {/* No element selected — canvas settings */}
          <div className="px-4 py-3 border-b border-[#EEF2FA] shrink-0">
            <p className="text-[#8A9ABB] text-[10px] uppercase tracking-widest">Properties</p>
            <p className="text-[#0F2348] text-sm font-semibold mt-0.5">Canvas</p>
          </div>

          <Section title="Breakpoint">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[#5E6F8E] text-xs mb-2">Position</p>
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    value={canvasSettings.x}
                    suffix="x"
                    onChange={val => onCanvasUpdate({ x: val })}
                  />
                  <NumberInput
                    value={canvasSettings.y}
                    suffix="y"
                    onChange={val => onCanvasUpdate({ y: val })}
                  />
                </div>
              </div>

              <div>
                <p className="text-[#5E6F8E] text-xs mb-2">Width</p>
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    value={canvasSettings.width}
                    onChange={val => val > 0 && onCanvasUpdate({ width: val })}
                  />
                  <select
                    className="bg-[#F3F6FB] border border-[#E2E8F4] rounded-xl px-3 py-2 text-sm text-[#5E6F8E] outline-none"
                    onChange={e => onCanvasUpdate({ widthMode: e.target.value })}
                  >
                    <option>Fixed</option>
                    <option>Fill</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="text-[#5E6F8E] text-xs mb-2">Height</p>
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    value={canvasSettings.height}
                    onChange={val => val > 0 && onCanvasUpdate({ height: val })}
                  />
                  <select
                    className="bg-[#F3F6FB] border border-[#E2E8F4] rounded-xl px-3 py-2 text-sm text-[#5E6F8E] outline-none"
                    onChange={e => onCanvasUpdate({ heightMode: e.target.value })}
                  >
                    <option>Fixed</option>
                    <option>Fill</option>
                  </select>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Styles">
            <ColorRow
              label="Fill"
              color={canvasSettings.fill}
              onChange={val => onCanvasUpdate({ fill: val })}
            />
          </Section>
        </>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Home, Search, MoreHorizontal } from 'lucide-react'

const LAYER_ICONS = {
  heading:   'T',
  paragraph: 'T',
  text:      'T',
  link:      '↗',
  button:    '⬭',
  container: '◻',
  section:   '▬',
  divider:   '—',
  image:     '🖼',
  video:     '▶',
  input:     '▭',
  checkbox:  '☑',
}

function PageRow({ page, isActive, onSelect, onRename, onDelete, canDelete }) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={onSelect}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs w-full text-left transition-colors group mb-0.5 ${
          isActive
            ? 'bg-[#EEF3FF] text-[#2348D7] font-semibold'
            : 'text-[#243754] hover:bg-[#F3F7FF]'
        }`}
      >
        <Home size={12} className="shrink-0" />
        <span className="flex-1 truncate">{page.name}</span>

        {/* Three dot menu */}
        <span
          onClick={e => { e.stopPropagation(); setShowMenu(v => !v) }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-[#D8E8FF]"
        >
          <MoreHorizontal size={11} />
        </span>
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <div className="absolute left-full top-0 ml-1 z-50 bg-white border border-[#D8E1F0] rounded-xl shadow-lg overflow-hidden w-36">
          <button
            onClick={() => { onRename(); setShowMenu(false) }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#243754] hover:bg-[#F3F7FF] transition-colors"
          >
            Rename
          </button>
          {canDelete && (
            <button
              onClick={() => { onDelete(); setShowMenu(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function LayerRow({ element, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const icon = LAYER_ICONS[element.type] || '?'

  // Build a readable label
  const label = element.content
    ? element.content.slice(0, 18)
    : element.type.charAt(0).toUpperCase() + element.type.slice(1)

  return (
    <button
      onClick={() => onSelect(element.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 8px',
        borderRadius: 8,
        border: 'none',
        backgroundColor: isSelected
          ? '#EEF3FF'
          : hovered ? '#F7F9FD' : 'transparent',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        transition: 'background 0.1s',
      }}
    >
      {/* Type icon */}
      <div style={{
        width: 22, height: 22,
        borderRadius: 5,
        backgroundColor: isSelected ? '#DCEAFF' : '#F0F3FB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11,
        flexShrink: 0,
      }}>
        {icon}
      </div>

      {/* Label */}
      <span style={{
        flex: 1,
        fontSize: 12,
        fontWeight: isSelected ? 600 : 400,
        color: isSelected ? '#2348D7' : '#243754',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>

      {/* Eye icon on hover */}
      {hovered && (
        <span style={{ fontSize: 11, color: '#AAB8D4' }}>👁</span>
      )}
    </button>
  )
}

export default function LeftPanel({
  elements = [], selectedId, onSelect,
  activeTab, onTabChange,
  pages, activePageId,
  onSwitchPage, onAddPage, onRenamePage, onDeletePage
}) {
  const tabs = ['Pages', 'Layers', 'Assets']

  return (
    <div className="w-[260px] h-full bg-white border-r border-[#D8E1F0] flex flex-col shrink-0">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[#E4EBF6]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
              activeTab === tab
                ? 'bg-[#EEF3FF] text-[#2348D7] font-semibold'
                : 'text-[#6F7E99] hover:text-[#2348D7] hover:bg-[#F3F7FF]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-3 py-3 border-b border-[#E4EBF6]">
        <div className="flex items-center gap-2 bg-[#F7F9FD] border border-[#DFE6F2] rounded-xl px-3 py-2">
          <Search size={13} className="text-[#94A3BD]" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-[#21395F] placeholder-[#94A3BD] outline-none w-full"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'Pages' && (
          <div className="p-2">
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-1.5 mb-1">
              <span className="text-[#6F7E99] text-[10px] font-semibold uppercase tracking-widest">
                Pages
              </span>
              <button
                onClick={onAddPage}
                className="text-[#94A3BD] hover:text-[#2348D7] hover:bg-[#EEF3FF] rounded-lg p-1 transition-colors"
                title="Add page"
              >
                +
              </button>
            </div>

            {/* Page list */}
            {pages.map(page => (
              <PageRow
                key={page.id}
                page={page}
                isActive={activePageId === page.id}
                onSelect={() => onSwitchPage(page.id)}
                onRename={() => onRenamePage(page.id)}
                onDelete={() => onDeletePage(page.id)}
                canDelete={pages.length > 1}
              />
            ))}
          </div>
        )}
        {activeTab === 'Layers' && (
          <div className="flex flex-col gap-0.5 p-2">
            {elements.length === 0 ? (
              <p className="text-[#C5D0E4] text-xs px-2 py-4 text-center">
                No layers yet
              </p>
            ) : (
              [...elements].reverse().map(el => (
                <LayerRow
                  key={el.id}
                  element={el}
                  isSelected={selectedId === el.id}
                  onSelect={onSelect}
                />
              ))
            )}
          </div>
        )}
        {activeTab === 'Assets' && (
          <p className="text-[#94A3BD] text-sm px-2">No assets yet</p>
        )}
      </div>
    </div>
  )
}

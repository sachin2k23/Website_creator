import { useState } from 'react'
import { Home, Search, Plus, ChevronRight, ChevronDown, MoreHorizontal, Eye, EyeOff } from 'lucide-react'

// ── Layer type icons ──────────────────────────────────────────────────────────

const TYPE_META = {
  heading:   { icon: 'T',   color: '#8B6CF7', bg: '#F0EBFF' },
  paragraph: { icon: 'T',   color: '#8B6CF7', bg: '#F0EBFF' },
  text:      { icon: 'T',   color: '#8B6CF7', bg: '#F0EBFF' },
  link:      { icon: '↗',   color: '#3B82F6', bg: '#EFF6FF' },
  button:    { icon: '▭',   color: '#3B82F6', bg: '#EFF6FF' },
  container: { icon: null,  color: '#3B82F6', bg: '#EFF6FF', isFrame: true },
  section:   { icon: null,  color: '#3B82F6', bg: '#EFF6FF', isFrame: true },
  frame:     { icon: null,  color: '#3B82F6', bg: '#EFF6FF', isFrame: true },
  divider:   { icon: '—',   color: '#94A3B8', bg: '#F1F5F9' },
  image:     { icon: null,  color: '#10B981', bg: '#ECFDF5', isImage: true },
  video:     { icon: '▶',   color: '#F59E0B', bg: '#FFFBEB' },
  input:     { icon: '▭',   color: '#6366F1', bg: '#EEF2FF' },
  checkbox:  { icon: '☑',   color: '#6366F1', bg: '#EEF2FF' },
}

// ── Frame SVG icon (like Framer's stacked squares) ───────────────────────────
function FrameIcon({ color = '#3B82F6', size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <rect x="0.5" y="0.5" width="11" height="11" rx="1.5" stroke={color} strokeWidth="1.2" fill="none"/>
      <rect x="2.5" y="2.5" width="7" height="7" rx="0.8" fill={color} opacity="0.25"/>
    </svg>
  )
}

// ── Image SVG icon ────────────────────────────────────────────────────────────
function ImageIcon({ color = '#10B981', size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <rect x="0.5" y="0.5" width="11" height="11" rx="1.5" stroke={color} strokeWidth="1.2" fill="none"/>
      <circle cx="4" cy="4" r="1.2" fill={color} opacity="0.6"/>
      <path d="M1 9l3-3 2 2 2-3 3 4" stroke={color} strokeWidth="1" strokeLinejoin="round" fill="none" opacity="0.8"/>
    </svg>
  )
}

// ── Single layer row (recursive) ──────────────────────────────────────────────
function LayerRow({ node, depth = 0, selectedId, onSelect, hiddenIds, onToggleHide }) {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0
  const [collapsed, setCollapsed] = useState(false)
  const [hovered, setHovered]     = useState(false)

  const isSelected = selectedId === node.id
  const isHidden   = hiddenIds?.has(node.id)

  const meta  = TYPE_META[node.type] || { icon: '?', color: '#6B7280', bg: '#F3F4F6' }
  const label = node.name || node.content?.slice(0, 22) || node.type

  const indent = depth * 16 // px per level

  return (
    <>
      <div
        className="relative group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          onClick={() => onSelect(node.id)}
          className="flex items-center w-full text-left rounded-md transition-all duration-100"
          style={{
            paddingLeft: 6 + indent,
            paddingRight: 6,
            paddingTop: 4,
            paddingBottom: 4,
            backgroundColor: isSelected
              ? '#EEF3FF'
              : hovered ? '#F5F7FC' : 'transparent',
          }}
        >
          {/* Collapse toggle */}
          <span
            className="shrink-0 mr-0.5 rounded hover:bg-[#DDE6F7] transition-colors"
            style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={e => { e.stopPropagation(); if (hasChildren) setCollapsed(v => !v) }}
          >
            {hasChildren ? (
              collapsed
                ? <ChevronRight size={10} className="text-[#94A3B8]" />
                : <ChevronDown  size={10} className="text-[#94A3B8]" />
            ) : null}
          </span>

          {/* Type icon badge */}
          <span
            className="shrink-0 mr-1.5 flex items-center justify-center rounded"
            style={{
              width: 18, height: 18,
              backgroundColor: meta.bg,
              fontSize: 10,
              color: meta.color,
              fontWeight: 700,
            }}
          >
            {meta.isFrame
              ? <FrameIcon color={meta.color} size={10} />
              : meta.isImage
                ? <ImageIcon color={meta.color} size={10} />
                : meta.icon}
          </span>

          {/* Label */}
          <span
            className="flex-1 truncate text-[12px] leading-none"
            style={{
              color: isSelected ? '#2348D7' : isHidden ? '#B0BDD0' : '#1E2D45',
              fontWeight: isSelected ? 600 : 400,
              textDecoration: isHidden ? 'line-through' : 'none',
            }}
          >
            {label}
          </span>

          {/* Hover actions */}
          {hovered && (
            <span className="flex items-center gap-0.5 ml-1 shrink-0">
              <span
                className="p-0.5 rounded hover:bg-[#DDE6F7] text-[#94A3B8] hover:text-[#2348D7] transition-colors"
                onClick={e => { e.stopPropagation(); onToggleHide?.(node.id) }}
                title={isHidden ? 'Show' : 'Hide'}
              >
                {isHidden ? <EyeOff size={10} /> : <Eye size={10} />}
              </span>
            </span>
          )}
        </button>

        {/* Left border accent for selected */}
        {isSelected && (
          <span
            className="absolute left-0 top-1 bottom-1 w-[2.5px] rounded-full bg-[#2348D7]"
          />
        )}
      </div>

      {/* Recursive children */}
      {hasChildren && !collapsed && (
        <div>
          {node.children.map(child => (
            <LayerRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              hiddenIds={hiddenIds}
              onToggleHide={onToggleHide}
            />
          ))}
        </div>
      )}
    </>
  )
}

// ── Page row ──────────────────────────────────────────────────────────────────
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
        <span
          onClick={e => { e.stopPropagation(); setShowMenu(v => !v) }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-[#D8E8FF]"
        >
          <MoreHorizontal size={11} />
        </span>
      </button>

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

// ── Main LeftPanel ────────────────────────────────────────────────────────────
export default function LeftPanel({
  elements = [],
  selectedId,
  onSelect,
  activeTab,
  onTabChange,
  pages,
  activePageId,
  onSwitchPage,
  onAddPage,
  onRenamePage,
  onDeletePage,
}) {
  const tabs = ['Pages', 'Layers', 'Assets']
  const [search, setSearch]     = useState('')
  const [hiddenIds, setHiddenIds] = useState(new Set())

  const toggleHide = (id) => {
    setHiddenIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Flatten tree for search filtering
  function flattenTree(nodes, result = []) {
    for (const n of nodes) {
      result.push(n)
      if (n.children?.length) flattenTree(n.children, result)
    }
    return result
  }

  const allNodes      = flattenTree(elements)
  const searchTrimmed = search.trim().toLowerCase()
  const filtered      = searchTrimmed
    ? allNodes.filter(n =>
        (n.name || n.type || '').toLowerCase().includes(searchTrimmed) ||
        (n.content || '').toLowerCase().includes(searchTrimmed)
      )
    : null // null = show full tree

  // Reversed for display (top of canvas = top of list)
  const rootNodes = [...elements].reverse()

  return (
    <div className="w-[260px] h-full bg-white border-r border-[#D8E1F0] flex flex-col shrink-0 select-none">

      {/* ── Tabs ── */}
      <div className="flex items-center gap-0.5 px-2 py-2 border-b border-[#E4EBF6]">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 py-1.5 rounded-xl text-[12px] font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[#EEF3FF] text-[#2348D7] font-semibold'
                : 'text-[#6F7E99] hover:text-[#2348D7] hover:bg-[#F3F7FF]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Search bar ── */}
      <div className="px-3 py-2 border-b border-[#E4EBF6]">
        <div className="flex items-center gap-2 bg-[#F7F9FD] border border-[#DFE6F2] rounded-lg px-2.5 py-1.5">
          <Search size={12} className="text-[#94A3BD] shrink-0" />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-[12px] text-[#21395F] placeholder-[#94A3BD] outline-none w-full"
          />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Pages tab ── */}
        {activeTab === 'Pages' && (
          <div className="p-2">
            <div className="flex items-center justify-between px-2 py-1.5 mb-1">
              <span className="text-[#94A3BD] text-[10px] font-semibold uppercase tracking-widest">
                Pages
              </span>
              <button
                onClick={onAddPage}
                className="text-[#94A3BD] hover:text-[#2348D7] hover:bg-[#EEF3FF] rounded-lg p-0.5 transition-colors"
                title="Add page"
              >
                <Plus size={13} />
              </button>
            </div>
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

        {/* ── Layers tab ── */}
        {activeTab === 'Layers' && (
          <div className="py-1.5 px-2">
            {elements.length === 0 ? (
              <p className="text-[#C5D0E4] text-xs text-center py-8">
                No layers yet
              </p>
            ) : filtered ? (
              /* Search results — flat list */
              filtered.length === 0 ? (
                <p className="text-[#C5D0E4] text-xs text-center py-8">No results</p>
              ) : (
                filtered.map(node => (
                  <LayerRow
                    key={node.id}
                    node={{ ...node, children: [] }} // flatten for search view
                    depth={0}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    hiddenIds={hiddenIds}
                    onToggleHide={toggleHide}
                  />
                ))
              )
            ) : (
              /* Full hierarchical tree */
              rootNodes.map(node => (
                <LayerRow
                  key={node.id}
                  node={node}
                  depth={0}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  hiddenIds={hiddenIds}
                  onToggleHide={toggleHide}
                />
              ))
            )}
          </div>
        )}

        {/* ── Assets tab ── */}
        {activeTab === 'Assets' && (
          <p className="text-[#94A3BD] text-xs text-center py-8">No assets yet</p>
        )}
      </div>
    </div>
  )
}
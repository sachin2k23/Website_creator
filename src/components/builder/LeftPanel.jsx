import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Home,
  MoreHorizontal,
  Plus,
  Search,
} from 'lucide-react'

const GROUP_BG = '#EAF6FF'

const TYPE_META = {
  desktop:   { label: 'Desktop',   icon: DesktopIcon,   color: '#2563EB', bg: '#EFF6FF' },
  content:   { label: 'Content',   icon: StackIcon,     color: '#0284C7', bg: GROUP_BG },
  section:   { label: 'Section',   icon: SectionIcon,   color: '#2563EB', bg: '#EFF6FF' },
  container: { label: 'Container', icon: FrameIcon,     color: '#2563EB', bg: '#EFF6FF' },
  frame:     { label: 'Frame',     icon: FrameIcon,     color: '#2563EB', bg: '#EFF6FF' },
  heading:   { label: 'Heading',   icon: TypeIcon,      color: '#7C3AED', bg: '#F3E8FF' },
  paragraph: { label: 'Text',      icon: TypeIcon,      color: '#7C3AED', bg: '#F3E8FF' },
  text:      { label: 'Text',      icon: TypeIcon,      color: '#7C3AED', bg: '#F3E8FF' },
  link:      { label: 'Link',      icon: LinkIcon,      color: '#2563EB', bg: '#EFF6FF' },
  button:    { label: 'Button',    icon: ButtonIcon,    color: '#2563EB', bg: '#EFF6FF' },
  image:     { label: 'Image',     icon: ImageIcon,     color: '#059669', bg: '#ECFDF5' },
  video:     { label: 'Video',     icon: VideoIcon,     color: '#D97706', bg: '#FFFBEB' },
  divider:   { label: 'Divider',   icon: DividerIcon,   color: '#64748B', bg: '#F1F5F9' },
  input:     { label: 'Input',     icon: InputIcon,     color: '#4F46E5', bg: '#EEF2FF' },
  checkbox:  { label: 'Checkbox',  icon: CheckboxIcon,  color: '#4F46E5', bg: '#EEF2FF' },
}

function LayerRow({ node, depth = 0, selectedId, onSelect, hiddenIds, onToggleHide }) {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0
  const defaultCollapsed = depth > 2 && node.type !== 'desktop' && node.type !== 'content'
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [hovered, setHovered] = useState(false)
  const rowRef = useRef(null)

  const isVirtual = node.virtual
  const isSelected = !isVirtual && selectedId === node.id
  const hasSelectedChild = hasChildren && containsNode(node.children, selectedId)
  const isExpanded = !collapsed || hasSelectedChild
  const isHidden = hiddenIds?.has(node.id)
  const meta = TYPE_META[node.type] || { label: node.type || 'Layer', icon: UnknownIcon, color: '#64748B', bg: '#F1F5F9' }
  const Icon = meta.icon
  const label = getLayerLabel(node, meta)
  const indent = 8 + depth * 16

  useEffect(() => {
    if (isSelected && rowRef.current) {
      rowRef.current.scrollIntoView({ block: 'nearest' })
    }
  }, [isSelected])

  return (
    <>
      <div
        ref={rowRef}
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          type="button"
          onClick={() => {
            if (isVirtual) {
              if (hasChildren) setCollapsed(value => !value)
              return
            }
            onSelect(node.id)
          }}
          className="group flex h-8 w-full items-center rounded-lg text-left transition-colors"
          style={{
            paddingLeft: indent,
            paddingRight: 8,
            backgroundColor: isSelected ? '#0EA5E9' : hovered ? '#F1F7FF' : 'transparent',
            color: isSelected ? '#FFFFFF' : '#26364D',
          }}
        >
          <span
            className="mr-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors"
            onClick={event => {
              event.stopPropagation()
              if (hasChildren) setCollapsed(value => !value)
            }}
          >
            {hasChildren ? (
              isExpanded
                ? <ChevronDown size={13} className={isSelected ? 'text-white' : 'text-[#7B8AA5]'} />
                : <ChevronRight size={13} className={isSelected ? 'text-white' : 'text-[#7B8AA5]'} />
            ) : (
              <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />
            )}
          </span>

          <span
            className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
            style={{
              backgroundColor: isSelected ? 'rgba(255,255,255,0.18)' : meta.bg,
              color: isSelected ? '#FFFFFF' : meta.color,
            }}
          >
            <Icon size={12} />
          </span>

          <span
            className="min-w-0 flex-1 truncate text-[12px]"
            style={{
              fontWeight: isSelected || isVirtual ? 650 : 500,
              color: isSelected ? '#FFFFFF' : isHidden ? '#A8B4C7' : isVirtual ? '#42526D' : '#1D2B44',
              textDecoration: isHidden ? 'line-through' : 'none',
            }}
          >
            {label}
          </span>

          {node.badge && (
            <span className={`ml-2 shrink-0 text-[10px] ${isSelected ? 'text-sky-100' : 'text-[#97A6BD]'}`}>
              {node.badge}
            </span>
          )}

          {!isVirtual && (hovered || isHidden) && (
            <span
              className={`ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                isSelected ? 'hover:bg-white/15' : 'hover:bg-[#DBEAFE]'
              }`}
              onClick={event => {
                event.stopPropagation()
                onToggleHide?.(node.id)
              }}
              title={isHidden ? 'Show' : 'Hide'}
            >
              {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
            </span>
          )}
        </button>

        {isSelected && (
          <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-[#0B74DE]" />
        )}
      </div>

      {hasChildren && isExpanded && node.children.map(child => (
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
    </>
  )
}

function PageRow({ page, isActive, onSelect, onRename, onDelete, canDelete }) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onSelect}
        className={`mb-1 flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-xs transition-colors ${
          isActive ? 'bg-[#EEF6FF] text-[#0B74DE] font-semibold' : 'text-[#30425F] hover:bg-[#F4F8FD]'
        }`}
      >
        <Home size={13} className="shrink-0" />
        <span className="flex-1 truncate">{page.name}</span>
        <span
          onClick={event => { event.stopPropagation(); setShowMenu(value => !value) }}
          className="rounded p-0.5 opacity-0 transition-opacity hover:bg-[#DBEAFE] group-hover:opacity-100"
        >
          <MoreHorizontal size={12} />
        </span>
      </button>

      {showMenu && (
        <div className="absolute left-full top-0 z-50 ml-1 w-36 overflow-hidden rounded-xl border border-[#D8E1F0] bg-white shadow-lg">
          <button
            type="button"
            onClick={() => { onRename(); setShowMenu(false) }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#243754] transition-colors hover:bg-[#F3F7FF]"
          >
            Rename
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={() => { onDelete(); setShowMenu(false) }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500 transition-colors hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

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
  const tabs = ['Pages', 'Layers']
  const [search, setSearch] = useState('')
  const [hiddenIds, setHiddenIds] = useState(new Set())

  const layerTree = useMemo(() => buildLayerTree(elements), [elements])
  const flatLayers = useMemo(() => flattenTree(layerTree).filter(node => !node.virtual), [layerTree])
  const searchTrimmed = search.trim().toLowerCase()
  const filtered = searchTrimmed
    ? flatLayers.filter(node =>
        getLayerLabel(node, TYPE_META[node.type]).toLowerCase().includes(searchTrimmed) ||
        (node.content || '').toLowerCase().includes(searchTrimmed) ||
        (node.type || '').toLowerCase().includes(searchTrimmed)
      )
    : null

  const toggleHide = id => {
    setHiddenIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="flex h-full w-[292px] shrink-0 select-none flex-col border-r border-[#D8E1F0] bg-white">
      <div className="border-b border-[#E4EBF6] px-3 py-2">
        <div className="flex rounded-xl bg-[#F2F5FA] p-1">
          {tabs.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`h-8 flex-1 rounded-lg text-[12px] font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-white text-[#0B74DE] shadow-sm'
                  : 'text-[#75849A] hover:text-[#30425F]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-[#E4EBF6] px-3 py-2">
        <div className="flex h-9 items-center gap-2 rounded-lg border border-[#DFE6F2] bg-[#F7F9FD] px-2.5">
          <Search size={13} className="shrink-0 text-[#94A3BD]" />
          <input
            type="text"
            placeholder="Search layers..."
            value={search}
            onChange={event => setSearch(event.target.value)}
            className="w-full bg-transparent text-[12px] text-[#21395F] outline-none placeholder:text-[#94A3BD]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {activeTab === 'Pages' && (
          <div>
            <div className="mb-1 flex items-center justify-between px-2 py-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3BD]">Pages</span>
              <button
                type="button"
                onClick={onAddPage}
                className="rounded-lg p-1 text-[#94A3BD] transition-colors hover:bg-[#EEF6FF] hover:text-[#0B74DE]"
                title="Add page"
              >
                <Plus size={14} />
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

        {activeTab === 'Layers' && (
          <div>
            {elements.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#C5D0E4]">No layers yet</p>
            ) : filtered ? (
              filtered.length === 0 ? (
                <p className="py-8 text-center text-xs text-[#C5D0E4]">No results</p>
              ) : filtered.map(node => (
                <LayerRow
                  key={node.id}
                  node={{ ...node, children: [] }}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  hiddenIds={hiddenIds}
                  onToggleHide={toggleHide}
                />
              ))
            ) : (
              layerTree.map(node => (
                <LayerRow
                  key={node.id}
                  node={node}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  hiddenIds={hiddenIds}
                  onToggleHide={toggleHide}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function buildLayerTree(elements) {
  const displayRoots = inferContainerHierarchy(elements)
  const count = flattenTree(displayRoots).filter(node => !node.virtual).length

  return [{
    id: '__desktop-root',
    type: 'desktop',
    virtual: true,
    badge: `${count}`,
    children: [{
      id: '__content-root',
      type: 'content',
      virtual: true,
      badge: `${displayRoots.length}`,
      children: displayRoots,
    }],
  }]
}

function inferContainerHierarchy(elements) {
  const nodes = elements.map(element => ({
    ...element,
    children: Array.isArray(element.children) ? element.children.map(child => ({ ...child })) : [],
  }))
  const byId = new Map(nodes.map(node => [node.id, node]))
  const assigned = new Set()

  nodes.forEach(child => {
    if (assigned.has(child.id)) return
    if (child.children?.length) {
      child.children.forEach(grandchild => assigned.add(grandchild.id))
    }

    const parent = findBestVisualParent(child, nodes)
    if (!parent) return

    parent.children = [...(parent.children || []), child]
    assigned.add(child.id)
  })

  return nodes
    .filter(node => !assigned.has(node.id) && byId.has(node.id))
    .sort(compareLayers)
    .map(sortChildren)
}

function findBestVisualParent(child, candidates) {
  const childBox = getBox(child)
  if (!childBox) return null

  return candidates
    .filter(candidate =>
      candidate.id !== child.id &&
      isContainerType(candidate.type) &&
      !isContainedBy(child, candidate) &&
      containsBox(getBox(candidate), childBox)
    )
    .sort((a, b) => area(getBox(a)) - area(getBox(b)))[0] || null
}

function isContainedBy(child, candidate) {
  return candidate.children?.some(node => node.id === child.id)
}

function containsBox(parent, child) {
  if (!parent || !child) return false
  if (area(parent) <= area(child)) return false

  const tolerance = 2
  return (
    child.x >= parent.x - tolerance &&
    child.y >= parent.y - tolerance &&
    child.x + child.width <= parent.x + parent.width + tolerance &&
    child.y + child.height <= parent.y + parent.height + tolerance
  )
}

function getBox(node) {
  return {
    x: node.x ?? 0,
    y: node.y ?? 0,
    width: node.width ?? 0,
    height: node.height ?? 0,
  }
}

function area(box) {
  return Math.max(0, box?.width || 0) * Math.max(0, box?.height || 0)
}

function isContainerType(type) {
  return type === 'container' || type === 'section' || type === 'frame'
}

function compareLayers(a, b) {
  const ay = a.y ?? 0
  const by = b.y ?? 0
  if (ay !== by) return ay - by
  return (a.x ?? 0) - (b.x ?? 0)
}

function sortChildren(node) {
  return {
    ...node,
    children: (node.children || []).sort(compareLayers).map(sortChildren),
  }
}

function flattenTree(nodes, result = []) {
  nodes.forEach(node => {
    result.push(node)
    if (node.children?.length) flattenTree(node.children, result)
  })
  return result
}

function containsNode(nodes, id) {
  if (!id) return false
  return nodes.some(node => node.id === id || (node.children?.length && containsNode(node.children, id)))
}

function getLayerLabel(node, meta) {
  if (node.virtual) return meta?.label || node.type
  if (node.name && node.name !== node.type) return node.name
  if (node.content?.trim()) return node.content.trim().replace(/\s+/g, ' ').slice(0, 34)
  return meta?.label || node.type || 'Layer'
}

function DesktopIcon({ size = 12 }) {
  return <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2" width="11" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 12h4M7 9.5V12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}

function StackIcon({ size = 12 }) {
  return <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><rect x="2" y="2.5" width="10" height="2.5" rx="1" fill="currentColor"/><rect x="2" y="6" width="10" height="2.5" rx="1" fill="currentColor"/><rect x="2" y="9.5" width="10" height="2.5" rx="1" fill="currentColor"/></svg>
}

function SectionIcon({ size = 12 }) {
  return <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 5h10" stroke="currentColor" strokeWidth="1.3"/></svg>
}

function FrameIcon({ size = 12 }) {
  return <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="4" y="4" width="6" height="6" rx="1" fill="currentColor" opacity="0.18"/></svg>
}

function TypeIcon({ size = 12 }) {
  return <span style={{ fontSize: size, fontWeight: 800, lineHeight: 1 }}>T</span>
}

function ImageIcon({ size = 12 }) {
  return <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="5" cy="5" r="1" fill="currentColor"/><path d="M3 10l3-3 2 2 1.5-2 1.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

function LinkIcon({ size = 12 }) {
  return <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><path d="M5.8 8.2l2.4-2.4M6 4.2l.4-.4a2.3 2.3 0 013.2 3.2l-.4.4M8 9.8l-.4.4a2.3 2.3 0 01-3.2-3.2l.4-.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}

function ButtonIcon({ size = 12 }) {
  return <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><rect x="2" y="4" width="10" height="6" rx="3" stroke="currentColor" strokeWidth="1.4"/><path d="M5 7h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}

function VideoIcon({ size = 12 }) {
  return <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><rect x="2" y="3" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M6 5.5l3 1.5-3 1.5v-3z" fill="currentColor"/></svg>
}

function DividerIcon({ size = 12 }) {
  return <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><path d="M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
}

function InputIcon({ size = 12 }) {
  return <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><rect x="2" y="4" width="10" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
}

function CheckboxIcon({ size = 12 }) {
  return <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><rect x="2.5" y="2.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 7l1.7 1.7 3.3-3.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

function UnknownIcon({ size = 12 }) {
  return <span style={{ fontSize: size, fontWeight: 800, lineHeight: 1 }}>?</span>
}

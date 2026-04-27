import { useState } from 'react'
import { Search, Type, Layout, Image, MousePointer, ChevronRight } from 'lucide-react'

const CATEGORIES = [
  {
    id: 'text',
    label: 'Text',
    icon: Type,
    items: [
      { id: 'heading',   label: 'Heading',   description: 'Large title' },
      { id: 'paragraph', label: 'Paragraph', description: 'Body text' },
      { id: 'link',      label: 'Link',      description: 'Clickable text' },
    ]
  },
  {
    id: 'layout',
    label: 'Layout',
    icon: Layout,
    items: [
      { id: 'container', label: 'Container', description: 'Box / div' },
      { id: 'section',   label: 'Section',   description: 'Full width row' },
      { id: 'divider',   label: 'Divider',   description: 'Horizontal line' },
    ]
  },
  {
    id: 'media',
    label: 'Media',
    icon: Image,
    items: [
      { id: 'image', label: 'Image', description: 'Image block' },
      { id: 'video', label: 'Video', description: 'Video player' },
    ]
  },
  {
    id: 'form',
    label: 'Form',
    icon: MousePointer,
    items: [
      { id: 'button',   label: 'Button',   description: 'Click action' },
      { id: 'input',    label: 'Input',    description: 'Text field' },
      { id: 'checkbox', label: 'Checkbox', description: 'Toggle option' },
    ]
  },
]

// Mini visual preview per element
function ElementPreview({ id }) {
  const previews = {
    heading:   <span style={{ fontSize: 15, fontWeight: 700, color: '#0F2348' }}>Title</span>,
    paragraph: <span style={{ fontSize: 9, color: '#5E6F8E', lineHeight: 1.5 }}>Body text goes here...</span>,
    link:      <span style={{ fontSize: 10, color: '#2348D7', textDecoration: 'underline' }}>Click here</span>,
    container: <div style={{ width: 40, height: 26, border: '2px dashed #D8E1F0', borderRadius: 4 }} />,
    section:   <div style={{ width: 52, height: 14, border: '2px dashed #D8E1F0', borderRadius: 2 }} />,
    divider:   <div style={{ width: 44, height: 2, backgroundColor: '#D8E1F0', borderRadius: 2 }} />,
    image:     <div style={{ width: 40, height: 28, backgroundColor: '#F0F4FF', border: '1.5px dashed #AAB8D4', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🖼</div>,
    video:     <div style={{ width: 40, height: 28, backgroundColor: '#0F1A2E', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>▶</div>,
    button:    <div style={{ padding: '3px 10px', backgroundColor: '#2348D7', color: 'white', borderRadius: 5, fontSize: 9, fontWeight: 600 }}>Button</div>,
    input:     <div style={{ width: 48, height: 18, border: '1.5px solid #D8E1F0', borderRadius: 4, backgroundColor: 'white' }} />,
    checkbox:  <div style={{ width: 14, height: 14, border: '1.5px solid #2348D7', borderRadius: 3, backgroundColor: '#EEF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#2348D7' }}>✓</div>,
  }

  return (
    <div style={{
      width: '100%', height: 52,
      backgroundColor: '#F7F9FD',
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    }}>
      {previews[id] || null}
    </div>
  )
}

export default function InsertPanel({ onInsert }) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0])
  const [search, setSearch] = useState('')

  // When searching, flatten all items and ignore category selection
  const isSearching = search.trim().length > 0
  const searchResults = CATEGORIES.flatMap(c => c.items).filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  )

  const displayItems = isSearching ? searchResults : activeCategory.items

  return (
    <div style={{ display: 'flex', height: '100%' }}>

      {/* Left: category list */}
      <div style={{
        width: 56,
        height: '100%',
        borderRight: '1px solid #EEF2FA',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 12,
        gap: 4,
        overflowY: 'auto',
      }}>
        {CATEGORIES.map(cat => {
          const Icon = cat.icon
          const isActive = activeCategory.id === cat.id && !isSearching
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat); setSearch('') }}
              title={cat.label}
              style={{
                width: 40, height: 40,
                borderRadius: 10,
                border: 'none',
                backgroundColor: isActive ? '#EEF3FF' : 'transparent',
                color: isActive ? '#2348D7' : '#8A9ABB',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                gap: 2,
                transition: 'all 0.15s',
              }}
            >
              <Icon size={16} />
              <span style={{ fontSize: 8, fontWeight: 600 }}>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Right: items panel */}
      <div style={{ width: 200, height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Header + search */}
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid #EEF2FA', flexShrink: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#0F2348', marginBottom: 8 }}>
            {isSearching ? 'Search results' : activeCategory.label}
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            backgroundColor: '#F7F9FD', border: '1px solid #DFE6F2',
            borderRadius: 8, padding: '5px 10px',
          }}>
            <Search size={11} color="#94A3BD" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 11, color: '#21395F', width: '100%',
              }}
            />
          </div>
        </div>

        {/* Scrollable items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
          {displayItems.length === 0 && (
            <p style={{ fontSize: 11, color: '#C5D0E4', textAlign: 'center', marginTop: 24 }}>
              No elements found
            </p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {displayItems.map(el => (
              <button
                key={el.id}
                onClick={() => onInsert(el)}
                style={{
                  display: 'flex', flexDirection: 'column',
                  padding: 8, borderRadius: 10,
                  backgroundColor: '#F3F6FB',
                  border: '1.5px solid #E2E8F4',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#EEF3FF'
                  e.currentTarget.style.borderColor = '#2348D7'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#F3F6FB'
                  e.currentTarget.style.borderColor = '#E2E8F4'
                }}
              >
                <ElementPreview id={el.id} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#0F2348' }}>{el.label}</span>
                <span style={{ fontSize: 9, color: '#AAB8D4', marginTop: 1 }}>{el.description}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
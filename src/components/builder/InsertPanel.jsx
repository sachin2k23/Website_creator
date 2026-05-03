import { useState } from 'react'
import {
  AtSign,
  Box,
  CheckCircle2,
  Columns2,
  Columns3,
  Feather,
  FileText,
  FormInput,
  GitBranch,
  Globe2,
  Image,
  LayoutTemplate,
  Link,
  MousePointerClick,
  Orbit,
  PanelTop,
  Play,
  Rows3,
  Search,
  Shapes,
  Smile,
  Square,
  Star,
  Tag,
  Text,
  Type,
  Zap,
} from 'lucide-react'

const common = {
  children: [],
  opacity: 100,
  shadowColor: null,
  textColor: '#111827',
}

const makeElement = (id, label, description, defaults) => ({
  id,
  label,
  description,
  ...common,
  type: id,
  name: label,
  x: 80,
  y: 80,
  ...defaults,
})

const child = (type, name, x, y, width, height, extra = {}) => ({
  ...common,
  id: type,
  type,
  name,
  x,
  y,
  width,
  height,
  content: '',
  fill: 'transparent',
  borderColor: null,
  radius: 0,
  ...extra,
  children: [],
})

const ITEMS = {
  basics: [
    makeElement('section', 'Section', 'Full-width row container', {
      width: 1200,
      height: 120,
      fill: '#F8FAFF',
      borderColor: null,
      radius: 0,
    }),
    makeElement('container', 'Container', 'Box div wrapper', {
      width: 320,
      height: 200,
      fill: '#FFFFFF',
      borderColor: '#E2E8F4',
      radius: 8,
    }),
    {
      id: 'navigation',
      label: 'Navigation',
      description: 'Logo, links and action',
      type: 'group',
      children: [
        child('section', 'Navigation Bar', 0, 0, 1200, 68, { fill: '#FFFFFF', borderColor: '#E2E8F4' }),
        child('heading', 'Logo', 48, 20, 120, 28, { content: 'Brand', fontSize: 20, fontWeight: 700, textColor: '#0F2348' }),
        child('link', 'Nav Link', 760, 22, 70, 24, { content: 'Work', fontSize: 15, textColor: '#41506C' }),
        child('link', 'Nav Link', 850, 22, 80, 24, { content: 'About', fontSize: 15, textColor: '#41506C' }),
        child('link', 'Nav Link', 950, 22, 70, 24, { content: 'Blog', fontSize: 15, textColor: '#41506C' }),
        child('button', 'Nav Button', 1050, 12, 110, 44, { content: 'Start', fill: '#2348D7', textColor: '#FFFFFF', radius: 8, fontSize: 14, fontWeight: 700 }),
      ],
    },
    {
      id: 'footer',
      label: 'Footer',
      description: 'Dark footer block',
      type: 'group',
      children: [
        child('section', 'Footer', 0, 0, 1200, 120, { fill: '#0F2348' }),
        child('heading', 'Footer Logo', 48, 34, 140, 34, { content: 'Brand', fontSize: 22, fontWeight: 700, textColor: '#FFFFFF' }),
        child('paragraph', 'Footer Links', 760, 36, 300, 24, { content: 'Home  Work  Contact', fontSize: 14, textColor: '#D8E1F0' }),
        child('paragraph', 'Copyright', 48, 82, 280, 22, { content: 'Copyright 2026. All rights reserved.', fontSize: 12, textColor: '#AAB8D4' }),
      ],
    },
    makeElement('card', 'Card', 'White card with shadow', {
      width: 300,
      height: 200,
      fill: '#FFFFFF',
      borderColor: null,
      shadowColor: 'rgba(15,35,72,0.14)',
      radius: 16,
    }),
    makeElement('divider', 'Divider', 'Horizontal rule', {
      width: 400,
      height: 2,
      fill: '#E2E8F4',
      borderColor: null,
      radius: 2,
    }),
  ],
  text: [
    makeElement('heading', 'Heading', 'Large page title', {
      width: 320,
      height: 50,
      content: 'Your Heading',
      fill: 'transparent',
      borderColor: null,
      fontSize: 32,
      fontWeight: 700,
      textColor: '#0F2348',
    }),
    makeElement('paragraph', 'Paragraph', 'Body copy block', {
      width: 300,
      height: 80,
      content: 'Your text goes here',
      fill: 'transparent',
      borderColor: null,
      fontSize: 16,
      textColor: '#4B5563',
    }),
    makeElement('link', 'Link', 'Clickable text', {
      width: 120,
      height: 30,
      content: 'Click here',
      fill: 'transparent',
      borderColor: null,
      fontSize: 16,
      textColor: '#2348D7',
    }),
    makeElement('label', 'Label', 'Small uppercase label', {
      width: 120,
      height: 24,
      content: 'LABEL',
      fill: 'transparent',
      borderColor: null,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 2,
      textColor: '#5E6F8E',
    }),
  ],
  media: [
    makeElement('image', 'Image', 'Responsive image placeholder', {
      width: 280,
      height: 180,
      fill: '#F0F4FF',
      borderColor: '#D8E1F0',
      radius: 10,
    }),
    makeElement('video', 'Video', 'Player placeholder', {
      width: 320,
      height: 200,
      fill: '#0F1A2E',
      borderColor: null,
      radius: 10,
    }),
    makeElement('icon', 'Icon', 'Star SVG placeholder', {
      width: 48,
      height: 48,
      fill: 'transparent',
      borderColor: null,
      radius: 0,
      textColor: '#2348D7',
    }),
  ],
  icons: [
    makeElement('iconic-icon', 'Iconic', 'Friendly outline icon', {
      type: 'icon',
      iconSet: 'iconic',
      width: 48,
      height: 48,
      fill: 'transparent',
      borderColor: null,
      radius: 0,
      textColor: '#0099FF',
    }),
    makeElement('phosphor-icon', 'Phosphor', 'Geometric icon style', {
      type: 'icon',
      iconSet: 'phosphor',
      width: 48,
      height: 48,
      fill: 'transparent',
      borderColor: null,
      radius: 0,
      textColor: '#0099FF',
    }),
    makeElement('hero-icon', 'Hero', 'Heroicons-style symbol', {
      type: 'icon',
      iconSet: 'hero',
      width: 48,
      height: 48,
      fill: 'transparent',
      borderColor: null,
      radius: 0,
      textColor: '#0099FF',
    }),
    makeElement('feather-icon', 'Feather', 'Feather-style mark', {
      type: 'icon',
      iconSet: 'feather',
      width: 48,
      height: 48,
      fill: 'transparent',
      borderColor: null,
      radius: 0,
      textColor: '#0099FF',
    }),
    makeElement('meteor-icon', 'Meteor', 'Globe icon set', {
      type: 'icon',
      iconSet: 'meteor',
      width: 48,
      height: 48,
      fill: 'transparent',
      borderColor: null,
      radius: 0,
      textColor: '#0099FF',
    }),
    makeElement('material-icon', 'Material', 'Material-style bolt', {
      type: 'icon',
      iconSet: 'material',
      width: 48,
      height: 48,
      fill: 'transparent',
      borderColor: null,
      radius: 0,
      textColor: '#0099FF',
    }),
    makeElement('basicons-icon', 'Basicons', 'Orbit outline icon', {
      type: 'icon',
      iconSet: 'basicons',
      width: 48,
      height: 48,
      fill: 'transparent',
      borderColor: null,
      radius: 0,
      textColor: '#0099FF',
    }),
    makeElement('flowbite-icon', 'Flowbite', 'Connected nodes icon', {
      type: 'icon',
      iconSet: 'flowbite',
      width: 48,
      height: 48,
      fill: 'transparent',
      borderColor: null,
      radius: 0,
      textColor: '#0099FF',
    }),
    makeElement('nonicons-icon', 'Nonicons', 'Expressive outline icon', {
      type: 'icon',
      iconSet: 'nonicons',
      width: 48,
      height: 48,
      fill: 'transparent',
      borderColor: null,
      radius: 0,
      textColor: '#0099FF',
    }),
    makeElement('sargam-icon', 'Sargam', 'Check circle icon', {
      type: 'icon',
      iconSet: 'sargam',
      width: 48,
      height: 48,
      fill: 'transparent',
      borderColor: null,
      radius: 0,
      textColor: '#0099FF',
    }),
  ],
  forms: [
    makeElement('button', 'Button', 'Primary action', {
      width: 140,
      height: 44,
      content: 'Button',
      fill: '#2348D7',
      borderColor: null,
      radius: 8,
      textColor: '#FFFFFF',
      fontSize: 14,
      fontWeight: 700,
    }),
    makeElement('input', 'Input', 'Single-line field', {
      width: 260,
      height: 44,
      content: 'Placeholder',
      fill: '#FFFFFF',
      borderColor: '#D8E1F0',
      radius: 8,
      fontSize: 14,
    }),
    makeElement('textarea', 'Textarea', 'Multi-line field', {
      width: 260,
      height: 100,
      content: 'Placeholder',
      fill: '#FFFFFF',
      borderColor: '#D8E1F0',
      radius: 8,
      fontSize: 14,
    }),
    makeElement('checkbox', 'Checkbox', 'Toggle option', {
      width: 140,
      height: 30,
      content: 'Option',
      fill: 'transparent',
      borderColor: null,
      radius: 0,
      fontSize: 14,
    }),
    makeElement('select', 'Select', 'Dropdown field', {
      width: 200,
      height: 44,
      content: 'Choose option',
      fill: '#FFFFFF',
      borderColor: '#D8E1F0',
      radius: 8,
      fontSize: 14,
    }),
  ],
  layout: [
    {
      id: 'two-columns',
      label: '2 Columns',
      description: 'Two side-by-side containers',
      type: 'group',
      children: [
        child('container', 'Column 1', 80, 80, 560, 200, { fill: '#FFFFFF', borderColor: '#E2E8F4', radius: 12 }),
        child('container', 'Column 2', 660, 80, 560, 200, { fill: '#FFFFFF', borderColor: '#E2E8F4', radius: 12 }),
      ],
    },
    {
      id: 'three-columns',
      label: '3 Columns',
      description: 'Three equal containers',
      type: 'group',
      children: [
        child('container', 'Column 1', 80, 80, 360, 200, { fill: '#FFFFFF', borderColor: '#E2E8F4', radius: 12 }),
        child('container', 'Column 2', 460, 80, 360, 200, { fill: '#FFFFFF', borderColor: '#E2E8F4', radius: 12 }),
        child('container', 'Column 3', 840, 80, 360, 200, { fill: '#FFFFFF', borderColor: '#E2E8F4', radius: 12 }),
      ],
    },
    {
      id: 'hero-block',
      label: 'Hero Block',
      description: 'Heading, copy and button',
      type: 'group',
      children: [
        child('section', 'Hero Section', 0, 0, 1200, 360, { fill: '#F8FAFF' }),
        child('heading', 'Hero Heading', 80, 74, 560, 86, { content: 'Build something brilliant', fontSize: 44, fontWeight: 700, textColor: '#0F2348' }),
        child('paragraph', 'Hero Paragraph', 80, 178, 500, 64, { content: 'Design, arrange and publish your next website with a canvas that feels direct.', fontSize: 18, textColor: '#5E6F8E' }),
        child('button', 'Hero Button', 80, 268, 150, 48, { content: 'Get started', fill: '#2348D7', textColor: '#FFFFFF', radius: 8, fontWeight: 700 }),
      ],
    },
    {
      id: 'cta-block',
      label: 'CTA Block',
      description: 'Centered conversion block',
      type: 'group',
      children: [
        child('section', 'CTA Section', 0, 0, 1200, 260, { fill: '#0F2348' }),
        child('heading', 'CTA Heading', 360, 54, 480, 58, { content: 'Ready to launch?', fontSize: 36, fontWeight: 700, textColor: '#FFFFFF', textAlign: 'center' }),
        child('paragraph', 'CTA Subtext', 390, 126, 420, 36, { content: 'Turn the page into a polished web experience.', fontSize: 16, textColor: '#D8E1F0', textAlign: 'center' }),
        child('button', 'CTA Button', 525, 184, 150, 46, { content: 'Publish now', fill: '#FFFFFF', textColor: '#2348D7', radius: 8, fontWeight: 700 }),
      ],
    },
  ],
}

const CATEGORIES = [
  { id: 'basics', label: 'Basics', icon: Square, items: ITEMS.basics },
  { id: 'text', label: 'Text', icon: Type, items: ITEMS.text },
  { id: 'media', label: 'Media', icon: Image, items: ITEMS.media },
  { id: 'icons', label: 'Icons', icon: Smile, items: ITEMS.icons },
  { id: 'forms', label: 'Forms', icon: FormInput, items: ITEMS.forms },
  { id: 'layout', label: 'Layout', icon: LayoutTemplate, items: ITEMS.layout },
]

const ICON_PREVIEWS = {
  'iconic-icon': Smile,
  'phosphor-icon': Shapes,
  'hero-icon': AtSign,
  'feather-icon': Feather,
  'meteor-icon': Globe2,
  'material-icon': Zap,
  'basicons-icon': Orbit,
  'flowbite-icon': GitBranch,
  'nonicons-icon': Feather,
  'sargam-icon': CheckCircle2,
}

function Preview({ id }) {
  const IconPreview = ICON_PREVIEWS[id]

  if (IconPreview) {
    return (
      <div className="h-[86px] w-full rounded-2xl bg-[#EEF8FF] flex flex-col items-center justify-center overflow-hidden">
        <IconPreview size={34} strokeWidth={2.4} color="#0099FF" />
      </div>
    )
  }

  const shell = (children) => (
    <div className="h-[60px] w-full rounded-lg bg-[#F7F9FD] border border-[#E8EDF6] flex items-center justify-center overflow-hidden">
      {children}
    </div>
  )

  const previews = {
    section: shell(<div className="w-14 h-4 rounded-sm bg-[#F8FAFF] border border-[#D8E1F0]" />),
    container: shell(<div className="w-12 h-8 rounded border border-[#C7D2E5] bg-white" />),
    navigation: shell(<div className="w-16 h-8 bg-white border-b border-[#C7D2E5] px-1.5 flex items-center justify-between"><span className="w-3 h-2 rounded-sm bg-[#0F2348]" /><span className="w-7 h-1 rounded bg-[#AAB8D4]" /><span className="w-3 h-2 rounded bg-[#2348D7]" /></div>),
    footer: shell(<div className="w-16 h-8 bg-[#0F2348] px-2 py-1.5 flex flex-col justify-between"><span className="w-5 h-1.5 rounded bg-white" /><span className="w-10 h-1 rounded bg-[#AAB8D4]" /></div>),
    card: shell(<div className="w-12 h-8 rounded-lg bg-white shadow-md border border-[#EEF2FA]" />),
    divider: shell(<div className="w-14 h-0.5 rounded bg-[#D8E1F0]" />),
    heading: shell(<Text size={30} strokeWidth={2.6} color="#0F2348" />),
    paragraph: shell(<FileText size={28} color="#7D8CA8" />),
    link: shell(<Link size={26} color="#2348D7" />),
    label: shell(<Tag size={26} color="#5E6F8E" />),
    image: shell(<Image size={30} color="#7D8CA8" />),
    video: shell(<div className="w-14 h-9 rounded bg-[#0F1A2E] flex items-center justify-center"><Play size={18} fill="white" color="white" /></div>),
    icon: shell(<Star size={30} color="#2348D7" fill="#EAF0FF" />),
    button: shell(<div className="px-4 py-2 rounded-md bg-[#2348D7] text-white text-[9px] font-bold">Button</div>),
    input: shell(<div className="w-14 h-5 rounded border border-[#C7D2E5] bg-white" />),
    textarea: shell(<div className="w-14 h-8 rounded border border-[#C7D2E5] bg-white" />),
    checkbox: shell(<div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded border border-[#2348D7]" /><span className="w-8 h-1.5 rounded bg-[#AAB8D4]" /></div>),
    select: shell(<div className="w-14 h-5 rounded border border-[#C7D2E5] bg-white flex items-center justify-end pr-1"><span className="text-[9px] text-[#7D8CA8]">v</span></div>),
    'two-columns': shell(<Columns2 size={30} color="#2348D7" />),
    'three-columns': shell(<Columns3 size={30} color="#2348D7" />),
    'hero-block': shell(<div className="w-16 h-10 bg-[#F8FAFF] px-2 py-1.5 flex flex-col gap-1"><span className="w-9 h-1.5 rounded bg-[#0F2348]" /><span className="w-12 h-1 rounded bg-[#AAB8D4]" /><span className="w-5 h-2 rounded bg-[#2348D7]" /></div>),
    'cta-block': shell(<div className="w-16 h-10 bg-[#0F2348] px-2 py-2 flex flex-col items-center gap-1"><span className="w-10 h-1.5 rounded bg-white" /><span className="w-12 h-1 rounded bg-[#AAB8D4]" /><span className="w-5 h-2 rounded bg-white" /></div>),
  }

  return previews[id] || shell(<Box size={28} color="#7D8CA8" />)
}

export default function InsertPanel({ onInsert }) {
  const [activeId, setActiveId] = useState('basics')
  const [search, setSearch] = useState('')

  const activeCategory = CATEGORIES.find(cat => cat.id === activeId) || CATEGORIES[0]
  const allItems = CATEGORIES.flatMap(cat => cat.items)
  const query = search.trim().toLowerCase()
  const displayItems = query
    ? allItems.filter(item => `${item.label} ${item.description}`.toLowerCase().includes(query))
    : activeCategory.items

  return (
    <div className="h-full w-[324px] bg-white flex border-r border-[#E2E8F4]">
      <aside className="w-[92px] border-r border-[#EEF2FA] p-2 flex flex-col gap-1 overflow-y-auto">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon
          const isActive = activeId === cat.id && !query
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveId(cat.id)
                setSearch('')
              }}
              className={`h-14 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-all ${
                isActive ? 'bg-[#EEF3FF] text-[#2348D7]' : 'text-[#6F7E99] hover:bg-[#F7F9FD] hover:text-[#0F2348]'
              }`}
              title={cat.label}
            >
              <Icon size={17} />
              {cat.label}
            </button>
          )
        })}
      </aside>

      <section className="flex-1 min-w-0 flex flex-col">
        <div className="px-3 py-3 border-b border-[#EEF2FA]">
          <div className="flex items-center gap-2 mb-3">
            <MousePointerClick size={16} color="#2348D7" />
            <h2 className="text-sm font-bold text-[#0F2348]">{query ? 'Search' : activeCategory.label}</h2>
          </div>
          <div className="h-9 rounded-xl bg-[#F7F9FD] border border-[#DFE6F2] flex items-center gap-2 px-3">
            <Search size={13} color="#94A3BD" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent outline-none text-xs text-[#21395F] placeholder:text-[#9AA8C0]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {displayItems.length === 0 ? (
            <p className="mt-8 text-center text-xs text-[#AAB8D4]">No elements found</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {displayItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onInsert(item)}
                  className="group text-left rounded-xl border border-[#E2E8F4] bg-white p-2 transition-all hover:border-[#2348D7] hover:bg-[#EEF3FF] focus:outline-none focus:border-[#2348D7] focus:bg-[#EEF3FF]"
                >
                  <Preview id={item.id} />
                  <span className="mt-2 block text-[11px] font-bold text-[#0F2348] leading-tight">{item.label}</span>
                  <span className="mt-0.5 block text-[9px] text-[#8A9ABB] leading-snug">{item.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

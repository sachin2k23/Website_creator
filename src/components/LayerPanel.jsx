import { useEffect, useMemo, useRef, useState } from "react"

export default function LayerPanel({ elements = [], selectedId, onSelect }) {
  const tree = useMemo(() => buildTree(elements), [elements])

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full p-2 overflow-y-auto">
      {tree.map(node => (
        <LayerItem
          key={node.id}
          node={node}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

function LayerItem({ node, selectedId, onSelect, depth = 0 }) {
  const [expanded, setExpanded] = useState(true)
  const ref = useRef(null)
  const children = node.children || []
  const hasChildren = children.length > 0
  const isSelected = selectedId === node.id
  const hasSelectedChild = hasChildren && containsNode(children, selectedId)

  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ block: "nearest" })
    }
  }, [isSelected])

  const isExpanded = expanded || hasSelectedChild

  return (
    <div>
      <div
        ref={ref}
        onClick={() => onSelect(node.id)}
        className={`px-2 py-1 rounded cursor-pointer text-sm transition flex items-center gap-1 ${
          isSelected
            ? "bg-blue-500 text-white"
            : "hover:bg-gray-100 text-gray-700"
        }`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={event => {
              event.stopPropagation()
              setExpanded(value => !value)
            }}
            className="w-4 h-4 shrink-0 flex items-center justify-center"
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        ) : (
          <span className="w-4 h-4 shrink-0" />
        )}

        <span className="truncate">
          {node.name || node.content || node.type || "Layer"}
        </span>
      </div>

      {hasChildren && isExpanded && children.map(child => (
        <LayerItem
          key={child.id}
          node={child}
          selectedId={selectedId}
          onSelect={onSelect}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}

function buildTree(elements) {
  const nodes = elements.map(element => ({
    ...element,
    children: element.children ? buildTree(element.children) : [],
  }))

  if (nodes.some(node => node.parentId)) {
    const byId = new Map(nodes.map(node => [node.id, { ...node, children: [] }]))
    const roots = []

    nodes.forEach(node => {
      const current = byId.get(node.id)
      const parent = byId.get(node.parentId)

      if (parent) {
        parent.children.push(current)
      } else {
        roots.push(current)
      }
    })

    return roots
  }

  return nodes
}

function containsNode(nodes, id) {
  if (!id) return false

  return nodes.some(node =>
    node.id === id || (node.children?.length && containsNode(node.children, id))
  )
}

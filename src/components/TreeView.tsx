import { useMemo, useState } from 'react'
import type { Node } from '../types/types'

type TreeViewProps = {
  root: Node
  selectedId?: string | null
  onSelect: (id: string) => void
}

function getItemChildren(item: Node): Node[] {
  return item.children || []
}

function getShortName(item: Node): string {
  switch (item.type) {
    case 'Div':
      if (item.text) {
        return 'T'
      }
      return 'D'

    case 'Button':
      return 'B'
    case 'Image':
      return 'I'
    case 'Input':
      return 'I'
    default:
      break
  }
  return item.name
}

// Signature based ONLY on node type and the recursive structure of children types
function serializeItem(item: Node): string {
  const childrenSerialized =
    item.children?.map((c) => serializeItem(c)).join(',') ?? ''
  const type = item.text ? 'Text' : item.type
  return `T(${type})[${childrenSerialized}]`
}

function isContainerDiv(item: Node): boolean {
  return item.type === 'Div' && !item.text
}

function computeComponentLabels(root: Node): Map<string, string> {
  // Group nodes by serialized subtree (structure + styles)
  const groups = new Map<string, string[]>()
  const result = new Map<string, string>()

  const visit = (item: Node) => {
    // Only group Div nodes without text
    if (isContainerDiv(item)) {
      const key = serializeItem(item)
      const list = groups.get(key) ?? []
      list.push(item.id)
      groups.set(key, list)
    }
    for (const child of item.children) visit(child)
  }
  for (const child of root.children) visit(child)

  for (const [, ids] of groups) {
    const cIndex = 1
    if (ids.length >= 2) {
      for (const id of ids) {
        result.set(id, `C${cIndex}`)
      }
    }
  }

  return result
}

function TreeItem(props: {
  item: Node
  selectedId?: string | null
  onSelect: (id: string) => void
  labels: Map<string, string>
}) {
  const { item, selectedId, onSelect, labels } = props
  const [expanded, setExpanded] = useState(true)
  const isSelected = selectedId === item.id
  const children = getItemChildren(item)
  const compLabel = labels.get(item.id)

  return (
    <div>
      <div
        className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg ${isSelected ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'}`}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(item.id)
        }}
      >
        <button
          className="text-xs text-gray-500 w-4"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {children && children.length > 0 ? (expanded ? '▾' : '▸') : ''}
        </button>
        <span className="text-xs text-gray-700">{getShortName(item)}</span>
        <span className="ml-1 text-[10px] text-gray-800">{item.name}</span>
        {compLabel && (
          <span className="ml-1 text-[10px] text-green-700">({compLabel})</span>
        )}
      </div>
      {expanded && children && children.length > 0 && (
        <div className="ml-4 border-l border-gray-200 pl-2">
          {children.map((child) => (
            <TreeItem
              key={child.id}
              item={child}
              onSelect={onSelect}
              selectedId={selectedId}
              labels={labels}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TreeView({ root, selectedId, onSelect }: TreeViewProps) {
  const labels = useMemo(() => computeComponentLabels(root), [root])
  return (
    <div className="text-sm">
      <TreeItem
        key={root.id}
        item={root}
        selectedId={selectedId}
        onSelect={onSelect}
        labels={labels}
      />
    </div>
  )
}

export default TreeView

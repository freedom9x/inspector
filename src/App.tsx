import { useMemo, useState } from 'react'
import TreeView from './components/TreeView'
import Preview from './components/Preview'
import Inspector from './components/Inspector'
import type { Node } from './types/types'

function updateNodeById(
  nodes: Array<Node>,
  nodeId: string,
  apply: (n: Node) => Node,
): Array<Node> {
  return nodes.map((n) => {
    if (n.id === nodeId) return apply(n)
    if (n.children?.length) {
      return {
        ...n,
        children: updateNodeById(n.children, nodeId, apply),
      }
    }
    return n
  })
}

const initialRoot: Node = {
  id: 'root-node',
  type: 'Div',
  name: 'Root',
  children: [
    {
      id: 'text-1',
      type: 'Div',
      display: 'inline',
      name: 'Text 1',
      text: 'Text 1',
      children: [],
    },
    {
      id: 'card-0',
      name: 'Card 1',
      type: 'Div',
      width: 520,
      height: 160,
      background: 'rgb(220 182 28)',
      children: [
        {
          id: 'text-2',
          type: 'Div',
          name: 'Text 2',
          text: 'Text 2',
          children: [],
        },
      ],
    },

    {
      id: 'card-1',
      name: 'Card 1',
      type: 'Div',
      width: 520,
      height: 160,
      background: 'rgb(84 155 75)',
      children: [
        {
          id: 'btn-1',
          x: 20,
          y: 20,
          name: 'Button 1',
          type: 'Button',
          width: 120,
          height: 40,
          background: '#2563eb',
          color: '#fff',
          text: 'Button 1',
          children: [],
        },
        {
          id: 'img-1',
          x: 40,
          y: 20,
          name: 'Image 1',
          type: 'Image',
          width: 200,
          height: 40,
          background: '#c084fc',
          children: [],
        },
      ],
    },
    {
      id: 'card-2',
      name: 'Card 2',
      type: 'Div',
      width: 520,
      height: 160,
      background: 'rgb(84 155 75)',
      children: [
        {
          id: 'btn-2',
          x: 20,
          y: 20,
          name: 'Button 2',
          type: 'Button',
          width: 120,
          height: 40,
          background: '#2563eb',
          color: '#fff',
          text: 'Button 1',
          children: [],
        },
        {
          id: 'img-2',
          x: 40,
          y: 20,
          name: 'Image 2',
          type: 'Image',
          width: 200,
          height: 40,
          background: '#c084fc',
          children: [],
        },
      ],
    },
  ],
}

function App() {
  const [root, setRoot] = useState<Node>(initialRoot)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedItem: Node | undefined = useMemo(() => {
    const stack = [root, ...root.children]
    while (stack.length) {
      const item = stack.pop() as Node
      if (item.id === selectedId) return item
      if (item.children?.length) {
        stack.push(...item.children)
      }
    }
    return undefined
  }, [root, selectedId])

  function handleChangeNode(changes: Partial<Node>) {
    if (!selectedId) return
    setRoot((prev) => {
      if (prev.id === selectedId) {
        return { ...prev, ...changes }
      }
      return {
        ...prev,
        children: updateNodeById(prev.children, selectedId, (n) => ({
          ...n,
          ...changes,
        })),
      }
    })
  }

  function handleToggleStyle(property: keyof Node) {
    if (!selectedId) return
    setRoot((prev) => {
      if (prev.id === selectedId) {
        const disabled = { ...(prev.disabledStyles || {}) }
        const key = String(property)
        disabled[key] = !disabled[key]
        return { ...prev, disabledStyles: disabled }
      }
      return {
        ...prev,
        children: updateNodeById(prev.children, selectedId, (n) => {
          const disabled = { ...(n.disabledStyles || {}) }
          const key = String(property)
          disabled[key] = !disabled[key]
          return { ...n, disabledStyles: disabled }
        }),
      }
    })
  }

  return (
    <div className="max-w-screen-2xl mx-auto p-6 bg-gray-50">
      <div className="text-xl font-semibold mb-4">UI</div>
      <div className="flex justify-center gap-4 p-4 rounded-lg border">
        <div className="flex-1">
          <div className="text-sm font-medium mb-2">Tree View</div>
          <div className="border rounded-xl border-gray-400  p-2 overflow-auto">
            <TreeView
              root={root}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>
        <div className="flex-2">
          <div className="text-sm font-medium mb-2">Preview</div>
          <div className="border  rounded-xl border-gray-400  p-2 overflow-auto">
            <Preview
              item={root}
              selectedId={selectedId ?? undefined}
              onSelect={setSelectedId}
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium mb-2">CSS Inspector</div>
          <div className="border rounded-xl border-gray-400  p-2 overflow-auto">
            <Inspector
              item={selectedItem}
              onChange={handleChangeNode}
              onToggleStyle={handleToggleStyle}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

import type { Node } from '../types/types'

type PreviewProps = {
  item: Node
  selectedId?: string | null
  onSelect: (id: string) => void
}
const supportStyles = [
  'display',
  'width',
  'height',
  'background',
  'color',
  'border',
  'x',
  'y',
]
function nodeToStyle(node: Node): React.CSSProperties {
  const disabledStyles = node?.disabledStyles || {}
  const style: React.CSSProperties = {}
  supportStyles.forEach((styleKey) => {
    if (!disabledStyles[styleKey]) {
      const value = node[styleKey as keyof Node]
      if (value !== undefined) {
        if (styleKey === 'x') {
          style.top = value as number
        } else if (styleKey === 'y') {
          style.left = value as number
        } else if (typeof value === 'string' || typeof value === 'number') {
          ;(style as Record<string, string | number>)[styleKey] = value
        }
      }
    }
  })
  return style
}

function RenderItem({ item, selectedId, onSelect }: PreviewProps) {
  const style = nodeToStyle(item)
  const selectedStyle = `${selectedId === item.id ? 'inset-ring-3 inset-ring-red-500 ' : ''}`
  return (
    <>
      {item.type === 'Button' && (
        <button
          id={item?.id}
          className={`relative text-sm ${selectedStyle}`}
          style={style}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(item.id)
          }}
        >
          {item.text ?? item.name}
        </button>
      )}
      {item.type === 'Input' && (
        <input
          id={item?.id}
          className={`px-2 py-1 relative border rounded w-full ${selectedStyle}`}
          defaultValue={item.text ?? ''}
          style={style}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(item.id)
          }}
        />
      )}
      {item.type === 'Image' && (
        <div
          id={item?.id}
          className={`relative ${selectedStyle}`}
          style={style}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(item.id)
          }}
        >
          {item?.name}
        </div>
      )}
      {item.type === 'Div' && item.text && (
        <span
          id={item?.id}
          className={`text-sm relative font-medium ${selectedStyle}`}
          style={style}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(item.id)
          }}
        >
          {item.text}
        </span>
      )}

      {item.children?.length > 0 && (
        <div
          id={item?.id}
          className={`relative ${selectedStyle}`}
          style={style}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(item.id)
          }}
        >
          {item.children.map((child) => (
            <RenderItem
              key={child.id}
              item={child}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </>
  )
}

function Preview({ item, selectedId, onSelect }: PreviewProps) {
  return (
    <div className="p-4 rounded relative">
      <RenderItem
        key={item?.id}
        item={item}
        selectedId={selectedId ?? ''}
        onSelect={onSelect}
      />
    </div>
  )
}

export default Preview

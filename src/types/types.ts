type Node = {
  id: string
  name: string
  type: 'Div' | 'Input' | 'Image' | 'Button'
  width?: number
  height?: number
  x?: number
  y?: number
  display?: string
  text?: string
  background?: string
  color?: string
  border?: string
  children: Array<Node>
  disabledStyles?: Record<string, boolean>
}

export type { Node }

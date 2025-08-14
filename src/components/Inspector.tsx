import { useMemo, useState, useRef, useEffect } from 'react'
import type { Node } from '../types/types'
type InspectorProps = {
  item?: Node | null
  onChange: (changes: Partial<Node>) => void
  onToggleStyle: (property: keyof Node) => void
}

const editableProps: Array<{
  key: keyof Node
  label: string
  type: 'text' | 'number'
}> = [
  { key: 'display', label: 'display', type: 'text' },
  { key: 'width', label: 'width', type: 'number' },
  { key: 'height', label: 'height', type: 'number' },
  { key: 'background', label: 'background', type: 'text' },
  { key: 'color', label: 'color', type: 'text' },
  { key: 'border', label: 'border', type: 'text' },
  { key: 'text', label: 'text', type: 'text' },
  { key: 'x', label: 'x', type: 'number' },
  { key: 'y', label: 'y', type: 'number' },
]

const valueSuggestions: Partial<Record<keyof Node, string[]>> = {
  display: ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'],
  background: ['white', 'black', 'green', 'burlywood', 'gray'],
  color: ['red', 'blue', 'green', 'white', 'black'],
  border: ['1px solid black', '1px solid #ccc'],
  width: ['120', '200', '320', '480'],
  height: ['40', '80', '160', '240'],
  x: [],
  y: [],
}

// Generate property:value pairs for suggestions
const propertyValuePairs: Array<{
  property: string
  value: string
  type: 'text' | 'number'
}> = []
editableProps.forEach((prop) => {
  if (prop.type === 'text' && valueSuggestions[prop.key]) {
    valueSuggestions[prop.key]!.forEach((value) => {
      propertyValuePairs.push({
        property: prop.key,
        value,
        type: prop.type,
      })
    })
  }
})

function Inspector({ item, onChange, onToggleStyle }: InspectorProps) {
  const rows = useMemo(() => editableProps, [])
  const [editingProperty, setEditingProperty] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')
  const [editingPropertyName, setEditingPropertyName] = useState<string>('')
  const [editingPropertyValue, setEditingPropertyValue] = useState<string>('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    typeof propertyValuePairs
  >([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [suggestionType, setSuggestionType] = useState<'property' | 'value'>(
    'property',
  )
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const valueInputRef = useRef<HTMLInputElement>(null)

  const disabled = item?.disabledStyles ?? {}

  const activeRows = rows.filter((row) => {
    const value = item?.[row.key]
    if (typeof value === 'number') return true
    return value !== undefined && value !== ''
  })

  function handleExistingChange(
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof Node,
    type: 'text' | 'number',
  ) {
    const raw = e.target.value
    setEditingValue(raw)
    onChange({
      [key]: type === 'number' ? Number(raw) : raw,
    } as Partial<Node>)
    // }
  }

  function startEditing(property: string, value: string, field: string) {
    setEditingProperty(property)
    setEditingValue(value)
    setShowSuggestions(false)
    if (field === 'value') {
      setSuggestionType('value')
      setEditingValue(value)
    } else {
      setEditingValue(property)
    }

    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function startAddingProperty() {
    setEditingProperty('')
    setEditingPropertyName('')
    setEditingPropertyValue('')
    setSuggestionType('property')
    setShowSuggestions(false)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleSuggestionSelect(suggestion: (typeof propertyValuePairs)[0]) {
    if (suggestionType === 'property') {
      addStyle(suggestion.property as keyof Node, suggestion.value)
      setEditingProperty(suggestion.property)
      setEditingValue(suggestion.value)
      setSuggestionType('value')
    } else {
      setEditingValue(suggestion.value)
    }
    setShowSuggestions(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (showSuggestions && filteredSuggestions[selectedIndex]) {
        handleSuggestionSelect(filteredSuggestions[selectedIndex])
      } else {
        saveEdit()
      }
    } else if (e.key === 'Escape') {
      cancelEdit()
    } else if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0,
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1,
        )
      }
    }
  }

  function addStyle(key: keyof Node, editingValue: string) {
    const def = rows.find((r) => r.key === key)
    if (!def) return

    const parsed: string | number =
      def.type === 'number' ? Number(editingValue) : editingValue
    if (editingValue === '' || (def.type === 'number' && Number.isNaN(parsed)))
      return

    onChange({ [key]: parsed } as Partial<Node>)
    cancelEdit()
  }

  function saveEdit() {
    // if (!editingProperty) return

    const key = editingProperty as keyof Node
    const def = rows.find((r) => r.key === key)
    if (!def) return

    const parsed: string | number =
      def.type === 'number' ? Number(editingValue) : editingValue
    if (editingValue === '' || (def.type === 'number' && Number.isNaN(parsed)))
      return

    onChange({ [key]: parsed } as Partial<Node>)
    cancelEdit()
  }

  function cancelEdit() {
    setEditingProperty(null)
    setEditingValue('')
    setShowSuggestions(false)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Element)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!item) {
    return (
      <div className="text-sm text-gray-500">Select an item to inspect</div>
    )
  }

  return (
    <div className="text-sm">
      <div className="mb-2 font-medium text-gray-700">
        #{item.name}
        {`{`}
      </div>

      <div className="flex flex-col">
        {activeRows.map((row) => {
          const key = row.key
          const val = item[key]
          const isDisabled = !!disabled[String(key)]
          const isEditing = editingProperty === String(key)

          return (
            <>
              <div
                key={String(key)}
                className={`flex items-center gap-1 px-1 py-0.5 hover:bg-gray-50 rounded ${isDisabled ? 'line-through opacity-60' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={!isDisabled}
                  onChange={() => onToggleStyle(key)}
                  aria-label={`toggle ${String(key)}`}
                  className={`focus:outline-0 ${isEditing && 'invisible'}`}
                />
                <label
                  className={`text-gray-700 text-red-500 pr-1`}
                  onClick={() =>
                    startEditing(String(key), String(val ?? ''), 'property')
                  }
                >
                  {String(key)}:
                </label>
                {`:`}
                {isEditing ? (
                  <input
                    ref={inputRef}
                    className="focus:outline-0 border border-blue-500 rounded"
                    type={row.type === 'number' ? 'number' : 'text'}
                    value={editingValue}
                    onChange={(e) => handleExistingChange(e, key, row.type)}
                    onKeyDown={handleKeyDown}
                    onBlur={saveEdit}
                  />
                ) : (
                  <div
                    className="cursor-text hover:bg-blue-50 rounded"
                    onClick={() =>
                      startEditing(String(key), String(val ?? ''), 'value')
                    }
                  >
                    {String(val ?? '')}
                  </div>
                )}
                {row.type === 'number' && 'px'};
              </div>
            </>
          )
        })}
        {/* Editing new property */}
        {editingProperty === '' && (
          <>
            <div className="flex items-center gap-1 px-1 py-0.5">
              <input
                ref={inputRef}
                className="px-2 py-1 focus:outline-0 border border-gray-200 rounded"
                type="text"
                value={editingPropertyName}
                onChange={(e) => {
                  const value = e.target.value
                  setEditingPropertyName(value)

                  // Show property names and property:value pairs
                  const propertyNames = editableProps.map((p) => p.key)
                  const propertySuggestions = propertyNames.filter((p) =>
                    p.toLowerCase().includes(value.toLowerCase()),
                  )

                  const propertyValueSuggestions = propertyValuePairs.filter(
                    (pair) =>
                      pair.property
                        .toLowerCase()
                        .includes(value.toLowerCase()) ||
                      pair.value.toLowerCase().includes(value.toLowerCase()),
                  )

                  const allSuggestions = [
                    ...propertySuggestions.map((p) => ({
                      property: p,
                      value: '',
                      type: 'text' as const,
                    })),
                    ...propertyValueSuggestions,
                  ]

                  setFilteredSuggestions(allSuggestions.slice(0, 8))
                  setShowSuggestions(allSuggestions.length > 0)
                  setSelectedIndex(0)
                }}
                onFocus={() => {
                  // Show all property suggestions when focused
                  const propertyNames = editableProps.map((p) => p.key)
                  const allSuggestions = [
                    ...propertyNames.map((p) => ({
                      property: p,
                      value: '',
                      type: 'text' as const,
                    })),
                    ...propertyValuePairs,
                  ]
                  setFilteredSuggestions(allSuggestions.slice(0, 8))
                  setShowSuggestions(allSuggestions.length > 0)
                  setSelectedIndex(0)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Tab' || e.key === ':') {
                    e.preventDefault()
                    valueInputRef.current?.focus()
                  } else if (
                    e.key === 'Enter' &&
                    showSuggestions &&
                    filteredSuggestions[selectedIndex]
                  ) {
                    e.preventDefault()
                    const suggestion = filteredSuggestions[selectedIndex]
                    setEditingPropertyName(suggestion.property)
                    setEditingPropertyValue(suggestion.value)
                    setShowSuggestions(false)
                    if (suggestion.value) {
                      // If suggestion has value, focus value input
                      setTimeout(() => valueInputRef.current?.focus(), 0)
                    } else {
                      // If only property, focus value input
                      setTimeout(() => valueInputRef.current?.focus(), 0)
                    }
                  } else if (showSuggestions) {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      setSelectedIndex((prev) =>
                        prev < filteredSuggestions.length - 1 ? prev + 1 : 0,
                      )
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      setSelectedIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredSuggestions.length - 1,
                      )
                    }
                  }
                }}
                placeholder="property"
              />
              :
              <input
                ref={valueInputRef}
                className="px-2 py-1 focus:outline-0 border border-gray-200 rounded"
                type={
                  editableProps.find((p) => p.key === editingPropertyName)
                    ?.type === 'number'
                    ? 'number'
                    : 'text'
                }
                value={editingPropertyValue}
                onChange={(e) => {
                  const value = e.target.value
                  setEditingPropertyValue(value)

                  // Show value suggestions for the selected property
                  const prop = editingPropertyName.trim() as keyof Node
                  const suggestions = valueSuggestions[prop] || []
                  const filtered = suggestions.filter((s) =>
                    s.toLowerCase().includes(value.toLowerCase()),
                  )
                  setFilteredSuggestions(
                    filtered
                      .map((s) => ({
                        property: prop,
                        value: s,
                        type: 'text' as const,
                      }))
                      .slice(0, 8),
                  )
                  setShowSuggestions(filtered.length > 0)
                  setSelectedIndex(0)
                }}
                onFocus={() => {
                  // Show all value suggestions for the selected property when focused
                  const prop = editingPropertyName.trim() as keyof Node
                  const suggestions = valueSuggestions[prop] || []
                  setFilteredSuggestions(
                    suggestions
                      .map((s) => ({
                        property: prop,
                        value: s,
                        type: 'text' as const,
                      }))
                      .slice(0, 8),
                  )
                  setShowSuggestions(suggestions.length > 0)
                  setSelectedIndex(0)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    if (showSuggestions && filteredSuggestions[selectedIndex]) {
                      e.preventDefault()
                      const suggestion = filteredSuggestions[selectedIndex]
                      setEditingPropertyValue(suggestion.value)
                      setShowSuggestions(false)
                    }

                    const prop = editingPropertyName.trim() as keyof Node
                    const def = rows.find((r) => r.key === prop)
                    if (def && editingPropertyValue.trim()) {
                      const parsed =
                        def.type === 'number'
                          ? Number(editingPropertyValue)
                          : editingPropertyValue
                      onChange({ [prop]: parsed } as Partial<Node>)
                      setEditingPropertyName('')
                      setEditingPropertyValue('')
                      setShowSuggestions(false)
                    }
                  } else if (showSuggestions) {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      setSelectedIndex((prev) =>
                        prev < filteredSuggestions.length - 1 ? prev + 1 : 0,
                      )
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      setSelectedIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredSuggestions.length - 1,
                      )
                    }
                  }
                }}
                placeholder="value"
              />
              ;
            </div>
            {showSuggestions && (
              <div
                ref={suggestionsRef}
                className="absolute bg-white border border-gray-300 rounded shadow-lg z-10 max-h-48 overflow-y-auto w-[256px]"
                style={{
                  top: inputRef.current
                    ? inputRef.current.offsetTop + inputRef.current.offsetHeight
                    : 0,
                  left: inputRef.current ? inputRef.current.offsetLeft : 0,
                }}
              >
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.property}-${suggestion.value}`}
                    className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                      index === selectedIndex ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => {
                      setEditingPropertyName(suggestion.property)
                      setEditingPropertyValue(suggestion.value)
                      setShowSuggestions(false)
                      if (!suggestion.value) {
                        setTimeout(() => valueInputRef.current?.focus(), 0)
                      } else {
                        setTimeout(() => {
                          valueInputRef.current?.focus()
                          setShowSuggestions(false)
                        }, 0)
                      }
                    }}
                  >
                    <div className="font-mono text-sm">
                      {suggestion.value ? (
                        <>
                          <span className="text-blue-600">
                            {suggestion.property}
                          </span>
                          <span className="text-gray-500">: </span>
                          <span className="text-green-600">
                            {suggestion.value}
                          </span>
                        </>
                      ) : (
                        <span className="text-blue-600">
                          {suggestion.property}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Add new property row */}
        {editingProperty !== '' && (
          <div
            className="gap-2 px-1 py-0.5 hover:bg-gray-50 rounded cursor-text text-gray-400 italic text-xs"
            onClick={startAddingProperty}
          >
            Add property
          </div>
        )}
      </div>
      {`}`}
    </div>
  )
}

export default Inspector

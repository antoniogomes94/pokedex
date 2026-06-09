import { useMemo, useState } from 'react'
import { useIndex } from '../data/hooks'
import type { IndexEntry } from '../types'
import { displayName, formatDex } from '../utils/format'

export function PokemonPicker({
  onPick,
  placeholder = 'Buscar Pokémon...',
}: {
  onPick: (entry: IndexEntry) => void
  placeholder?: string
}) {
  const { data: index } = useIndex()
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!index || query.trim().length < 1) return []
    const q = query.trim().toLowerCase()
    return index
      .filter(
        (e) =>
          e.name.includes(q) ||
          displayName(e.name).toLowerCase().includes(q) ||
          String(e.dex) === q.replace(/^#0*/, '')
      )
      .slice(0, 12)
  }, [index, query])

  return (
    <div className="picker">
      <input
        className="search-input"
        style={{ width: '100%' }}
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <div className="picker-results">
          {results.map((e) => (
            <button
              key={e.id}
              onClick={() => {
                onPick(e)
                setQuery('')
              }}
            >
              <img src={e.sprite ?? ''} loading="lazy" alt="" />
              <span>
                {formatDex(e.dex)} {displayName(e.name)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

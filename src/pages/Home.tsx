import { useEffect, useMemo, useRef, useState } from 'react'
import { PokemonCard } from '../components/PokemonCard'
import { useGames, useIndex } from '../data/hooks'
import { useFavorites } from '../store/favorites'
import type { FormType, IndexEntry } from '../types'
import { displayName, versionGroupLabel } from '../utils/format'
import { TYPE_COLORS, TYPE_PT, genLabel } from '../utils/i18n'

const GENS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const TYPES = Object.keys(TYPE_PT)
const PAGE = 120

type SortKey = 'dex-asc' | 'dex-desc' | 'name-asc' | 'name-desc' | 'type'

const REGIONAL: FormType[] = ['alolan', 'galarian', 'hisuian', 'paldean']

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

export function Home() {
  const { data: index, error } = useIndex()
  const { data: games } = useGames()
  const { ids: favIds } = useFavorites()
  const favSet = useMemo(() => new Set(favIds), [favIds])

  const [search, setSearch] = useState('')
  const [gens, setGens] = useState<Set<number>>(new Set())
  const [types, setTypes] = useState<Set<string>>(new Set())
  const [game, setGame] = useState(0)
  const [sort, setSort] = useState<SortKey>('dex-asc')
  const [showMega, setShowMega] = useState(false)
  const [showGmax, setShowGmax] = useState(false)
  const [showRegional, setShowRegional] = useState(true)
  const [showOther, setShowOther] = useState(false)
  const [onlyFavs, setOnlyFavs] = useState(false)
  const [visible, setVisible] = useState(PAGE)

  const filterKey = [search, [...gens], [...types], game, sort, showMega, showGmax, showRegional, showOther, onlyFavs].join('|')
  const [lastFilterKey, setLastFilterKey] = useState(filterKey)
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey)
    setVisible(PAGE)
  }

  const filtered = useMemo(() => {
    if (!index) return []
    const q = search.trim().toLowerCase()
    const formVisible = (f: FormType) =>
      f === 'normal' ||
      (f === 'mega' && showMega) ||
      (f === 'gmax' && showGmax) ||
      (REGIONAL.includes(f) && showRegional) ||
      (f === 'other' && showOther)

    const result = index.filter((e: IndexEntry) => {
      // busca ativa ignora os toggles de forma para o usuário achar qualquer coisa
      if (q) {
        const matches =
          e.name.includes(q) ||
          displayName(e.name).toLowerCase().includes(q) ||
          String(e.dex) === q.replace(/^#0*/, '')
        if (!matches) return false
      } else if (!formVisible(e.form)) {
        return false
      }
      if (gens.size > 0 && !gens.has(e.gen)) return false
      if (types.size > 0 && !e.types.some((t) => types.has(t))) return false
      if (game !== 0 && !e.games.includes(game)) return false
      if (onlyFavs && !favSet.has(e.id)) return false
      return true
    })

    const byName = (a: IndexEntry, b: IndexEntry) =>
      displayName(a.name).localeCompare(displayName(b.name))
    switch (sort) {
      case 'dex-desc':
        result.sort((a, b) => b.dex - a.dex || b.id - a.id)
        break
      case 'name-asc':
        result.sort(byName)
        break
      case 'name-desc':
        result.sort((a, b) => byName(b, a))
        break
      case 'type':
        result.sort(
          (a, b) =>
            (TYPE_PT[a.types[0]] ?? '').localeCompare(TYPE_PT[b.types[0]] ?? '') ||
            a.dex - b.dex
        )
        break
      default:
        result.sort((a, b) => a.dex - b.dex || a.id - b.id)
    }
    return result
  }, [index, search, gens, types, game, sort, showMega, showGmax, showRegional, showOther, onlyFavs, favSet])

  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && setVisible((v) => v + PAGE),
      { rootMargin: '800px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [filtered.length])

  if (error) return <p className="empty-state">Erro ao carregar a Pokédex: {error.message}</p>
  if (!index) return <p className="loading">Carregando Pokédex...</p>

  return (
    <>
      <div className="filters">
        <div className="filters-row">
          <input
            className="search-input"
            type="search"
            placeholder="Buscar por nome ou número..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="control" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="dex-asc">Número ↑</option>
            <option value="dex-desc">Número ↓</option>
            <option value="name-asc">Nome A–Z</option>
            <option value="name-desc">Nome Z–A</option>
            <option value="type">Tipo</option>
          </select>
          <select className="control" value={game} onChange={(e) => setGame(Number(e.target.value))}>
            <option value={0}>Todos os jogos</option>
            {games?.versionGroups.map((vg) => (
              <option key={vg.id} value={vg.id}>
                {versionGroupLabel(vg.name)}
              </option>
            ))}
          </select>
        </div>

        <div className="filters-row">
          <span className="filter-label">Geração</span>
          {GENS.map((g) => (
            <button
              key={g}
              className={`chip${gens.has(g) ? ' on' : ''}`}
              onClick={() => setGens((prev) => toggleInSet(prev, g))}
              title={genLabel(g)}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="filters-row">
          <span className="filter-label">Tipo</span>
          {TYPES.map((t) => (
            <button
              key={t}
              className={`chip type-chip${types.has(t) ? ' on' : ''}`}
              style={{ '--chip-color': TYPE_COLORS[t] } as React.CSSProperties}
              onClick={() => setTypes((prev) => toggleInSet(prev, t))}
            >
              {TYPE_PT[t]}
            </button>
          ))}
        </div>

        <div className="filters-row">
          <span className="filter-label">Mostrar</span>
          <label className="toggle">
            <input type="checkbox" checked={showRegional} onChange={(e) => setShowRegional(e.target.checked)} />
            Formas regionais
          </label>
          <label className="toggle">
            <input type="checkbox" checked={showMega} onChange={(e) => setShowMega(e.target.checked)} />
            Megaevoluções
          </label>
          <label className="toggle">
            <input type="checkbox" checked={showGmax} onChange={(e) => setShowGmax(e.target.checked)} />
            Gigantamax
          </label>
          <label className="toggle">
            <input type="checkbox" checked={showOther} onChange={(e) => setShowOther(e.target.checked)} />
            Outras formas
          </label>
          <label className="toggle">
            <input type="checkbox" checked={onlyFavs} onChange={(e) => setOnlyFavs(e.target.checked)} />
            ★ Só favoritos
          </label>
        </div>
      </div>

      <p className="result-count">
        {filtered.length} Pokémon encontrado{filtered.length === 1 ? '' : 's'}
      </p>

      {filtered.length === 0 ? (
        <p className="empty-state">Nenhum Pokémon encontrado com esses filtros.</p>
      ) : (
        <div className="grid">
          {filtered.slice(0, visible).map((e) => (
            <PokemonCard key={e.id} entry={e} favorite={favSet.has(e.id)} />
          ))}
        </div>
      )}
      {visible < filtered.length && <div ref={sentinelRef} className="loading">Carregando mais...</div>}
    </>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { FilterSheet } from '../components/FilterSheet'
import { PokemonCard } from '../components/PokemonCard'
import { useGames, useIndex } from '../data/hooks'
import { useFavorites } from '../store/favorites'
import type { FormType, IndexEntry } from '../types'
import { displayName, versionGroupLabel } from '../utils/format'
import { SORT_OPTIONS, type SortKey } from '../utils/filters'
import { TYPE_COLORS, TYPE_PT, genLabel } from '../utils/i18n'

const GENS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const TYPES = Object.keys(TYPE_PT)
const PAGE = 120

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
  const [strictTypes, setStrictTypes] = useState(false)
  const [game, setGame] = useState(0)
  const [sort, setSort] = useState<SortKey>('dex-asc')
  const [showMega, setShowMega] = useState(false)
  const [showGmax, setShowGmax] = useState(false)
  const [showRegional, setShowRegional] = useState(true)
  const [showOther, setShowOther] = useState(false)
  const [onlyFavs, setOnlyFavs] = useState(false)
  const [onlyLegendary, setOnlyLegendary] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [visible, setVisible] = useState(PAGE)

  const filterKey = [search, [...gens], [...types], strictTypes, game, sort, showMega, showGmax, showRegional, showOther, onlyFavs, onlyLegendary].join('|')
  const [lastFilterKey, setLastFilterKey] = useState(filterKey)
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey)
    setVisible(PAGE)
  }

  const toggleType = (t: string) =>
    setTypes((prev) => {
      // busca exata limita a seleção a dois tipos
      if (strictTypes && !prev.has(t) && prev.size >= 2) return prev
      return toggleInSet(prev, t)
    })

  const handleStrict = (on: boolean) => {
    setStrictTypes(on)
    if (on) setTypes((prev) => (prev.size > 2 ? new Set([...prev].slice(0, 2)) : prev))
  }

  const clearAll = () => {
    setGens(new Set())
    setTypes(new Set())
    setStrictTypes(false)
    setGame(0)
    setShowMega(false)
    setShowGmax(false)
    setShowRegional(true)
    setShowOther(false)
    setOnlyFavs(false)
    setOnlyLegendary(false)
  }

  const activeFilters =
    gens.size +
    types.size +
    (game !== 0 ? 1 : 0) +
    (onlyFavs ? 1 : 0) +
    (onlyLegendary ? 1 : 0) +
    (showMega ? 1 : 0) +
    (showGmax ? 1 : 0) +
    (showOther ? 1 : 0) +
    (showRegional ? 0 : 1)

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
      if (types.size > 0) {
        if (strictTypes) {
          if (e.types.length !== types.size || !e.types.every((t) => types.has(t))) return false
        } else if (!e.types.some((t) => types.has(t))) {
          return false
        }
      }
      if (game !== 0 && !e.games.includes(game)) return false
      if (onlyFavs && !favSet.has(e.id)) return false
      if (onlyLegendary && !e.legendary) return false
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
  }, [index, search, gens, types, strictTypes, game, sort, showMega, showGmax, showRegional, showOther, onlyFavs, onlyLegendary, favSet])

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
      <div className="mobile-filter-bar">
        <input
          className="search-input"
          type="search"
          placeholder="Buscar um Pokémon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="filter-btn" onClick={() => setSheetOpen(true)} aria-label="Abrir filtros">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3" />
          </svg>
          {activeFilters > 0 && <span className="filter-badge">{activeFilters}</span>}
        </button>
      </div>

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
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
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
              onClick={() => toggleType(t)}
            >
              {TYPE_PT[t]}
            </button>
          ))}
          <label className="toggle" title="Mostrar apenas Pokémon com exatamente os tipos selecionados">
            <input type="checkbox" checked={strictTypes} onChange={(e) => handleStrict(e.target.checked)} />
            Busca exata
          </label>
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
            <input type="checkbox" checked={onlyLegendary} onChange={(e) => setOnlyLegendary(e.target.checked)} />
            ⭐ Só lendários
          </label>
          <label className="toggle">
            <input type="checkbox" checked={onlyFavs} onChange={(e) => setOnlyFavs(e.target.checked)} />
            ★ Só favoritos
          </label>
        </div>
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onClearAll={clearAll}
        index={index}
        games={games}
        onlyFavs={onlyFavs}
        onToggleFavs={() => setOnlyFavs((v) => !v)}
        categories={[
          { label: 'Formas regionais', on: showRegional, toggle: () => setShowRegional((v) => !v) },
          { label: 'Megaevoluções', on: showMega, toggle: () => setShowMega((v) => !v) },
          { label: 'Gigantamax', on: showGmax, toggle: () => setShowGmax((v) => !v) },
          { label: 'Outras formas', on: showOther, toggle: () => setShowOther((v) => !v) },
          { label: 'Lendários', on: onlyLegendary, toggle: () => setOnlyLegendary((v) => !v) },
        ]}
        categoriesApplied={!showRegional || showMega || showGmax || showOther || onlyLegendary}
        game={game}
        onGameChange={setGame}
        types={types}
        onToggleType={toggleType}
        onClearTypes={() => setTypes(new Set())}
        strictTypes={strictTypes}
        onStrictChange={handleStrict}
        gens={gens}
        onToggleGen={(g) => setGens((prev) => toggleInSet(prev, g))}
        onClearGens={() => setGens(new Set())}
        sort={sort}
        onSortChange={setSort}
      />

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

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { GamesData, IndexEntry } from '../types'
import { versionGroupLabel } from '../utils/format'
import { REGIONS, SORT_OPTIONS, type SortKey } from '../utils/filters'
import { TYPE_COLORS, TYPE_PT } from '../utils/i18n'

interface SectionProps {
  title: string
  summary: string
  applied: boolean
  onClear?: () => void
  defaultOpen?: boolean
  children: ReactNode
}

function SheetSection({ title, summary, applied, onClear, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="sheet-section">
      <div
        className="sheet-section-head"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOpen((o) => !o)}
      >
        <div>
          <h3>{title}</h3>
          <span className={`sheet-pill${applied ? ' applied' : ''}`}>{summary}</span>
          {applied && onClear && (
            <button
              className="sheet-clear"
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
            >
              Limpar
            </button>
          )}
        </div>
        <span className={`sheet-caret${open ? ' open' : ''}`}>▾</span>
      </div>
      {open && <div className="sheet-section-body">{children}</div>}
    </div>
  )
}

const selectionsLabel = (n: number) => `${n} ${n === 1 ? 'seleção' : 'seleções'}`

export interface CategoryOption {
  label: string
  on: boolean
  toggle: () => void
}

interface FilterSheetProps {
  open: boolean
  onClose: () => void
  onClearAll: () => void
  index: IndexEntry[]
  games: GamesData | null
  onlyFavs: boolean
  onToggleFavs: () => void
  categories: CategoryOption[]
  categoriesApplied: boolean
  game: number
  onGameChange: (id: number) => void
  types: Set<string>
  onToggleType: (t: string) => void
  onClearTypes: () => void
  strictTypes: boolean
  onStrictChange: (on: boolean) => void
  gens: Set<number>
  onToggleGen: (g: number) => void
  onClearGens: () => void
  sort: SortKey
  onSortChange: (s: SortKey) => void
}

export function FilterSheet({
  open,
  onClose,
  onClearAll,
  index,
  games,
  onlyFavs,
  onToggleFavs,
  categories,
  categoriesApplied,
  game,
  onGameChange,
  types,
  onToggleType,
  onClearTypes,
  strictTypes,
  onStrictChange,
  gens,
  onToggleGen,
  onClearGens,
  sort,
  onSortChange,
}: FilterSheetProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const spriteByDex = useMemo(() => {
    const map = new Map<number, string>()
    for (const e of index) {
      if (e.form === 'normal' && e.sprite && !map.has(e.dex)) map.set(e.dex, e.sprite)
    }
    return map
  }, [index])

  if (!open) return null

  const selectedGame = games?.versionGroups.find((vg) => vg.id === game)
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? ''
  const categoriesOn = categories.filter((c) => c.on).length

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Filtros de busca">
        <div className="sheet-handle" />
        <h2 className="sheet-title">Filtros de busca</h2>
        <div className="sheet-title-bar" />
        <p className="sheet-desc">
          Encontrar o Pokémon que você quer pode ser difícil. Aplique alguns filtros para refinar a
          sua busca e achar os que você procura.
        </p>

        <button className={`sheet-fav${onlyFavs ? ' on' : ''}`} onClick={onToggleFavs}>
          {onlyFavs ? '♥' : '♡'} Favoritos
        </button>

        <SheetSection
          title="Categoria"
          summary={categoriesApplied ? selectionsLabel(categoriesOn) : 'Nenhum filtro aplicado'}
          applied={categoriesApplied}
          defaultOpen
        >
          <div className="sheet-chip-grid cols-2">
            {categories.map((c) => (
              <button key={c.label} className={`sheet-chip${c.on ? ' on' : ''}`} onClick={c.toggle}>
                {c.label}
              </button>
            ))}
          </div>
        </SheetSection>

        <SheetSection
          title="Jogo"
          summary={selectedGame ? versionGroupLabel(selectedGame.name) : 'Nenhum filtro aplicado'}
          applied={game !== 0}
          onClear={() => onGameChange(0)}
        >
          <div className="sheet-chip-grid cols-2">
            {games?.versionGroups.map((vg) => (
              <button
                key={vg.id}
                className={`sheet-chip${game === vg.id ? ' on' : ''}`}
                onClick={() => onGameChange(game === vg.id ? 0 : vg.id)}
              >
                {versionGroupLabel(vg.name)}
              </button>
            ))}
          </div>
        </SheetSection>

        <SheetSection
          title="Tipos"
          summary={types.size > 0 ? selectionsLabel(types.size) : 'Nenhum filtro aplicado'}
          applied={types.size > 0}
          onClear={onClearTypes}
        >
          <div className="sheet-chip-grid cols-3">
            {Object.keys(TYPE_PT).map((t) => (
              <button
                key={t}
                className={`sheet-chip type-chip${types.has(t) ? ' on' : ''}`}
                style={{ '--chip-color': TYPE_COLORS[t] } as React.CSSProperties}
                onClick={() => onToggleType(t)}
              >
                <span className="type-dot" style={{ background: TYPE_COLORS[t] }} />
                {TYPE_PT[t]}
              </button>
            ))}
          </div>
          <div className="strict-row">
            <div>
              <h4>Busca exata</h4>
              <p>
                Ao ativar esta opção, você pode escolher até dois tipos. A Pokédex mostrará apenas
                os Pokémon que tenham exatamente o(s) tipo(s) que você procura.
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={strictTypes}
                onChange={(e) => onStrictChange(e.target.checked)}
              />
              <span />
            </label>
          </div>
        </SheetSection>

        <SheetSection
          title="Região"
          summary={gens.size > 0 ? selectionsLabel(gens.size) : 'Nenhum filtro aplicado'}
          applied={gens.size > 0}
          onClear={onClearGens}
        >
          <div className="region-grid">
            {REGIONS.map((r) => (
              <button
                key={r.gen}
                className={`region-chip${gens.has(r.gen) ? ' on' : ''}`}
                onClick={() => onToggleGen(r.gen)}
              >
                <span className="region-starters">
                  {r.starters.map(
                    (dex) =>
                      spriteByDex.get(dex) && (
                        <img key={dex} src={spriteByDex.get(dex)} alt="" loading="lazy" />
                      )
                  )}
                </span>
                {r.name}
              </button>
            ))}
          </div>
        </SheetSection>

        <SheetSection title="Ordenar" summary={sortLabel} applied={sort !== 'dex-asc'}>
          <div className="sheet-chip-grid cols-2">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                className={`sheet-chip${sort === o.value ? ' on' : ''}`}
                onClick={() => onSortChange(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </SheetSection>

        <div className="sheet-actions">
          <button className="sheet-btn clear" onClick={onClearAll}>
            ✕ Limpar tudo
          </button>
          <button className="sheet-btn apply" onClick={onClose}>
            ✓ Aplicar
          </button>
        </div>
      </div>
    </>
  )
}

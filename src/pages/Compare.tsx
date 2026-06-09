import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PokemonPicker } from '../components/PokemonPicker'
import { StatBars } from '../components/StatBars'
import { TypeBadge } from '../components/TypeBadge'
import { WeaknessList } from '../components/WeaknessList'
import { usePokemon, useTypes } from '../data/hooks'
import { displayName, formatDex } from '../utils/format'

function CompareSlot({ id, onChange }: { id: number | null; onChange: (id: number | null) => void }) {
  const { data: pokemon } = usePokemon(id ?? undefined)
  const { data: typesData } = useTypes()

  return (
    <div className="section compare-card">
      <PokemonPicker onPick={(e) => onChange(e.id)} placeholder="Escolher Pokémon..." />
      {id == null ? (
        <p className="empty-state">Selecione um Pokémon acima.</p>
      ) : !pokemon ? (
        <p className="loading">Carregando...</p>
      ) : (
        <>
          <Link to={`/pokemon/${pokemon.id}`}>
            <img src={pokemon.sprites.normal ?? ''} alt={displayName(pokemon.name)} />
            <h2 style={{ margin: '4px 0 0' }}>{displayName(pokemon.name)}</h2>
          </Link>
          <p className="genus" style={{ color: 'var(--text-muted)', margin: 0 }}>
            {formatDex(pokemon.dex)}
          </p>
          <div className="badges">
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
          <div style={{ textAlign: 'left' }}>
            <StatBars stats={pokemon.stats} />
            {typesData && (
              <div style={{ marginTop: 16 }}>
                <WeaknessList types={pokemon.types} typesData={typesData} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export function Compare() {
  const [left, setLeft] = useState<number | null>(null)
  const [right, setRight] = useState<number | null>(null)

  return (
    <>
      <h1 className="page-title">Comparador</h1>
      <p className="page-subtitle">Escolha dois Pokémon para comparar stats, tipos e fraquezas.</p>
      <div className="compare-grid">
        <CompareSlot id={left} onChange={setLeft} />
        <CompareSlot id={right} onChange={setRight} />
      </div>
    </>
  )
}

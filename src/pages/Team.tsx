import { useMemo } from 'react'
import { PokemonCard } from '../components/PokemonCard'
import { PokemonPicker } from '../components/PokemonPicker'
import { TypeBadge } from '../components/TypeBadge'
import { useIndex, useTypes } from '../data/hooks'
import { useFavorites } from '../store/favorites'
import { TEAM_SIZE, useTeam } from '../store/team'
import type { IndexEntry } from '../types'
import { computeWeaknesses } from '../utils/weakness'

export function Team() {
  const { data: index } = useIndex()
  const { data: typesData } = useTypes()
  const team = useTeam()
  const { ids: favIds } = useFavorites()

  const byId = useMemo(() => {
    const map = new Map<number, IndexEntry>()
    index?.forEach((e) => map.set(e.id, e))
    return map
  }, [index])

  const members = team.ids
    .map((id) => byId.get(id))
    .filter((e): e is IndexEntry => e != null)

  const coverage = useMemo(() => {
    if (!typesData || members.length === 0) return []
    return Object.keys(typesData).map((attacking) => {
      let weak = 0
      let resist = 0
      for (const m of members) {
        const mult = computeWeaknesses(m.types, typesData)[attacking]
        if (mult > 1) weak++
        else if (mult < 1) resist++
      }
      return { type: attacking, weak, resist }
    })
  }, [typesData, members])

  return (
    <>
      <h1 className="page-title">Minha equipe</h1>
      <p className="page-subtitle">
        Monte uma equipe de até {TEAM_SIZE} Pokémon e veja a cobertura defensiva combinada.
      </p>

      {!team.isFull && (
        <div style={{ maxWidth: 420, marginBottom: 18 }}>
          <PokemonPicker onPick={(e) => team.add(e.id)} placeholder="Adicionar à equipe..." />
        </div>
      )}

      <div className="team-slots">
        {Array.from({ length: TEAM_SIZE }, (_, i) => {
          const entry = members[i]
          return entry ? (
            <div className="team-slot filled" key={entry.id}>
              <button className="remove" title="Remover da equipe" onClick={() => team.remove(entry.id)}>
                ✕
              </button>
              <PokemonCard entry={entry} favorite={favIds.includes(entry.id)} />
            </div>
          ) : (
            <div className="team-slot" key={`empty-${i}`}>
              Vazio
            </div>
          )
        })}
      </div>

      {coverage.length > 0 && (
        <section className="section">
          <h2>Cobertura defensiva</h2>
          <p className="page-subtitle">
            Quantos membros são fracos ou resistentes contra cada tipo de ataque.
          </p>
          <div className="coverage-list">
            {coverage.map(({ type, weak, resist }) => (
              <span
                className="weakness-item"
                key={type}
                style={weak >= 2 && resist === 0 ? { outline: '2px solid var(--accent)' } : undefined}
                title={weak >= 2 && resist === 0 ? 'Atenção: fraqueza sem cobertura' : undefined}
              >
                <TypeBadge type={type} />
                {weak > 0 && <span style={{ color: 'var(--accent)' }}>▼{weak}</span>}
                {resist > 0 && <span style={{ color: '#3da5e0' }}>▲{resist}</span>}
                {weak === 0 && resist === 0 && '—'}
              </span>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

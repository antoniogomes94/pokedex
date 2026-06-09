import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EvolutionChain } from '../components/EvolutionChain'
import { MovesTable } from '../components/MovesTable'
import { StatBars } from '../components/StatBars'
import { TypeBadge } from '../components/TypeBadge'
import { WeaknessList } from '../components/WeaknessList'
import { useGames, useMoves, usePokemon, useTypes } from '../data/hooks'
import { useFavorites } from '../store/favorites'
import { useTeam } from '../store/team'
import { displayName, formatDex, formatHeight, formatWeight, prettify } from '../utils/format'
import { FORM_PT, genLabel } from '../utils/i18n'

export function PokemonDetail() {
  const { id } = useParams()
  const { data: pokemon, error } = usePokemon(id)
  const { data: typesData } = useTypes()
  const { data: gamesData } = useGames()
  const { data: movesData } = useMoves()
  const { isFavorite, toggle } = useFavorites()
  const team = useTeam()

  const [shiny, setShiny] = useState(false)
  const [lastId, setLastId] = useState(id)
  if (id !== lastId) {
    setLastId(id)
    setShiny(false)
  }
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const gameNames = useMemo(() => {
    if (!pokemon || !gamesData) return []
    return gamesData.versionGroups
      .filter((vg) => pokemon.games.includes(vg.id))
      .flatMap((vg) => vg.versions.map((v) => prettify(v.name)))
  }, [pokemon, gamesData])

  if (error) return <p className="empty-state">Pokémon não encontrado.</p>
  if (!pokemon) return <p className="loading">Carregando...</p>

  const fav = isFavorite(pokemon.id)
  const inTeam = team.inTeam(pokemon.id)
  const sprite = shiny ? (pokemon.sprites.shiny ?? pokemon.sprites.normal) : pokemon.sprites.normal
  const flavor = pokemon.flavor[pokemon.flavor.length - 1]
  const genderless = pokemon.genderRate === -1
  const femalePct = (pokemon.genderRate / 8) * 100

  const playCry = () => {
    if (!pokemon.cry) return
    audioRef.current?.pause()
    audioRef.current = new Audio(pokemon.cry)
    audioRef.current.volume = 0.4
    audioRef.current.play().catch(() => {})
  }

  return (
    <>
      <Link to="/" className="back-link">
        ← Voltar para a Pokédex
      </Link>

      <div className="detail-hero">
        <div className="detail-art">
          {shiny && <span className="shiny-tag">✨ Shiny</span>}
          <img src={sprite ?? ''} alt={displayName(pokemon.name)} />
        </div>
        <div className="detail-head">
          <span className="dex">
            {formatDex(pokemon.dex)} · {genLabel(pokemon.generation)}
            {pokemon.form !== 'normal' && ` · ${FORM_PT[pokemon.form]}`}
            {pokemon.isLegendary && ' · Lendário'}
            {pokemon.isMythical && ' · Mítico'}
          </span>
          <h1>{displayName(pokemon.name)}</h1>
          {pokemon.genus && <p className="genus">{pokemon.genus}</p>}
          <div className="badges">
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
          <div className="detail-actions">
            <button
              className={`action-btn${shiny ? ' on' : ''}`}
              onClick={() => setShiny((s) => !s)}
              disabled={!pokemon.sprites.shiny}
            >
              ✨ {shiny ? 'Ver normal' : 'Ver shiny'}
            </button>
            <button className={`action-btn fav${fav ? ' on' : ''}`} onClick={() => toggle(pokemon.id)}>
              {fav ? '★ Favoritado' : '☆ Favoritar'}
            </button>
            {pokemon.cry && (
              <button className="action-btn" onClick={playCry}>
                🔊 Ouvir
              </button>
            )}
            <button
              className={`action-btn${inTeam ? ' on' : ''}`}
              onClick={() => (inTeam ? team.remove(pokemon.id) : team.add(pokemon.id))}
              disabled={!inTeam && team.isFull}
              title={!inTeam && team.isFull ? 'Equipe cheia (6)' : undefined}
            >
              {inTeam ? '✓ Na equipe' : '+ Equipe'}
            </button>
          </div>
        </div>
      </div>

      <section className="section">
        <h2>Sobre</h2>
        {flavor && <p className="flavor">“{flavor.text}”</p>}
        <div className="about-grid">
          <div className="item">
            <span>Altura</span>
            {formatHeight(pokemon.height)}
          </div>
          <div className="item">
            <span>Peso</span>
            {formatWeight(pokemon.weight)}
          </div>
          <div className="item">
            <span>Habilidades</span>
            {pokemon.abilities.map((a) => prettify(a.name) + (a.hidden ? ' (oculta)' : '')).join(', ')}
          </div>
          <div className="item">
            <span>Grupos de ovo</span>
            {pokemon.eggGroups.map(prettify).join(', ') || '—'}
          </div>
          <div className="item">
            <span>Gênero</span>
            {genderless ? 'Sem gênero' : `${100 - femalePct}% ♂ / ${femalePct}% ♀`}
          </div>
          <div className="item">
            <span>Taxa de captura</span>
            {pokemon.captureRate}
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Estatísticas base</h2>
        <StatBars stats={pokemon.stats} />
      </section>

      {typesData && (
        <section className="section">
          <h2>Fraquezas e resistências</h2>
          <WeaknessList types={pokemon.types} typesData={typesData} />
        </section>
      )}

      {pokemon.evolution && (
        <section className="section">
          <h2>Linha evolutiva</h2>
          <EvolutionChain root={pokemon.evolution} currentSpecies={pokemon.speciesId} />
        </section>
      )}

      {pokemon.varieties.length > 1 && (
        <section className="section">
          <h2>Formas e variações</h2>
          <div className="forms-grid">
            {pokemon.varieties.map((v) => (
              <Link
                key={v.id}
                to={`/pokemon/${v.id}`}
                className={`form-card${v.id === pokemon.id ? ' current' : ''}`}
              >
                <img src={v.sprite ?? ''} loading="lazy" alt={displayName(v.name)} />
                <span className="name">{displayName(v.name)}</span>
                <span className="label">{FORM_PT[v.form]}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {movesData && gamesData && (
        <section className="section">
          <h2>Golpes</h2>
          <MovesTable pokemon={pokemon} movesData={movesData} gamesData={gamesData} />
        </section>
      )}

      {gameNames.length > 0 && (
        <section className="section">
          <h2>Aparece nos jogos</h2>
          <div className="games-list">
            {[...new Set(gameNames)].map((g) => (
              <span className="game-chip" key={g}>
                {g}
              </span>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

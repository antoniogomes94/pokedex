import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { IndexEntry } from '../types'
import { displayName, formatDex } from '../utils/format'
import { FORM_PT } from '../utils/i18n'
import { TypeBadge } from './TypeBadge'

export const PokemonCard = memo(function PokemonCard({
  entry,
  favorite,
}: {
  entry: IndexEntry
  favorite: boolean
}) {
  return (
    <Link to={`/pokemon/${entry.id}`} className="card">
      {entry.form !== 'normal' && <span className="card-form">{FORM_PT[entry.form]}</span>}
      {favorite && (
        <span className="card-fav" title="Favorito">
          ★
        </span>
      )}
      <img src={entry.sprite ?? ''} loading="lazy" width={110} height={110} alt={displayName(entry.name)} />
      <span className="card-dex">{formatDex(entry.dex)}</span>
      <h3>{displayName(entry.name)}</h3>
      <div className="badges">
        {entry.types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
    </Link>
  )
})

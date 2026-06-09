import { useMemo, useState } from 'react'
import type { GamesData, MovesData, PokemonDetail } from '../types'
import { prettify, versionGroupLabel } from '../utils/format'
import { DAMAGE_CLASS_PT, METHOD_PT } from '../utils/i18n'
import { TypeBadge } from './TypeBadge'

const METHOD_ORDER = ['lv', 'tm', 'egg', 'tutor', 'other']

export function MovesTable({
  pokemon,
  movesData,
  gamesData,
}: {
  pokemon: PokemonDetail
  movesData: MovesData
  gamesData: GamesData
}) {
  const availableVgs = useMemo(
    () => gamesData.versionGroups.filter((vg) => pokemon.games.includes(vg.id)),
    [gamesData, pokemon]
  )
  const [vg, setVg] = useState(() => availableVgs[availableVgs.length - 1]?.id ?? 0)

  const methodsInVg = useMemo(() => {
    const set = new Set<string>()
    for (const m of pokemon.moves)
      for (const [g, method] of m.learn) if (g === vg) set.add(method as string)
    return METHOD_ORDER.filter((m) => set.has(m))
  }, [pokemon, vg])

  const [method, setMethod] = useState('lv')
  const activeMethod = methodsInVg.includes(method) ? method : (methodsInVg[0] ?? 'lv')

  const rows = useMemo(() => {
    const list = pokemon.moves
      .map((m) => {
        const learn = m.learn.find(([g, mt]) => g === vg && mt === activeMethod)
        return learn ? { id: m.id, level: learn[2] as number, info: movesData[m.id] } : null
      })
      .filter((r): r is NonNullable<typeof r> => r != null && r.info != null)
    if (activeMethod === 'lv') list.sort((a, b) => a.level - b.level)
    else list.sort((a, b) => a.info.name.localeCompare(b.info.name))
    return list
  }, [pokemon, vg, activeMethod, movesData])

  if (availableVgs.length === 0) return <p className="flavor">Sem dados de golpes.</p>

  return (
    <>
      <div className="moves-controls">
        <select className="control" value={vg} onChange={(e) => setVg(Number(e.target.value))}>
          {availableVgs.map((g) => (
            <option key={g.id} value={g.id}>
              {versionGroupLabel(g.name)}
            </option>
          ))}
        </select>
        {methodsInVg.map((m) => (
          <button
            key={m}
            className={`chip${m === activeMethod ? ' on' : ''}`}
            onClick={() => setMethod(m)}
          >
            {METHOD_PT[m] ?? m}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="flavor">Nenhum golpe nesse jogo/método.</p>
      ) : (
        <div className="moves-wrap">
          <table className="moves-table">
            <thead>
              <tr>
                {activeMethod === 'lv' && <th>Nível</th>}
                <th>Golpe</th>
                <th>Tipo</th>
                <th>Classe</th>
                <th>Poder</th>
                <th>Precisão</th>
                <th>PP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  {activeMethod === 'lv' && <td>{r.level === 0 ? '—' : r.level}</td>}
                  <td>{prettify(r.info.name)}</td>
                  <td>{r.info.type ? <TypeBadge type={r.info.type} /> : '—'}</td>
                  <td>{r.info.class ? (DAMAGE_CLASS_PT[r.info.class] ?? r.info.class) : '—'}</td>
                  <td>{r.info.power ?? '—'}</td>
                  <td>{r.info.accuracy != null ? `${r.info.accuracy}%` : '—'}</td>
                  <td>{r.info.pp ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

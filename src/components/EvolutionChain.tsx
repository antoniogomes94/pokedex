import { Link } from 'react-router-dom'
import type { EvoNode } from '../types'
import { prettify } from '../utils/format'

const ART = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'

function EvoCard({ node, currentSpecies }: { node: EvoNode; currentSpecies: number }) {
  return (
    <Link
      to={`/pokemon/${node.speciesId}`}
      className={`evo-card${node.speciesId === currentSpecies ? ' current' : ''}`}
    >
      <img src={`${ART}/${node.speciesId}.png`} loading="lazy" alt={prettify(node.species)} />
      <span className="name">{prettify(node.species)}</span>
    </Link>
  )
}

function EvoNodeView({ node, currentSpecies }: { node: EvoNode; currentSpecies: number }) {
  return (
    <div className="evo-node">
      <EvoCard node={node} currentSpecies={currentSpecies} />
      {node.evolvesTo.length > 0 && (
        <div className="evo-stage">
          {node.evolvesTo.map((child) => (
            <div className="evo-node" key={child.speciesId}>
              <div className="evo-arrow">
                <span className="arr">➜</span>
                {child.conditions && child.conditions.length > 0
                  ? [...new Set(child.conditions)].join(' ou ')
                  : ''}
              </div>
              <EvoNodeView node={child} currentSpecies={currentSpecies} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function EvolutionChain({ root, currentSpecies }: { root: EvoNode; currentSpecies: number }) {
  if (root.evolvesTo.length === 0) {
    return <p className="flavor">Este Pokémon não evolui.</p>
  }
  return (
    <div className="evo-chain">
      <EvoNodeView node={root} currentSpecies={currentSpecies} />
    </div>
  )
}

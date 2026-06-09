import type { TypesData } from '../types'
import { computeWeaknesses, formatMultiplier } from '../utils/weakness'
import { TypeBadge } from './TypeBadge'

export function WeaknessList({ types, typesData }: { types: string[]; typesData: TypesData }) {
  const mults = computeWeaknesses(types, typesData)
  const weak = Object.entries(mults).filter(([, m]) => m > 1)
  const resist = Object.entries(mults).filter(([, m]) => m > 0 && m < 1)
  const immune = Object.entries(mults).filter(([, m]) => m === 0)

  const renderGroup = (label: string, list: [string, number][]) =>
    list.length > 0 && (
      <div style={{ marginBottom: 12 }}>
        <p className="filter-label" style={{ margin: '0 0 6px' }}>
          {label}
        </p>
        <div className="weakness-grid">
          {list
            .sort((a, b) => b[1] - a[1])
            .map(([type, mult]) => (
              <span className="weakness-item" key={type}>
                <TypeBadge type={type} />
                {formatMultiplier(mult)}
              </span>
            ))}
        </div>
      </div>
    )

  return (
    <>
      {renderGroup('Fraquezas', weak)}
      {renderGroup('Resistências', resist)}
      {renderGroup('Imunidades', immune)}
    </>
  )
}

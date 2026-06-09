import { STAT_PT } from '../utils/i18n'

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed']
const MAX_STAT = 255

function barColor(value: number) {
  if (value < 50) return '#e3564d'
  if (value < 80) return '#f5b301'
  if (value < 110) return '#7bb662'
  return '#3da5e0'
}

export function StatBars({ stats }: { stats: Record<string, number> }) {
  const total = STAT_ORDER.reduce((sum, s) => sum + (stats[s] ?? 0), 0)
  return (
    <div>
      {STAT_ORDER.map((s) => (
        <div className="stat-row" key={s}>
          <span className="name">{STAT_PT[s] ?? s}</span>
          <span className="value">{stats[s] ?? 0}</span>
          <div className="stat-bar">
            <div
              style={{
                width: `${Math.min(100, ((stats[s] ?? 0) / MAX_STAT) * 100)}%`,
                background: barColor(stats[s] ?? 0),
              }}
            />
          </div>
        </div>
      ))}
      <p className="stat-total">Total: {total}</p>
    </div>
  )
}

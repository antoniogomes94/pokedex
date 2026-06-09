import { TYPE_COLORS, TYPE_PT } from '../utils/i18n'

export function TypeBadge({ type }: { type: string }) {
  return (
    <span className="type-badge" style={{ background: TYPE_COLORS[type] ?? '#888' }}>
      {TYPE_PT[type] ?? type}
    </span>
  )
}

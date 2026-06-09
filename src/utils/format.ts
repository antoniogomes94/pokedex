const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1)

export const prettify = (slug: string) => slug.split('-').map(cap).join(' ')

/** "venusaur-mega" → "Mega Venusaur", "raichu-alola" → "Raichu de Alola" */
export function displayName(name: string): string {
  let m = name.match(/^(.*)-mega(?:-([xy]))?$/)
  if (m) return `Mega ${prettify(m[1])}${m[2] ? ` ${m[2].toUpperCase()}` : ''}`
  m = name.match(/^(.*)-gmax$/)
  if (m) return `${prettify(m[1])} Gigantamax`
  m = name.match(/^(.*)-(alola|galar|hisui|paldea)(-.+)?$/)
  if (m) {
    const region = { alola: 'Alola', galar: 'Galar', hisui: 'Hisui', paldea: 'Paldeia' }[m[2]]
    return `${prettify(m[1])}${m[3] ? ` ${prettify(m[3].slice(1))}` : ''} de ${region}`
  }
  return prettify(name)
}

export const formatDex = (dex: number) => `#${String(dex).padStart(4, '0')}`

export const formatHeight = (dm: number) => `${(dm / 10).toFixed(1).replace('.', ',')} m`

export const formatWeight = (hg: number) => `${(hg / 10).toFixed(1).replace('.', ',')} kg`

/** "red-blue" → "Red / Blue" */
export const versionGroupLabel = (name: string) =>
  name === 'colosseum' || name === 'xd'
    ? prettify(name)
    : name.split('-').length > 1 && ['red-blue', 'gold-silver', 'black-white'].includes(name)
      ? name.split('-').map(cap).join(' / ')
      : prettify(name)

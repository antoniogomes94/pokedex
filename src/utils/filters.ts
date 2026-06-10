export type SortKey = 'dex-asc' | 'dex-desc' | 'name-asc' | 'name-desc' | 'type'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'dex-asc', label: 'Número ↑' },
  { value: 'dex-desc', label: 'Número ↓' },
  { value: 'name-asc', label: 'Nome A–Z' },
  { value: 'name-desc', label: 'Nome Z–A' },
  { value: 'type', label: 'Tipo' },
]

/** Regiões na ordem das gerações; os números são as dex dos iniciais usadas como ícone */
export const REGIONS: { gen: number; name: string; starters: number[] }[] = [
  { gen: 1, name: 'Kanto', starters: [1, 4, 7] },
  { gen: 2, name: 'Johto', starters: [152, 155, 158] },
  { gen: 3, name: 'Hoenn', starters: [252, 255, 258] },
  { gen: 4, name: 'Sinnoh', starters: [387, 390, 393] },
  { gen: 5, name: 'Unova', starters: [495, 498, 501] },
  { gen: 6, name: 'Kalos', starters: [650, 653, 656] },
  { gen: 7, name: 'Alola', starters: [722, 725, 728] },
  { gen: 8, name: 'Galar', starters: [810, 813, 816] },
  { gen: 9, name: 'Paldea', starters: [906, 909, 912] },
]

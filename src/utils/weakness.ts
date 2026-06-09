import type { TypesData } from '../types'

/**
 * Multiplicador de dano recebido por tipo de ataque, combinando os tipos
 * defensivos do Pokémon (ex.: 4, 2, 1, 0.5, 0.25, 0).
 */
export function computeWeaknesses(
  defendingTypes: string[],
  typesData: TypesData
): Record<string, number> {
  const result: Record<string, number> = {}
  for (const attacking of Object.keys(typesData)) {
    let mult = 1
    for (const def of defendingTypes) {
      const info = typesData[def]
      if (!info) continue
      if (info.noFrom.includes(attacking)) mult *= 0
      else if (info.doubleFrom.includes(attacking)) mult *= 2
      else if (info.halfFrom.includes(attacking)) mult *= 0.5
    }
    result[attacking] = mult
  }
  return result
}

export function formatMultiplier(mult: number): string {
  if (mult === 0.5) return '½×'
  if (mult === 0.25) return '¼×'
  return `${mult}×`
}

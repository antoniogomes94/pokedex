export type FormType =
  | 'normal'
  | 'mega'
  | 'gmax'
  | 'alolan'
  | 'galarian'
  | 'hisuian'
  | 'paldean'
  | 'other'

export interface IndexEntry {
  id: number
  dex: number
  name: string
  types: string[]
  gen: number
  form: FormType
  sprite: string | null
  games: number[]
  legendary: boolean
}

export interface EvoNode {
  species: string
  speciesId: number
  conditions?: string[]
  evolvesTo: EvoNode[]
}

export interface Variety {
  id: number
  name: string
  form: FormType
  sprite: string | null
}

/** Tupla [versionGroupId, método ('lv' | 'tm' | 'egg' | 'tutor' | 'other'), nível] */
export type LearnDetail = [number, string, number]

export interface PokemonDetail {
  id: number
  name: string
  speciesId: number
  dex: number
  form: FormType
  generation: number
  types: string[]
  stats: Record<string, number>
  abilities: { name: string; hidden: boolean }[]
  height: number
  weight: number
  baseExp: number | null
  sprites: { normal: string | null; shiny: string | null; icon: string | null }
  cry: string | null
  genus: string | null
  flavor: { version: string; text: string }[]
  genderRate: number
  captureRate: number
  eggGroups: string[]
  isLegendary: boolean
  isMythical: boolean
  evolution: EvoNode | null
  varieties: Variety[]
  games: number[]
  moves: { id: number; learn: LearnDetail[] }[]
}

export interface TypeInfo {
  id: number
  doubleFrom: string[]
  halfFrom: string[]
  noFrom: string[]
  doubleTo: string[]
  halfTo: string[]
  noTo: string[]
}
export type TypesData = Record<string, TypeInfo>

export interface VersionGroup {
  id: number
  name: string
  generation: number
  versions: { id: number; name: string }[]
}
export interface GamesData {
  versionGroups: VersionGroup[]
}

export interface MoveInfo {
  name: string
  type: string | null
  class: string | null
  power: number | null
  accuracy: number | null
  pp: number | null
}
export type MovesData = Record<string, MoveInfo>

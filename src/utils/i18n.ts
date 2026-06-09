import type { FormType } from '../types'

export const TYPE_PT: Record<string, string> = {
  normal: 'Normal',
  fighting: 'Lutador',
  flying: 'Voador',
  poison: 'Veneno',
  ground: 'Terra',
  rock: 'Pedra',
  bug: 'Inseto',
  ghost: 'Fantasma',
  steel: 'Aço',
  fire: 'Fogo',
  water: 'Água',
  grass: 'Planta',
  electric: 'Elétrico',
  psychic: 'Psíquico',
  ice: 'Gelo',
  dragon: 'Dragão',
  dark: 'Sombrio',
  fairy: 'Fada',
}

export const TYPE_COLORS: Record<string, string> = {
  normal: '#9aa07c',
  fighting: '#c1302b',
  flying: '#a890f0',
  poison: '#a3409f',
  ground: '#dcb55b',
  rock: '#b8a038',
  bug: '#a4b021',
  ghost: '#705898',
  steel: '#8a8aa8',
  fire: '#f08030',
  water: '#5d84e0',
  grass: '#71b94e',
  electric: '#e9bb1d',
  psychic: '#f85888',
  ice: '#79cdc8',
  dragon: '#7043f4',
  dark: '#705848',
  fairy: '#e88fb5',
}

export const STAT_PT: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'At. Especial',
  'special-defense': 'Def. Especial',
  speed: 'Velocidade',
}

export const METHOD_PT: Record<string, string> = {
  lv: 'Por nível',
  tm: 'TM / HM',
  egg: 'Ovo',
  tutor: 'Tutor',
  other: 'Outro',
}

export const FORM_PT: Record<FormType, string> = {
  normal: 'Normal',
  mega: 'Megaevolução',
  gmax: 'Gigantamax',
  alolan: 'Forma de Alola',
  galarian: 'Forma de Galar',
  hisuian: 'Forma de Hisui',
  paldean: 'Forma de Paldea',
  other: 'Outra forma',
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
export const genLabel = (gen: number) => `Geração ${ROMAN[gen - 1] ?? gen}`

export const DAMAGE_CLASS_PT: Record<string, string> = {
  physical: 'Físico',
  special: 'Especial',
  status: 'Status',
}

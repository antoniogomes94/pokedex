import type { GamesData, IndexEntry, MovesData, PokemonDetail, TypesData } from '../types'

const cache = new Map<string, Promise<unknown>>()

function fetchData<T>(file: string): Promise<T> {
  let promise = cache.get(file)
  if (!promise) {
    promise = fetch(`${import.meta.env.BASE_URL}data/${file}`).then((res) => {
      if (!res.ok) {
        cache.delete(file)
        throw new Error(`Falha ao carregar ${file}: HTTP ${res.status}`)
      }
      return res.json()
    })
    cache.set(file, promise)
  }
  return promise as Promise<T>
}

export const loadIndex = () => fetchData<IndexEntry[]>('index.json')
export const loadTypes = () => fetchData<TypesData>('types.json')
export const loadGames = () => fetchData<GamesData>('games.json')
export const loadMoves = () => fetchData<MovesData>('moves.json')
export const loadPokemon = (id: number | string) => fetchData<PokemonDetail>(`pokemon/${id}.json`)

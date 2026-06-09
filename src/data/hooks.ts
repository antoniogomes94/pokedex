import { useEffect, useState } from 'react'
import { loadGames, loadIndex, loadMoves, loadPokemon, loadTypes } from './api'
import type { GamesData, IndexEntry, MovesData, PokemonDetail, TypesData } from '../types'

interface Async<T> {
  data: T | null
  error: Error | null
}

function useAsync<T>(loader: () => Promise<T>, key: unknown): Async<T> {
  const [state, setState] = useState<Async<T>>({ data: null, error: null })
  const [lastKey, setLastKey] = useState(key)
  if (key !== lastKey) {
    setLastKey(key)
    setState({ data: null, error: null })
  }
  useEffect(() => {
    let active = true
    loader().then(
      (data) => active && setState({ data, error: null }),
      (error) => active && setState({ data: null, error })
    )
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return state
}

export const useIndex = (): Async<IndexEntry[]> => useAsync(loadIndex, 'index')
export const useTypes = (): Async<TypesData> => useAsync(loadTypes, 'types')
export const useGames = (): Async<GamesData> => useAsync(loadGames, 'games')
export const useMoves = (): Async<MovesData> => useAsync(loadMoves, 'moves')
export const usePokemon = (id: number | string | undefined): Async<PokemonDetail> =>
  useAsync(() => (id != null ? loadPokemon(id) : Promise.reject(new Error('sem id'))), id)

import { createStore } from './localStore'

const store = createStore<number[]>('pokedex:favorites', [])

export function useFavorites() {
  const ids = store.use()
  return {
    ids,
    isFavorite: (id: number) => ids.includes(id),
    toggle: (id: number) =>
      store.set((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
  }
}

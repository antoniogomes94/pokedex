import { createStore } from './localStore'

export const TEAM_SIZE = 6

const store = createStore<number[]>('pokedex:team', [])

export function useTeam() {
  const ids = store.use()
  return {
    ids,
    isFull: ids.length >= TEAM_SIZE,
    inTeam: (id: number) => ids.includes(id),
    add: (id: number) =>
      store.set((prev) => (prev.includes(id) || prev.length >= TEAM_SIZE ? prev : [...prev, id])),
    remove: (id: number) => store.set((prev) => prev.filter((x) => x !== id)),
  }
}

import { useEffect } from 'react'
import { createStore } from './localStore'

type Theme = 'light' | 'dark'

const systemTheme: Theme =
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'

const store = createStore<Theme>('pokedex:theme', systemTheme)

export function useTheme() {
  const theme = store.use()
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  return { theme, toggle: () => store.set((t) => (t === 'dark' ? 'light' : 'dark')) }
}

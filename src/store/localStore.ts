import { useSyncExternalStore } from 'react'

/** Store mínimo sincronizado com localStorage e compartilhado entre componentes. */
export function createStore<T>(key: string, initial: T) {
  let value: T = initial
  try {
    const raw = localStorage.getItem(key)
    if (raw != null) value = JSON.parse(raw) as T
  } catch {
    /* localStorage indisponível ou corrompido */
  }
  const listeners = new Set<() => void>()
  const get = () => value
  const set = (next: T | ((prev: T) => T)) => {
    value = typeof next === 'function' ? (next as (prev: T) => T)(value) : next
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l())
  }
  const subscribe = (l: () => void) => {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }
  const use = () => useSyncExternalStore(subscribe, get)
  return { get, set, use }
}

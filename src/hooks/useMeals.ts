import { useCallback, useEffect, useState } from 'react'
import { fetchMeals } from '../lib/meals'
import type { Meal } from '../types'

export function useMeals(listId: string | undefined) {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!listId) return
    setError(null)
    try {
      setMeals(await fetchMeals(listId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load meals')
    } finally {
      setLoading(false)
    }
  }, [listId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { meals, loading, error, refresh, setMeals }
}

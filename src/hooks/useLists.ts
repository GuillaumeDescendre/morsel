import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { fetchLists, type ListWithMeta } from '../lib/lists'

export function useLists() {
  const { user } = useAuth()
  const [lists, setLists] = useState<ListWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) return
    setError(null)
    try {
      setLists(await fetchLists(user.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load your lists')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { lists, loading, error, refresh }
}

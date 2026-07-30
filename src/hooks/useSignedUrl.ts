import { useEffect, useState } from 'react'
import { getSignedUrl } from '../lib/photos'

/** Resolve a private Storage path to a short-lived signed URL for display. */
export function useSignedUrl(path: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (!path) {
      setUrl(null)
      return
    }
    getSignedUrl(path).then((u) => {
      if (active) setUrl(u)
    })
    return () => {
      active = false
    }
  }, [path])

  return url
}

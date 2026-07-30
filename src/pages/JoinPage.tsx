import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { joinListViaToken } from '../lib/collab'
import { Button } from '../components/ui'
import { FullScreenLoader } from '../components/Loader'

type Status = 'idle' | 'joining' | 'error'

export default function JoinPage() {
  const { token } = useParams<{ token: string }>()
  const { session, loading, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('idle')
  const attempted = useRef(false)

  useEffect(() => {
    if (loading || !session || !token || attempted.current) return
    attempted.current = true
    setStatus('joining')
    joinListViaToken(token)
      .then((listId) => {
        if (listId) navigate(`/list/${listId}`, { replace: true })
        else setStatus('error')
      })
      .catch(() => setStatus('error'))
  }, [loading, session, token, navigate])

  if (loading) return <FullScreenLoader />

  // Not signed in → prompt sign-in, returning to this same join URL afterwards.
  if (!session) {
    return (
      <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-mint-100 text-5xl shadow-soft">
          🤝
        </div>
        <h1 className="text-2xl font-extrabold text-ink-900">You've been invited</h1>
        <p className="mt-2 max-w-xs text-ink-500">
          Sign in to join this meal list and start adding and rating meals together.
        </p>
        <Button
          onClick={() => signInWithGoogle(window.location.href)}
          variant="soft"
          className="mt-8 w-full bg-surface shadow-card ring-1 ring-black/[0.04]"
        >
          Continue with Google to join
        </Button>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl">🙈</p>
        <h1 className="mt-3 text-xl font-bold text-ink-900">This link isn't valid</h1>
        <p className="mt-1 text-ink-500">It may have been revoked or is incorrect.</p>
        <Button className="mt-5" onClick={() => navigate('/', { replace: true })}>
          Go to my lists
        </Button>
      </div>
    )
  }

  return <FullScreenLoader />
}

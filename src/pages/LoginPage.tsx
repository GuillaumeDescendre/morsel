import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Button } from '../components/ui'
import { FullScreenLoader } from '../components/Loader'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  )
}

export default function LoginPage() {
  const { session, loading, signInWithGoogle } = useAuth()

  if (loading) return <FullScreenLoader />
  if (session) return <Navigate to="/" replace />

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-peach-100 text-5xl shadow-soft">
        🍽️
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-ink-900">Morsel</h1>
      <p className="mt-2 max-w-xs text-ink-500">
        Keep track of every meal you've tried — rate it, note it, and share lists with the people
        you cook with.
      </p>

      <Button
        onClick={() => signInWithGoogle()}
        variant="soft"
        className="mt-8 w-full bg-surface shadow-card ring-1 ring-black/[0.04] hover:bg-peach-50"
      >
        <GoogleIcon />
        <span className="text-ink-900">Continue with Google</span>
      </Button>

      <p className="mt-6 text-xs text-ink-300">
        By continuing you agree to our Terms &amp; Privacy Policy.
      </p>
    </div>
  )
}

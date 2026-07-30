import { useAuth } from '../lib/auth'
import { Button, Card } from '../components/ui'

// Temporary home — real lists overview lands in Phase 3.
export default function HomePage() {
  const { profile, user, signOut } = useAuth()
  const name = profile?.display_name ?? user?.email ?? 'there'

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col px-5 pb-10 pt-12">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-500">Signed in as</p>
          <h1 className="text-xl font-extrabold text-ink-900">{name}</h1>
        </div>
        {profile?.avatar_url && (
          <img
            src={profile.avatar_url}
            alt=""
            className="h-11 w-11 rounded-full ring-2 ring-white shadow-card"
          />
        )}
      </header>

      <Card className="p-6 text-center">
        <p className="text-2xl">✅</p>
        <h2 className="mt-2 text-lg font-bold text-ink-900">You're signed in!</h2>
        <p className="mt-1 text-sm text-ink-500">
          Auth is working. Your lists overview arrives in the next phase.
        </p>
      </Card>

      <Button variant="ghost" className="mt-6 self-center" onClick={signOut}>
        Sign out
      </Button>
    </div>
  )
}

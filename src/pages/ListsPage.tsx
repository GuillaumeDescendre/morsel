import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useLists } from '../hooks/useLists'
import { createList } from '../lib/lists'
import { AvatarMenu } from '../components/AvatarMenu'
import { ListFormModal } from '../components/ListFormModal'
import { Card, Spinner } from '../components/ui'

export default function ListsPage() {
  const { profile } = useAuth()
  const { lists, loading, error, refresh } = useLists()
  const [creating, setCreating] = useState(false)

  const firstName = (profile?.display_name ?? '').split(' ')[0] || 'there'

  const handleCreate = async (name: string, emoji: string) => {
    await createList({ name, emoji })
    await refresh()
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col px-5 pb-28 pt-12">
      <header className="mb-7 flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-500">Hi {firstName} 👋</p>
          <h1 className="text-2xl font-extrabold text-ink-900">Your lists</h1>
        </div>
        <AvatarMenu />
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : error ? (
        <Card className="p-5 text-center text-blush-300">{error}</Card>
      ) : lists.length === 0 ? (
        <EmptyState onCreate={() => setCreating(true)} />
      ) : (
        <div className="flex flex-col gap-3">
          {lists.map((list) => (
            <Link key={list.id} to={`/list/${list.id}`} className="block">
              <Card className="flex items-center gap-4 p-4 transition active:scale-[0.99]">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-peach-100 text-3xl">
                  {list.emoji ?? '🍽️'}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-bold text-ink-900">{list.name}</h2>
                  <p className="text-sm text-ink-500">
                    {list.memberCount > 1 ? `Shared · ${list.memberCount} people` : 'Just you'}
                    {list.myRole !== 'owner' && ` · ${list.myRole}`}
                  </p>
                </div>
                <span className="text-ink-300">›</span>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Floating create button */}
      <button
        onClick={() => setCreating(true)}
        className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-peach-500 px-6 py-3.5 font-bold text-white shadow-soft transition active:scale-95"
        style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <span className="text-xl leading-none">＋</span> New list
      </button>

      <ListFormModal
        open={creating}
        onClose={() => setCreating(false)}
        onSubmit={handleCreate}
        title="New meal list"
        submitLabel="Create list"
      />
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="mt-6 flex flex-col items-center p-8 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-mint-100 text-5xl">
        🥘
      </div>
      <h2 className="text-lg font-bold text-ink-900">No lists yet</h2>
      <p className="mt-1 max-w-xs text-sm text-ink-500">
        Create your first list — like “Weeknight dinners” or “Restaurants to remember” — and start
        collecting the meals worth making again.
      </p>
      <button
        onClick={onCreate}
        className="mt-5 rounded-full bg-peach-500 px-6 py-2.5 font-bold text-white shadow-soft transition active:scale-95"
      >
        Create a list
      </button>
    </Card>
  )
}

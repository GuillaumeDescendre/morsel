import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { deleteList, fetchList, leaveList, updateList, type ListWithMeta } from '../lib/lists'
import { Card, Spinner } from '../components/ui'
import { ListFormModal } from '../components/ListFormModal'
import { ConfirmDialog } from '../components/Modal'
import { FullScreenLoader } from '../components/Loader'
import { useMeals } from '../hooks/useMeals'
import { MealCard } from '../components/MealCard'
import { MealFormModal } from '../components/MealFormModal'
import { MealDetailSheet } from '../components/MealDetailSheet'
import { ShareSheet } from '../components/ShareSheet'
import type { Meal } from '../types'

export default function ListPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [list, setList] = useState<ListWithMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { meals, loading: mealsLoading, refresh: refreshMeals } = useMeals(id)
  const [mealFormOpen, setMealFormOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)

  const load = useCallback(async () => {
    if (!id || !user) return
    try {
      const l = await fetchList(id, user.id)
      if (!l) setNotFound(true)
      else setList(l)
    } finally {
      setLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  if (loading) return <FullScreenLoader />

  if (notFound || !list) {
    return (
      <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-5 text-center">
        <p className="text-5xl">🤔</p>
        <h1 className="mt-3 text-xl font-bold text-ink-900">List not found</h1>
        <p className="mt-1 text-ink-500">It may have been deleted, or you no longer have access.</p>
        <Link to="/" className="mt-5 font-bold text-peach-600">
          ← Back to your lists
        </Link>
      </div>
    )
  }

  const isOwner = list.myRole === 'owner'
  const canEdit = list.myRole === 'owner' || list.myRole === 'editor'

  const handleRename = async (name: string, emoji: string) => {
    await updateList(list.id, { name, emoji })
    setList({ ...list, name, emoji })
  }

  const handleDelete = async () => {
    setBusy(true)
    try {
      await deleteList(list.id)
      navigate('/', { replace: true })
    } finally {
      setBusy(false)
    }
  }

  const handleLeave = async () => {
    if (!user) return
    setBusy(true)
    try {
      await leaveList(list.id, user.id)
      navigate('/', { replace: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col px-5 pb-28 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink-700 shadow-card ring-1 ring-black/[0.04]"
          aria-label="Back"
        >
          ‹
        </button>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink-700 shadow-card ring-1 ring-black/[0.04]"
            aria-label="List options"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="animate-fade absolute right-0 top-12 z-40 w-48 overflow-hidden rounded-2xl bg-surface p-1.5 shadow-soft ring-1 ring-black/[0.05]">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  setShareOpen(true)
                }}
                className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink-700 hover:bg-black/5"
              >
                Members &amp; sharing
              </button>
              {canEdit && (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    setRenaming(true)
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink-700 hover:bg-black/5"
                >
                  Rename
                </button>
              )}
              {isOwner ? (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    setConfirmDelete(true)
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-blush-300 hover:bg-blush-100"
                >
                  Delete list
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    setConfirmLeave(true)
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-blush-300 hover:bg-blush-100"
                >
                  Leave list
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <header className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-peach-100 text-4xl">
          {list.emoji ?? '🍽️'}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold text-ink-900">{list.name}</h1>
          <button onClick={() => setShareOpen(true)} className="text-sm font-semibold text-peach-600">
            {list.memberCount > 1 ? `Shared · ${list.memberCount} people` : 'Invite people →'}
          </button>
        </div>
      </header>

      {/* Meals */}
      {mealsLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : meals.length === 0 ? (
        <Card className="flex flex-col items-center p-8 text-center">
          <div className="mb-3 text-5xl">🍽️</div>
          <h2 className="text-lg font-bold text-ink-900">No meals yet</h2>
          <p className="mt-1 text-sm text-ink-500">
            {canEdit
              ? 'Add the first meal you tried — with a photo, a link, and your notes.'
              : "Nothing here yet. The list's editors can add meals."}
          </p>
          {canEdit && (
            <button
              onClick={() => {
                setEditingMeal(null)
                setMealFormOpen(true)
              }}
              className="mt-5 rounded-full bg-peach-500 px-6 py-2.5 font-bold text-white shadow-soft transition active:scale-95"
            >
              Add a meal
            </button>
          )}
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          {meals.map((m) => (
            <MealCard key={m.id} meal={m} onClick={() => setSelectedMeal(m)} />
          ))}
        </div>
      )}

      {canEdit && meals.length > 0 && (
        <button
          onClick={() => {
            setEditingMeal(null)
            setMealFormOpen(true)
          }}
          className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-peach-500 px-6 py-3.5 font-bold text-white shadow-soft transition active:scale-95"
          style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          <span className="text-xl leading-none">＋</span> Add meal
        </button>
      )}

      <MealFormModal
        open={mealFormOpen}
        onClose={() => setMealFormOpen(false)}
        listId={list.id}
        meal={editingMeal}
        onSaved={refreshMeals}
      />

      {user && (
        <ShareSheet
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          listId={list.id}
          isOwner={isOwner}
          currentUserId={user.id}
          onMembersChanged={load}
        />
      )}

      <MealDetailSheet
        open={!!selectedMeal}
        onClose={() => setSelectedMeal(null)}
        meal={selectedMeal}
        canEdit={canEdit}
        onEdit={() => {
          setEditingMeal(selectedMeal)
          setSelectedMeal(null)
          setMealFormOpen(true)
        }}
        onChanged={refreshMeals}
      />

      <ListFormModal
        open={renaming}
        onClose={() => setRenaming(false)}
        onSubmit={handleRename}
        title="Rename list"
        submitLabel="Save"
        initialName={list.name}
        initialEmoji={list.emoji ?? '🍽️'}
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete this list?"
        message="This permanently removes the list and all its meals for everyone. This can't be undone."
        confirmLabel="Delete"
        danger
        busy={busy}
      />
      <ConfirmDialog
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        onConfirm={handleLeave}
        title="Leave this list?"
        message="You'll lose access until someone invites you again."
        confirmLabel="Leave"
        danger
        busy={busy}
      />
    </div>
  )
}

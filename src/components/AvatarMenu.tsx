import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../lib/auth'
import { deleteMyAccount } from '../lib/account'
import { ConfirmDialog } from './Modal'

export function AvatarMenu() {
  const { profile, user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteMyAccount()
      // signOut inside deleteMyAccount triggers the auth state change → redirect to login.
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [open])

  const name = profile?.display_name ?? user?.email ?? 'You'
  const initial = name.charAt(0).toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-peach-200 font-extrabold text-peach-600 shadow-card ring-2 ring-white"
        aria-label="Account menu"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="animate-fade absolute right-0 top-13 z-40 w-56 overflow-hidden rounded-2xl bg-surface p-1.5 shadow-soft ring-1 ring-black/[0.05]">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-bold text-ink-900">{name}</p>
            <p className="truncate text-xs text-ink-500">{user?.email}</p>
          </div>
          <div className="my-1 h-px bg-black/[0.06]" />
          <button
            onClick={signOut}
            className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink-700 transition hover:bg-black/5"
          >
            Sign out
          </button>
          <button
            onClick={() => {
              setOpen(false)
              setConfirmDelete(true)
            }}
            className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-blush-300 transition hover:bg-blush-100"
          >
            Delete account
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete your account?"
        message="This permanently deletes your account, the lists you own, and their meals. Lists you've only joined stay with their owners. This can't be undone."
        confirmLabel="Delete forever"
        danger
        busy={deleting}
      />
    </div>
  )
}

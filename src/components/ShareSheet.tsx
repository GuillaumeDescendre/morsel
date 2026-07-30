import { useCallback, useEffect, useState } from 'react'
import { Modal } from './Modal'
import { Button, Spinner, cx } from './ui'
import {
  createShareLink,
  deleteShareLink,
  fetchMembers,
  fetchShareLinks,
  removeMember,
  shareUrl,
  type MemberWithProfile,
  type ShareLink,
} from '../lib/collab'
import type { MemberRole } from '../types'

const roleStyle: Record<MemberRole, string> = {
  owner: 'bg-peach-100 text-peach-600',
  editor: 'bg-mint-100 text-mint-500',
  viewer: 'bg-sky-100 text-sky-300',
}

export function ShareSheet({
  open,
  onClose,
  listId,
  isOwner,
  currentUserId,
  onMembersChanged,
}: {
  open: boolean
  onClose: () => void
  listId: string
  isOwner: boolean
  currentUserId: string
  onMembersChanged: () => void
}) {
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [links, setLinks] = useState<ShareLink[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [m, l] = await Promise.all([
        fetchMembers(listId),
        isOwner ? fetchShareLinks(listId) : Promise.resolve([]),
      ])
      setMembers(m)
      setLinks(l)
    } finally {
      setLoading(false)
    }
  }, [listId, isOwner])

  useEffect(() => {
    if (open) void load()
  }, [open, load])

  const copy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl(token))
      setCopied(token)
      setTimeout(() => setCopied((c) => (c === token ? null : c)), 1800)
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  const addLink = async (role: 'editor' | 'viewer') => {
    setCreating(true)
    try {
      const link = await createShareLink(listId, role)
      setLinks((ls) => [...ls, link])
      await copy(link.token)
    } finally {
      setCreating(false)
    }
  }

  const revoke = async (token: string) => {
    await deleteShareLink(token)
    setLinks((ls) => ls.filter((l) => l.token !== token))
  }

  const kick = async (userId: string) => {
    await removeMember(listId, userId)
    setMembers((ms) => ms.filter((m) => m.user_id !== userId))
    onMembersChanged()
  }

  return (
    <Modal open={open} onClose={onClose} title="Members & sharing">
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto">
          {/* Members */}
          <section>
            <h3 className="mb-2 text-sm font-bold text-ink-700">
              People ({members.length})
            </h3>
            <div className="flex flex-col gap-2">
              {members.map((m) => (
                <div key={m.user_id} className="flex items-center gap-3">
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-peach-200 text-sm font-bold text-peach-600">
                      {(m.display_name ?? '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="min-w-0 flex-1 truncate font-semibold text-ink-900">
                    {m.display_name ?? 'Member'}
                    {m.user_id === currentUserId && (
                      <span className="font-normal text-ink-500"> (you)</span>
                    )}
                  </span>
                  <span
                    className={cx(
                      'rounded-full px-2.5 py-0.5 text-xs font-bold capitalize',
                      roleStyle[m.role],
                    )}
                  >
                    {m.role}
                  </span>
                  {isOwner && m.role !== 'owner' && (
                    <button
                      onClick={() => kick(m.user_id)}
                      className="text-ink-300 hover:text-blush-300"
                      aria-label="Remove member"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Invite links */}
          {isOwner ? (
            <section>
              <h3 className="mb-1 text-sm font-bold text-ink-700">Invite links</h3>
              <p className="mb-3 text-xs text-ink-500">
                Anyone signed in who opens a link joins in that role. Revoke anytime.
              </p>

              <div className="flex flex-col gap-2">
                {links.map((l) => (
                  <div
                    key={l.token}
                    className="flex items-center gap-2 rounded-2xl bg-cream px-3 py-2"
                  >
                    <span
                      className={cx(
                        'rounded-full px-2.5 py-0.5 text-xs font-bold capitalize',
                        roleStyle[l.role],
                      )}
                    >
                      {l.role}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs text-ink-500">
                      /join/{l.token.slice(0, 8)}…
                    </span>
                    <button
                      onClick={() => copy(l.token)}
                      className="rounded-full bg-peach-100 px-3 py-1 text-xs font-bold text-peach-600"
                    >
                      {copied === l.token ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => revoke(l.token)}
                      className="text-ink-300 hover:text-blush-300"
                      aria-label="Revoke link"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <Button
                  variant="soft"
                  size="sm"
                  className="flex-1"
                  onClick={() => addLink('editor')}
                  disabled={creating}
                >
                  ＋ Editor link
                </Button>
                <Button
                  variant="soft"
                  size="sm"
                  className="flex-1"
                  onClick={() => addLink('viewer')}
                  disabled={creating}
                >
                  ＋ Viewer link
                </Button>
              </div>
            </section>
          ) : (
            <p className="text-center text-xs text-ink-500">
              Only the list owner can invite new people.
            </p>
          )}
        </div>
      )}
    </Modal>
  )
}

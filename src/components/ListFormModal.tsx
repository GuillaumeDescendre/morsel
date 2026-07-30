import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { Button, TextField, cx } from './ui'

const EMOJIS = [
  '🍽️', '🍜', '🍕', '🥗', '🍰', '🍳', '🌮', '🍔',
  '🍣', '🥘', '🍝', '🥞', '🍲', '🥙', '🧁', '☕',
  '🍛', '🥟', '🍤', '🫕', '🥩', '🍱', '🥧', '🌱',
]

export function ListFormModal({
  open,
  onClose,
  onSubmit,
  title,
  submitLabel,
  initialName = '',
  initialEmoji = '🍽️',
}: {
  open: boolean
  onClose: () => void
  onSubmit: (name: string, emoji: string) => Promise<void>
  title: string
  submitLabel: string
  initialName?: string
  initialEmoji?: string
}) {
  const [name, setName] = useState(initialName)
  const [emoji, setEmoji] = useState(initialEmoji)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(initialName)
      setEmoji(initialEmoji)
      setError(null)
    }
  }, [open, initialName, initialEmoji])

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Give your list a name')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onSubmit(trimmed, emoji)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-peach-100 text-3xl">
            {emoji}
          </div>
          <div className="flex-1">
            <TextField
              label="List name"
              placeholder="e.g. Weeknight favourites"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-bold text-ink-700">Pick an icon</span>
          <div className="grid grid-cols-8 gap-1.5">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={cx(
                  'flex aspect-square items-center justify-center rounded-xl text-xl transition',
                  emoji === e ? 'bg-peach-200 ring-2 ring-peach-400' : 'bg-cream hover:bg-peach-100',
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm font-semibold text-blush-300">{error}</p>}

        <div className="mt-1 flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={submit} disabled={busy}>
            {busy ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

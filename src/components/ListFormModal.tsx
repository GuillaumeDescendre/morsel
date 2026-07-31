import { useEffect, useMemo, useRef, useState } from 'react'
import { Modal } from './Modal'
import { Button, TextField, cx } from './ui'
import { useSignedUrl } from '../hooks/useSignedUrl'
import { createList, updateList } from '../lib/lists'
import { removeImage, uploadListIcon, validateImageFile } from '../lib/photos'
import { RATING_DIMS, type MealList, type RatingDim } from '../types'

const EMOJIS = [
  '🍽️', '🍜', '🍕', '🥗', '🍰', '🍳', '🌮', '🍔',
  '🍣', '🥘', '🍝', '🥞', '🍲', '🥙', '🧁', '☕',
  '🍛', '🥟', '🍤', '🫕', '🥩', '🍱', '🥧', '🌱',
]

export function ListFormModal({
  open,
  onClose,
  list,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  list: MealList | null // null = create
  onSaved: () => void
}) {
  const isEdit = !!list
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🍽️')
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconRemoved, setIconRemoved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ratingEnabled, setRatingEnabled] = useState(true)
  const [ratingDims, setRatingDims] = useState<RatingDim[]>(['taste', 'ease', 'digestion'])
  const fileRef = useRef<HTMLInputElement>(null)

  const localPreview = useMemo(
    () => (iconFile ? URL.createObjectURL(iconFile) : null),
    [iconFile],
  )
  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview)
  }, [localPreview])
  const existingIconUrl = useSignedUrl(!iconRemoved && list?.icon_path ? list.icon_path : null)
  const previewUrl = localPreview ?? existingIconUrl

  useEffect(() => {
    if (!open) return
    setName(list?.name ?? '')
    setEmoji(list?.emoji ?? '🍽️')
    setIconFile(null)
    setIconRemoved(false)
    setError(null)
    setRatingEnabled(list?.rating_enabled ?? true)
    setRatingDims(list?.rating_dims ?? ['taste', 'ease', 'digestion'])
  }, [open, list])

  const toggleDim = (dim: RatingDim) =>
    setRatingDims((ds) => (ds.includes(dim) ? ds.filter((d) => d !== dim) : [...ds, dim]))

  const pickImage = (file: File) => {
    const err = validateImageFile(file)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setIconFile(file)
    setIconRemoved(false)
  }

  const clearImage = () => {
    setIconFile(null)
    setIconRemoved(true)
    if (fileRef.current) fileRef.current.value = ''
  }

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Give your list a name')
      return
    }
    if (ratingEnabled && ratingDims.length === 0) {
      setError('Pick at least one thing to rate, or turn ratings off')
      return
    }
    setBusy(true)
    setError(null)
    // Keep dims in canonical order.
    const orderedDims = RATING_DIMS.map((d) => d.key).filter((k) => ratingDims.includes(k))
    const ratingConfig = { rating_enabled: ratingEnabled, rating_dims: orderedDims }
    try {
      if (!isEdit) {
        const created = await createList({ name: trimmed, emoji, ...ratingConfig })
        if (iconFile) {
          const path = await uploadListIcon(created.id, iconFile)
          await updateList(created.id, { icon_path: path })
        }
      } else {
        let iconPatch: { icon_path?: string | null } = {}
        if (iconFile) {
          const path = await uploadListIcon(list!.id, iconFile)
          iconPatch = { icon_path: path }
        } else if (iconRemoved && list!.icon_path) {
          await removeImage(list!.icon_path)
          iconPatch = { icon_path: null }
        }
        await updateList(list!.id, { name: trimmed, emoji, ...iconPatch, ...ratingConfig })
      }
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit list' : 'New meal list'}>
      <div className="flex max-h-[68vh] flex-col gap-4 overflow-y-auto pb-1">
        <div className="flex items-center gap-3">
          {/* Icon preview */}
          {previewUrl ? (
            <img src={previewUrl} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-peach-100 text-4xl">
              {emoji}
            </div>
          )}
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

        {/* Image icon controls */}
        <div className="flex gap-2">
          <Button
            variant="soft"
            size="sm"
            className="flex-1"
            onClick={() => fileRef.current?.click()}
          >
            📷 {previewUrl ? 'Change photo' : 'Use a photo'}
          </Button>
          {previewUrl && (
            <Button variant="ghost" size="sm" onClick={clearImage}>
              Remove
            </Button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) pickImage(f)
            }}
          />
        </div>

        {/* Emoji fallback picker */}
        <div>
          <span className="mb-2 block text-sm font-bold text-ink-700">
            {previewUrl ? 'Fallback icon' : 'Pick an icon'}
          </span>
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

        {/* Rating configuration */}
        <div className="rounded-2xl bg-cream p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-ink-700">Rate meals in this list</span>
              <p className="text-xs text-ink-500">Turn off for a plain wishlist.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={ratingEnabled}
              aria-label="Rate meals in this list"
              onClick={() => setRatingEnabled((v) => !v)}
              className={cx(
                'relative h-6 w-11 shrink-0 rounded-full transition',
                ratingEnabled ? 'bg-peach-500' : 'bg-ink-300/40',
              )}
            >
              <span
                className={cx(
                  'absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow transition',
                  ratingEnabled ? 'left-[22px]' : 'left-0.5',
                )}
              />
            </button>
          </div>

          {ratingEnabled && (
            <div className="mt-3">
              <span className="mb-1.5 block text-xs font-bold text-ink-500">What do you rate?</span>
              <div className="flex flex-wrap gap-1.5">
                {RATING_DIMS.map((d) => {
                  const active = ratingDims.includes(d.key)
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => toggleDim(d.key)}
                      className={cx(
                        'rounded-full px-3 py-1.5 text-sm font-bold transition',
                        active
                          ? 'bg-peach-500 text-white shadow-soft'
                          : 'bg-surface text-ink-700 ring-1 ring-black/[0.06]',
                      )}
                    >
                      {d.emoji} {d.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm font-semibold text-blush-300">{error}</p>}
      </div>

      <div className="mt-4 flex gap-3">
        <Button variant="ghost" className="flex-1" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={submit} disabled={busy}>
          {busy ? 'Saving…' : isEdit ? 'Save' : 'Create list'}
        </Button>
      </div>
    </Modal>
  )
}

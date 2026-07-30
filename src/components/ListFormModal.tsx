import { useEffect, useMemo, useRef, useState } from 'react'
import { Modal } from './Modal'
import { Button, TextField, cx } from './ui'
import { useSignedUrl } from '../hooks/useSignedUrl'
import { createList, updateList } from '../lib/lists'
import { removeImage, uploadListIcon, validateImageFile } from '../lib/photos'
import type { MealList } from '../types'

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
  }, [open, list])

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
    setBusy(true)
    setError(null)
    try {
      if (!isEdit) {
        const created = await createList({ name: trimmed, emoji })
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
        await updateList(list!.id, { name: trimmed, emoji, ...iconPatch })
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
      <div className="flex flex-col gap-4">
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

        {error && <p className="text-sm font-semibold text-blush-300">{error}</p>}

        <div className="mt-1 flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={submit} disabled={busy}>
            {busy ? 'Saving…' : isEdit ? 'Save' : 'Create list'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

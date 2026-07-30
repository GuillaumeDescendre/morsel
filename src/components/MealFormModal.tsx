import { useEffect, useMemo, useRef, useState } from 'react'
import { Modal } from './Modal'
import { Button, TextField, TextArea, cx } from './ui'
import { RatingSlider } from './RatingSlider'
import { ScoreBadge } from './ScoreBadge'
import { useSignedUrl } from '../hooks/useSignedUrl'
import { useAuth } from '../lib/auth'
import { createMeal, fetchAllTags, updateMeal, type MealRating } from '../lib/meals'
import { removeImage, uploadMealPhoto, validateImageFile } from '../lib/photos'
import { globalScore, type Meal } from '../types'

export function MealFormModal({
  open,
  onClose,
  listId,
  meal,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  listId: string
  meal: Meal | null // null = create
  onSaved: () => void
}) {
  const isEdit = !!meal
  const [title, setTitle] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagDraft, setTagDraft] = useState('')

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoRemoved, setPhotoRemoved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const { user } = useAuth()
  const [hasRating, setHasRating] = useState(false)
  const [taste, setTaste] = useState(5)
  const [ease, setEase] = useState(5)
  const [digestion, setDigestion] = useState(5)

  const existingUrl = useSignedUrl(!photoRemoved && meal?.photo_path ? meal.photo_path : null)
  const localPreview = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile],
  )
  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview)
  }, [localPreview])
  const previewUrl = localPreview ?? existingUrl

  useEffect(() => {
    if (!open) return
    setTitle(meal?.title ?? '')
    setSourceUrl(meal?.source_url ?? '')
    setNotes(meal?.notes ?? '')
    setTags(meal?.tags ?? [])
    setTagDraft('')
    setPhotoFile(null)
    setPhotoRemoved(false)
    setError(null)
    setHasRating(meal?.taste != null)
    setTaste(meal?.taste ?? 5)
    setEase(meal?.ease ?? 5)
    setDigestion(meal?.digestion ?? 5)
    fetchAllTags()
      .then(setSuggestions)
      .catch(() => setSuggestions([]))
  }, [open, meal])

  const liveScore = hasRating ? globalScore({ taste, ease, digestion }) : null

  const tagSuggestions = useMemo(() => {
    const q = tagDraft.trim().toLowerCase()
    return suggestions
      .filter((t) => !tags.includes(t) && (q === '' || t.includes(q)))
      .slice(0, 12)
  }, [suggestions, tags, tagDraft])

  const addTag = (t: string) => {
    const v = t.trim().toLowerCase()
    if (v && !tags.includes(v) && tags.length < 8) setTags((ts) => [...ts, v])
    setTagDraft('')
  }

  const submit = async () => {
    const trimmed = title.trim()
    if (!trimmed) {
      setError('Give the meal a name')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const rating: MealRating = hasRating
        ? {
            taste,
            ease,
            digestion,
            rated_by: user?.id ?? null,
            rated_at: new Date().toISOString(),
          }
        : { taste: null, ease: null, digestion: null, rated_by: null, rated_at: null }

      const fields = {
        title: trimmed,
        source_url: sourceUrl.trim() || null,
        notes: notes.trim() || null,
        tags,
        ...rating,
      }

      if (!isEdit) {
        const created = await createMeal(listId, fields)
        if (photoFile) {
          const path = await uploadMealPhoto(listId, created.id, photoFile)
          await updateMeal(created.id, { photo_path: path })
        }
      } else {
        let photoPatch: { photo_path?: string | null } = {}
        if (photoFile) {
          const path = await uploadMealPhoto(listId, meal!.id, photoFile)
          photoPatch = { photo_path: path }
        } else if (photoRemoved && meal!.photo_path) {
          await removeImage(meal!.photo_path)
          photoPatch = { photo_path: null }
        }
        await updateMeal(meal!.id, { ...fields, ...photoPatch })
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
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit meal' : 'Add a meal'}>
      <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pb-1">
        {/* Photo */}
        <div>
          <span className="mb-2 block text-sm font-bold text-ink-700">Photo</span>
          {previewUrl ? (
            <div className="relative">
              <img src={previewUrl} alt="" className="h-44 w-full rounded-2xl object-cover" />
              <button
                onClick={() => {
                  setPhotoFile(null)
                  setPhotoRemoved(true)
                  if (fileRef.current) fileRef.current.value = ''
                }}
                className="absolute right-2 top-2 rounded-full bg-ink-900/60 px-2.5 py-1 text-xs font-bold text-white"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex h-28 w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-peach-200 bg-peach-50 text-peach-600"
            >
              <span className="text-2xl">📷</span>
              <span className="text-sm font-bold">Add a photo</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) return
              const err = validateImageFile(f)
              if (err) {
                setError(err)
                return
              }
              setError(null)
              setPhotoFile(f)
              setPhotoRemoved(false)
            }}
          />
        </div>

        <TextField
          label="Meal name"
          placeholder="e.g. Miso-glazed salmon"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={160}
          autoFocus={!isEdit}
        />

        <TextField
          label="Recipe link (optional)"
          placeholder="Paste a URL"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          inputMode="url"
        />

        <TextArea
          label="Notes (optional)"
          placeholder="Tweaks, what you'd change, who liked it…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        {/* Rating */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold text-ink-700">Rating</span>
            <div className="flex items-center gap-2">
              {liveScore != null && <ScoreBadge score={liveScore} size="sm" />}
              <button
                type="button"
                role="switch"
                aria-checked={hasRating}
                aria-label="Rate this meal"
                onClick={() => setHasRating((v) => !v)}
                className={cx(
                  'relative h-6 w-11 shrink-0 rounded-full transition',
                  hasRating ? 'bg-peach-500' : 'bg-ink-300/40',
                )}
              >
                <span
                  className={cx(
                    'absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow transition',
                    hasRating ? 'left-[22px]' : 'left-0.5',
                  )}
                />
              </button>
            </div>
          </div>
          {hasRating ? (
            <div className="flex flex-col gap-2">
              <RatingSlider label="Taste" emoji="😋" value={taste} onChange={setTaste} />
              <RatingSlider label="Ease" emoji="🧑‍🍳" value={ease} onChange={setEase} />
              <RatingSlider label="Digestion" emoji="😌" value={digestion} onChange={setDigestion} />
            </div>
          ) : (
            <p className="rounded-2xl bg-cream px-4 py-3 text-sm text-ink-500">
              Not tried yet — turn on to rate taste, ease &amp; digestion.
            </p>
          )}
        </div>

        {/* Tags */}
        <div>
          <span className="mb-1.5 block text-sm font-bold text-ink-700">Tags</span>
          {tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                  className="flex items-center gap-1 rounded-full bg-lav-100 px-2.5 py-1 text-xs font-semibold text-lav-500"
                >
                  {t} <span className="text-lav-300">✕</span>
                </button>
              ))}
            </div>
          )}
          <input
            className={cx(
              'w-full rounded-2xl bg-cream px-4 py-3 text-ink-900 placeholder:text-ink-300 ring-1 ring-black/[0.05] focus:outline-none focus:ring-2 focus:ring-peach-300',
            )}
            placeholder="Reuse a tag below, or type a new one + Enter"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                addTag(tagDraft)
              }
            }}
            maxLength={24}
          />
          {tagSuggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tagSuggestions.map((t) => (
                <button
                  key={t}
                  onClick={() => addTag(t)}
                  className="rounded-full border border-lav-200 bg-surface px-2.5 py-1 text-xs font-semibold text-lav-500 transition hover:bg-lav-100"
                >
                  ＋ {t}
                </button>
              ))}
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
          {busy ? 'Saving…' : isEdit ? 'Save' : 'Add meal'}
        </Button>
      </div>
    </Modal>
  )
}

import { useEffect, useState } from 'react'
import { Modal, ConfirmDialog } from './Modal'
import { Button } from './ui'
import { ScoreBadge } from './ScoreBadge'
import { RatingSlider } from './RatingSlider'
import { useSignedUrl } from '../hooks/useSignedUrl'
import { useAuth } from '../lib/auth'
import { deleteMeal, rateMeal } from '../lib/meals'
import { supabase } from '../lib/supabase'
import { globalScore, type Meal } from '../types'

function ReadonlyDimension({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex-1 rounded-2xl bg-cream py-2.5 text-center">
      <div className="text-lg font-extrabold text-ink-900">{value ?? '–'}</div>
      <div className="text-xs font-semibold text-ink-500">{label}</div>
    </div>
  )
}

export function MealDetailSheet({
  open,
  onClose,
  meal,
  canEdit,
  onEdit,
  onChanged,
}: {
  open: boolean
  onClose: () => void
  meal: Meal | null
  canEdit: boolean
  onEdit: () => void
  onChanged: () => void
}) {
  const { user } = useAuth()
  const photoUrl = useSignedUrl(meal?.photo_path)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  const [taste, setTaste] = useState(5)
  const [ease, setEase] = useState(5)
  const [digestion, setDigestion] = useState(5)
  const [dirty, setDirty] = useState(false)
  const [savingRating, setSavingRating] = useState(false)
  const [rated, setRated] = useState(false)
  const [raterName, setRaterName] = useState<string | null>(null)

  // Reset local rating state whenever a different meal is shown.
  useEffect(() => {
    if (!meal) return
    setTaste(meal.taste ?? 5)
    setEase(meal.ease ?? 5)
    setDigestion(meal.digestion ?? 5)
    setRated(meal.taste != null)
    setDirty(false)
  }, [meal])

  // Resolve who last rated it.
  useEffect(() => {
    if (!meal?.rated_by) {
      setRaterName(null)
      return
    }
    if (meal.rated_by === user?.id) {
      setRaterName('you')
      return
    }
    let active = true
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', meal.rated_by)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setRaterName(data?.display_name ?? 'someone')
      })
    return () => {
      active = false
    }
  }, [meal?.rated_by, user?.id])

  if (!meal) return null

  const showScore = dirty || rated
  const liveScore = showScore ? globalScore({ taste, ease, digestion }) : null

  const handleSaveRating = async () => {
    if (!user) return
    setSavingRating(true)
    try {
      await rateMeal(meal.id, user.id, { taste, ease, digestion })
      setRated(true)
      setDirty(false)
      setRaterName('you')
      onChanged()
    } finally {
      setSavingRating(false)
    }
  }

  const handleDelete = async () => {
    setBusy(true)
    try {
      await deleteMeal(meal)
      onChanged()
      onClose()
    } finally {
      setBusy(false)
      setConfirmDelete(false)
    }
  }

  const setter = { taste: setTaste, ease: setEase, digestion: setDigestion }
  const onRate = (dim: keyof typeof setter) => (v: number) => {
    setter[dim](v)
    setDirty(true)
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex max-h-[78vh] flex-col gap-4 overflow-y-auto">
        {photoUrl && (
          <img src={photoUrl} alt="" className="-mx-1 h-52 w-[calc(100%+0.5rem)] rounded-2xl object-cover" />
        )}

        <div className="flex items-start justify-between gap-3">
          <h2 className="text-2xl font-extrabold text-ink-900">{meal.title}</h2>
          <ScoreBadge score={liveScore} size="lg" />
        </div>

        {/* Rating */}
        <div className="flex flex-col gap-2">
          {canEdit ? (
            <>
              <RatingSlider label="Taste" emoji="😋" value={taste} onChange={onRate('taste')} />
              <RatingSlider label="Ease" emoji="🧑‍🍳" value={ease} onChange={onRate('ease')} />
              <RatingSlider
                label="Digestion"
                emoji="😌"
                value={digestion}
                onChange={onRate('digestion')}
              />
              {dirty && (
                <Button onClick={handleSaveRating} disabled={savingRating} className="mt-1">
                  {savingRating ? 'Saving…' : rated ? 'Update rating' : 'Save rating'}
                </Button>
              )}
              <p className="text-center text-xs text-ink-500">
                {rated
                  ? raterName
                    ? `Last rated by ${raterName}`
                    : 'Rated'
                  : 'Not rated yet — drag to rate'}
              </p>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <ReadonlyDimension label="Taste" value={meal.taste} />
                <ReadonlyDimension label="Ease" value={meal.ease} />
                <ReadonlyDimension label="Digestion" value={meal.digestion} />
              </div>
              {!rated && <p className="text-center text-xs text-ink-500">Not rated yet</p>}
            </>
          )}
        </div>

        {meal.source_url && (
          <a
            href={meal.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-2xl bg-sky-100 px-4 py-3 font-bold text-sky-300"
          >
            🔗 <span className="truncate">Open recipe link</span>
          </a>
        )}

        {meal.notes && (
          <div>
            <h3 className="mb-1 text-sm font-bold text-ink-700">Notes</h3>
            <p className="whitespace-pre-wrap text-ink-700">{meal.notes}</p>
          </div>
        )}

        {meal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {meal.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-lav-100 px-3 py-1 text-sm font-semibold text-lav-500"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {canEdit ? (
        <div className="mt-4 flex gap-3">
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
          <Button className="flex-1" onClick={onEdit}>
            Edit details
          </Button>
        </div>
      ) : (
        <Button variant="ghost" className="mt-4 w-full" onClick={onClose}>
          Close
        </Button>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete this meal?"
        message="This removes it for everyone on the list and can't be undone."
        confirmLabel="Delete"
        danger
        busy={busy}
      />
    </Modal>
  )
}

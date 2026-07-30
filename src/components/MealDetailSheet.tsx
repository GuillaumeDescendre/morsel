import { useState } from 'react'
import { Modal, ConfirmDialog } from './Modal'
import { Button } from './ui'
import { ScoreBadge } from './ScoreBadge'
import { useSignedUrl } from '../hooks/useSignedUrl'
import { deleteMeal } from '../lib/meals'
import { globalScore, type Meal } from '../types'

function Dimension({ label, value }: { label: string; value: number | null }) {
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
  const photoUrl = useSignedUrl(meal?.photo_path)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!meal) return null
  const score = globalScore(meal)
  const rated = score != null

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

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex max-h-[78vh] flex-col gap-4 overflow-y-auto">
        {photoUrl && (
          <img src={photoUrl} alt="" className="-mx-1 h-52 w-[calc(100%+0.5rem)] rounded-2xl object-cover" />
        )}

        <div className="flex items-start justify-between gap-3">
          <h2 className="text-2xl font-extrabold text-ink-900">{meal.title}</h2>
          <ScoreBadge score={score} size="lg" />
        </div>

        {/* Rating (interactive editing arrives in Phase 5) */}
        <div className="flex gap-2">
          <Dimension label="Taste" value={meal.taste} />
          <Dimension label="Ease" value={meal.ease} />
          <Dimension label="Digestion" value={meal.digestion} />
        </div>
        {!rated && (
          <p className="-mt-1 text-center text-xs text-ink-500">Not rated yet</p>
        )}

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
            Edit
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

import { Card } from './ui'
import { ScoreBadge } from './ScoreBadge'
import { useSignedUrl } from '../hooks/useSignedUrl'
import { globalScore, type Meal } from '../types'

export function MealCard({ meal, onClick }: { meal: Meal; onClick: () => void }) {
  const photoUrl = useSignedUrl(meal.photo_path)
  const score = globalScore(meal)

  return (
    <button onClick={onClick} className="block w-full text-left">
      <Card className="flex items-center gap-3.5 p-3 transition active:scale-[0.99]">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            className="h-16 w-16 shrink-0 rounded-2xl object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-peach-100 text-2xl">
            🍴
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-ink-900">{meal.title}</h3>
          {meal.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {meal.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-lav-100 px-2 py-0.5 text-xs font-semibold text-lav-500"
                >
                  {t}
                </span>
              ))}
              {meal.tags.length > 3 && (
                <span className="text-xs font-semibold text-ink-300">+{meal.tags.length - 3}</span>
              )}
            </div>
          )}
          {meal.tags.length === 0 && meal.source_url && (
            <p className="mt-0.5 truncate text-xs text-ink-500">🔗 recipe link</p>
          )}
        </div>

        <ScoreBadge score={score} />
      </Card>
    </button>
  )
}

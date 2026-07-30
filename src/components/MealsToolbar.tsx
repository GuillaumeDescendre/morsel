import { cx } from './ui'

export type SortMode = 'recent' | 'score' | 'title'

const SORTS: { key: SortMode; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'score', label: 'Top rated' },
  { key: 'title', label: 'A–Z' },
]

export function MealsToolbar({
  search,
  onSearch,
  sort,
  onSort,
  allTags,
  selectedTags,
  onToggleTag,
}: {
  search: string
  onSearch: (v: string) => void
  sort: SortMode
  onSort: (s: SortMode) => void
  allTags: string[]
  selectedTags: string[]
  onToggleTag: (t: string) => void
}) {
  return (
    <div className="mb-3 flex flex-col gap-2.5">
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300">
          🔍
        </span>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search meals…"
          className="w-full rounded-full bg-surface py-2.5 pl-10 pr-4 text-ink-900 placeholder:text-ink-300 shadow-card ring-1 ring-black/[0.04] focus:outline-none focus:ring-2 focus:ring-peach-300"
        />
      </div>

      <div className="flex gap-1.5">
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => onSort(s.key)}
            className={cx(
              'rounded-full px-3.5 py-1.5 text-sm font-bold transition',
              sort === s.key
                ? 'bg-peach-500 text-white shadow-soft'
                : 'bg-surface text-ink-700 ring-1 ring-black/[0.04]',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {allTags.length > 0 && (
        <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1">
          {allTags.map((t) => {
            const active = selectedTags.includes(t)
            return (
              <button
                key={t}
                onClick={() => onToggleTag(t)}
                className={cx(
                  'shrink-0 rounded-full px-3 py-1 text-sm font-semibold transition',
                  active
                    ? 'bg-lav-400 text-white'
                    : 'bg-lav-100 text-lav-500',
                )}
              >
                {t}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

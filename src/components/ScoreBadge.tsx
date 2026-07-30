import { cx } from './ui'

function tone(score: number | null): string {
  if (score == null) return 'bg-ink-300/15 text-ink-500'
  if (score >= 7.5) return 'bg-mint-100 text-mint-500'
  if (score >= 5) return 'bg-butter-200 text-peach-600'
  return 'bg-blush-100 text-blush-300'
}

export function ScoreBadge({
  score,
  size = 'md',
}: {
  score: number | null
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = {
    sm: 'h-9 w-9 text-sm',
    md: 'h-12 w-12 text-lg',
    lg: 'h-16 w-16 text-2xl',
  }
  return (
    <div
      className={cx(
        'flex shrink-0 flex-col items-center justify-center rounded-2xl font-extrabold',
        sizes[size],
        tone(score),
      )}
    >
      {score == null ? <span className="text-base">•</span> : <span className="leading-none">{score}</span>}
    </div>
  )
}

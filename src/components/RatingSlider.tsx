export function RatingSlider({
  label,
  emoji,
  value,
  onChange,
}: {
  label: string
  emoji: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="rounded-2xl bg-cream px-4 py-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-bold text-ink-700">
          {emoji} {label}
        </span>
        <span className="text-lg font-extrabold text-peach-600 tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-peach-500"
        aria-label={label}
      />
    </div>
  )
}

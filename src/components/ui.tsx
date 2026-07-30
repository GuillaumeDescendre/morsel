import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'soft' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-bold transition active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2'
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-base' }
  const variants = {
    primary:
      'bg-peach-500 text-white shadow-soft hover:bg-peach-600 focus-visible:outline-peach-300',
    soft: 'bg-peach-100 text-peach-600 hover:bg-peach-200 focus-visible:outline-peach-300',
    ghost: 'text-ink-700 hover:bg-black/5 focus-visible:outline-ink-300',
    danger: 'bg-blush-200 text-blush-300 hover:bg-blush-300 hover:text-white',
  }
  return (
    <button className={cx(base, sizes[size], variants[variant], className)} {...rest}>
      {children}
    </button>
  )
}

export function Card({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cx(
        'rounded-2xl bg-surface shadow-card ring-1 ring-black/[0.03]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        'h-6 w-6 animate-spin rounded-full border-[3px] border-peach-200 border-t-peach-500',
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

export { cx }

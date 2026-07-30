import { useSignedUrl } from '../hooks/useSignedUrl'
import { cx } from './ui'

const SIZES = {
  sm: 'h-14 w-14 text-3xl rounded-2xl',
  md: 'h-16 w-16 text-4xl rounded-2xl',
}

export function ListIcon({
  emoji,
  iconPath,
  size = 'sm',
}: {
  emoji: string | null
  iconPath: string | null
  size?: keyof typeof SIZES
}) {
  const url = useSignedUrl(iconPath)

  if (url) {
    return <img src={url} alt="" className={cx('shrink-0 object-cover', SIZES[size])} />
  }
  return (
    <div className={cx('flex shrink-0 items-center justify-center bg-peach-100', SIZES[size])}>
      {emoji ?? '🍽️'}
    </div>
  )
}

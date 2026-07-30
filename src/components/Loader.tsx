import { Spinner } from './ui'

export function FullScreenLoader() {
  return (
    <div className="flex min-h-full items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  )
}

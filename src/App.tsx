import { Button, Card } from './components/ui'

export default function App() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col px-5 pb-10 pt-14">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-peach-100 text-4xl shadow-soft">
          🍽️
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">Morsel</h1>
        <p className="mt-1 text-ink-500">Remember every meal worth making again.</p>
      </header>

      <Card className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink-900">Miso-glazed salmon</h2>
            <p className="text-sm text-ink-500">Weeknight favourites</p>
          </div>
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-mint-100 font-extrabold text-mint-500">
            <span className="text-lg leading-none">8.3</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-peach-100 px-2.5 py-1 text-peach-600">Taste 9</span>
          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-sky-300">Ease 7</span>
          <span className="rounded-full bg-lav-100 px-2.5 py-1 text-lav-500">Digestion 9</span>
        </div>
      </Card>

      <div className="mt-8 flex flex-col gap-3">
        <Button>Add a meal</Button>
        <Button variant="soft">Create a list</Button>
        <p className="mt-2 text-center text-xs text-ink-300">
          Design-system preview — real screens arrive in the next phases.
        </p>
      </div>
    </div>
  )
}

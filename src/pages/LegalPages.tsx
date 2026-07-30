import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col px-5 pb-16 pt-8">
      <Link to="/" className="mb-4 font-bold text-peach-600">
        ‹ Back
      </Link>
      <h1 className="mb-1 text-2xl font-extrabold text-ink-900">{title}</h1>
      <p className="mb-6 text-sm text-ink-500">Morsel · last updated 30 July 2026</p>
      <div className="flex flex-col gap-4 text-ink-700 [&_h2]:mt-2 [&_h2]:font-bold [&_h2]:text-ink-900">
        {children}
      </div>
      <p className="mt-8 text-xs text-ink-300">
        This is a plain-language summary for a small personal app, not legal advice.
      </p>
    </div>
  )
}

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>
        Morsel is a small app for remembering and rating meals you've tried, and sharing those
        lists with people you choose. This explains what we store and why.
      </p>
      <h2>What we store</h2>
      <p>
        When you sign in with Google, we store your name, email, and profile photo to identify your
        account. We store the meal lists, meals, ratings, notes, links, tags, and photos you add,
        and who you've shared a list with.
      </p>
      <h2>Where it's stored</h2>
      <p>
        Your data lives in our Supabase database and file storage. Access is restricted by
        row-level security so you only see lists you own or have been invited to.
      </p>
      <h2>Sharing</h2>
      <p>
        People you invite to a list can see and (depending on their role) edit its meals and
        ratings. We never sell your data or use it for advertising.
      </p>
      <h2>Deleting your data</h2>
      <p>
        You can delete your account at any time from the account menu. This removes your profile,
        the lists you own, and your memberships. You can also leave or delete individual lists.
      </p>
      <h2>Contact</h2>
      <p>Questions? Reach out to the person who runs this instance of Morsel.</p>
    </LegalLayout>
  )
}

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Use">
      <p>By using Morsel, you agree to these simple terms.</p>
      <h2>Your account</h2>
      <p>
        You're responsible for what you add and for who you invite to your lists. Don't upload
        content you don't have the right to share, and don't misuse the service.
      </p>
      <h2>Your content</h2>
      <p>
        You keep ownership of the meals, notes, and photos you add. You grant Morsel permission to
        store and display them to you and the people you share lists with.
      </p>
      <h2>Availability</h2>
      <p>
        Morsel is provided as-is, without warranty. It may change or be unavailable at times, and
        we aren't liable for lost data — keep your own copy of anything important.
      </p>
      <h2>Changes</h2>
      <p>These terms may be updated; continued use means you accept the current version.</p>
    </LegalLayout>
  )
}

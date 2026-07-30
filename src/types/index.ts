// Domain types — mirror the Supabase schema (Phase 1).

export type MemberRole = 'owner' | 'editor' | 'viewer'

export interface Profile {
  id: string // == auth.users.id
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface MealList {
  id: string
  name: string
  emoji: string | null
  icon_path: string | null
  owner_id: string
  created_at: string
}

export interface ListMember {
  list_id: string
  user_id: string
  role: MemberRole
  created_at: string
}

/** A pending invite for someone who hasn't signed in yet (matched by email). */
export interface ListInvite {
  id: string
  list_id: string
  email: string
  role: Exclude<MemberRole, 'owner'>
  invited_by: string
  created_at: string
}

export interface Meal {
  id: string
  list_id: string
  title: string
  source_url: string | null
  notes: string | null
  photo_path: string | null // Storage object path
  tags: string[]
  created_by: string
  created_at: string
  // Shared rating (one per meal). Null until first rated.
  taste: number | null // 1..10
  ease: number | null // 1..10
  digestion: number | null // 1..10
  rated_by: string | null // last person to set the rating
  rated_at: string | null
}

/** Global score = average of the three dimensions, or null if unrated. */
export function globalScore(m: Pick<Meal, 'taste' | 'ease' | 'digestion'>): number | null {
  const vals = [m.taste, m.ease, m.digestion].filter((v): v is number => v != null)
  if (vals.length === 0) return null
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
}

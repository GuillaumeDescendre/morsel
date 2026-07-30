import { supabase } from './supabase'
import type { MemberRole } from '../types'

export interface MemberWithProfile {
  user_id: string
  role: MemberRole
  display_name: string | null
  avatar_url: string | null
}

export interface ShareLink {
  token: string
  role: Exclude<MemberRole, 'owner'>
  created_at: string
}

/** Members of a list, with their profile info (two queries joined client-side). */
export async function fetchMembers(listId: string): Promise<MemberWithProfile[]> {
  const { data: members, error } = await supabase
    .from('list_members')
    .select('user_id, role')
    .eq('list_id', listId)
  if (error) throw error

  const ids = (members ?? []).map((m) => m.user_id)
  const profileMap = new Map<string, { display_name: string | null; avatar_url: string | null }>()
  if (ids.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', ids)
    for (const p of profiles ?? []) {
      profileMap.set(p.id, { display_name: p.display_name, avatar_url: p.avatar_url })
    }
  }

  const rank: Record<MemberRole, number> = { owner: 0, editor: 1, viewer: 2 }
  return (members ?? [])
    .map((m) => ({
      user_id: m.user_id,
      role: m.role as MemberRole,
      display_name: profileMap.get(m.user_id)?.display_name ?? null,
      avatar_url: profileMap.get(m.user_id)?.avatar_url ?? null,
    }))
    .sort((a, b) => rank[a.role] - rank[b.role])
}

export async function removeMember(listId: string, userId: string) {
  const { error } = await supabase
    .from('list_members')
    .delete()
    .eq('list_id', listId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function fetchShareLinks(listId: string): Promise<ShareLink[]> {
  const { data, error } = await supabase
    .from('list_share_links')
    .select('token, role, created_at')
    .eq('list_id', listId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as ShareLink[]
}

export async function createShareLink(
  listId: string,
  role: Exclude<MemberRole, 'owner'>,
): Promise<ShareLink> {
  const { data, error } = await supabase
    .from('list_share_links')
    .insert({ list_id: listId, role })
    .select('token, role, created_at')
    .single()
  if (error) throw error
  return data as ShareLink
}

export async function deleteShareLink(token: string) {
  const { error } = await supabase.from('list_share_links').delete().eq('token', token)
  if (error) throw error
}

/** Redeem a token to join a list. Returns the list id, or null if the link is invalid. */
export async function joinListViaToken(token: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('join_list_via_token', { _token: token })
  if (error) throw error
  return (data as string | null) ?? null
}

export function shareUrl(token: string): string {
  return `${window.location.origin}/join/${token}`
}

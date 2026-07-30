import { supabase } from './supabase'
import type { MealList, MemberRole } from '../types'

export interface ListWithMeta extends MealList {
  memberCount: number
  myRole: MemberRole
}

interface ListRow extends MealList {
  list_members: { user_id: string; role: MemberRole }[] | null
}

function withMeta(row: ListRow, userId: string): ListWithMeta {
  const members = row.list_members ?? []
  const mine = members.find((m) => m.user_id === userId)
  const { list_members: _members, ...rest } = row
  return {
    ...rest,
    memberCount: members.length,
    myRole: mine?.role ?? 'viewer',
  }
}

export async function fetchLists(userId: string): Promise<ListWithMeta[]> {
  const { data, error } = await supabase
    .from('lists')
    .select('*, list_members(user_id, role)')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as ListRow[]).map((row) => withMeta(row, userId))
}

export async function fetchList(id: string, userId: string): Promise<ListWithMeta | null> {
  const { data, error } = await supabase
    .from('lists')
    .select('*, list_members(user_id, role)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? withMeta(data as ListRow, userId) : null
}

export async function createList(input: { name: string; emoji: string }): Promise<MealList> {
  // owner_id is filled server-side from auth.uid() (see migration 0004).
  const { data, error } = await supabase
    .from('lists')
    .insert({ name: input.name, emoji: input.emoji })
    .select()
    .single()
  if (error) throw error
  return data as MealList
}

export async function updateList(id: string, patch: { name: string; emoji: string }) {
  const { error } = await supabase.from('lists').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteList(id: string) {
  const { error } = await supabase.from('lists').delete().eq('id', id)
  if (error) throw error
}

export async function leaveList(listId: string, userId: string) {
  const { error } = await supabase
    .from('list_members')
    .delete()
    .eq('list_id', listId)
    .eq('user_id', userId)
  if (error) throw error
}

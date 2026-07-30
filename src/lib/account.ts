import { supabase } from './supabase'

/** Permanently delete the current user's account and owned data. */
export async function deleteMyAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_my_account')
  if (error) throw error
  await supabase.auth.signOut()
}

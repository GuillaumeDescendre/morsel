import { supabase } from './supabase'
import type { Meal } from '../types'
import { removeImage } from './photos'

export interface MealInput {
  title: string
  source_url: string | null
  notes: string | null
  tags: string[]
}

/** The shared rating fields, written together (all null = unrated). */
export interface MealRating {
  taste: number | null
  ease: number | null
  digestion: number | null
  rated_by: string | null
  rated_at: string | null
}

/** Distinct tags across every meal the user can see — used to suggest existing tags. */
export async function fetchAllTags(): Promise<string[]> {
  const { data, error } = await supabase.from('meals').select('tags')
  if (error) throw error
  const set = new Set<string>()
  for (const row of data ?? []) {
    for (const t of (row.tags as string[] | null) ?? []) set.add(t)
  }
  return [...set].sort()
}

export async function fetchMeals(listId: string): Promise<Meal[]> {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('list_id', listId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Meal[]
}

export async function createMeal(
  listId: string,
  input: MealInput & Partial<MealRating>,
): Promise<Meal> {
  // created_by is filled server-side from auth.uid() (see migration 0004).
  const { data, error } = await supabase
    .from('meals')
    .insert({ list_id: listId, ...input })
    .select()
    .single()
  if (error) throw error
  return data as Meal
}

export async function updateMeal(
  id: string,
  patch: Partial<MealInput> & Partial<MealRating> & { photo_path?: string | null },
): Promise<Meal> {
  const { data, error } = await supabase
    .from('meals')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Meal
}

export async function deleteMeal(meal: Meal): Promise<void> {
  const { error } = await supabase.from('meals').delete().eq('id', meal.id)
  if (error) throw error
  // Best-effort photo cleanup (row is already gone; ignore storage errors).
  if (meal.photo_path) {
    try {
      await removeImage(meal.photo_path)
    } catch {
      /* ignore */
    }
  }
}

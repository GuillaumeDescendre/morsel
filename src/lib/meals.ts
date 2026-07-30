import { supabase } from './supabase'
import type { Meal } from '../types'
import { removeMealPhoto } from './photos'

export interface MealInput {
  title: string
  source_url: string | null
  notes: string | null
  tags: string[]
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
  userId: string,
  input: MealInput,
): Promise<Meal> {
  const { data, error } = await supabase
    .from('meals')
    .insert({ list_id: listId, created_by: userId, ...input })
    .select()
    .single()
  if (error) throw error
  return data as Meal
}

export async function updateMeal(
  id: string,
  patch: Partial<MealInput> & { photo_path?: string | null },
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
      await removeMealPhoto(meal.photo_path)
    } catch {
      /* ignore */
    }
  }
}

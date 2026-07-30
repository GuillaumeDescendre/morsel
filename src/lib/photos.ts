import imageCompression from 'browser-image-compression'
import { supabase } from './supabase'

const BUCKET = 'meal-photos'

/** Shrink a user-picked image before upload so mobile uploads stay fast and cheap. */
export async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.6,
    maxWidthOrHeight: 1400,
    useWebWorker: true,
    fileType: 'image/jpeg',
  })
}

/** Upload a photo for a meal. Path is {listId}/{mealId}/... so Storage RLS can check membership. */
export async function uploadMealPhoto(
  listId: string,
  mealId: string,
  file: File,
): Promise<string> {
  const compressed = await compressImage(file)
  const path = `${listId}/${mealId}/photo_${Date.now()}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    contentType: 'image/jpeg',
    upsert: true,
  })
  if (error) throw error
  return path
}

export async function getSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
  if (error) return null
  return data.signedUrl
}

export async function removeMealPhoto(path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path])
}

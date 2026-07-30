import { supabase } from './supabase'

const BUCKET = 'meal-photos'

/** Reject absurdly large / non-image files before we even try to compress them. */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024 // 20 MB

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Please choose an image file.'
  if (file.size > MAX_UPLOAD_BYTES) return 'That image is too large (max 20 MB).'
  return null
}

interface CompressOpts {
  maxSizeMB: number
  maxWidthOrHeight: number
}

// Full-width meal photos vs. small square list icons.
const MEAL_PRESET: CompressOpts = { maxSizeMB: 0.6, maxWidthOrHeight: 1400 }
const ICON_PRESET: CompressOpts = { maxSizeMB: 0.15, maxWidthOrHeight: 400 }

/** Shrink a user-picked image before upload so it loads fast and takes little space. */
export async function compressImage(file: File, opts: CompressOpts = MEAL_PRESET): Promise<File> {
  // Lazy-loaded so the compression lib is code-split out of the main bundle.
  const { default: imageCompression } = await import('browser-image-compression')
  return imageCompression(file, {
    ...opts,
    useWebWorker: true,
    fileType: 'image/jpeg',
  })
}

/** Upload a meal photo. Path is {listId}/{mealId}/... so Storage RLS can check membership. */
export async function uploadMealPhoto(
  listId: string,
  mealId: string,
  file: File,
): Promise<string> {
  const compressed = await compressImage(file, MEAL_PRESET)
  const path = `${listId}/${mealId}/photo_${Date.now()}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    contentType: 'image/jpeg',
    upsert: true,
  })
  if (error) throw error
  return path
}

/** Upload a list icon. Stored under the list's folder so membership policies apply. */
export async function uploadListIcon(listId: string, file: File): Promise<string> {
  const compressed = await compressImage(file, ICON_PRESET)
  const path = `${listId}/icon_${Date.now()}.jpg`
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

export async function removeImage(path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path])
}

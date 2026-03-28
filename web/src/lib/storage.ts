import { createClient } from './supabase/client'

/**
 * Uploads a file to a Supabase storage bucket
 * @param bucket Bucket name ('documents' or 'calendar')
 * @param path Internal path/filename
 * @param file File object from input
 * @returns public URL of the uploaded file
 */
export async function uploadFile(bucket: string, path: string, file: File) {
    const supabase = createClient()
    
    // 1. Upload the file
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: true
        })

    if (error) throw error

    // 2. Get the public URL
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

    return publicUrl
}

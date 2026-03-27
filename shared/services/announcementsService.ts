import { SupabaseClient } from '@supabase/supabase-js';

export const getAnnouncements = async (supabase: SupabaseClient, limit = 50) => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data;
};

export const createAnnouncement = async (
  supabase: SupabaseClient, 
  announcement: { title: string; content: string; category?: string; target_role?: number | null }
) => {
  const { data, error } = await supabase
    .from('announcements')
    .insert([announcement])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

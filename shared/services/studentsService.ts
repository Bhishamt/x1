// We accept the configured Supabase client from the calling platform (Next.js server/client or React Native client)
// to ensure the authentication context is handled correctly for the respective environment.
import { SupabaseClient } from '@supabase/supabase-js';

export const getStudents = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role_id', 4)
    .order('full_name', { ascending: true });
    
  if (error) throw error;
  return data;
};

export const getStudentById = async (supabase: SupabaseClient, id: string) => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      results (*)
    `)
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};

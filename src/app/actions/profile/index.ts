'use server';

import { Database } from '@/database.types';
import { createClient } from '@/utils/supabase/server';

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (!data || error) {
    return { profileData: null, profileError: error?.message || 'Error fetching user data' };
  }

  const { data: profileData, error: profileError } = await supabase
    .from('Profile')
    .select('*')
    .eq('user_id', data.user.id)
    .single();

  if (!profileData || profileError) {
    return { profileData: null, profileError: profileError?.message || 'Error fetching profile data' };
  }

  return { profileData, profileError: null };
}

export const isProfileOfCurrentUser = async (
  profile:
    | Database['public']['Tables']['Profile']['Row']
    | Pick<Database['public']['Tables']['Profile']['Row'], 'user_id' | 'username' | 'photo_url'>,
) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (!data || error) {
    return false;
  }
  return profile.user_id === data.user.id;
};

export const getProfileByUsername = async (username: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('Profile').select('*').eq('username', username).single();
  return { data, error };
};

'use server';

import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '@/database.types';
import { redirect } from 'next/navigation';

type ProfileInsert = Database['public']['Tables']['Profile']['Insert'];

export const checkUsername = async (username: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase.from('Profile').select('*').eq('username', username).single();

  if (error && error.code === 'PGRST116') {
    // username is unique
    return true;
  }

  return false;
};

export const createProfile = async (profile: ProfileInsert) => {
  const supabase = await createClient();
  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError || !user.user) {
    return { error: userError?.message || 'Failed to get user' };
  }
  const { error, data } = await supabase
    .from('Profile')
    .upsert({
      ...profile,
      user_id: user.user?.id,
    })
    .select()
    .single();
  if (error || !data) {
    return { error: error?.message || 'Failed to create profile' };
  }

  return redirect(`/profile/${data.username}`);
};

export const uploadFile = async (file: File) => {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from('assets')
    .upload(`profile_photos/${uuidv4()}.${file.type.split('/')[1]}`, file);

  if (error) {
    return { error: error.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('assets').getPublicUrl(data.path);
  if (!publicUrl) {
    return { error: 'Failed to get public URL' };
  }

  return { publicUrl };
};

'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

async function getURL() {
  const headersList = headers();
  const host = (await headersList).get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getURL()}/login/callback`,
    },
  });

  if (error) {
    console.error(error);
    throw new Error('Failed to sign in with Google');
  }

  redirect(data.url);
}

export const signInWithGithub = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${getURL()}/login/callback`,
    },
  });

  if (error) {
    console.error(error);
    throw new Error('Failed to sign in with Github');
  }

  redirect(data.url);
};

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

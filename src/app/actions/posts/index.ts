'use server';

import { Database } from '@/database.types';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUserProfile } from '../profile';

export async function createPost(content: string, profileId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('Post').insert({ content, owner: profileId }).select().single();
  return { data, error };
}

export async function getPostsByProfileId(profileId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('Post').select('*').eq('owner', profileId);
  return { data, error };
}

export async function deletePost(postId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from('Post').delete().eq('id', postId);
  return { error };
}

export async function getPostsForFeed({ feedType }: { feedType: 'following' | 'discover' }) {
  const supabase = await createClient();
  const { profileData, profileError } = await getCurrentUserProfile();

  if (profileError || !profileData) {
    return { error: profileError || 'Error getting current user profile' };
  }

  const { data: followingData, error: followingError } = await supabase
    .from('Followers')
    .select('following_user')
    .eq('follwed_by', profileData.user_id);

  if (followingError && followingError.code !== 'PGRST116') {
    return { error: followingError.message || 'Error getting following users' };
  }

  const followingUserIds = followingData
    ? [...followingData.map((follow) => follow.following_user), profileData.user_id]
    : [profileData.user_id];

  let query = supabase
    .from('Post')
    .select(
      `
    *,
    profile:owner (
      user_id,
      username,
      photo_url,
      first_name,
      last_name,
      bio,
      am_i_following:Followers!Followers_following_user_fkey (
        follwed_by
      )
    )
  `,
    )
    .eq('profile.am_i_following.follwed_by', profileData.user_id)
    .order('created_at', { ascending: false });

  if (feedType === 'following') {
    query = query.in('owner', followingUserIds);
  }

  const { data: postsData, error: postsError } = await query;

  if (postsError && postsError.code !== 'PGRST116') {
    return { error: postsError.message || 'Error getting posts for feed' };
  }

  // Transform the data to include a boolean am_i_following flag
  const transformedData =
    postsData?.map((post) => ({
      ...post,
      profile: {
        ...post.profile,
        am_i_following: Boolean(post.profile?.am_i_following?.length),
      },
    })) || [];

  return { data: transformedData, error: null };
}

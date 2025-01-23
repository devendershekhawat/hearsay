'use server';

import { createClient } from '@/utils/supabase/server';
import { error } from 'console';

export const getMyConnectionWithProfile = async (profileUserId: string) => {
  const supabase = await createClient();

  const { data: currentUser, error: currentUserError } = await supabase.auth.getUser();

  if (!currentUser || currentUserError) {
    return { error: currentUserError?.message || 'Error getting current user' };
  }

  const { data: userFollowingMe, error: userFollowingMeError } = await supabase
    .from('Followers')
    .select('*')
    .eq('following_user', currentUser.user.id)
    .eq('follwed_by', profileUserId)
    .single();

  const { data: meFollowingUser, error: meFollowingUserError } = await supabase
    .from('Followers')
    .select('*')
    .eq('following_user', profileUserId)
    .eq('follwed_by', currentUser.user.id)
    .single();

  if (
    (userFollowingMeError?.code !== 'PGRST116' && userFollowingMeError) ||
    (meFollowingUserError?.code !== 'PGRST116' && meFollowingUserError)
  ) {
    return {
      error: userFollowingMeError?.message || meFollowingUserError?.message || 'Error getting user connection',
    };
  }

  return {
    userIsFollowingMe: userFollowingMe !== null && userFollowingMeError === null,
    IamFollowingUser: meFollowingUser !== null && meFollowingUserError === null,
  };
};

export async function followUser(userId: string) {
  const supabase = await createClient();
  const { data: currentUser, error: currentUserError } = await supabase.auth.getUser();

  if (!currentUser || currentUserError) {
    return { error: currentUserError?.message || 'Error following user' };
  }

  const { error } = await supabase.from('Followers').insert({
    following_user: userId,
    follwed_by: currentUser.user.id,
  });

  if (error) {
    return { error: error.message || 'Error following user' };
  }

  return { success: true };
}

export async function unfollowUser(userId: string) {
  const supabase = await createClient();
  const { data: currentUser, error: currentUserError } = await supabase.auth.getUser();

  if (!currentUser || currentUserError) {
    return { error: currentUserError?.message || 'Error unfollowing user' };
  }

  const { error } = await supabase
    .from('Followers')
    .delete()
    .eq('following_user', userId)
    .eq('follwed_by', currentUser.user.id);

  if (error) {
    return { error: error.message || 'Error unfollowing user' };
  }

  return { success: true };
}

export async function getPeople() {
  const supabase = await createClient();

  // Get current user first
  const { data: currentUser, error: currentUserError } = await supabase.auth.getUser();

  if (!currentUser || currentUserError) {
    return { error: currentUserError?.message || 'Error getting current user' };
  }

  const { data: followingUsers, error: followingUsersError } = await supabase
    .from('Followers')
    .select('following_user')
    .eq('follwed_by', currentUser.user.id);

  console.log('followingUsers', followingUsers);

  const { data, error } = await supabase
    .from('Profile')
    .select('*')
    .not(
      'user_id',
      'in',
      `(${
        followingUsers
          ?.map((user) => user.following_user)
          .concat(currentUser.user.id)
          .join(',') || `'${currentUser.user.id}'`
      })`,
    );

  console.log('query', {
    currentUser: currentUser.user.id,
    data,
    error,
  });

  // Transform the data to include a boolean amIFollowingUser
  const transformedData = data?.map((profile) => ({
    ...profile,
  }));

  return { data: transformedData, error };
}

export async function getProfilesIFollow() {
  const supabase = await createClient();

  // Get current user first
  const { data: currentUser, error: currentUserError } = await supabase.auth.getUser();

  if (!currentUser || currentUserError) {
    return { error: currentUserError?.message || 'Error getting current user' };
  }

  const { data: followingUsers, error: followingUsersError } = await supabase
    .from('Followers')
    .select('following_user')
    .eq('follwed_by', currentUser.user.id);

  if (followingUsersError) {
    return { error: followingUsersError.message || 'Error getting following users' };
  }

  const { data, error } = await supabase
    .from('Profile')
    .select('*')
    .in('user_id', followingUsers?.map((user) => user.following_user) || []);

  if (error) {
    return { error: error.message || 'Error getting profiles I follow' };
  }

  // Transform the data to include a boolean amIFollowingUser
  const transformedData = data?.map((profile) => ({
    ...profile,
  }));

  return { data: transformedData, error };
}

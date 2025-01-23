import { getCurrentUserProfile } from '../actions/profile';

import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const { profileData, profileError } = await getCurrentUserProfile();

  if (profileError || !profileData) {
    return <div>Error fetching profile data</div>;
  }

  redirect(`/profile/${profileData.username}`);
  return <div>Profile</div>;
}

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Image from 'next/image';
import { getPeople, getProfilesIFollow } from '../actions/people';
import { ProfileHoverCard } from '@/components/ProfileHoverCard';
import { FollowButton } from '@/components/FollowButton';
import Link from 'next/link';
import { Database } from '@/database.types';
import { FindPeople } from '@/components/FindPeople';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

const ProfileCard = ({
  profile,
  amIFollowingUser,
}: {
  profile: Database['public']['Tables']['Profile']['Row'];
  amIFollowingUser: boolean;
}) => {
  console.log('profile', profile, amIFollowingUser);
  return (
    <div key={profile.user_id} className="flex justify-between py-2">
      <ProfileHoverCard profile={{ ...profile, am_i_following: amIFollowingUser }} isCurrentUser={false}>
        <Link href={`/profile/${profile.username}`} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden">
            <Image src={profile.photo_url!} alt={profile.username} fill className="object-cover" />
          </div>
          <div>
            <div className="font-medium">
              {profile.first_name} {profile.last_name}
            </div>
            <div className="text-sm text-gray-500">@{profile.username}</div>
          </div>
        </Link>
      </ProfileHoverCard>
      <FollowButton profileId={profile.user_id} amIFollowingUser={amIFollowingUser} />
    </div>
  );
};

export const NoFollowingProfiles = () => {
  return (
    <div className="text-center py-8">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No profiles followed yet</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Start by discovering interesting people to follow</p>
      <Link
        href="/people?type=discover"
        className="mt-4 inline-block px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
      >
        Discover People
      </Link>
    </div>
  );
};

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const type = (await searchParams).type;
  if (!type) {
    redirect('/people?type=following');
  }

  const { data: profilesIFollow, error: profilesIFollowError } = await getProfilesIFollow();
  const { data: profiles, error: profilesError } = await getPeople();

  if (!profilesIFollow || profilesIFollowError || !profiles || profilesError) {
    return <div>Error fetching profiles I follow</div>;
  }

  return (
    <main className="w-full max-w-screen-md mx-auto pt-10 px-4">
      <h1 className="text-2xl font-bold">People</h1>
      <br />
      <Tabs value={type as string} defaultValue={type as string} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="following" asChild>
            <Link href={`/people?type=following`}>Following</Link>
          </TabsTrigger>
          <TabsTrigger value="discover" asChild>
            <Link href={`/people?type=discover`}>Find People</Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="following">
          {profilesIFollow.length > 0 ? (
            profilesIFollow.map((profile) => (
              <ProfileCard key={profile.user_id} profile={profile} amIFollowingUser={true} />
            ))
          ) : (
            <NoFollowingProfiles />
          )}
        </TabsContent>
        <TabsContent value="discover">
          {profiles.map((profile) => (
            <ProfileCard key={profile.user_id} profile={profile} amIFollowingUser={false} />
          ))}
        </TabsContent>
      </Tabs>
    </main>
  );
}

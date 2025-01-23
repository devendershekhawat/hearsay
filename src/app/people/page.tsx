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
import { ProfileCard } from '@/components/ProfileCard';
import { NoFollowingProfiles } from '@/components/NoFollowingProfiles';

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

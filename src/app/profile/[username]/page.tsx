import { getMyConnectionWithProfile } from '@/app/actions/people';
import { deletePost, getPostsByProfileId } from '@/app/actions/posts';
import { getProfileByUsername, isProfileOfCurrentUser } from '@/app/actions/profile';
import { FollowButton } from '@/components/FollowButton';
import Post from '@/components/Post';
import { UserFeed } from '@/components/PostsContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const username = (await params).username;
  const { data: profile } = await getProfileByUsername(username);

  if (!profile) {
    return {
      title: 'Profile Not Found | hearsay',
      description: 'This profile could not be found.',
    };
  }

  return {
    title: `${profile.first_name} ${profile.last_name} (@${profile.username}) | hearsay`,
    description: profile.bio || `View ${profile.first_name}'s profile and posts on hearsay.`,
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const username = (await params).username;
  const { data: profile, error: profileError } = await getProfileByUsername(username);

  if (!profile || profileError) {
    return <div>Profile not found</div>;
  }

  const isCurrentUser = await isProfileOfCurrentUser(profile);

  const { userIsFollowingMe, IamFollowingUser, error: connectionError } = await getMyConnectionWithProfile(
    profile.user_id,
  );

  if (connectionError) {
    return <div>Error getting user connection</div>;
  }

  return (
    <main className="w-full max-w-2xl mx-auto pt-10">
      <div className="flex flex-col items-center justify-center gap-4 mb-10">
        <div className="w-40 h-40 rounded-full overflow-hidden relative border-4 dark:border-white border-gray-800">
          <Image
            src={profile.photo_url || 'https://i.sstatic.net/l60Hf.png'}
            alt={profile.username}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-2xl font-bold">
            {profile.first_name} {profile.last_name}
          </h1>
          <p className="text-sm text-muted-foreground text-center">@{profile.username}</p>
          {!isCurrentUser && userIsFollowingMe && <Badge variant="secondary">follows you</Badge>}
        </div>
        {profile.bio && <p className="text-md">{profile.bio}</p>}
        {isCurrentUser ? (
          <Button size="sm">
            <Link href={`/profile/update`}>Edit profile</Link>
          </Button>
        ) : (
          <FollowButton profileId={profile.user_id} amIFollowingUser={IamFollowingUser || false} />
        )}
      </div>
      <p className="text-sm font-bold text-muted-foreground">Posts</p>
      <Separator className="my-4" />
      <UserFeed currentUserId={profile.user_id} feedType="profile" />
    </main>
  );
}

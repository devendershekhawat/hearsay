'use client';

import Image from 'next/image';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { PostWithProfile } from './Post';
import { FollowButton } from './FollowButton';
import { Database } from '@/database.types';
import Link from 'next/link';
export function ProfileHoverCard({
  children,
  profile,
  isCurrentUser,
}: {
  children: React.ReactNode;
  profile: { am_i_following: boolean } & Pick<
    Database['public']['Tables']['Profile']['Row'],
    'user_id' | 'photo_url' | 'first_name' | 'last_name' | 'username' | 'bio'
  >;
  isCurrentUser: boolean;
}) {
  if (!profile) return null;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <Link href={`/profile/${profile.username}`} className="flex gap-2">
              <div className="w-12 h-12 rounded-full overflow-hidden relative">
                <Image src={profile.photo_url!} alt={`${profile.first_name}'s avatar`} fill className="object-cover" />
              </div>
              <div className="flex flex-col">
                <p className="font-medium text-sm">
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">@{profile.username}</p>
              </div>
            </Link>
            {!isCurrentUser && <FollowButton profileId={profile.user_id} amIFollowingUser={profile.am_i_following} />}
          </div>

          {profile.bio && <p className="text-sm text-neutral-700 dark:text-neutral-200">{profile.bio}</p>}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

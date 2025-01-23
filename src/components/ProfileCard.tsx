import { FollowButton } from './FollowButton';
import { ProfileHoverCard } from './ProfileHoverCard';
import { Database } from '@/database.types';
import Image from 'next/image';
import Link from 'next/link';

export const ProfileCard = ({
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

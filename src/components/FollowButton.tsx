'use client';

import { followUser, unfollowUser } from '@/app/actions/people';
import { Button } from './ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function FollowButton({ profileId, amIFollowingUser }: { profileId: string; amIFollowingUser: boolean }) {
  const [isFollowing, setIsFollowing] = useState(amIFollowingUser);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFollow = async () => {
    setLoading(true);
    const { error } = await followUser(profileId);
    if (error) {
      toast({
        title: 'Error following user',
        description: error,
        variant: 'destructive',
      });
    }
    setIsFollowing(!isFollowing);
    setLoading(false);
  };

  const handleUnfollow = async () => {
    setLoading(true);
    const { error } = await unfollowUser(profileId);
    if (error) {
      toast({
        title: 'Error unfollowing user',
        description: error,
        variant: 'destructive',
      });
    }
    setIsFollowing(!isFollowing);
    setLoading(false);
  };

  return (
    <Button
      size="sm"
      onClick={isFollowing ? handleUnfollow : handleFollow}
      disabled={loading}
      variant={isFollowing ? 'outline' : 'default'}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}

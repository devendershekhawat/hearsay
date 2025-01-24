'use client';

import Post from './Post';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PostWithProfile } from './Post';
import { motion, AnimatePresence } from 'framer-motion';
import { getPostsForFeed } from '@/app/actions/posts';
import { Skeleton } from './ui/skeleton';

export const UserFeed = ({
  currentUserId,
  feedType,
}: {
  currentUserId: string;
  feedType: 'following' | 'discover' | 'profile';
}) => {
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const { toast } = useToast();

  const handleDelete = (postId: number) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  useEffect(() => {
    const fetchPosts = async () => {
      if (feedType === 'profile') return;
      const { data, error } = await getPostsForFeed({ feedType });
      if (error || !data) {
        toast({ title: 'Error getting posts', description: error || 'Error getting posts', variant: 'destructive' });
        return;
      }
      setPosts(data as PostWithProfile[]);
      setIsLoading(false);
    };

    fetchPosts();

    const setupRealtimeSubscription = async () => {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get list of users that the current user follows
      const { data: followingData, error: followingError } = await supabase
        .from('Followers')
        .select('following_user')
        .eq('follwed_by', user.id);

      if (followingError) {
        toast({ title: 'Error getting following users', description: followingError.message, variant: 'destructive' });
        return;
      }

      const followingUserIds = followingData?.map((follow) => follow.following_user).join(',');

      let filter = '';

      switch (feedType) {
        case 'following':
          filter = followingUserIds ? `owner=in.(${followingUserIds}, ${user.id})` : `owner=eq.${user.id}`;
          break;
        case 'discover':
          filter = '';
          break;
        case 'profile':
          filter = `owner=eq.${user.id}`;
          break;
      }

      // Set up realtime subscription with filter
      const room = supabase.channel('feed').on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Post',
          filter,
        },
        async (payload) => {
          // Fetch the complete post with profile data
          const { data: postWithProfile } = await supabase
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
            .eq('id', payload.new.id)
            .eq('profile.am_i_following.follwed_by', user.id)
            .single();

          if (postWithProfile) {
            console.log({ postWithProfile });
            setPosts((prevPosts) => [
              {
                ...postWithProfile,
                profile: {
                  ...postWithProfile.profile,
                  am_i_following: Boolean(postWithProfile.profile?.am_i_following?.length),
                },
              } as PostWithProfile,
              ...prevPosts,
            ]);
          }
        },
      );

      room.subscribe();

      return () => {
        room.unsubscribe();
      };
    };

    setupRealtimeSubscription();
  }, []);

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Post post={post} currentUserId={currentUserId} onDelete={handleDelete} />
          </motion.div>
        ))
      ) : (
        <div>No posts</div>
      )}
    </AnimatePresence>
  );
};

'use client';

import { Database } from '@/database.types';
import Image from 'next/image';
import { PostDeleteButton } from './PostDeleteButton';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProfileHoverCard } from './ProfileHoverCard';

export type PostWithProfile = Database['public']['Tables']['Post']['Row'] & {
  profile:
    | ({ am_i_following: boolean } & Pick<
        Database['public']['Tables']['Profile']['Row'],
        'user_id' | 'username' | 'photo_url' | 'first_name' | 'last_name' | 'bio'
      >)
    | null;
};

function Post({
  post,
  currentUserId,
  onDelete,
}: {
  post: PostWithProfile;
  currentUserId: string;
  onDelete: (postId: number) => void;
}) {
  if (!post.profile) return null;

  const owner = post.profile;
  const isCurrentUser = owner.user_id === currentUserId;

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="w-full py-5 transition-all duration-200"
    >
      <div className="flex gap-3">
        <ProfileHoverCard profile={post.profile} isCurrentUser={isCurrentUser}>
          <Link href={`/profile/${owner.username}`} className="shrink-0 group relative self-start">
            <div className="w-8 h-8 rounded-full overflow-hidden relative">
              <Image src={owner.photo_url!} alt={`${owner.first_name}'s avatar`} fill className="object-cover" />
            </div>
          </Link>
        </ProfileHoverCard>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <ProfileHoverCard profile={post.profile} isCurrentUser={isCurrentUser}>
              <Link href={`/profile/${owner.username}`} className="inline-flex items-center gap-1.5 group">
                <span className="font-medium text-[15px] text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {owner.first_name} {owner.last_name}
                </span>
                <span className="text-[15px] text-neutral-500 dark:text-neutral-400 group-hover:text-blue-600/70 dark:group-hover:text-blue-400/70">
                  @{owner.username}
                </span>
              </Link>
            </ProfileHoverCard>
            <span className="text-neutral-300 dark:text-neutral-600 text-sm">•</span>
            <time className="text-neutral-500 dark:text-neutral-400 text-[13px]">
              {new Date(post.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </div>

          <p className="mt-1.5 text-[15px] text-neutral-800 dark:text-neutral-200 leading-normal">{post.content}</p>
        </div>

        {isCurrentUser && (
          <div className="shrink-0">
            <PostDeleteButton postId={post.id} onDelete={onDelete} />
          </div>
        )}
      </div>
    </motion.article>
  );
}

export default Post;

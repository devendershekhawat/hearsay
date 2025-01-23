'use client';

import { Database } from '@/database.types';
import Image from 'next/image';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useState } from 'react';
import { createPost } from '@/app/actions/posts';
import { useToast } from '@/hooks/use-toast';

export default function PostComposer({ profile }: { profile: Database['public']['Tables']['Profile']['Row'] }) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const handlePost = async () => {
    setIsLoading(true);
    const { data, error } = await createPost(content, profile.user_id);
    if (error || !data) {
      toast({
        title: 'Error',
        description: 'Failed to post',
        variant: 'destructive',
      });
    }

    setContent('');
    toast({
      title: 'Post created',
      description: 'Your post has been created',
    });
    setIsLoading(false);
  };

  return (
    <div className="w-full flex gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden">
        <Image src={profile.photo_url!} alt="Profile avatar" fill className="object-cover" />
      </div>
      <div className="flex-1">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full mb-4"
        />
        <Button onClick={handlePost} disabled={isLoading || content.length === 0}>
          {isLoading ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </div>
  );
}

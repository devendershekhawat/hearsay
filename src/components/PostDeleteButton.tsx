'use client';

import { FaTrash } from 'react-icons/fa';
import { Button } from './ui/button';
import { deletePost } from '@/app/actions/posts';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function PostDeleteButton({ postId, onDelete }: { postId: number; onDelete: (postId: number) => void }) {
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await deletePost(postId);
    if (error) {
      toast({
        title: 'Error deleting post',
        description: error.message || 'Error deleting post',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Post deleted', description: 'Your post has been deleted' });
    }
    setDeleting(false);
    onDelete(postId);
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FaTrash />}
          </Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={10}>Delete post</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

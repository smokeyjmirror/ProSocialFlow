import type { Post } from '@/app/page';
import PostCard from './post-card';
import { BookOpen } from 'lucide-react';

interface PostQueueProps {
  posts: Post[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedContent: Partial<Post>) => void;
}

export default function PostQueue({
  posts,
  onDelete,
  onUpdate,
}: PostQueueProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold font-headline">Learning Queue</h2>
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed border-border rounded-lg p-12">
          <BookOpen className="h-12 w-12 mb-4" />
          <h3 className="text-lg font-semibold">Your curriculum is empty</h3>
          <p>Generate a TIL fact to get started.</p>
        </div>
      )}
    </div>
  );
}

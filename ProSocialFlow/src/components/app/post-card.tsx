
'use client';

import { useState } from 'react';
import type { Post } from '@/app/page';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Trash2 } from 'lucide-react';
import { getTopicIcon } from '@/lib/topic-icons';

interface PostCardProps {
  post: Post;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedContent: Partial<Post>) => void;
}

export default function PostCard({
  post,
  onDelete,
  onUpdate,
}: PostCardProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between bg-card-foreground/5 p-4 gap-4">
        <div className="flex flex-col gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Badge variant="secondary" className="pl-2">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1.5 [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:stroke-current">
                  {getTopicIcon(post.category)}
                </span>
                <span className="capitalize">{post.category}</span>
              </div>
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal leading-snug">
            <span className="font-semibold">Topic:</span> {post.topic}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
          onClick={() => onDelete(post.id)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete post</span>
        </Button>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-3">
          <Textarea
            value={post.post}
            onChange={e => onUpdate(post.id, { post: e.target.value })}
            className="h-48 resize-none"
            aria-label="Post content"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(post.post)}
            >
              {copied ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copied ? 'Copied' : 'Copy Post'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

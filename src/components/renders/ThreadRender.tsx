import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Heart, MessageSquare, ExternalLink } from 'lucide-react';

export function ThreadRender({ data }: { data: any }) {
  const { thread_title, posts } = data;

  if (!posts || posts.length === 0) return null;

  return (
    <Card className="my-4 bg-card border-border">
      {thread_title && (
        <CardHeader className="pb-3 border-b border-border bg-muted/50">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            {thread_title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {posts.map((post: any, i: number) => (
            <div key={i} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-amber-500">{post.author || 'Anonymous'}</span>
                  <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                </div>
                {post.url && (
                  <a href={post.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-amber-500">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
              {post.likes !== undefined && (
                <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                  <Heart className="w-3 h-3" />
                  {post.likes}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

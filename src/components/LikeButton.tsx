'use client';

import { useState, useEffect } from 'react';
import { getLikeCount, addLike } from '@/lib/supabase';

export default function LikeButton({ slug }: { slug: string }) {
  const [count, setCount]       = useState(0);
  const [liked, setLiked]       = useState(false);
  const [pop, setPop]           = useState(false);
  const [ready, setReady]       = useState(false);

  useEffect(() => {
    getLikeCount(slug).then(setCount);
    setLiked(!!localStorage.getItem(`liked_${slug}`));
    setReady(true);
  }, [slug]);

  async function handleLike() {
    if (liked) return;
    setLiked(true);
    setCount(c => c + 1);
    setPop(true);
    localStorage.setItem(`liked_${slug}`, '1');
    setTimeout(() => setPop(false), 500);
    await addLike(slug);
  }

  if (!ready) return null;

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      title={liked ? 'You liked this' : 'Like this post'}
      className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-full border transition-all duration-200 ${
        liked
          ? 'border-accent-coral bg-accent-coral/10 text-accent-coral cursor-default'
          : 'border-border text-muted hover:border-accent-coral hover:text-accent-coral hover:bg-accent-coral/5 cursor-pointer'
      }`}
    >
      <span className={`text-xl transition-transform duration-300 ${pop ? 'scale-[1.6]' : 'scale-100'}`}>
        {liked ? '❤️' : '🤍'}
      </span>
      <span className="text-sm font-semibold">{count}</span>
      <span className="text-sm">{count === 1 ? 'like' : 'likes'}</span>
    </button>
  );
}

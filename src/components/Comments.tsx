'use client';

import { useState, useEffect } from 'react';
import { getComments, addComment, type Comment } from '@/lib/supabase';

const ACCENT_BG = ['bg-accent-coral', 'bg-accent-blue', 'bg-accent-gold', 'bg-accent-green'];

function Avatar({ name, index }: { name: string; index: number }) {
  const bg = ACCENT_BG[index % 4];
  return (
    <div className={`w-9 h-9 rounded-full ${bg} flex-shrink-0 flex items-center justify-center mt-0.5`}>
      <span className="text-paper font-display font-bold text-sm leading-none">
        {name.trim()[0]?.toUpperCase() ?? '?'}
      </span>
    </div>
  );
}

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments]   = useState<Comment[]>([]);
  const [loading, setLoading]     = useState(true);
  const [name, setName]           = useState('');
  const [message, setMessage]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    getComments(slug).then(c => { setComments(c); setLoading(false); });
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim())    return setError('Please enter your name.');
    if (!message.trim()) return setError('Please write something.');

    setSubmitting(true);
    try {
      await addComment(slug, name.trim(), message.trim());
      setSuccess(true);
      setName('');
      setMessage('');
      const updated = await getComments(slug);
      setComments(updated);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError('Could not post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Heading */}
      <h3 className="font-display text-2xl font-bold text-ink mb-8">
        {loading ? 'Comments' : `${comments.length} ${comments.length === 1 ? 'Comment' : 'Comments'}`}
      </h3>

      {/* Comment list */}
      {!loading && comments.length > 0 && (
        <div className="space-y-7 mb-10">
          {comments.map((c, i) => (
            <div key={c.id} className="flex gap-4">
              <Avatar name={c.name} index={i} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2 mb-1.5">
                  <span className="font-semibold text-sm text-ink">{c.name}</span>
                  <span className="text-xs text-muted">
                    {new Date(c.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap break-words">
                  {c.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && comments.length === 0 && (
        <p className="text-sm text-muted mb-8 italic">No comments yet. Be the first to share your thoughts.</p>
      )}

      {/* Form */}
      <form onSubmit={submit} className="space-y-4 bg-white border border-border rounded-2xl p-6">
        <p className="font-display font-semibold text-ink text-lg">Leave a comment</p>

        {success && (
          <div className="bg-accent-green/10 border border-accent-green text-accent-green rounded-lg px-4 py-3 text-sm font-medium">
            ✓ Comment posted — thank you!
          </div>
        )}

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          className="w-full border border-border rounded-lg px-4 py-3 text-sm text-ink bg-paper focus:outline-none focus:border-accent-coral transition-colors"
        />
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Share your thoughts…"
          rows={4}
          className="w-full border border-border rounded-lg px-4 py-3 text-sm text-ink bg-paper focus:outline-none focus:border-accent-coral transition-colors resize-none"
        />
        {error && <p className="text-accent-coral text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-ink text-paper px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent-coral transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'Posting…' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
}

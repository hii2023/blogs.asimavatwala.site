'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createPost, uploadImage } from '@/lib/github';

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

const ADMIN_PASSWORD = 'Altaf@2024';

interface Form {
  title: string;
  quote: string;
  content: string;
  coverImageFile: File | null;
}

const EMPTY_FORM: Form = { title: '', quote: '', content: '', coverImageFile: null };

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('gh_token');
    if (saved) setToken(saved);
    if (sessionStorage.getItem('admin_ok') === '1') setLoggedIn(true);
  }, []);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_ok', '1');
      setLoggedIn(true);
      setError('');
    } else {
      setError('Wrong password.');
    }
  }

  function logout() {
    sessionStorage.removeItem('admin_ok');
    setLoggedIn(false);
  }

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, coverImageFile: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Title is required.');
    if (!form.content || form.content === '<p></p>') return setError('Content is required.');
    if (!token.trim()) return setError('GitHub token is required.');

    setPublishing(true);
    try {
      localStorage.setItem('gh_token', token);

      let coverImage: string | undefined;
      if (form.coverImageFile) {
        coverImage = await uploadImage(token, form.coverImageFile);
      }

      const words = form.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const readTime = Math.max(1, Math.round(words / 200));

      await createPost(token, {
        id: Date.now().toString(),
        slug: slugify(form.title),
        title: form.title.trim(),
        quote: form.quote.trim() || undefined,
        coverImage,
        content: form.content,
        createdAt: new Date().toISOString(),
        published: true,
        readTime,
      });

      setDone(true);
      setForm(EMPTY_FORM);
      setPreview(null);
      setTimeout(() => setDone(false), 6000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to publish. Check your token.');
    } finally {
      setPublishing(false);
    }
  }

  if (!mounted) return null;

  /* ── LOGIN SCREEN ── */
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="w-full max-w-xs">
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl font-bold text-ink">Admin</h1>
            <p className="text-muted text-sm mt-1 tracking-wide">blogs.asimavatwala.site</p>
            <div className="flex justify-center gap-1.5 mt-4">
              {['bg-accent-coral','bg-accent-gold','bg-accent-green','bg-accent-blue'].map((c) => (
                <span key={c} className={`w-5 h-[3px] rounded-full ${c}`} />
              ))}
            </div>
          </div>

          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-muted uppercase mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                className="w-full border border-border rounded-lg px-4 py-3 bg-white text-ink text-sm focus:outline-none focus:border-accent-coral transition-colors"
              />
            </div>
            {error && <p className="text-accent-coral text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-ink text-paper py-3 rounded-lg text-sm font-medium hover:bg-accent-coral transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── EDITOR SCREEN ── */
  return (
    <div className="min-h-screen bg-paper">
      {/* Admin header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="font-display text-lg font-bold text-ink hover:opacity-70 transition-opacity">
              Altaf
            </a>
            <span className="text-border text-lg">·</span>
            <span className="text-sm text-muted">New Post</span>
          </div>
          <button onClick={logout} className="text-xs text-muted hover:text-ink transition-colors">
            Log out
          </button>
        </div>
        <div className="h-[3px] flex">
          {['bg-accent-coral','bg-accent-gold','bg-accent-green','bg-accent-blue'].map((c) => (
            <div key={c} className={`flex-1 ${c}`} />
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {done && (
          <div className="bg-accent-green/10 border border-accent-green text-accent-green rounded-lg px-4 py-3 mb-8 text-sm font-medium">
            ✓ Post published! Your site will rebuild in ~2 minutes.
          </div>
        )}

        <form onSubmit={publish} className="space-y-9">

          {/* GitHub Token */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-muted uppercase mb-2">
              GitHub Token
              <span className="normal-case tracking-normal text-muted ml-2 text-xs">(saved in your browser)</span>
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="github_pat_…"
              className="w-full border border-border rounded-lg px-4 py-3 bg-white text-ink text-sm font-mono focus:outline-none focus:border-accent-coral transition-colors"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-muted uppercase mb-3">
              Title <span className="text-accent-coral">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Give your post a title…"
              className="w-full border-0 border-b-2 border-border bg-transparent font-display text-3xl font-bold text-ink focus:outline-none focus:border-accent-coral transition-colors pb-2 placeholder:text-border placeholder:font-normal placeholder:text-2xl"
            />
          </div>

          {/* Quote */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-muted uppercase mb-2">
              Opening Quote
              <span className="normal-case tracking-normal text-muted ml-2 text-xs">(optional)</span>
            </label>
            <input
              type="text"
              value={form.quote}
              onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
              placeholder="A line to set the tone…"
              className="w-full border border-border rounded-lg px-4 py-3 bg-white text-ink text-sm italic focus:outline-none focus:border-accent-coral transition-colors"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-muted uppercase mb-2">
              Cover Image
              <span className="normal-case tracking-normal text-muted ml-2 text-xs">(optional)</span>
            </label>
            <label className="block border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-accent-coral transition-colors">
              <input type="file" accept="image/*" onChange={onImage} className="hidden" />
              {preview ? (
                <div>
                  <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-lg object-cover mb-2" />
                  <p className="text-xs text-muted">{form.coverImageFile?.name}</p>
                  <p className="text-xs text-accent-coral mt-1">Click to change</p>
                </div>
              ) : (
                <>
                  <p className="text-muted text-sm mb-1">Click or drag an image</p>
                  <p className="text-xs text-muted opacity-60">PNG · JPG · WebP · up to 10 MB</p>
                </>
              )}
            </label>
          </div>

          {/* Content */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-muted uppercase mb-2">
              Content <span className="text-accent-coral">*</span>
            </label>
            <Editor
              content={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
            />
          </div>

          {error && (
            <p className="text-accent-coral text-sm">{error}</p>
          )}

          <div className="flex items-center gap-5 pt-2">
            <button
              type="submit"
              disabled={publishing}
              className="bg-ink text-paper px-10 py-3 rounded-lg text-sm font-semibold hover:bg-accent-coral transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {publishing ? 'Publishing…' : 'Publish Post'}
            </button>
            <p className="text-xs text-muted">Site rebuilds in ~2 min after publishing</p>
          </div>
        </form>
      </main>
    </div>
  );
}

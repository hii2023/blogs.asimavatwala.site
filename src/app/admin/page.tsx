'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { createPost, updatePost, uploadImage } from '@/lib/github';

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

const ADMIN_PASSWORD = 'Altaf@2024';
const OWNER = 'hii2023';
const REPO = 'blogs.asimavatwala.site';

interface Form {
  title: string;
  quote: string;
  content: string;
  coverImage: string;        // existing URL (when editing)
  coverImageFile: File | null; // new upload
}

interface PostMeta {
  slug: string;
  title: string;
  sha: string;        // file sha for GitHub update API
  createdAt: string;
}

const EMPTY_FORM: Form = { title: '', quote: '', content: '', coverImage: '', coverImageFile: null };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60);
}

type View = 'list' | 'new' | 'edit';

export default function AdminPage() {
  const [mounted, setMounted]     = useState(false);
  const [loggedIn, setLoggedIn]   = useState(false);
  const [password, setPassword]   = useState('');
  const [token, setToken]         = useState('');
  const [view, setView]           = useState<View>('list');

  // post list
  const [posts, setPosts]         = useState<PostMeta[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // editor
  const [form, setForm]           = useState<Form>(EMPTY_FORM);
  const [editSlug, setEditSlug]   = useState<string | null>(null);
  const [editSha, setEditSha]     = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [done, setDone]           = useState('');

  /* ── bootstrap ── */
  useEffect(() => {
    setMounted(true);
    const t = localStorage.getItem('gh_token');
    if (t) setToken(t);
    if (sessionStorage.getItem('admin_ok') === '1') setLoggedIn(true);
  }, []);

  /* ── fetch post list from GitHub ── */
  const loadPosts = useCallback(async (tok: string) => {
    if (!tok) return;
    setLoadingPosts(true);
    try {
      const res = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/posts`,
        { headers: { Authorization: `Bearer ${tok}`, Accept: 'application/vnd.github+json' } }
      );
      if (!res.ok) { setPosts([]); return; }
      const files: { name: string; sha: string }[] = await res.json();
      const metas = await Promise.all(
        files.filter(f => f.name.endsWith('.json')).map(async f => {
          const r = await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/contents/posts/${f.name}`,
            { headers: { Authorization: `Bearer ${tok}`, Accept: 'application/vnd.github+json' } }
          );
          const d = await r.json();
          const post = JSON.parse(atob(d.content.replace(/\n/g, '')));
          return { slug: post.slug, title: post.title, sha: d.sha, createdAt: post.createdAt } as PostMeta;
        })
      );
      setPosts(metas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch { setPosts([]); }
    finally { setLoadingPosts(false); }
  }, []);

  useEffect(() => { if (loggedIn && token) loadPosts(token); }, [loggedIn, token, loadPosts]);

  /* ── load a post into editor ── */
  async function openEdit(meta: PostMeta) {
    setError('');
    try {
      const res = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/posts/${meta.slug}.json`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
      );
      const d = await res.json();
      const post = JSON.parse(atob(d.content.replace(/\n/g, '')));
      setForm({ title: post.title, quote: post.quote ?? '', content: post.content, coverImage: post.coverImage ?? '', coverImageFile: null });
      setImagePreview(post.coverImage ?? null);
      setEditSlug(meta.slug);
      setEditSha(d.sha);
      setView('edit');
    } catch {
      setError('Could not load post. Check your token.');
    }
  }

  /* ── auth ── */
  function login(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) { sessionStorage.setItem('admin_ok', '1'); setLoggedIn(true); setError(''); }
    else setError('Wrong password.');
  }
  function logout() { sessionStorage.removeItem('admin_ok'); setLoggedIn(false); }

  /* ── image picker ── */
  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm(f => ({ ...f, coverImageFile: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  /* ── save (create or update) ── */
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Title is required.');
    if (!form.content || form.content === '<p></p>') return setError('Content is required.');
    if (!token.trim()) return setError('GitHub token is required.');

    setSaving(true);
    try {
      localStorage.setItem('gh_token', token);

      let coverImage: string | undefined = form.coverImage || undefined;
      if (form.coverImageFile) coverImage = await uploadImage(token, form.coverImageFile);

      const words = form.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const readTime = Math.max(1, Math.round(words / 200));

      if (view === 'edit' && editSlug && editSha) {
        // UPDATE existing post
        await updatePost(token, {
          id: editSlug,
          slug: editSlug,
          title: form.title.trim(),
          quote: form.quote.trim() || undefined,
          coverImage,
          content: form.content,
          createdAt: posts.find(p => p.slug === editSlug)?.createdAt ?? new Date().toISOString(),
          published: true,
          readTime,
        }, editSha);
        setDone('Post updated! Site rebuilds in ~2 minutes.');
      } else {
        // CREATE new post
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
        setDone('Post published! Site rebuilds in ~2 minutes.');
      }

      setForm(EMPTY_FORM);
      setImagePreview(null);
      setEditSlug(null);
      setEditSha(null);
      setView('list');
      await loadPosts(token);
      setTimeout(() => setDone(''), 6000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save. Check your token.');
    } finally {
      setSaving(false);
    }
  }

  function startNew() {
    setForm(EMPTY_FORM);
    setImagePreview(null);
    setEditSlug(null);
    setEditSha(null);
    setError('');
    setView('new');
  }

  if (!mounted) return null;

  /* ══════════════════ LOGIN ══════════════════ */
  if (!loggedIn) return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-ink">Admin</h1>
          <p className="text-muted text-sm mt-1 tracking-wide">Present Enough</p>
          <div className="flex justify-center gap-1.5 mt-4">
            {['bg-accent-coral','bg-accent-gold','bg-accent-green','bg-accent-blue'].map(c => (
              <span key={c} className={`w-5 h-[3px] rounded-full ${c}`} />
            ))}
          </div>
        </div>
        <form onSubmit={login} className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-muted uppercase mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoFocus
              className="w-full border border-border rounded-lg px-4 py-3 bg-white text-ink text-sm focus:outline-none focus:border-accent-coral transition-colors" />
          </div>
          {error && <p className="text-accent-coral text-sm">{error}</p>}
          <button type="submit" className="w-full bg-ink text-paper py-3 rounded-lg text-sm font-medium hover:bg-accent-coral transition-colors">
            Enter
          </button>
        </form>
      </div>
    </div>
  );

  /* ══════════════════ SHARED HEADER ══════════════════ */
  const AdminHeader = ({ title }: { title: string }) => (
    <header className="bg-white border-b border-border sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="font-display text-lg font-bold text-ink hover:opacity-70 transition-opacity">Present Enough</a>
          <span className="text-border">·</span>
          <span className="text-sm text-muted">{title}</span>
        </div>
        <button onClick={logout} className="text-xs text-muted hover:text-ink transition-colors">Log out</button>
      </div>
      <div className="h-[3px] flex">
        {['bg-accent-coral','bg-accent-gold','bg-accent-green','bg-accent-blue'].map(c => (
          <div key={c} className={`flex-1 ${c}`} />
        ))}
      </div>
    </header>
  );

  /* ══════════════════ POST LIST ══════════════════ */
  if (view === 'list') return (
    <div className="min-h-screen bg-paper">
      <AdminHeader title="Posts" />
      <main className="max-w-3xl mx-auto px-6 py-12">

        {done && (
          <div className="bg-accent-green/10 border border-accent-green text-accent-green rounded-lg px-4 py-3 mb-8 text-sm font-medium">
            ✓ {done}
          </div>
        )}

        {/* Token field */}
        <div className="mb-8">
          <label className="block text-[10px] tracking-[0.2em] text-muted uppercase mb-2">
            GitHub Token <span className="normal-case tracking-normal text-xs">(saved in browser)</span>
          </label>
          <input type="password" value={token}
            onChange={e => { setToken(e.target.value); localStorage.setItem('gh_token', e.target.value); }}
            placeholder="github_pat_…"
            className="w-full border border-border rounded-lg px-4 py-3 bg-white text-ink text-sm font-mono focus:outline-none focus:border-accent-coral transition-colors" />
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-ink">All Posts</h2>
          <button onClick={startNew}
            className="bg-ink text-paper px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent-coral transition-colors">
            + New Post
          </button>
        </div>

        {loadingPosts ? (
          <p className="text-muted text-sm">Loading posts…</p>
        ) : posts.length === 0 ? (
          <p className="text-muted text-sm">No posts yet. Write your first one!</p>
        ) : (
          <div className="space-y-3">
            {posts.map(p => (
              <div key={p.slug} className="flex items-center justify-between bg-white border border-border rounded-xl px-5 py-4 hover:border-accent-coral transition-colors group">
                <div>
                  <p className="font-display font-semibold text-ink group-hover:text-accent-coral transition-colors">{p.title}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    <span className="mx-2">·</span>
                    <a href={`/blog/${p.slug}/`} target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">
                      View ↗
                    </a>
                  </p>
                </div>
                <button onClick={() => openEdit(p)}
                  className="text-xs text-muted hover:text-accent-coral transition-colors font-medium px-3 py-1.5 border border-border rounded-lg hover:border-accent-coral">
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );

  /* ══════════════════ EDITOR (new or edit) ══════════════════ */
  return (
    <div className="min-h-screen bg-paper">
      <AdminHeader title={view === 'edit' ? 'Edit Post' : 'New Post'} />
      <main className="max-w-3xl mx-auto px-6 py-12">

        <button onClick={() => { setView('list'); setError(''); }}
          className="text-xs text-muted hover:text-ink transition-colors mb-8 flex items-center gap-1">
          ← Back to all posts
        </button>

        <form onSubmit={save} className="space-y-9">

          {/* Title */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-muted uppercase mb-3">
              Title <span className="text-accent-coral">*</span>
            </label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Give your post a title…"
              className="w-full border-0 border-b-2 border-border bg-transparent font-display text-3xl font-bold text-ink focus:outline-none focus:border-accent-coral transition-colors pb-2 placeholder:text-border placeholder:font-normal placeholder:text-2xl" />
          </div>

          {/* Quote */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-muted uppercase mb-2">
              Opening Quote <span className="normal-case tracking-normal text-muted ml-1 text-xs">(optional)</span>
            </label>
            <input type="text" value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))}
              placeholder="A line to set the tone…"
              className="w-full border border-border rounded-lg px-4 py-3 bg-white text-ink text-sm italic focus:outline-none focus:border-accent-coral transition-colors" />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-muted uppercase mb-2">
              Cover Image <span className="normal-case tracking-normal text-muted ml-1 text-xs">(optional)</span>
            </label>
            <label className="block border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-accent-coral transition-colors">
              <input type="file" accept="image/*" onChange={onImage} className="hidden" />
              {imagePreview ? (
                <div>
                  <img src={imagePreview} alt="preview" className="max-h-48 mx-auto rounded-lg object-cover mb-2" />
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
            <Editor content={form.content} onChange={html => setForm(f => ({ ...f, content: html }))} />
          </div>

          {error && <p className="text-accent-coral text-sm">{error}</p>}

          <div className="flex items-center gap-5 pt-2">
            <button type="submit" disabled={saving}
              className="bg-ink text-paper px-10 py-3 rounded-lg text-sm font-semibold hover:bg-accent-coral transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {saving ? 'Saving…' : view === 'edit' ? 'Save Changes' : 'Publish Post'}
            </button>
            <p className="text-xs text-muted">Site rebuilds in ~2 min</p>
          </div>
        </form>
      </main>
    </div>
  );
}

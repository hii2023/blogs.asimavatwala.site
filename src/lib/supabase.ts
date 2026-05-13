const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

function h() {
  return {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
  };
}

/* ── Likes ── */
export async function getLikeCount(slug: string): Promise<number> {
  if (!URL) return 0;
  const res = await fetch(`${URL}/rest/v1/likes?post_slug=eq.${slug}&select=id`, { headers: h() });
  if (!res.ok) return 0;
  const data = await res.json();
  return Array.isArray(data) ? data.length : 0;
}

export async function addLike(slug: string): Promise<void> {
  if (!URL) return;
  await fetch(`${URL}/rest/v1/likes`, {
    method: 'POST',
    headers: { ...h(), Prefer: 'return=minimal' },
    body: JSON.stringify({ post_slug: slug }),
  });
}

/* ── Comments ── */
export interface Comment {
  id: string;
  post_slug: string;
  name: string;
  message: string;
  created_at: string;
}

export async function getComments(slug: string): Promise<Comment[]> {
  if (!URL) return [];
  const res = await fetch(
    `${URL}/rest/v1/comments?post_slug=eq.${slug}&order=created_at.asc&select=*`,
    { headers: h() }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function addComment(slug: string, name: string, message: string): Promise<void> {
  if (!URL) throw new Error('Supabase not configured');
  const res = await fetch(`${URL}/rest/v1/comments`, {
    method: 'POST',
    headers: { ...h(), Prefer: 'return=minimal' },
    body: JSON.stringify({ post_slug: slug, name, message }),
  });
  if (!res.ok) throw new Error('Failed to post comment');
}

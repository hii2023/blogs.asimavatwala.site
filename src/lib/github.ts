const OWNER = 'hii2023';
const REPO = 'blogs.asimavatwala.site';
const BRANCH = 'main';

export interface Post {
  id: string;
  slug: string;
  title: string;
  quote?: string;
  coverImage?: string;
  content: string;
  createdAt: string;
  published: boolean;
  readTime?: number;
}

async function ghFetch(token: string, repoPath: string, options: RequestInit = {}) {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${repoPath}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
        ...(options.headers ?? {}),
      },
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `GitHub API error ${res.status}`);
  }
  return res.json();
}

export async function uploadImage(token: string, file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let binary = '';
  new Uint8Array(buf).forEach((b) => (binary += String.fromCharCode(b)));
  const base64 = btoa(binary);

  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${Date.now()}.${ext}`;
  const repoPath = `public/images/posts/${filename}`;

  await ghFetch(token, repoPath, {
    method: 'PUT',
    body: JSON.stringify({
      message: `Upload image: ${filename}`,
      content: base64,
      branch: BRANCH,
    }),
  });

  return `/images/posts/${filename}`;
}

export async function createPost(token: string, post: Post): Promise<void> {
  const json = JSON.stringify(post, null, 2);
  const content = btoa(unescape(encodeURIComponent(json)));

  await ghFetch(token, `posts/${post.slug}.json`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `Add post: ${post.title}`,
      content,
      branch: BRANCH,
    }),
  });
}

export async function updatePost(token: string, post: Post, sha: string): Promise<void> {
  const json = JSON.stringify(post, null, 2);
  const content = btoa(unescape(encodeURIComponent(json)));

  await ghFetch(token, `posts/${post.slug}.json`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `Update post: ${post.title}`,
      content,
      sha,
      branch: BRANCH,
    }),
  });
}

export async function listRemotePosts(token: string): Promise<{ name: string; sha: string }[]> {
  try {
    const files = await ghFetch(token, 'posts') as { name: string; sha: string }[];
    return files.filter((f) => f.name.endsWith('.json'));
  } catch {
    return [];
  }
}

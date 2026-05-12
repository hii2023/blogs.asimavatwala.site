import fs from 'fs';
import path from 'path';

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

export function getAllPosts(): Post[] {
  const postsDir = path.join(process.cwd(), 'posts');
  if (!fs.existsSync(postsDir)) return [];

  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith('.json'))
    .map((file) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(postsDir, file), 'utf-8')) as Post;
      } catch {
        return null;
      }
    })
    .filter((p): p is Post => p !== null && p.published)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(process.cwd(), 'posts', `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Post;
  } catch {
    return null;
  }
}

import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/posts';
import Header from '@/components/Header';
import ShareBar from '@/components/ShareBar';
import LikeButton from '@/components/LikeButton';
import Comments from '@/components/Comments';

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — Present Enough`,
    description: post.quote ?? post.content.replace(/<[^>]*>/g, '').slice(0, 160),
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Title block */}
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-8">
          <div className="flex items-center gap-3 mb-8 text-xs text-muted">
            <a href="/" className="hover:text-ink transition-colors">← All posts</a>
            <span className="text-border">·</span>
            <span>{date}</span>
            {post.readTime && (
              <>
                <span className="text-border">·</span>
                <span>{post.readTime} min read</span>
              </>
            )}
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.1] text-ink mb-8">
            {post.title}
          </h1>

          {post.quote && (
            <blockquote className="border-l-4 border-accent-coral pl-6 py-1 mb-10">
              <p className="font-display text-xl md:text-2xl italic text-muted leading-relaxed">
                &ldquo;{post.quote}&rdquo;
              </p>
            </blockquote>
          )}

          <div className="flex items-center gap-2 mb-10">
            <span className="w-10 h-[3px] bg-accent-coral rounded-full" />
            <span className="w-6 h-[3px] bg-accent-gold rounded-full" />
            <span className="w-3 h-[3px] bg-accent-green rounded-full" />
          </div>
        </div>

        {/* Cover image */}
        {post.coverImage && (
          <div className="max-w-5xl mx-auto px-6 mb-12">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full aspect-[21/9] object-cover rounded-xl shadow-lg"
            />
          </div>
        )}

        {/* Body */}
        <div className="max-w-2xl mx-auto px-6 pb-12">
          <div
            className="blog-content text-ink"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* ── Like + Share ── */}
        <div className="max-w-2xl mx-auto px-6 pb-12">
          <div className="border-t border-border pt-10 space-y-8">
            {/* Like */}
            <div>
              <p className="text-[10px] tracking-[0.2em] text-muted uppercase mb-3 font-semibold">Did you enjoy this?</p>
              <LikeButton slug={post.slug} />
            </div>

            {/* Share */}
            <ShareBar title={post.title} slug={post.slug} />
          </div>
        </div>

        {/* ── Comments ── */}
        <div className="max-w-2xl mx-auto px-6 pb-24">
          <div className="border-t border-border pt-10">
            <Comments slug={post.slug} />
          </div>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-7 flex items-center justify-between">
          <span className="font-display text-sm text-muted">
            &copy; {new Date().getFullYear()} Present Enough · Altaf Simavatwala
          </span>
          <a href="/" className="text-xs text-muted hover:text-ink transition-colors">
            ← Back to all posts
          </a>
        </div>
      </footer>
    </div>
  );
}

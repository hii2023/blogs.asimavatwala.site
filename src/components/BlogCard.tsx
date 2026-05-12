import Link from 'next/link';
import { Post } from '@/lib/posts';

const ACCENTS = [
  { bar: 'bg-accent-coral', text: 'text-accent-coral', border: 'border-accent-coral', light: 'bg-accent-coral/10' },
  { bar: 'bg-accent-blue',  text: 'text-accent-blue',  border: 'border-accent-blue',  light: 'bg-accent-blue/10'  },
  { bar: 'bg-accent-gold',  text: 'text-accent-gold',  border: 'border-accent-gold',  light: 'bg-accent-gold/10'  },
  { bar: 'bg-accent-green', text: 'text-accent-green', border: 'border-accent-green', light: 'bg-accent-green/10' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function excerpt(html: string, len: number) {
  return html.replace(/<[^>]*>/g, '').slice(0, len).trimEnd() + '…';
}

interface Props { post: Post; index: number; featured?: boolean }

export default function BlogCard({ post, index, featured = false }: Props) {
  const a = ACCENTS[index % 4];
  const num = String(index + 1).padStart(2, '0');

  if (featured) {
    return (
      <Link href={`/blog/${post.slug}/`} className="group block">
        <article className="grid md:grid-cols-2 overflow-hidden rounded-xl border border-border hover:shadow-2xl hover:border-transparent transition-all duration-300">
          {/* Image side */}
          <div className={`relative min-h-[280px] overflow-hidden ${post.coverImage ? '' : a.light + ' flex items-center justify-center'}`}>
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <span className={`font-display text-[10rem] font-bold opacity-10 ${a.text} select-none`}>
                {post.title[0]}
              </span>
            )}
            {/* Number badge */}
            <span className={`absolute top-4 left-4 ${a.bar} text-paper text-xs font-bold px-2.5 py-1 rounded-sm tracking-widest`}>
              {num}
            </span>
          </div>

          {/* Text side */}
          <div className={`p-8 md:p-10 flex flex-col justify-center border-l-0 md:border-l-4 ${a.border}`}>
            <p className={`text-xs tracking-[0.2em] uppercase font-semibold ${a.text} mb-4`}>
              Latest Post
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold leading-[1.15] text-ink mb-4 group-hover:opacity-80 transition-opacity">
              {post.title}
            </h2>
            {post.quote && (
              <p className={`text-sm italic ${a.text} mb-4 pl-3 border-l-2 ${a.border}`}>
                &ldquo;{post.quote}&rdquo;
              </p>
            )}
            <p className="text-muted text-sm leading-relaxed mb-6">
              {excerpt(post.content, 180)}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>{formatDate(post.createdAt)}</span>
              {post.readTime && <><span>·</span><span>{post.readTime} min read</span></>}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}/`} className="group block h-full">
      <article className="flex flex-col h-full overflow-hidden rounded-xl border border-border hover:shadow-xl hover:border-transparent transition-all duration-300">
        {/* Image */}
        <div className={`relative aspect-[16/9] overflow-hidden ${post.coverImage ? '' : a.light + ' flex items-center justify-center'}`}>
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span className={`font-display text-7xl font-bold opacity-10 ${a.text} select-none`}>
              {post.title[0]}
            </span>
          )}
          <span className={`absolute top-3 left-3 ${a.bar} text-paper text-xs font-bold px-2 py-0.5 rounded-sm tracking-widest`}>
            {num}
          </span>
        </div>

        {/* Text */}
        <div className={`flex flex-col flex-1 p-5 border-t-[3px] ${a.border}`}>
          <h3 className="font-display text-xl font-bold leading-snug text-ink mb-2 group-hover:opacity-75 transition-opacity line-clamp-2">
            {post.title}
          </h3>
          {post.quote && (
            <p className="text-xs italic text-muted mb-2 line-clamp-1">
              &ldquo;{post.quote}&rdquo;
            </p>
          )}
          <p className="text-muted text-sm leading-relaxed flex-1 line-clamp-3 mb-4">
            {excerpt(post.content, 110)}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>{formatDate(post.createdAt)}</span>
            {post.readTime && <><span>·</span><span>{post.readTime} min read</span></>}
          </div>
        </div>
      </article>
    </Link>
  );
}

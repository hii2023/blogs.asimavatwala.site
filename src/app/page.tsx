import { getAllPosts } from '@/lib/posts';
import Header from '@/components/Header';
import BlogCard from '@/components/BlogCard';

export default function Home() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Header />

      {/* Intro */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-ink leading-[1.1] mb-8 max-w-2xl">
            Present Enough
          </h1>
          <div className="max-w-2xl space-y-4 text-muted leading-relaxed">
            <p>
              I write about responsibility, freedom, systems, inequality, awareness, business, health,
              and the uncomfortable truths we often ignore.
            </p>
            <p>
              These are not motivational quotes or polished philosophies. They are observations,
              questions, patterns, and thoughts shaped through experience, mistakes, analysis, and
              paying attention to how people and systems actually work.
            </p>
            <p>
              I believe freedom comes with responsibility, comfort often hides blindness, and the
              world runs on the invisible labor of people we rarely notice enough.
            </p>
            <p className="text-ink font-medium">
              This space is simply an attempt to think honestly, stay grounded, and document ideas
              worth questioning.
            </p>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-16">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="font-display text-5xl font-bold text-ink mb-3 opacity-20">∅</p>
            <p className="font-display text-2xl text-muted">The first essay is being written.</p>
            <p className="text-sm text-muted mt-2 opacity-60">Check back soon.</p>
          </div>
        ) : (
          <>
            {featured && (
              <section className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-[10px] tracking-[0.25em] text-muted uppercase font-semibold">
                    Latest
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <BlogCard post={featured} index={0} featured />
              </section>
            )}

            {rest.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-[10px] tracking-[0.25em] text-muted uppercase font-semibold">
                    More Thoughts
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post, i) => (
                    <BlogCard key={post.slug} post={post} index={i + 1} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-7 flex items-center justify-between">
          <span className="font-display text-sm text-muted">
            &copy; {new Date().getFullYear()} Present Enough · Altaf Simavatwala
          </span>
          <span className="text-xs text-muted tracking-wide">blogs.asimavatwala.site</span>
        </div>
      </footer>
    </div>
  );
}

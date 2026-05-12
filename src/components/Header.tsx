import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-border bg-paper">
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="group flex flex-col leading-tight">
          <span className="font-display text-2xl font-bold tracking-tight text-ink group-hover:opacity-75 transition-opacity">
            Altaf
          </span>
          <span className="text-[10px] tracking-[0.2em] text-muted uppercase font-body">
            thoughts &amp; essays
          </span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            href="/"
            className="text-sm text-muted hover:text-ink transition-colors tracking-wide"
          >
            Home
          </Link>
          <a
            href="https://asimavatwala.site"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted hover:text-ink transition-colors tracking-wide"
          >
            About
          </a>
        </nav>
      </div>
      {/* Colorful rule */}
      <div className="h-[3px] flex">
        <div className="flex-1 bg-accent-coral" />
        <div className="flex-1 bg-accent-gold" />
        <div className="flex-1 bg-accent-green" />
        <div className="flex-1 bg-accent-blue" />
      </div>
    </header>
  );
}

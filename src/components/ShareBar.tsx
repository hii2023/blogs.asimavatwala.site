'use client';

import { useState, useEffect } from 'react';

interface Props { title: string; slug: string }

export default function ShareBar({ title, slug }: Props) {
  const [copied, setCopied]     = useState(false);
  const [canShare, setCanShare] = useState(false);

  const url  = `https://blogs.asimavatwala.site/blog/${slug}/`;
  const enc  = encodeURIComponent(url);
  const encT = encodeURIComponent(title);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function nativeShare() {
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* cancelled */ }
    }
  }

  const buttons = [
    {
      label: 'Twitter / X',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.264 5.633 5.9-5.633zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encT}&url=${enc}`,
      color: 'hover:border-[#1DA1F2] hover:text-[#1DA1F2]',
    },
    {
      label: 'Facebook',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
      color: 'hover:border-[#1877F2] hover:text-[#1877F2]',
    },
    {
      label: 'Email',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      ),
      href: `mailto:?subject=${encT}&body=I thought you'd find this interesting:%0A%0A${url}`,
      color: 'hover:border-accent-coral hover:text-accent-coral',
    },
  ];

  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] text-muted uppercase mb-3 font-semibold">Share this post</p>
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => (
          <a
            key={b.label}
            href={b.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-muted transition-all text-sm ${b.color}`}
          >
            {b.icon}
            <span>{b.label}</span>
          </a>
        ))}

        {/* Native share — only shown when Web Share API is available (mobile/supported browsers) */}
        {canShare && (
          <button
            onClick={nativeShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-muted hover:border-accent-coral hover:text-accent-coral transition-all text-sm"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
            </svg>
            <span>Share</span>
          </button>
        )}

        {/* Copy Link */}
        <button
          onClick={copyLink}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm ${
            copied
              ? 'border-accent-green text-accent-green bg-accent-green/10'
              : 'border-border text-muted hover:border-accent-green hover:text-accent-green'
          }`}
        >
          {copied ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
          )}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
}

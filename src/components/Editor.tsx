'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface Props {
  content: string;
  onChange: (html: string) => void;
}

function ToolBtn({
  label, active, onClick,
}: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
        active
          ? 'bg-ink text-paper'
          : 'text-muted hover:bg-border hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}

export default function Editor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing your thoughts here…' }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && content === '' && editor.getText() !== '') {
      editor.commands.clearContent();
    }
  }, [content, editor]);

  if (!editor) return null;

  const e = editor;

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-border bg-paper">
        <ToolBtn label="B"        onClick={() => e.chain().focus().toggleBold().run()}           active={e.isActive('bold')} />
        <ToolBtn label="I"        onClick={() => e.chain().focus().toggleItalic().run()}         active={e.isActive('italic')} />
        <ToolBtn label="U"        onClick={() => e.chain().focus().toggleUnderline().run()}      active={e.isActive('underline')} />
        <div className="w-px h-4 bg-border mx-1" />
        <ToolBtn label="H2"       onClick={() => e.chain().focus().toggleHeading({ level: 2 }).run()} active={e.isActive('heading', { level: 2 })} />
        <ToolBtn label="H3"       onClick={() => e.chain().focus().toggleHeading({ level: 3 }).run()} active={e.isActive('heading', { level: 3 })} />
        <div className="w-px h-4 bg-border mx-1" />
        <ToolBtn label="• List"   onClick={() => e.chain().focus().toggleBulletList().run()}     active={e.isActive('bulletList')} />
        <ToolBtn label="1. List"  onClick={() => e.chain().focus().toggleOrderedList().run()}    active={e.isActive('orderedList')} />
        <div className="w-px h-4 bg-border mx-1" />
        <ToolBtn label="❝ Quote"  onClick={() => e.chain().focus().toggleBlockquote().run()}     active={e.isActive('blockquote')} />
        <ToolBtn label="─ Rule"   onClick={() => e.chain().focus().setHorizontalRule().run()} />
      </div>

      {/* Content area */}
      <div className="px-6 py-5 min-h-[360px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const html = useMemo(() => {
    try {
      marked.setOptions({
        gfm: true,
        breaks: true,
      });
      return marked.parse(content || '') as string;
    } catch (err) {
      console.error('Failed to parse markdown:', err);
      return content;
    }
  }, [content]);

  return (
    <div
      className={`prose-academic text-slate-800 leading-relaxed max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

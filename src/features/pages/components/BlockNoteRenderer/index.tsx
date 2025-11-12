import React, { useEffect, useState, useMemo } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { Block, PartialBlock } from '@blocknote/core';

interface BlockNoteRendererProps {
  content: PartialBlock[] | Block[];
  className?: string;
}

export const BlockNoteRenderer: React.FC<BlockNoteRendererProps> = ({
  content,
  className = ''
}) => {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  // Watch for theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Create read-only editor instance
  const editor = useCreateBlockNote({
    initialContent: content as PartialBlock[],
  });

  return (
    <div className={`blocknote-renderer ${className}`}>
      <BlockNoteView
        editor={editor}
        theme={isDark ? 'dark' : 'light'}
        editable={false}
        data-color-scheme={isDark ? 'dark' : 'light'}
      />

      <style>{`
        /* BlockNote Renderer Styling */
        .blocknote-renderer {
          width: 100%;
        }

        /* Remove padding/margins for renderer view */
        .blocknote-renderer .bn-container {
          padding: 0;
        }

        /* Dark mode styling */
        .blocknote-renderer .bn-container[data-color-scheme="dark"] {
          background-color: transparent;
          color: #f1f5f9;
        }

        /* Light mode styling */
        .blocknote-renderer .bn-container[data-color-scheme="light"] {
          background-color: transparent;
          color: #1e293b;
        }

        /* Hide side menu in read-only mode */
        .blocknote-renderer .bn-side-menu {
          display: none;
        }

        /* Typography adjustments for better readability */
        .blocknote-renderer .bn-block-content {
          line-height: 1.75;
        }

        .blocknote-renderer h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .blocknote-renderer h2 {
          font-size: 1.875rem;
          font-weight: 600;
          margin-top: 1.75rem;
          margin-bottom: 0.875rem;
          line-height: 1.3;
        }

        .blocknote-renderer h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }

        .blocknote-renderer p {
          margin-bottom: 1rem;
        }

        .blocknote-renderer ul,
        .blocknote-renderer ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .blocknote-renderer li {
          margin-bottom: 0.5rem;
        }

        .blocknote-renderer code {
          background-color: #f1f5f9;
          color: #e11d48;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }

        .blocknote-renderer[data-color-scheme="dark"] code {
          background-color: #1e293b;
          color: #fb7185;
        }

        .blocknote-renderer pre {
          background-color: #f1f5f9;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }

        .blocknote-renderer[data-color-scheme="dark"] pre {
          background-color: #1e293b;
        }

        .blocknote-renderer blockquote {
          border-left: 4px solid #e2e8f0;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #64748b;
        }

        .blocknote-renderer[data-color-scheme="dark"] blockquote {
          border-left-color: #475569;
          color: #94a3b8;
        }

        .blocknote-renderer img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }

        .blocknote-renderer a {
          color: #2563eb;
          text-decoration: underline;
          transition: color 0.2s;
        }

        .blocknote-renderer a:hover {
          color: #1d4ed8;
        }

        .blocknote-renderer[data-color-scheme="dark"] a {
          color: #60a5fa;
        }

        .blocknote-renderer[data-color-scheme="dark"] a:hover {
          color: #93c5fd;
        }

        /* Table styling */
        .blocknote-renderer table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        .blocknote-renderer th,
        .blocknote-renderer td {
          border: 1px solid #e2e8f0;
          padding: 0.75rem;
          text-align: left;
        }

        .blocknote-renderer th {
          background-color: #f8fafc;
          font-weight: 600;
        }

        .blocknote-renderer[data-color-scheme="dark"] th,
        .blocknote-renderer[data-color-scheme="dark"] td {
          border-color: #334155;
        }

        .blocknote-renderer[data-color-scheme="dark"] th {
          background-color: #1e293b;
        }
      `}</style>
    </div>
  );
};

export default BlockNoteRenderer;

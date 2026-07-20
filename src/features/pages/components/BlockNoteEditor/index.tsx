import React, { useEffect, useState, useMemo } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { Block, BlockNoteEditor as BlockNoteEditorType, PartialBlock } from '@blocknote/core';
import { Theme } from '@blocknote/mantine';

interface BlockNoteEditorProps {
  initialContent?: PartialBlock[];
  onChange: (blocks: Block[]) => void;
  onSave?: (blocks: Block[]) => Promise<void>;
  editable?: boolean;
}

// Custom theme that integrates with Tailwind CSS colors
const createCustomTheme = (): Theme => ({
  light: {
    colors: {
      editor: {
        text: '#1e293b',      // slate-800
        background: '#ffffff',
      },
      menu: {
        text: '#1e293b',      // slate-800
        background: '#f8fafc', // slate-50
      },
      tooltip: {
        text: '#f8fafc',      // slate-50
        background: '#1e293b', // slate-800
      },
      hovered: {
        text: '#0f172a',      // slate-900
        background: '#f1f5f9', // slate-100
      },
      selected: {
        text: '#0f172a',      // slate-900
        background: '#e2e8f0', // slate-200
      },
      disabled: {
        text: '#94a3b8',      // slate-400
        background: '#f1f5f9', // slate-100
      },
      shadow: '#0f172a20',    // slate-900 with opacity
      border: '#e2e8f0',      // slate-200
      sideMenu: '#64748b',    // slate-500
      highlights: {
        gray: { text: '#1e293b', background: '#f1f5f9' },
        brown: { text: '#78350f', background: '#fef3c7' },
        red: { text: '#991b1b', background: '#fee2e2' },
        orange: { text: '#c2410c', background: '#fed7aa' },
        yellow: { text: '#854d0e', background: '#fef08a' },
        green: { text: '#166534', background: '#d9f99d' },
        blue: { text: '#1e40af', background: '#dbeafe' },
        purple: { text: '#6b21a8', background: '#e9d5ff' },
        pink: { text: '#9f1239', background: '#fce7f3' },
      },
    },
  },
  dark: {
    colors: {
      editor: {
        text: '#f1f5f9',      // slate-100
        background: '#0f172a', // slate-900
      },
      menu: {
        text: '#f1f5f9',      // slate-100
        background: '#1e293b', // slate-800
      },
      tooltip: {
        text: '#0f172a',      // slate-900
        background: '#e2e8f0', // slate-200
      },
      hovered: {
        text: '#f8fafc',      // slate-50
        background: '#334155', // slate-700
      },
      selected: {
        text: '#ffffff',
        background: '#475569', // slate-600
      },
      disabled: {
        text: '#64748b',      // slate-500
        background: '#1e293b', // slate-800
      },
      shadow: '#00000040',    // black with opacity
      border: '#334155',      // slate-700
      sideMenu: '#94a3b8',    // slate-400
      highlights: {
        gray: { text: '#f1f5f9', background: '#334155' },
        brown: { text: '#fef3c7', background: '#78350f' },
        red: { text: '#fee2e2', background: '#991b1b' },
        orange: { text: '#fed7aa', background: '#c2410c' },
        yellow: { text: '#fef08a', background: '#854d0e' },
        green: { text: '#d9f99d', background: '#166534' },
        blue: { text: '#dbeafe', background: '#1e40af' },
        purple: { text: '#e9d5ff', background: '#6b21a8' },
        pink: { text: '#fce7f3', background: '#9f1239' },
      },
    },
  },
});

export const BlockNoteEditor: React.FC<BlockNoteEditorProps> = ({
  initialContent,
  onChange,
  onSave,
  editable = true,
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

  // Create editor instance
  const editor = useCreateBlockNote({
    initialContent: initialContent as PartialBlock[] | undefined,
  });

  // Custom theme
  const customTheme = useMemo(() => createCustomTheme(), []);

  // Handle content changes
  const handleChange = () => {
    const blocks = editor.document;
    onChange(blocks);
  };

  return (
    <div className="blocknote-editor-wrapper w-full">
      <BlockNoteView
        editor={editor}
        theme={isDark ? 'dark' : 'light'}
        onChange={handleChange}
        editable={editable}
        data-color-scheme={isDark ? 'dark' : 'light'}
      />
      {onSave && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onSave(editor.document)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            Save Content
          </button>
        </div>
      )}

      <style>{`
        /* BlockNote Editor Container Styling */
        .blocknote-editor-wrapper {
          min-height: 400px;
        }

        /* Ensure proper background in dark mode */
        .bn-container[data-color-scheme="dark"] {
          background-color: #0f172a;
          color: #f1f5f9;
        }

        .bn-container[data-color-scheme="light"] {
          background-color: #ffffff;
          color: #1e293b;
        }

        /* Custom scrollbar for better dark mode experience */
        .bn-container[data-color-scheme="dark"] ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .bn-container[data-color-scheme="dark"] ::-webkit-scrollbar-track {
          background: #1e293b;
        }

        .bn-container[data-color-scheme="dark"] ::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }

        .bn-container[data-color-scheme="dark"] ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }

        /* Light mode scrollbar */
        .bn-container[data-color-scheme="light"] ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .bn-container[data-color-scheme="light"] ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .bn-container[data-color-scheme="light"] ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .bn-container[data-color-scheme="light"] ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default BlockNoteEditor;

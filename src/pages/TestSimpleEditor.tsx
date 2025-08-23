import React from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/react/style.css';
import '@blocknote/mantine/style.css';

export default function TestSimpleEditor() {
  // Create editor with no initial content
  const editor = useCreateBlockNote();

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Test Simple Editor</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <BlockNoteView editor={editor} theme="light" />
      </div>
    </div>
  );
}
import React from 'react';
import { EditorRoot, EditorContent } from 'novel';
import { StarterKit } from '@tiptap/starter-kit';

// Simple test component to verify Novel is working
export default function NovelTest() {
  console.log('NovelTest component rendering...');
  
  return (
    <div className="border border-red-500 p-4 m-4">
      <h3 className="text-red-600 font-bold mb-2">Novel Test Component</h3>
      <div className="border border-gray-300 min-h-[100px]">
        <EditorRoot>
          <EditorContent
            extensions={[StarterKit]}
            initialContent={{
              type: 'doc',
              content: [{
                type: 'paragraph',
                content: [{
                  type: 'text',
                  text: 'This is a test of the Novel editor...'
                }]
              }]
            }}
            onUpdate={({ editor }) => {
              console.log('Editor content:', editor.getHTML());
            }}
            className="p-2"
          />
        </EditorRoot>
      </div>
    </div>
  );
}
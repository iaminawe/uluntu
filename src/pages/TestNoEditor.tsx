import React, { useState } from 'react';

export default function TestNoEditor() {
  const [text, setText] = useState('');

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Page - No Editor</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Simple Textarea Test</h2>
          <p className="mb-4">This page tests if the app works without any rich text editor.</p>
          
          <textarea
            className="w-full p-3 border rounded-lg"
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type something here..."
          />
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">Character count: {text.length}</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Navigation Links:</h3>
          <ul className="space-y-2">
            <li><a href="/" className="text-blue-600 hover:underline">Home</a></li>
            <li><a href="/test-simple" className="text-blue-600 hover:underline">Test Simple Editor</a></li>
            <li><a href="/ai-editor" className="text-blue-600 hover:underline">AI Editor Demo</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
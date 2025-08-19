import React, { useState } from 'react';
import {
  AuthorLink,
  AuthorAvatar,
  AuthorName,
  AuthorCard
} from '../shared/components/ui/AuthorLink';
import { AuthorSelector } from '../shared/components/ui/AuthorLink/AuthorSelector';
import { useAuthorById } from '../hooks/useAuthor';

/**
 * Comprehensive examples demonstrating the AuthorLink component system
 * This file shows various use cases and implementations
 */

// Mock content data for examples
const mockBlogPost = {
  id: '1',
  title: 'Building Better User Interfaces',
  content: 'Lorem ipsum...',
  authorId: '123',
  publishedAt: '2024-01-15T10:00:00Z'
};

const mockComment = {
  id: '2',
  content: 'This is a great article!',
  author_id: '456',
  createdAt: '2024-01-16T14:30:00Z'
};

const mockTeamMembers = ['123', '456', '789', '101'];

export function AuthorDisplayExamples() {
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedSingleAuthor, setSelectedSingleAuthor] = useState<string[]>([]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Author Display Examples</h1>
        <p className="text-gray-600 mb-8">
          This page demonstrates various ways to use the AuthorLink component system
          for displaying author information throughout your application.
        </p>
      </div>

      {/* Basic Usage Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Name Only</h3>
            <AuthorLink authorId="123" />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Avatar Only</h3>
            <AuthorAvatar authorId="123" size="md" />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Name + Avatar</h3>
            <AuthorLink authorId="123" showAvatar />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Full Display</h3>
            <AuthorLink authorId="123" showAvatar showTitle />
          </div>
        </div>
      </section>

      {/* Size Variations */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Size Variations</h2>
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Small</p>
            <AuthorLink authorId="123" showAvatar showTitle size="sm" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Medium (default)</p>
            <AuthorLink authorId="123" showAvatar showTitle size="md" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Large</p>
            <AuthorLink authorId="123" showAvatar showTitle size="lg" />
          </div>
        </div>
      </section>

      {/* Content Integration Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Content Integration</h2>
        
        <div className="space-y-6">
          {/* Blog Post Example */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{mockBlogPost.title}</h3>
              <p className="text-gray-600 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <AuthorLink 
                  content={mockBlogPost} 
                  showAvatar 
                  showTitle 
                  size="sm" 
                />
                <span className="text-sm text-gray-500">
                  {new Date(mockBlogPost.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Comment Example */}
          <div className="border-l-4 border-blue-200 pl-4 py-2">
            <div className="flex items-start gap-3">
              <AuthorAvatar content={mockComment} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AuthorName content={mockComment} size="sm" className="font-medium" />
                  <span className="text-xs text-gray-500">
                    {new Date(mockComment.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{mockComment.content}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Display Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Team Display</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockTeamMembers.map((memberId) => (
            <AuthorCard key={memberId} authorId={memberId} />
          ))}
        </div>
      </section>

      {/* Interactive Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Interactive Examples</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Multi-select Example */}
          <div>
            <h3 className="font-medium mb-3">Multi-Author Selector</h3>
            <AuthorSelector
              availableAuthorIds={mockTeamMembers}
              selectedAuthorIds={selectedAuthors}
              onSelectionChange={setSelectedAuthors}
              multiple
              searchable
              className="mb-4"
            />
            {selectedAuthors.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Selected Authors:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAuthors.map(authorId => (
                    <div key={authorId} className="bg-blue-50 rounded-full px-3 py-1">
                      <AuthorName authorId={authorId} size="sm" noLink />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Single-select Example */}
          <div>
            <h3 className="font-medium mb-3">Single Author Selector</h3>
            <AuthorSelector
              availableAuthorIds={mockTeamMembers}
              selectedAuthorIds={selectedSingleAuthor}
              onSelectionChange={setSelectedSingleAuthor}
              multiple={false}
              searchable
              className="mb-4"
            />
            {selectedSingleAuthor.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Selected Author:</p>
                <AuthorLink 
                  authorId={selectedSingleAuthor[0]} 
                  showAvatar 
                  showTitle 
                  className="bg-green-50 p-3 rounded-lg" 
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Loading and Error States */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Loading & Error States</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Loading State</h3>
            <AuthorLink authorId="loading-author" showAvatar showTitle />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Error State</h3>
            <AuthorLink authorId="nonexistent" showAvatar showTitle />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Custom Fallback</h3>
            <AuthorLink 
              authorId="nonexistent" 
              showAvatar 
              showTitle 
              unknownAuthorText="Content Author"
              errorFallback={<span className="text-orange-600">Author Unavailable</span>}
            />
          </div>
        </div>
      </section>

      {/* Advanced Usage */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Advanced Usage</h2>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Custom Click Handler</h3>
            <AuthorLink 
              authorId="123" 
              showAvatar 
              showTitle 
              noLink
              onClick={(author) => alert(`Clicked on ${author.name}!`)}
              className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Custom Styling</h3>
            <AuthorLink 
              authorId="123" 
              showAvatar 
              showTitle
              avatarSize={48}
              className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200"
            />
          </div>
        </div>
      </section>

      {/* Implementation Notes */}
      <section className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Implementation Notes</h2>
        <div className="prose prose-sm max-w-none">
          <ul className="space-y-2">
            <li><strong>Flexible Data Sources:</strong> Can use authorId prop or extract from content objects</li>
            <li><strong>Loading States:</strong> Automatically shows skeleton loading while fetching data</li>
            <li><strong>Error Handling:</strong> Graceful fallbacks for missing or failed author data</li>
            <li><strong>Performance:</strong> Built-in caching and optimized queries</li>
            <li><strong>Accessibility:</strong> Proper ARIA labels and keyboard navigation</li>
            <li><strong>Customizable:</strong> Extensive styling and behavior options</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default AuthorDisplayExamples;
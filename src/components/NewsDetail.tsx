'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building, Users, Calendar, MessageSquare, Share2, X } from 'lucide-react';

interface NewsAuthor {
  id: number;
  name: string;
  image: string;
  title?: string;
  bio?: string;
}

interface NewsAssociation {
  type: 'company' | 'group' | 'event' | 'member';
  id: number;
  name: string;
}

interface NewsComment {
  id: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
    image: string;
  };
}

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  image?: string;
  publishedAt: string;
  author: NewsAuthor;
  associations?: NewsAssociation[];
  tags: string[];
  comments: NewsComment[];
}

// This would come from your database
const SAMPLE_ARTICLE: NewsArticle = {
  id: 1,
  title: 'Kootenay Tech Scene Continues to Grow',
  content: `The Kootenay region's technology sector is experiencing unprecedented growth, with new companies and startups choosing the area as their home base.

This trend is driven by several factors, including:

- The rise of remote work
- High quality of life in the Kootenays
- Growing tech community and support networks
- Affordable housing compared to major tech hubs

Local organizations are playing a crucial role in supporting this growth through mentorship programs, networking events, and resource sharing initiatives.

The impact on the local economy has been significant, with new job opportunities being created and increased investment in the region's digital infrastructure.

Looking ahead, community leaders are focused on sustainable growth that maintains the region's unique character while fostering innovation and technological advancement.`,
  image: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
  publishedAt: '2025-03-15',
  author: {
    id: 1,
    name: 'Sarah Johnson',
    title: 'Tech Community Lead',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    bio: 'Sarah has been involved in the Kootenay tech scene for over 5 years and is passionate about building inclusive tech communities.'
  },
  associations: [
    { type: 'company', id: 1, name: 'Mountain Tech Solutions' },
    { type: 'group', id: 1, name: 'Kootenay Tech Organizers' }
  ],
  tags: ['Community', 'Growth', 'Startups'],
  comments: [
    {
      id: 1,
      content: 'Great to see the tech community growing! Looking forward to more collaboration opportunities.',
      createdAt: '2025-03-15T14:30:00',
      author: {
        id: 2,
        name: 'Michael Chen',
        image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
      }
    }
  ]
};

interface CommentModalProps {
  onClose: () => void;
  onSubmit: (comment: string) => void;
}

function CommentModal({ onClose, onSubmit }: CommentModalProps) {
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(comment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Add Comment</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Post Comment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ShareModalProps {
  article: NewsArticle;
  onClose: () => void;
}

function ShareModal({ article, onClose }: ShareModalProps) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const shareLinks = [
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Share Article</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          {shareLinks.map(link => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-center"
            >
              Share on {link.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NewsDetail({ newsId }: { newsId: string }) {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // In a real app, you'd fetch the article data based on the newsId
  const article = SAMPLE_ARTICLE;

  const handleCommentSubmit = (comment: string) => {
    console.log('Comment submitted:', comment);
    // In a real app, you'd send this to your backend
  };

  const getAssociationIcon = (type: NewsAssociation['type']) => {
    switch (type) {
      case 'company':
        return <Building className="h-4 w-4" />;
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <article className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        {article.image && (
          <div className="h-96 overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {article.title}
          </h1>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <img
                src={article.author.image}
                alt={article.author.name}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <Link
                  href={`/directory/${article.author.id}`}
                  className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                >
                  {article.author.name}
                </Link>
                {article.author.title && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">{article.author.title}</p>
                )}
              </div>
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              {new Date(article.publishedAt).toLocaleDateString()}
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-8">
            {article.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n');
                return (
                  <ul key={index} className="list-disc list-inside mb-4">
                    {items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={index} className="mb-4">{paragraph}</p>;
            })}
          </div>

          {article.associations && article.associations.length > 0 && (
            <div className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Related</h2>
              <div className="flex flex-wrap gap-3">
                {article.associations.map(assoc => (
                  <Link
                    key={`${assoc.type}-${assoc.id}`}
                    href={`/${assoc.type}s/${assoc.id}`}
                    className="flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-600"
                  >
                    {getAssociationIcon(assoc.type)}
                    <span className="ml-1">{assoc.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setShowCommentModal(true)}
              className="flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Comment
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Comments ({article.comments.length})
            </h2>
            {article.comments.map(comment => (
              <div
                key={comment.id}
                className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4"
              >
                <div className="flex items-center mb-3">
                  <img
                    src={comment.author.image}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <div>
                    <Link
                      href={`/directory/${comment.author.id}`}
                      className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                    >
                      {comment.author.name}
                    </Link>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </article>

      {showCommentModal && (
        <CommentModal
          onClose={() => setShowCommentModal(false)}
          onSubmit={handleCommentSubmit}
        />
      )}

      {showShareModal && (
        <ShareModal
          article={article}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Mail } from 'lucide-react';

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  publishedAt: string;
  author: {
    name: string;
    image: string;
  };
  tags: string[];
}

const SAMPLE_ARTICLES: NewsArticle[] = [
  {
    id: 1,
    title: 'Kootenay Tech Scene Continues to Grow',
    excerpt: 'The Kootenay region\'s technology sector is experiencing unprecedented growth, with new companies and startups choosing the area as their home base.',
    image: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
    publishedAt: '2025-03-15',
    author: {
      name: 'Sarah Johnson',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
    },
    tags: ['Community', 'Growth', 'Startups']
  },
  {
    id: 2,
    title: 'Local AI Startup Secures Major Funding',
    excerpt: 'A Nelson-based artificial intelligence startup has secured $2.5 million in seed funding to develop innovative solutions for environmental monitoring.',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    publishedAt: '2025-03-10',
    author: {
      name: 'Michael Chen',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    },
    tags: ['AI', 'Funding', 'Environment']
  }
];

export default function NewsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Get unique tags from all articles
  const allTags = Array.from(
    new Set(SAMPLE_ARTICLES.flatMap(article => article.tags))
  ).sort();

  // Filter articles based on search term and selected tag
  const filteredArticles = SAMPLE_ARTICLES.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'all' || article.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <div>
      <div className="mb-8">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg 
                     bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${selectedTag === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
          >
            All Tags
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${selectedTag === tag
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredArticles.map(article => (
          <Link
            key={article.id}
            href={`/news/${article.id}`}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {article.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {article.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={article.author.image}
                    alt={article.author.name}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    By {article.author.name}
                  </span>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Newsletter CTA */}
      <div className="mt-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-8 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <div className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
              <Mail className="h-6 w-6" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
          <p className="text-white/80 mb-6">
            Get the latest updates from the Nelson tech community, including events, job opportunities, and news.
          </p>
          {subscribed ? (
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-lg font-medium">Thanks for subscribing!</p>
              <p className="text-white/80">You'll receive our next newsletter in your inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-white/90 transition-colors font-medium"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
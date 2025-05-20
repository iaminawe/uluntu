import { Metadata } from 'next';
import NewsList from '../../components/NewsList';

export const metadata: Metadata = {
  title: 'News | Kootenay Tech Community',
  description: 'Latest news and updates from the Kootenay tech community',
};

export default function NewsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">News</h1>
        <a
          href="/news/create"
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          Add News
        </a>
      </div>
      <NewsList />
    </div>
  );
}
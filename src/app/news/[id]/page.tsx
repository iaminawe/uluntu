import { Metadata } from 'next';
import NewsDetail from '../../../components/NewsDetail';

export const metadata: Metadata = {
  title: 'News Article | Kootenay Tech Community',
  description: 'Read the latest news from the Kootenay tech community',
};

export default function NewsDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <NewsDetail newsId={params.id} />
    </div>
  );
}
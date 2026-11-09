import { useMemo } from 'react';
import { useCompaniesHybrid } from '@/features/companies/hooks/useCompaniesHybrid';
import { Company } from '@/features/companies/types';
import { DetailedCard } from '@/shared/components/visual';

interface MappedCompany {
  id: string;
  title: string;
  excerpt: string;
  image?: string;
  date?: string;
  category: string;
  readTime: string;
  link: string;
  type: 'company';
  author: {
    id: string;
    name: string;
    image: string;
  };
}

export default function NewCompaniesSection() {
  const { companies, isLoading } = useCompaniesHybrid();
  
  const newCompanies = useMemo(() => {
    return companies
      .slice(0, 6)
      .map((company: Company) => ({
        id: company.id,
        title: company.name,
        excerpt: company.description || 'Discover this local organization',
        image: company.logo || company.cover_image || undefined,
        date: company.created_at || undefined,
        category: company.industry?.join(', ') || 'Community',
        readTime: company.size || 'Learn more',
        link: `/companies/${company.slug || company.id}`,
        type: 'company' as const,
        author: {
          id: '1',
          name: company.location || 'Uluntu',
          image: ''
        }
      }));
  }, [companies]);

  if (isLoading || newCompanies.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white dark:bg-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            New Companies
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Discover the latest organizations joining our community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newCompanies.map((company) => (
            <DetailedCard
              key={`company-${company.id}`}
              id={company.id}
              title={company.title}
              excerpt={company.excerpt}
              image={company.image}
              date={company.date}
              author={company.author}
              category={company.category}
              readTime={company.readTime}
              link={company.link}
              linkText="View Company"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
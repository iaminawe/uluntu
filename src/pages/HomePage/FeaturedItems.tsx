import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Users } from 'lucide-react';
import { Member, Company, Event, Group, NewsArticle } from './types';
import { getMemberProfileUrl } from '@/utils/memberSlugUtils';
import { getCompanyUrl, getEventUrl, getGroupUrl, getNewsArticleUrl } from '@/utils/contentUrlUtils';

interface FeaturedItemsProps {
  members: Member[];
  companies: Company[];
  events: Event[];
  groups: Group[];
  news: NewsArticle[];
}

interface FeaturedItemsResult {
  featuredMembers: React.ReactNode[];
  featuredCompanies: React.ReactNode[];
  featuredEvents: React.ReactNode[];
  activeGroups: React.ReactNode[];
  latestNews: React.ReactNode[];
}

// Function that returns properly typed featured content
export const FeaturedItems = ({ 
  members, 
  companies, 
  events, 
  groups, 
  news 
}: FeaturedItemsProps): FeaturedItemsResult => {
  const featuredMembers = members
    .filter(member => member.featured)
    .map(member => (
      <Link
        key={member.id}
        to={getMemberProfileUrl(member)}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div className="h-48 overflow-hidden">
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">{member.name}</h3>
          <p className="text-orange-500">{member.title}</p>
          {member.company && (
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{member.company}</p>
          )}
        </div>
      </Link>
    ));

  const featuredCompanies = companies
    .filter(company => company.featured)
    .map(company => (
      <Link
        key={company.id}
        to={getCompanyUrl(company)}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <img
            src={company.logo}
            alt={company.name}
            className="max-h-32 max-w-[80%]"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">{company.name}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{company.industry.join(', ')}</p>
        </div>
      </Link>
    ));

  const featuredEvents = events
    .filter(event => event.featured || new Date(event.date) > new Date())
    .slice(0, 3)
    .map(event => (
      <Link
        key={event.id}
        to={getEventUrl(event)}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div className="h-48 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">{event.title}</h3>
          <p className="text-sm text-orange-500">
            {format(new Date(event.date), 'MMMM d, yyyy')}
          </p>
        </div>
      </Link>
    ));

  const activeGroups = groups.map(group => (
    <Link
      key={group.id}
      to={getGroupUrl(group)}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="h-48 overflow-hidden">
        <img
          src={group.heroImage}
          alt={group.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">{group.name}</h3>
        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {group.memberCount} members
          </span>
          <span>
            Active {format(new Date(group.lastActive), 'MM/dd/yyyy')}
          </span>
        </div>
      </div>
    </Link>
  ));

  const latestNews = news.map(article => (
    <Link
      key={article.id}
      to={getNewsArticleUrl(article)}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="h-48 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{article.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{article.excerpt}</p>
      </div>
    </Link>
  ));

  return {
    featuredMembers,
    featuredCompanies,
    featuredEvents,
    activeGroups,
    latestNews
  };
};

export default FeaturedItems;

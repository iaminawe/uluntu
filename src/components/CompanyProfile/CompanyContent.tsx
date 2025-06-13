import { Link } from 'react-router-dom';
import { Users, Calendar, BookOpen, Newspaper, Briefcase } from 'lucide-react';
import { Company } from '@/features/companies/components/CompanyProfile/types';

interface CompanyContentProps {
  company: Company;
}

const CompanyContent = ({ company }: CompanyContentProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Users className="h-5 w-5 text-orange-500 mr-2" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Team</h2>
        </div>
        <div className="space-y-4">
          {company.members.map(member => (
            <div key={member.id} className="flex items-center">
              <img
                src={member.image}
                alt={member.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <Link
                  to={`/directory/${member.id}`}
                  className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                >
                  {member.name}
                </Link>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {member.title} • Joined {new Date(member.joinedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-orange-500 mr-2" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Events</h2>
        </div>
        <div className="space-y-4">
          {company.events.map(event => (
            <div key={event.id}>
              <Link
                to={`/events/${event.id}`}
                className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
              >
                {event.title}
              </Link>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {event.type} • {new Date(event.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <BookOpen className="h-5 w-5 text-orange-500 mr-2" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Resources</h2>
        </div>
        <div className="space-y-4">
          {company.resources.map(resource => (
            <div key={resource.id}>
              <Link
                to={`/resources/${resource.id}`}
                className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
              >
                {resource.title}
              </Link>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {resource.type} • {new Date(resource.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Briefcase className="h-5 w-5 text-orange-500 mr-2" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Opportunities</h2>
        </div>
        <div className="space-y-4">
          {company.opportunities.map(opportunity => (
            <div key={opportunity.id}>
              <Link
                to={`/opportunities/${opportunity.id}`}
                className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
              >
                {opportunity.title}
              </Link>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {opportunity.type} • Posted {new Date(opportunity.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Newspaper className="h-5 w-5 text-orange-500 mr-2" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Latest News</h2>
        </div>
        <div className="space-y-4">
          {company.posts.map(post => (
            <div key={post.id}>
              <Link
                to={`/posts/${post.id}`}
                className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
              >
                {post.title}
              </Link>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Posted on {new Date(post.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyContent;

import { useSearchParams } from 'react-router-dom';

const FilterTabs: React.FC = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'all';
  
  return (
    <div className="mb-8 flex justify-center">
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <a
          href="/opportunities"
          className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
            type === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-blue-50 dark:hover:bg-slate-600'
          }`}
        >
          All Opportunities
        </a>
        <a
          href="/opportunities?type=jobs"
          className={`px-4 py-2 text-sm font-medium ${
            type === 'jobs' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-blue-50 dark:hover:bg-slate-600'
          }`}
        >
          Jobs
        </a>
        <a
          href="/opportunities?type=projects"
          className={`px-4 py-2 text-sm font-medium ${
            type === 'projects' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-blue-50 dark:hover:bg-slate-600'
          }`}
        >
          Projects
        </a>
        <a
          href="/opportunities?type=volunteer"
          className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
            type === 'volunteer' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-blue-50 dark:hover:bg-slate-600'
          }`}
        >
          Volunteer
        </a>
      </div>
    </div>
  );
};

export default FilterTabs;

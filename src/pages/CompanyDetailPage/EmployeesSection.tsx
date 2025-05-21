import { Link } from 'react-router-dom';
import { EmployeesSectionProps } from './types';

const EmployeesSection: React.FC<EmployeesSectionProps> = ({ employees, isLoading }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse mt-8">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-slate-200 dark:bg-slate-700 rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Team Members</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {employees.map(employee => (
          <Link
            key={employee.id}
            to={`/directory/${employee.id}`}
            className="group bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col items-center text-center"
          >
            <img
              src={employee.image}
              alt={employee.name}
              className="w-16 h-16 rounded-full mb-3 object-cover"
            />
            <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
              {employee.name}
            </h3>
            {employee.title && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{employee.title}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default EmployeesSection;
